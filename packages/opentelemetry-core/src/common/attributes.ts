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

 /**
  * Common attribute names defined by the Opetelemetry Semantic Conventions specification
  * https://github.com/open-telemetry/opentelemetry-specification/tree/master/specification/trace/semantic_conventions
  */
export enum AttributeNames {
  COMPONENT = 'component',

  // grpc
  GRPC_KIND = 'grpc.kind', // SERVER or CLIENT
  GRPC_METHOD = 'grpc.method',
  GRPC_STATUS_CODE = 'grpc.status_code',
  GRPC_ERROR_NAME = 'grpc.error_name',
  GRPC_ERROR_MESSAGE = 'grpc.error_message',

  // http
  HTTP_HOST = 'http.host',
  HTTP_METHOD = 'http.method',
  HTTP_TARGET = 'http.target',
  HTTP_ROUTE = 'http.route',
  HTTP_URL = 'http.url',
  HTTP_STATUS_CODE = 'http.status_code',
  HTTP_STATUS_TEXT = 'http.status_text',
  HTTP_FLAVOR = 'http.flavor',
  HTTP_SERVER_NAME = 'http.server_name',
  HTTP_CLIENT_IP = 'http.client_ip',
  HTTP_SCHEME = 'http.scheme',

  // http (NOT ON OFFICIAL SPEC)
  HTTP_ERROR_NAME = 'http.error_name',
  HTTP_ERROR_MESSAGE = 'http.error_message',
  HTTP_USER_AGENT = 'http.user_agent',

  // General network connection attributes
  NET_PEER_IP = 'net.peer.ip',
  NET_PEER_PORT = 'net.peer.port',
  NET_PEER_NAME = 'net.peer.name',
  NET_PEER_IPV4 = 'net.peer.ipv4',
  NET_PEER_IPV6 = 'net.peer.ipv6',
  NET_PEER_SERVICE = 'net.peer.service',
  NET_HOST_IP = 'net.host.ip',
  NET_HOST_PORT = 'net.host.port',
  NET_HOST_NAME = 'net.host.name',
  NET_TRANSPORT = 'net.transport',

  // IP
  IP_TCP = 'IP.TCP',
  IP_UDP = 'IP.UDP',

  // db
  // required: https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/trace/semantic_conventions/database.md
  DB_TYPE = 'db.type',
  DB_INSTANCE = 'db.instance',
  DB_STATEMENT = 'db.statement',
  PEER_ADDRESS = 'net.peer.address',
  PEER_HOSTNAME = 'net.peer.host',

  // db (optional)
  DB_USER = 'db.user',
}
