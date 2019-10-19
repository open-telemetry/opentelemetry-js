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

/**
 * Attributes Names according [OpenTelemetry attributes specs](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/data-semantic-conventions.md)
 */
export enum AttributeNames {
  COMPONENT = 'component',
  PEER_HOSTNAME = 'peer.hostname',
  PEER_PORT = 'peer.port',
  PEER_SERVICE = 'peer.service',
  // NOT ON OFFICIAL SPEC
  DNS_ERROR_CODE = 'dns.error_code',
  DNS_ERROR_NAME = 'dns.error_name',
  DNS_ERROR_MESSAGE = 'dns.error_message',
}
