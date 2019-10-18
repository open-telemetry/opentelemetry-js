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

import { Span, CanonicalCode } from '@opentelemetry/types';
import { AttributeNames } from './enums';
import {
  PgClientExtended,
  PgPluginQueryConfig,
  PostgresCallback,
  PgClientConnectionParams,
} from './types';
import * as pgTypes from 'pg';
import { PostgresPlugin } from './pg';

export function _arrayStringifyHelper<T>(arr: Array<T>): string {
  return '[' + arr.toString() + ']';
}

// Helper function to get a low cardinality command name from the full text query
export function _getCommandFromText(text?: string): string {
  if (text) {
    const words = text.split(' ');
    if (words && words.length > 0) {
      return words[0];
    }
  }
  return 'unknown';
}

export function _getJDBCString(params: PgClientConnectionParams) {
  const host = params.host || 'localhost'; // postgres defaults to localhost
  const port = params.port || 5432; // postgres defaults to port 5432
  const database = params.database || '';
  return `jdbc:postgresql://${host}:${port}/${database}`;
}

// Queries where args[0] is a QueryConfig
export function _handleConfigQuery(
  this: pgTypes.Client & PgClientExtended,
  span: Span,
  ...args: unknown[]
) {
  const argsConfig = args[0] as PgPluginQueryConfig;

  // Set attributes
  span.setAttribute(AttributeNames.DB_STATEMENT, argsConfig.text);
  if (argsConfig.values instanceof Array) {
    span.setAttribute(
      AttributeNames.PG_VALUES,
      _arrayStringifyHelper(argsConfig.values)
    );
  }
  if (argsConfig.name) {
    span.setAttribute(AttributeNames.PG_PLAN, argsConfig.name);
  }

  // Update span name with query command; prefer plan name, if available
  const queryCommand = _getCommandFromText(argsConfig.name || argsConfig.text);
  span.updateName(PostgresPlugin.BASE_SPAN_NAME + ':' + queryCommand);
}

// Queries where args[1] is a 'values' array
export function _handleParameterizedQuery(
  this: pgTypes.Client & PgClientExtended,
  span: Span,
  ...args: unknown[]
) {

  // Set child span name
  const queryCommand = _getCommandFromText(args[0] as string);
  span.updateName(PostgresPlugin.BASE_SPAN_NAME + ':' + queryCommand);

  // Set attributes
  span.setAttribute(AttributeNames.DB_STATEMENT, args[0]);
  if (args[1] instanceof Array) {
    span.setAttribute(AttributeNames.PG_VALUES, _arrayStringifyHelper(args[1]));
  }
}

// Queries where args[0] is a text query and 'values' was not specified
export function _handleTextQuery(
  this: pgTypes.Client & PgClientExtended,
  span: Span,
  ...args: unknown[]
) {
  // Set child span name
  const queryCommand = _getCommandFromText(args[0] as string);
  span.updateName(PostgresPlugin.BASE_SPAN_NAME + ':' + queryCommand);

  // Set attributes
  span.setAttribute(AttributeNames.DB_STATEMENT, args[0]);
}

export function _patchCallback(
  span: Span,
  cb: PostgresCallback
): PostgresCallback {
  const originalCb = cb;
  return function patchedCallback(
    this: pgTypes.Client & PgClientExtended,
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
