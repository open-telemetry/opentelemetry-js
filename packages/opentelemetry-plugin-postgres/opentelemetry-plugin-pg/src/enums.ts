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

export enum AttributeNames {
  // required by https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/data-database.md
  COMPONENT = 'component',
  DB_TYPE = 'db.type',
  DB_INSTANCE = 'db.instance',
  DB_STATEMENT = 'db.statement',
  PEER_ADDRESS = 'peer.address',
  PEER_HOSTNAME = 'peer.host',

  // optional
  DB_USER = 'db.user',
  PEER_PORT = 'peer.port',
  PEER_IPV4 = 'peer.ipv4',
  PEER_IPV6 = 'peer.ipv6',
  PEER_SERVICE = 'peer.service',

  // PG specific -- not specified by spec
  PG_VALUES = 'pg.values',
  PG_PLAN = 'pg.plan',
}
