/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import { diag } from '@opentelemetry/api';
import type { OtlpHttpConfiguration } from './otlp-http-configuration';
import {
  getHttpConfigurationDefaults,
  mergeOtlpHttpConfigurationWithDefaults,
} from './otlp-http-configuration';
import type { OTLPExporterNodeConfigBase } from './legacy-node-configuration';
import { CompressionAlgorithm } from './legacy-node-configuration';
import { convertLegacyHeaders } from './convert-legacy-http-options';

/**
 * @deprecated this will be removed in 2.0
 *
 * @param config
 * @param signalResourcePath
 * @param requiredHeaders
 */
export function convertLegacyBrowserHttpOptions(
  config: OTLPExporterNodeConfigBase,
  signalResourcePath: string,
  requiredHeaders: Record<string, string>
): OtlpHttpConfiguration {
  // The shared config type accepts compression, but browsers always send uncompressed.
  if (
    config.compression !== undefined &&
    config.compression !== CompressionAlgorithm.NONE
  ) {
    diag.warn(
      `OTLP exporter: compression "${config.compression}" is not supported in browsers; sending uncompressed.`
    );
  }
  return mergeOtlpHttpConfigurationWithDefaults(
    {
      url: config.url,
      timeoutMillis: config.timeoutMillis,
      headers: convertLegacyHeaders(config),
      concurrencyLimit: config.concurrencyLimit,
    },
    {}, // no fallback for browser case
    getHttpConfigurationDefaults(requiredHeaders, signalResourcePath)
  );
}
