/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { BasePlugin } from '@opentelemetry/core';
import { CanonicalCode, SpanKind } from '@opentelemetry/api';
import { AttributeNames } from './enums';
import * as shimmer from 'shimmer';
import * as pgPoolTypes from 'pg-pool';
import {
  PostgresPoolPluginOptions,
  PgPoolCallback,
  PgPoolExtended,
} from './types';
import * as utils from './utils';
import { VERSION } from './version';

export class PostgresPoolPlugin extends BasePlugin<typeof pgPoolTypes> {
  protected _config: PostgresPoolPluginOptions;

  static readonly COMPONENT = 'pg-pool';
  static readonly DB_TYPE = 'sql';

  readonly supportedVersions = ['2.*'];

  constructor(readonly moduleName: string) {
    super('@opentelemetry/plugin-pg-pool', VERSION);
    this._config = {};
  }

  protected patch(): typeof pgPoolTypes {
    shimmer.wrap(
      this._moduleExports.prototype,
      'connect',
      this._getPoolConnectPatch() as never
    );

    return this._moduleExports;
  }

  protected unpatch(): void {
    shimmer.unwrap(this._moduleExports.prototype, 'connect');
  }

  private _getPoolConnectPatch() {
    const plugin = this;
    return (originalConnect: typeof pgPoolTypes.prototype.connect) => {
      plugin._logger.debug(
        `Patching ${PostgresPoolPlugin.COMPONENT}.prototype.connect`
      );
      return function connect(this: PgPoolExtended, callback?: PgPoolCallback) {
        const jdbcString = utils.getJDBCString(this.options);
        // setup span
        const span = plugin._tracer.startSpan(
          `${PostgresPoolPlugin.COMPONENT}.connect`,
          {
            kind: SpanKind.CLIENT,
            parent: plugin._tracer.getCurrentSpan() || undefined,
            attributes: {
              [AttributeNames.COMPONENT]: PostgresPoolPlugin.COMPONENT, // required
              [AttributeNames.DB_TYPE]: PostgresPoolPlugin.DB_TYPE, // required
              [AttributeNames.DB_INSTANCE]: this.options.database, // required
              [AttributeNames.PEER_HOSTNAME]: this.options.host, // required
              [AttributeNames.PEER_ADDRESS]: jdbcString, // required
              [AttributeNames.PEER_PORT]: this.options.port,
              [AttributeNames.DB_USER]: this.options.user,
              [AttributeNames.IDLE_TIMEOUT_MILLIS]: this.options
                .idleTimeoutMillis,
              [AttributeNames.MAX_CLIENT]: this.options.maxClient,
            },
          }
        );

        if (callback) {
          const parentSpan = plugin._tracer.getCurrentSpan();
          callback = utils.patchCallback(span, callback) as PgPoolCallback;
          // If a parent span exists, bind the callback
          if (parentSpan) {
            callback = plugin._tracer.bind(callback);
          }
        }

        const connectResult: unknown = originalConnect.call(
          this,
          callback as never
        );

        // No callback was provided, return a promise instead
        if (connectResult instanceof Promise) {
          const connectResultPromise = connectResult as Promise<unknown>;
          return plugin._tracer.bind(
            connectResultPromise
              .then((result: any) => {
                // Resturn a pass-along promise which ends the span and then goes to user's orig resolvers
                return new Promise((resolve, _) => {
                  span.setStatus({ code: CanonicalCode.OK });
                  span.end();
                  resolve(result);
                });
              })
              .catch((error: Error) => {
                return new Promise((_, reject) => {
                  span.setStatus({
                    code: CanonicalCode.UNKNOWN,
                    message: error.message,
                  });
                  span.end();
                  reject(error);
                });
              })
          );
        }

        // Else a callback was provided, so just return the result
        return connectResult;
      };
    };
  }
}

export const plugin = new PostgresPoolPlugin(PostgresPoolPlugin.COMPONENT);
