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
import { OTLPGRPCExporterConfigNode } from '../types';
import { diag } from '@opentelemetry/api';
import {
  getOtlpGrpcDefaultConfiguration,
  mergeOtlpGrpcConfigurationWithDefaults,
  OtlpGrpcConfiguration,
} from './otlp-grpc-configuration';
import { createEmptyMetadata } from '../grpc-exporter-transport';
import { getOtlpGrpcConfigurationFromEnv } from './otlp-grpc-env-configuration';

/**
 * @deprecated
 * @param config
 * @param signalIdentifier
 */
export function convertLegacyOtlpGrpcOptions(
  config: OTLPGRPCExporterConfigNode,
  signalIdentifier: string
): OtlpGrpcConfiguration {
  if (config.headers) {
    diag.warn('Headers cannot be set when using grpc');
  }

  // keep credentials locally in case user updates the reference on the config object
  const userProvidedCredentials = config.credentials;
  return mergeOtlpGrpcConfigurationWithDefaults(
    {
      url: config.url,
      metadata: () => {
        // metadata resolution strategy is merge, so we can return empty here, and it will not override the rest of the settings.
        return config.metadata ?? createEmptyMetadata();
      },
      compression: config.compression,
      timeoutMillis: config.timeoutMillis,
      concurrencyLimit: config.concurrencyLimit,
      credentials:
        userProvidedCredentials != null
          ? () => userProvidedCredentials
          : undefined,
      userAgent: config.userAgent,
    },
    getOtlpGrpcConfigurationFromEnv(signalIdentifier),
    getOtlpGrpcDefaultConfiguration()
  );
}
