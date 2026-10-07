/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import type { OtlpHttpConfiguration } from '../../../configuration/otlp-http-configuration';
import {
  getHttpConfigurationDefaults,
  mergeOtlpHttpConfigurationWithDefaults,
} from '../../../configuration/otlp-http-configuration';
import type { OTLPExporterConfigBase } from '../../../configuration/legacy-base-configuration';
import { convertLegacyHeaders } from '../../../configuration/convert-legacy-http-options';

/**
 * @deprecated this will be removed in 2.0
 *
 * @param config
 * @param signalResourcePath
 * @param requiredHeaders
 */
export function convertLegacyBrowserHttpOptions(
  config: OTLPExporterConfigBase,
  signalResourcePath: string,
  requiredHeaders: Record<string, string>
): OtlpHttpConfiguration {
  return mergeOtlpHttpConfigurationWithDefaults(
    {
      url: config.url,
      timeoutMillis: config.timeoutMillis,
      headers: convertLegacyHeaders(config),
      concurrencyLimit: config.concurrencyLimit,
      maxRequestSize: config.maxRequestSize,
    },
    {}, // no fallback for browser case
    getHttpConfigurationDefaults(requiredHeaders, signalResourcePath)
  );
}
