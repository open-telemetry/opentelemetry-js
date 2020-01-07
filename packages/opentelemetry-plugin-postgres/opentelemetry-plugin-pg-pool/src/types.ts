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
import * as pgPoolTypes from 'pg-pool';

export interface PostgresPoolPluginOptions {}

export type PgPoolCallback = (
  err: Error,
  client: any,
  done: (release?: any) => void
) => void;

export interface PgPoolOptionsParams {
  database: string;
  host: string;
  port: number;
  user: string;
  idleTimeoutMillis: number; // the minimum amount of time that an object may sit idle in the pool before it is eligible for eviction due to idle time
  maxClient: number; // maximum size of the pool
}

export interface PgPoolExtended extends pgPoolTypes<pgTypes.Client> {
  options: PgPoolOptionsParams;
}
