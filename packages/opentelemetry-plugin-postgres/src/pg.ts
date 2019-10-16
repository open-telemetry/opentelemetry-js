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
import { SpanKind, Span, CanonicalCode } from '@opentelemetry/types';
import { AttributeNames } from './enums';
import {
  PostgresPluginOptions,
  PgClientConnectionParams,
  PgPluginQueryConfig,
  PostgresCallback,
} from './types';
import * as path from 'path';
import * as pgTypes from 'pg';
import * as shimmer from 'shimmer';

// Helper function to get a low cardinality command name from the full text query
function getCommandFromText(text?: string): string {
  if (text) {
    const words = text.split(' ');
    if (words && words.length > 0) {
      return words[0];
    }
  }
  return 'unknown';
}

export class PostgresPlugin extends BasePlugin<typeof pgTypes> {
  protected _config: PostgresPluginOptions;

  static readonly COMPONENT = 'pg';
  static readonly BASE_SPAN_NAME = PostgresPlugin.COMPONENT + '.query';

  readonly supportedVersions = ['^7.12.1'];

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
        `Patching ${PostgresPlugin.COMPONENT}.Client.prototype.query`
      );
      return function query(
        this: pgTypes.Client & PgClientConnectionParams,
        ...args: unknown[]
      ) {
        let callbackProvided = false;
        const span = plugin._pgStartSpan(this);

        // Handle different client.query(...) signatures
        if (typeof args[0] === 'string') {
          if (args.length > 1 && args[1] instanceof Array) {
            _handleParameterizedQuery.call(this, span, ...args);
          } else {
            _handleTextQuery.call(this, span, ...args);
          }
        } else if (typeof args[0] === 'object') {
          _handleConfigQuery.call(this, span, ...args);
        }

        // Bind callback to parent span
        if (args.length > 0) {
          if (typeof args[args.length - 1] === 'function') {
            args[args.length - 1] = plugin._tracer.bind(
              _patchCallback(span, args[args.length - 1] as PostgresCallback)
            );
            callbackProvided = true;
          } else if (
            typeof (args[0] as PgPluginQueryConfig).callback === 'function'
          ) {
            (args[0] as PgPluginQueryConfig).callback = plugin._tracer.bind(
              _patchCallback(span, (args[0] as PgPluginQueryConfig).callback!)
            );
            callbackProvided = true;
          }
        }

        // Perform the original query
        const result: unknown = original.apply(this, args as never);

        // Bind promise to parent span and end the span
        if (result instanceof Promise) {
          return plugin._tracer.bind(
            result
              .then((result: unknown) => {
                // Return a pass-along promise which ends the span and then goes to user's orig resolvers
                return new Promise((resolve, _) => {
                  span.setStatus({ code: CanonicalCode.OK });
                  span.end();
                  resolve(result);
                });
              })
              .catch((error: Error) => {
                return new Promise((_, reject) => {
                  span.setStatus({ code: CanonicalCode.UNKNOWN });
                  span.end();
                  reject(error);
                });
              })
          );
        }
        // else returns void
        if (!callbackProvided) {
          span.setStatus({
            code: CanonicalCode.INVALID_ARGUMENT,
            message: 'Invalid query provided to the driver',
          });
          span.end();
        }
        return result; // void
      };
    };
  }

  // Private helper function to start a span
  private _pgStartSpan(client: pgTypes.Client & PgClientConnectionParams) {
    return this._tracer.startSpan(PostgresPlugin.BASE_SPAN_NAME, {
      kind: SpanKind.CLIENT,
      parent: this._tracer.getCurrentSpan() || undefined,
      attributes: {
        [AttributeNames.COMPONENT]: PostgresPlugin.COMPONENT,
        [AttributeNames.PEER_HOST]: client.connectionParameters.host,
        [AttributeNames.PEER_PORT]: client.connectionParameters.port,
      },
    });
  }
}

// Queries where args[0] is a text query and 'values' was not specified
function _handleTextQuery(
  this: pgTypes.Client & PgClientConnectionParams,
  span: Span,
  ...args: unknown[]
) {
  // Set child span name
  const queryCommand = getCommandFromText(args[0] as string);
  span.updateName(PostgresPlugin.BASE_SPAN_NAME + ':' + queryCommand);

  // Set attributes
  span.setAttribute(AttributeNames.DB_STATEMENT, args[0]);
}

// Queries where args[1] is a 'values' array
function _handleParameterizedQuery(
  this: pgTypes.Client & PgClientConnectionParams,
  span: Span,
  ...args: unknown[]
) {
  // Set child span name
  const queryCommand = getCommandFromText(args[0] as string);
  span.updateName(PostgresPlugin.BASE_SPAN_NAME + ':' + queryCommand);

  // Set  attributes
  span.setAttribute(AttributeNames.DB_STATEMENT, args[0]);
  span.setAttribute(AttributeNames.PG_VALUES, args[1]);
}

// Queries where args[0] is a QueryConfig
function _handleConfigQuery(
  this: pgTypes.Client & PgClientConnectionParams,
  span: Span,
  ...args: unknown[]
) {
  const config = args[0] as PgPluginQueryConfig;

  // Set attributes
  span.setAttribute(AttributeNames.DB_STATEMENT, config.text);
  if (config.values) {
    span.setAttribute(AttributeNames.PG_VALUES, config.values);
  }
  if (config.name) {
    span.setAttribute(AttributeNames.PG_PLAN, config.name);
  }

  // Update span name with query command; prefer plan name, if available
  const queryCommand = getCommandFromText(config.name || config.text);
  span.updateName(PostgresPlugin.BASE_SPAN_NAME + ':' + queryCommand);
}

function _patchCallback(span: Span, cb: PostgresCallback): PostgresCallback {
  const originalCb = cb;
  return function patchedCallback(
    this: pgTypes.Client & PgClientConnectionParams,
    err: Error,
    res: object
  ) {
    if (err) {
      span.setStatus({
        code: CanonicalCode.UNKNOWN,
        message: err.message,
      });
    } else if (res) {
      span.setStatus({ code: CanonicalCode.OK });
    }
    span.end();
    return originalCb.call(this, err, res);
  };
}

const basedir = path.dirname(require.resolve('pg'));
const version = require(path.join(basedir, '../', 'package.json')).version;
export const plugin = new PostgresPlugin(PostgresPlugin.COMPONENT, version);
