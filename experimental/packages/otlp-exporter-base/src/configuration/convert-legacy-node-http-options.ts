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
import { OTLPExporterNodeConfigBase } from './legacy-node-configuration';
import {
  getHttpConfigurationDefaults,
  mergeOtlpHttpConfigurationWithDefaults,
  OtlpHttpConfiguration,
} from './otlp-http-configuration';
import { getHttpConfigurationFromEnvironment } from './otlp-http-env-configuration';
import type * as http from 'http';
import type * as https from 'https';
import { diag } from '@opentelemetry/api';

function convertLegacyAgentOptions(
  config: OTLPExporterNodeConfigBase
): http.AgentOptions | https.AgentOptions | undefined {
  // populate keepAlive for use with new settings
  if (config?.keepAlive != null) {
    if (config.httpAgentOptions != null) {
      if (config.httpAgentOptions.keepAlive == null) {
        // specific setting is not set, populate with non-specific setting.
        config.httpAgentOptions.keepAlive = config.keepAlive;
      }
      // do nothing, use specific setting otherwise
    } else {
      // populate specific option if AgentOptions does not exist.
      config.httpAgentOptions = {
        keepAlive: config.keepAlive,
      };
    }
  }

  return config.httpAgentOptions;
}

/**
 * @deprecated this will be removed in 2.0
 * @param config
 * @param signalIdentifier
 * @param signalResourcePath
 * @param requiredHeaders
 */
export function convertLegacyHttpOptions(
  config: OTLPExporterNodeConfigBase,
  signalIdentifier: string,
  signalResourcePath: string,
  requiredHeaders: Record<string, string>
): OtlpHttpConfiguration {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((config as any).metadata) {
    diag.warn('Metadata cannot be set when using http');
  }

  return mergeOtlpHttpConfigurationWithDefaults(
    {
      url: config.url,
      headers: config.headers,
      concurrencyLimit: config.concurrencyLimit,
      timeoutMillis: config.timeoutMillis,
      compression: config.compression,
      agentOptions: convertLegacyAgentOptions(config),
    },
    getHttpConfigurationFromEnvironment(signalIdentifier, signalResourcePath),
    getHttpConfigurationDefaults(requiredHeaders, signalResourcePath)
  );
}
