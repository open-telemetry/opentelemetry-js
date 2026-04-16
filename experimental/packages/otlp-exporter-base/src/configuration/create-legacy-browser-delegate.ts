/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { MeterProvider } from '@opentelemetry/api';
import type {
  IExporterMetricsHelper,
  ISerializer,
} from '@opentelemetry/otlp-transformer';
import { createOtlpFetchExportDelegate } from '../otlp-browser-http-export-delegate';
import { convertLegacyBrowserHttpOptions } from './convert-legacy-browser-http-options';
import type { IOtlpExportDelegate } from '../otlp-export-delegate';
import type { OTLPExporterConfigBase } from './legacy-base-configuration';
import { ATTR_HTTP_RESPONSE_STATUS_CODE } from '../semconv';
import { ExporterMetrics } from '../ExporterMetrics';

/**
 * @deprecated
 */
export function createLegacyOtlpBrowserExporterMetrics<Internal>(
  metricsComponentType: string,
  exporterMetricsHelper: IExporterMetricsHelper<Internal>,
  url: string | undefined,
  meterProvider: MeterProvider | undefined
): ExporterMetrics<Internal> {
  return new ExporterMetrics({
    componentType: metricsComponentType,
    metricsHelper: exporterMetricsHelper,
    url,
    meterProvider,
    responseAttributes: (error: unknown) => {
      if (!error) {
        return {
          [ATTR_HTTP_RESPONSE_STATUS_CODE]: 200,
        };
      }
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
  exporterMetricsHelper: IExporterMetricsHelper<Internal>,
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
      exporterMetricsHelper,
      options.url,
      config.meterProvider
    )
  );
}
