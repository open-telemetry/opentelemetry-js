/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  getHttpConfigurationDefaults,
  mergeOtlpHttpConfigurationWithDefaults,
  OtlpHttpConfiguration,
} from './otlp-http-configuration';
import { OTLPExporterNodeConfigBase } from './legacy-node-configuration';
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
