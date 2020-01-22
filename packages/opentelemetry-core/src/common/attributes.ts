/*!
 * Copyright 2020, OpenTelemetry Authors
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

export enum CommonAttributeNames {
  // Shared between http, database, etc..
  COMPONENT = 'component',

  // https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/data-span-general.md
  NET_TRANSPORT = 'net.transport',
  NET_PEER_IP = 'net.peer.ip',
  NET_PEER_PORT = 'net.peer.port',
  NET_PEER_NAME = 'net.peer.name',
  NET_HOST_IP = 'net.host.ip',
  NET_HOST_PORT = 'net.host.port',
  NET_HOST_NAME = 'net.host.name',
  PEER_SERVICE = 'peer.service',

  // https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/data-database.md
  // required
  DB_TYPE = 'db.type',
  DB_INSTANCE = 'db.instance',
  DB_STATEMENT = 'db.statement',
  DB_URL = 'db.url',
  // optional
  DB_USER = 'db.user',

  // https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/data-rpc.md
  // required
  RPC_SERVICE = 'rpc.service',

  // https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/data-http.md
  // required
  HTTP_METHOD = 'http.method',
  HTTP_URL = 'http.url',
  HTTP_HOST = 'http.host',
  HTTP_SCHEME = 'http.scheme',
  HTTP_STATUS_CODE = 'http.status_code',

  // optional
  HTTP_STATUS_TEXT = 'http.status_text',
  HTTP_FLAVOR = 'http.flavor',

  // Others
  PEER_ADDRESS = 'peer.address',
  PEER_HOSTNAME = 'peer.hostname',
  PEER_PORT = 'peer.port',
  PEER_IPV4 = 'peer.ipv4',
  PEER_IPV6 = 'peer.ipv6',
}
