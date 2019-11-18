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

import * as mysqlTypes from 'mysql';
import { AttributeNames } from './enums';

export function getSpanName(
  query: string | mysqlTypes.QueryOptions | mysqlTypes.Query
) {
  const queryString = typeof query === 'string' ? query : query.sql;

  const match = queryString.match(/^\s*(\w+)/);
  const command = (match && match[1]) || 'UNKNOWN_COMMAND';

  return `mysql.query:${command}`;
}

export function getConnectionAttributes(config: mysqlTypes.PoolConfig) {
  const { host, port, database, user } = config;

  return {
    [AttributeNames.PEER_ADDRESS]: getJDBCString(host, port, database),
    [AttributeNames.DB_INSTANCE]: database,
    [AttributeNames.PEER_HOSTNAME]: host,
    [AttributeNames.PEER_PORT]: port,
    [AttributeNames.DB_USER]: user,
  };
}

function getJDBCString(
  host: string | undefined,
  port: number | undefined,
  database: string | undefined
) {
  let str = `jdbc:mysql://${host || 'localhost'}`;

  if (typeof port === 'number') {
    str += `:${port}`;
  }

  if (typeof database === 'string') {
    str += `/${database}`;
  }

  return str;
}
