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

/**
 * https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/trace/semantic_conventions/http.md
 */
export enum AttributeNames {
  COMPONENT = 'component',
  HTTP_HOST = 'http.host',
  HTTP_FLAVOR = 'http.flavor',
  HTTP_METHOD = 'http.method',
  HTTP_SCHEME = 'http.scheme',
  HTTP_STATUS_CODE = 'http.status_code',
  HTTP_STATUS_TEXT = 'http.status_text',
  HTTP_URL = 'http.url',
  HTTP_TARGET = 'http.target',
  HTTP_USER_AGENT = 'http.user_agent',
  HTTP_RESPONSE_CONTENT_LENGTH = 'http.response_content_length',
}
