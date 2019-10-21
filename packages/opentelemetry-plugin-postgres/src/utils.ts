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

import { Span, CanonicalCode, Tracer, SpanKind } from '@opentelemetry/types';
import { AttributeNames } from './enums';
import {
  PgClientExtended,
  PgPluginQueryConfig,
  PostgresCallback,
  PgClientConnectionParams,
} from './types';
import * as pgTypes from 'pg';
import { PostgresPlugin } from './pg';

function getJDBCString(params: PgClientConnectionParams) {
  const host = params.host || 'localhost'; // postgres defaults to localhost
  const port = params.port || 5432; // postgres defaults to port 5432
  const database = params.database || '';
  return `jdbc:postgresql://${host}:${port}/${database}`;
}

export function arrayStringifyHelper<T>(arr: Array<T>): string {
  return '[' + arr.toString() + ']';
}

// Helper function to get a low cardinality command name from the full text query
export function getCommandFromText(text?: string): string {
  if (text) {
    const words = text.split(' ');
    if (words && words.length > 0) {
      return words[0];
    }
  }
  return 'unknown';
}

// Queries where args[0] is a QueryConfig
export function handleConfigQuery(
  this: pgTypes.Client & PgClientExtended,
  tracer: Tracer,
  ...args: unknown[]
) {
  const argsConfig = args[0] as PgPluginQueryConfig;

  // Set child span name
  const queryCommand = getCommandFromText(argsConfig.name || argsConfig.text);
  const name = PostgresPlugin.BASE_SPAN_NAME + ':' + queryCommand;
  const span = pgStartSpan(tracer, this, name);

  // Set attributes
  span.setAttribute(AttributeNames.DB_STATEMENT, argsConfig.text);
  if (argsConfig.values instanceof Array) {
    span.setAttribute(
      AttributeNames.PG_VALUES,
      arrayStringifyHelper(argsConfig.values)
    );
  }
  // Set plan name attribute, if present
  if (argsConfig.name) {
    span.setAttribute(AttributeNames.PG_PLAN, argsConfig.name);
  }

  return span;
}

// Queries where args[1] is a 'values' array
export function handleParameterizedQuery(
  this: pgTypes.Client & PgClientExtended,
  tracer: Tracer,
  ...args: unknown[]
) {
  // Set child span name
  const queryCommand = getCommandFromText(args[0] as string);
  const name = PostgresPlugin.BASE_SPAN_NAME + ':' + queryCommand;
  const span = pgStartSpan(tracer, this, name);

  // Set attributes
  span.setAttribute(AttributeNames.DB_STATEMENT, args[0]);
  if (args[1] instanceof Array) {
    span.setAttribute(AttributeNames.PG_VALUES, arrayStringifyHelper(args[1]));
  }

  return span;
}

// Queries where args[0] is a text query and 'values' was not specified
export function handleTextQuery(
  this: pgTypes.Client & PgClientExtended,
  tracer: Tracer,
  ...args: unknown[]
) {
  // Set child span name
  const queryCommand = getCommandFromText(args[0] as string);
  const name = PostgresPlugin.BASE_SPAN_NAME + ':' + queryCommand;
  const span = pgStartSpan(tracer, this, name);

  // Set attributes
  span.setAttribute(AttributeNames.DB_STATEMENT, args[0]);

  return span;
}

export function patchCallback(
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

// Private helper function to start a span
export function pgStartSpan(
  tracer: Tracer,
  client: pgTypes.Client & PgClientExtended,
  name: string
) {
  const jdbcString = getJDBCString(client.connectionParameters);
  return tracer.startSpan(name, {
    kind: SpanKind.CLIENT,
    parent: tracer.getCurrentSpan() || undefined,
    attributes: {
      [AttributeNames.COMPONENT]: PostgresPlugin.COMPONENT, // required
      [AttributeNames.DB_INSTANCE]: client.connectionParameters.database, // required
      [AttributeNames.DB_TYPE]: PostgresPlugin.DB_TYPE, // required
      [AttributeNames.PEER_ADDRESS]: jdbcString, // required
      [AttributeNames.PEER_HOSTNAME]: client.connectionParameters.host, // required
      [AttributeNames.PEER_PORT]: client.connectionParameters.port,
      [AttributeNames.DB_USER]: client.connectionParameters.user,
    },
  });
}
