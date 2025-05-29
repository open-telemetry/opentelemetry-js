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

import { OTLPExporterConfigBase } from './legacy-base-configuration';

/**
 * Collector Exporter node base config
 */
export interface OTLPExporterNodeConfigBase extends OTLPExporterConfigBase {
  keepAlive?: boolean;
  compression?: CompressionAlgorithm;
  httpAgentOptions?: http.AgentOptions | https.AgentOptions;
  /**
   * {@link httpAgentOptions} should be preferred in almost all cases.
   *
   * This option exists to allow passing an instance of a custom HTTP agent
   * class for advanced use cases.
   * Great care must be taken not to require the `http` module before it is
   * instrumented (for instance by importing the `Agent` class to extend it)
   * in CommonJS code, as this will break the instrumentation and no telemetry
   * data will be collected.
   */
  httpAgent?: http.Agent | https.Agent;
}

export enum CompressionAlgorithm {
  NONE = 'none',
  GZIP = 'gzip',
}
