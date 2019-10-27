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

export type Func<T> = (...args: unknown[]) => T;
export type MongoInternalCommand = {
  findandmodify: boolean;
  createIndexes: boolean;
  count: boolean;
  ismaster: boolean;
  query?: { [key: string]: unknown };
  q?: { [key: string]: unknown };
};
//
// https://github.com/mongodb-js/mongodb-core/blob/master/lib/topologies/server.js#L117
export type MongoInternalTopology = {
  s?: {
    options?: {
      host?: string;
      port?: number;
      servername?: string;
    };
  };
};
