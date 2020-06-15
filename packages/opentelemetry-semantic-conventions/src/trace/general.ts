/*
 * Copyright The OpenTelemetry Authors
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
export const GeneralAttribute = {
  // Not in spec
  COMPONENT: 'component',

  NET_PEER_IP: 'net.peer.ip',
  NET_PEER_ADDRESS: 'net.peer.address',
  NET_PEER_HOSTNAME: 'net.peer.host',
  NET_PEER_PORT: 'net.peer.port',
  NET_PEER_NAME: 'net.peer.name',
  NET_PEER_IPV4: 'net.peer.ipv4',
  NET_PEER_IPV6: 'net.peer.ipv6',
  NET_PEER_SERVICE: 'net.peer.service',
  NET_HOST_IP: 'net.host.ip',
  NET_HOST_PORT: 'net.host.port',
  NET_HOST_NAME: 'net.host.name',
  NET_TRANSPORT: 'net.transport',

  // These are used as potential values to NET_TRANSPORT
  IP_TCP: 'IP.TCP',
  IP_UDP: 'IP.UDP',
  INPROC: 'inproc',
};
