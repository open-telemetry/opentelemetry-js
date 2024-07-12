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

import { getEnv } from '@opentelemetry/core';
import {
  appendResourcePathToUrl,
  appendRootPathToUrlIfNeeded,
  OTLPExporterConfigBase,
} from '@opentelemetry/otlp-exporter-base';

const DEFAULT_COLLECTOR_RESOURCE_PATH = 'v1/logs';
export const DEFAULT_COLLECTOR_URL = `http://localhost:4318/${DEFAULT_COLLECTOR_RESOURCE_PATH}`;

/**
 * common get default url
 * @param config exporter config
 * @returns url string
 */
export function getDefaultUrl(config: OTLPExporterConfigBase): string {
  if (typeof config.url === 'string') {
    return config.url;
  }

  const env = getEnv();
  if (env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT.length > 0) {
    return appendRootPathToUrlIfNeeded(env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT);
  }

  if (env.OTEL_EXPORTER_OTLP_ENDPOINT.length > 0) {
    return appendResourcePathToUrl(
      env.OTEL_EXPORTER_OTLP_ENDPOINT,
      DEFAULT_COLLECTOR_RESOURCE_PATH
    );
  }

  return DEFAULT_COLLECTOR_URL;
}
