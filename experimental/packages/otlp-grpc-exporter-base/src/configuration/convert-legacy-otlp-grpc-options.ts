/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
