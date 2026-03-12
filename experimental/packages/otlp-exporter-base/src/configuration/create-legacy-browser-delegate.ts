/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { MeterProvider } from '@opentelemetry/api';
import type { ISerializer } from '@opentelemetry/otlp-transformer';
import { createOtlpFetchExportDelegate } from '../otlp-browser-http-export-delegate';
import { convertLegacyBrowserHttpOptions } from './convert-legacy-browser-http-options';
import type { IOtlpExportDelegate } from '../otlp-export-delegate';
import type { OTLPExporterConfigBase } from './legacy-base-configuration';
import { ATTR_HTTP_RESPONSE_STATUS_CODE } from '../semconv';
import { ExporterMetrics, type IExporterSignal } from '../ExporterMetrics';

/**
 * @deprecated
 */
export function createLegacyOtlpBrowserExporterMetrics<Internal>(
  metricsComponentType: string,
  signal: IExporterSignal<Internal>,
  url: string | undefined,
  meterProvider: MeterProvider | undefined
): ExporterMetrics<Internal> {
  return new ExporterMetrics({
    componentType: metricsComponentType,
    signal,
    url,
    meterProvider,
    errorAttributes: (error: unknown) => {
      if (!(error instanceof Error)) {
        return {};
      }
      if (
        error.message.startsWith(
          'Fetch request failed with non-retryable status '
        )
      ) {
        const statusStr = error.message.substring(
          'Fetch request failed with non-retryable status '.length
        );
        return {
          [ATTR_HTTP_RESPONSE_STATUS_CODE]: Number(statusStr),
        };
      }
      return {};
    },
  });
}

/**
 * @deprecated
 * @param config
 * @param serializer
 * @param signalResourcePath
 * @param requiredHeaders
 */
export function createLegacyOtlpBrowserExportDelegate<Internal, Response>(
  config: OTLPExporterConfigBase,
  serializer: ISerializer<Internal, Response>,
  metricsComponentType: string,
  signal: IExporterSignal<Internal>,
  meterProvider: MeterProvider | undefined,
  signalResourcePath: string,
  requiredHeaders: Record<string, string>
): IOtlpExportDelegate<Internal> {
  const options = convertLegacyBrowserHttpOptions(
    config,
    signalResourcePath,
    requiredHeaders
  );

  return createOtlpFetchExportDelegate(
    options,
    serializer,
    createLegacyOtlpBrowserExporterMetrics(
      metricsComponentType,
      signal,
      options.url,
      config.meterProvider
    )
  );
}
