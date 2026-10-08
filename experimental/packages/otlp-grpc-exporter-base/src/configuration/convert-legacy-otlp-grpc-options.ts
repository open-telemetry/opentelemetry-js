/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import type { OTLPGRPCExporterConfigNode } from '../types';
import type { OtlpGrpcConfiguration } from './otlp-grpc-configuration';
import {
  getOtlpGrpcDefaultConfiguration,
  mergeOtlpGrpcConfigurationWithDefaults,
} from './otlp-grpc-configuration';
import { createEmptyMetadata } from '../grpc-exporter-transport';
import { getOtlpGrpcConfigurationFromEnv } from './otlp-grpc-env-configuration';

function getUserProvidedGrpcConfiguration(
  config: OTLPGRPCExporterConfigNode
): Partial<OtlpGrpcConfiguration> {
  // keep credentials locally in case user updates the reference on the config object
  const userProvidedCredentials = config.credentials;
  return {
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
  };
}

/**
 * @deprecated
 * @param config
 * @param signalIdentifier
 */
export function convertLegacyOtlpGrpcOptions(
  config: OTLPGRPCExporterConfigNode,
  signalIdentifier: string
): OtlpGrpcConfiguration {
  return mergeOtlpGrpcConfigurationWithDefaults(
    getUserProvidedGrpcConfiguration(config),
    getOtlpGrpcConfigurationFromEnv(signalIdentifier),
    getOtlpGrpcDefaultConfiguration()
  );
}

/**
 * Converts the legacy configuration options into the configuration model used
 * by the OTLP gRPC exporters, without reading configuration from the
 * environment. Options that are not provided in `config` fall back to the
 * defaults defined by the OTLP exporter specification; reading configuration
 * from the environment is the caller's responsibility.
 *
 * @param config user-provided configuration options
 */
export function convertLegacyOtlpGrpcOptionsWithoutEnv(
  config: OTLPGRPCExporterConfigNode
): OtlpGrpcConfiguration {
  return mergeOtlpGrpcConfigurationWithDefaults(
    getUserProvidedGrpcConfiguration(config),
    {}, // no fallback from the environment
    getOtlpGrpcDefaultConfiguration()
  );
}
