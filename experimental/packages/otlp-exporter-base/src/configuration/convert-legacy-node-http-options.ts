/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import type { OTLPExporterNodeConfigBase } from './legacy-node-configuration';
import { diag } from '@opentelemetry/api';
import type {
  HttpAgentFactory,
  OtlpNodeHttpConfiguration,
} from './otlp-node-http-configuration';
import {
  getNodeHttpConfigurationDefaults,
  mergeOtlpNodeHttpConfigurationWithDefaults,
} from './otlp-node-http-configuration';
import { httpAgentFactoryFromOptions } from '../index-node-http';
import { getNodeHttpConfigurationFromEnvironment } from './otlp-node-http-env-configuration';
import { convertLegacyHeaders } from './convert-legacy-http-options';

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

function getUserProvidedConfiguration(
  config: OTLPExporterNodeConfigBase
): Partial<OtlpNodeHttpConfiguration> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((config as any).metadata) {
    diag.warn('Metadata cannot be set when using http');
  }

  return {
    url: config.url,
    headers: convertLegacyHeaders(config),
    concurrencyLimit: config.concurrencyLimit,
    timeoutMillis: config.timeoutMillis,
    compression: config.compression,
    agentFactory: convertLegacyAgentOptions(config),
    userAgent: config.userAgent,
  };
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
): OtlpNodeHttpConfiguration {
  return mergeOtlpNodeHttpConfigurationWithDefaults(
    getUserProvidedConfiguration(config),
    getNodeHttpConfigurationFromEnvironment(
      signalIdentifier,
      signalResourcePath
    ),
    getNodeHttpConfigurationDefaults(requiredHeaders, signalResourcePath)
  );
}

/**
 * Converts the legacy configuration options into the configuration model used
 * by the OTLP HTTP exporters, without reading configuration from the
 * environment. Options that are not provided in `config` fall back to the
 * defaults defined by the OTLP exporter specification; reading configuration
 * from the environment is the caller's responsibility.
 *
 * @param config user-provided configuration options
 * @param signalResourcePath signal resource path to append to the default URL (e.g.: v1/metrics, v1/traces, v1/logs)
 * @param requiredHeaders headers that are always set, taking precedence over user-provided ones (e.g.: Content-Type)
 */
export function convertLegacyHttpOptionsWithoutEnv(
  config: OTLPExporterNodeConfigBase,
  signalResourcePath: string,
  requiredHeaders: Record<string, string>
): OtlpNodeHttpConfiguration {
  return mergeOtlpNodeHttpConfigurationWithDefaults(
    getUserProvidedConfiguration(config),
    {}, // no fallback from the environment
    getNodeHttpConfigurationDefaults(requiredHeaders, signalResourcePath)
  );
}
