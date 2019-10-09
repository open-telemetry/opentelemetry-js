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
import { SpanKind } from '@opentelemetry/types';
import { AttributeNames } from './enums';
import { PostgresCallback, PostgresPluginOptions } from './types';
import * as path from 'path';
import * as pgTypes from 'pg';
import * as shimmer from 'shimmer';

export class PostgresPlugin extends BasePlugin<typeof pgTypes> {
  static readonly component = 'pg';
  readonly supportedVersions = ['^7.12.1'];
  protected _config: PostgresPluginOptions;

  constructor(readonly moduleName: string, readonly version: string) {
    super();
    this._config = {};
  }

  protected patch(): typeof pgTypes {
    if (this._moduleExports.Client.prototype.query) {
      shimmer.wrap(
        this._moduleExports.Client.prototype,
        'query',
        this._getClientQueryPatch() as never
      );
    }
    return this._moduleExports;
  }
  protected unpatch(): void {
    if (this._moduleExports.Client.prototype.query) {
      shimmer.unwrap(this._moduleExports.Client.prototype, 'query');
    }
  }

  private _getClientQueryPatch() {
    const plugin = this;
    return (original: typeof pgTypes.Client.prototype.query) => {
      plugin._logger.debug(
        `Patching ${PostgresPlugin.component}.Client.prototype.query`
      );
      return function query(this: pgTypes.Client, ...args: unknown[]) {
        // setup span
        let callbackProvided: boolean =
          args.length > 1 && typeof args[args.length - 1] === 'function';
        const span = plugin._tracer.startSpan(
          `${PostgresPlugin.component}.query`,
          {
            kind: SpanKind.CLIENT,
            parent: plugin._tracer.getCurrentSpan() || undefined,
            attributes: {
              [AttributeNames.COMPONENT]: PostgresPlugin.component,
              [AttributeNames.PG_HOST]: (this as any).connectionParameters.host,
              [AttributeNames.PG_PORT]: (this as any).connectionParameters.port,
            },
          }
        );

        try {
          if (typeof args[0] === 'string') {
            span.setAttribute(AttributeNames.PG_TEXT, args[0]);
            if (args[1] instanceof Array) {
              span.setAttribute(AttributeNames.PG_VALUES, args[1]);
              if (callbackProvided) {
                args[2] = plugin._tracer.bind(args[2]);
              }
            } else {
              if (callbackProvided) {
                args[1] = plugin._tracer.bind(args[1]);
              }
            }
          } else {
            const config = args[0] as pgTypes.QueryConfig & {
              callback?: PostgresCallback;
            };
            if (typeof config.name === 'string') {
              span.setAttribute(AttributeNames.PG_PLAN, config.name);
            } else {
              if (typeof config.text === 'string') {
                span.setAttribute(AttributeNames.PG_TEXT, config.text);
              }
              if (config.values instanceof Array) {
                span.setAttribute(AttributeNames.PG_VALUES, config.values);
              }
            }

            if (callbackProvided) {
              if (typeof args[1] === 'function') {
                args[1] = plugin._tracer.bind(args[1]);
              } else if (typeof args[2] === 'function') {
                args[2] = plugin._tracer.bind(args[2]);
              }
            } else if (
              config.callback &&
              typeof config.callback === 'function'
            ) {
              callbackProvided = true;
              config.callback = plugin._tracer.bind(config.callback);
            }
          }
        } catch (e) {
          plugin._logger.warn(
            `pg Plugin failed to trace query: error: ${e.message}`
          );
          const result = original.apply(this, arguments as any);
          span.end();
          return result;
        }

        const queryResult = original.apply(this, args as any);

        // No callback was provided, return a promise instead (new as of pg@7.x)
        if (!callbackProvided) {
          const queryResultPromise = (queryResult as unknown) as Promise<
            unknown
          >;
          return plugin._tracer.bind(
            queryResultPromise
              .then((result: any) => {
                // Return a pass-along promise which ends the span and then goes to user's orig resolvers
                return new Promise((resolve, _) => {
                  span.end();
                  resolve(result);
                });
              })
              .catch((error: Error) => {
                return new Promise((_, reject) => {
                  span.end();
                  reject(error);
                });
              })
          );
        }

        // Else a callback was provided, so just return the result
        span.end();
        return queryResult;
      };
    };
  }
}

const basedir = path.dirname(require.resolve('pg'));
const version = require(path.join(basedir, '../', 'package.json')).version;
export const plugin = new PostgresPlugin(PostgresPlugin.component, version);
