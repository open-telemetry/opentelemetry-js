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

import { Attributes } from '@opentelemetry/types';
import { AttributeNames } from './enums';
import { ConnectionConfig, Query } from './types';

/**
 * Get a span name from a mysql query
 *
 * @param query mysql Query or string
 */
export function getSpanName(query: string | Query) {
  return `mysql.query:${getCommand(query)}`;
}

/**
 * Get the low cardinality command name from a query.
 *
 * @param query mysql Query or string
 */
function getCommand(query: string | Query) {
  const queryString = typeof query === 'string' ? query : query.sql;

  if (!queryString) {
    return 'UNKNOWN_COMMAND';
  }

  // Command is the first non-whitespace token in the query
  const match = queryString.match(/^\s*(\w+)/);
  return (match && match[1]) || 'UNKNOWN_COMMAND';
}

/**
 * Get an Attributes map from a mysql connection config object
 *
 * @param config ConnectionConfig
 */
export function getConnectionAttributes(config: ConnectionConfig): Attributes {
  const { host, port, database, user } = getConfig(config);

  return {
    [AttributeNames.PEER_ADDRESS]: getJDBCString(host, port, database),
    [AttributeNames.DB_INSTANCE]: database,
    [AttributeNames.PEER_HOSTNAME]: host,
    [AttributeNames.PEER_PORT]: port,
    [AttributeNames.DB_USER]: user,
  };
}

function getConfig(config: any) {
  const { host, port, database, user } =
    (config && config.connectionConfig) || config || {};
  return { host, port, database, user };
}

function getJDBCString(
  host: string | undefined,
  port: number | undefined,
  database: string | undefined
) {
  let jdbcString = `jdbc:mysql://${host || 'localhost'}`;

  if (typeof port === 'number') {
    jdbcString += `:${port}`;
  }

  if (typeof database === 'string') {
    jdbcString += `/${database}`;
  }

  return jdbcString;
}
