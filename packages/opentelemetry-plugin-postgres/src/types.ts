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

import * as pgTypes from 'pg';

export interface PostgresPluginOptions {}

export type PostgresCallback = (err: Error, res: object) => unknown;

// These are not included in @types/pg, so manually define them.
// https://github.com/brianc/node-postgres/blob/fde5ec586e49258dfc4a2fcd861fcdecb4794fc3/lib/client.js#L25
export interface PgClientConnectionParams {
  database: string;
  host: string;
  port: number;
  user: string;
}

export interface PgClientExtended {
  connectionParameters: PgClientConnectionParams;
}

export interface PgPluginQueryConfig extends pgTypes.QueryConfig {
  callback?: PostgresCallback;
}
