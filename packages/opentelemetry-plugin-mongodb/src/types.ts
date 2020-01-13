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
  indexes?: unknown[];
  query?: { [key: string]: unknown };
  q?: { [key: string]: unknown };
};

// https://github.com/mongodb/node-mongodb-native/blob/master/lib/topologies/server.js#L179
export type MongoInternalTopology = {
  s?: {
    // those are for mongodb@3
    options?: {
      host?: string;
      port?: number;
      servername?: string;
    };
    // those are for mongodb@2
    host?: string;
    port?: number;
  };
};

export enum AttributeNames {
  // required by https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/data-semantic-conventions.md#databases-client-calls
  COMPONENT = 'component',
  DB_TYPE = 'db.type',
  DB_INSTANCE = 'db.instance',
  DB_STATEMENT = 'db.statement',
  PEER_ADDRESS = 'peer.address',
  PEER_HOSTNAME = 'peer.host',

  PEER_PORT = 'peer.port',
  PEER_IPV4 = 'peer.ipv4',
  PEER_IPV6 = 'peer.ipv6',
  PEER_SERVICE = 'peer.service',
}

export enum MongodbCommandType {
  CREATE_INDEXES = 'createIndexes',
  FIND_AND_MODIFY = 'findAndModify',
  IS_MASTER = 'isMaster',
  COUNT = 'count',
  UNKNOWN = 'unknown',
}
