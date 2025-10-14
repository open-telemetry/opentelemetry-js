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
import { HeadersFactory } from './otlp-http-configuration';

export interface OTLPExporterConfigBase {
  /**
   * Custom headers that will be attached to the HTTP request that's sent to the endpoint.
   *
   * @remarks
   * Prefer using a plain object over a factory function wherever possible.
   * If using a factory function (`HttpAgentFactory`), **do not import `http` or `https` at the top of the file**
   * Instead, use dynamic `import()` or `require()` to load the module. This ensures that the `http` or `https`
   * module is not loaded before `@opentelemetry/instrumentation-http` can instrument it.
   *
   * Functions passed to the exporter MUST NOT throw errors.
   *
   * @example <caption> Using headers options directly: </caption>
   * headers: {
   *  Authorization: "Api-Token my-secret-token",
   * }
   *
   * @example <caption> Using a custom factory function </caption>
   * headers: async () => {
   *   // ... do whatever you need to obtain the headers, ensuring you `await import('your-library')` to avoid breaking instrumentations ...
   *   return {
   *     Authorization: `Bearer ${token}`,
   *   };
   * };
   */
  headers?: Record<string, string> | HeadersFactory;
  url?: string;
  concurrencyLimit?: number;
  /** Maximum time the OTLP exporter will wait for each batch export.
   * The default value is 10000ms. */
  timeoutMillis?: number;
}
