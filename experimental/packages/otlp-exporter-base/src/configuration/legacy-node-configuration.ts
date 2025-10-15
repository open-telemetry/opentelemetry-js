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

// NOTE: do not change these imports to be actual imports, otherwise they WILL break `@opentelemetry/instrumentation-http`
import type * as http from 'http';
import type * as https from 'https';

import type { OTLPExporterConfigBase } from './legacy-base-configuration';
import type { HttpAgentFactory } from './otlp-node-http-configuration';

/**
 * Collector Exporter node base config
 */
export interface OTLPExporterNodeConfigBase extends OTLPExporterConfigBase {
  keepAlive?: boolean;
  compression?: CompressionAlgorithm;
  /**
   * Custom HTTP agent options or a factory function for creating agents.
   *
   * @remarks
   * Prefer using `http.AgentOptions` or `https.AgentOptions` over a factory function wherever possible.
   * If using a factory function (`HttpAgentFactory`), **do not import `http.Agent` or `https.Agent`
   * statically at the top of the file**.
   * Instead, use dynamic `import()` or `require()` to load the module. This ensures that the `http` or `https`
   * module is not loaded before `@opentelemetry/instrumentation-http` can instrument it.
   *
   * @example <caption> Using agent options directly: </caption>
   * httpAgentOptions: {
   *   keepAlive: true,
   *   maxSockets: 10
   * }
   *
   * @example <caption> Using a factory with dynamic import: </caption>
   * httpAgentOptions: async (protocol) => {
   *   const module = protocol === 'http:' ? await import('http') : await import('https');
   *   return new module.Agent({ keepAlive: true });
   * }
   */
  httpAgentOptions?: http.AgentOptions | https.AgentOptions | HttpAgentFactory;
  /**
   * User agent header string to be prepended to the exporter's default value.
   * Availablie since v1.49.0 of the spec.
   * Ref: https://opentelemetry.io/docs/specs/otel/protocol/exporter/#user-agent
   */
  userAgent?: string;
}

export enum CompressionAlgorithm {
  NONE = 'none',
  GZIP = 'gzip',
}
