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
import { diag } from '@opentelemetry/api';
import { wrapStaticHeadersInFunction } from './shared-configuration';
import {
  getNodeHttpConfigurationDefaults,
  HttpAgentFactory,
  mergeOtlpNodeHttpConfigurationWithDefaults,
  OtlpNodeHttpConfiguration,
} from './otlp-node-http-configuration';
import { httpAgentFactoryFromOptions } from '../index-node-http';
import { getNodeHttpConfigurationFromEnvironment } from './otlp-node-http-env-configuration';

function convertLegacyAgentOptions(
  config: OTLPExporterNodeConfigBase
): HttpAgentFactory | undefined {
  if (typeof config.httpAgentOptions === 'function') {
    return config.httpAgentOptions;
  }

  let legacy = config.httpAgentOptions;
  if (config.keepAlive != null) {
    legacy = { keepAlive: config.keepAlive, ...legacy };
  }

  if (legacy != null) {
    return httpAgentFactoryFromOptions(legacy);
  } else {
    return undefined;
  }
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
): Required<OtlpNodeHttpConfiguration> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((config as any).metadata) {
    diag.warn('Metadata cannot be set when using http');
  }

  return mergeOtlpNodeHttpConfigurationWithDefaults(
    {
      url: config.url,
      headers: wrapStaticHeadersInFunction(config.headers),
      concurrencyLimit: config.concurrencyLimit,
      timeoutMillis: config.timeoutMillis,
      compression: config.compression,
      agentFactory: convertLegacyAgentOptions(config),
      userAgent: config.userAgent,
    },
    getNodeHttpConfigurationFromEnvironment(
      signalIdentifier,
      signalResourcePath
    ),
    getNodeHttpConfigurationDefaults(requiredHeaders, signalResourcePath)
  );
}
