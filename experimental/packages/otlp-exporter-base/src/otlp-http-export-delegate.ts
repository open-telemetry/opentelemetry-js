/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { MeterProvider } from '@opentelemetry/api';

import type { IOtlpExportDelegate } from './otlp-export-delegate';
import { createOtlpExportDelegate } from './otlp-export-delegate';
import type { ISerializer } from '@opentelemetry/otlp-transformer';
import { createHttpExporterTransport } from './transport/http-exporter-transport';
import { createBoundedQueueExportPromiseHandler } from './bounded-queue-export-promise-handler';
import { createRetryingTransport } from './retrying-transport';
import type { OtlpNodeHttpConfiguration } from './configuration/otlp-node-http-configuration';
import { OTLPExporterError } from './types';
import { ATTR_HTTP_RESPONSE_STATUS_CODE } from './semconv';
import {
  ExporterMetrics,
  type IExporterMetricsHelper,
} from './ExporterMetrics';

export function createOtlpHttpExporterMetrics<Internal>(
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
    errorAttributes: (error: unknown) => {
      if (!(error instanceof OTLPExporterError)) {
        return {};
      }
      return {
        [ATTR_HTTP_RESPONSE_STATUS_CODE]: error.code,
      };
    },
  });
}

export function createOtlpHttpExportDelegate<Internal, Response>(
  options: OtlpNodeHttpConfiguration,
  serializer: ISerializer<Internal, Response>,
  metricsComponentType: string,
  exporterMetricsHelper: IExporterMetricsHelper<Internal>,
  meterProvider: MeterProvider | undefined
): IOtlpExportDelegate<Internal> {
  return createOtlpExportDelegate(
    {
      transport: createRetryingTransport({
        transport: createHttpExporterTransport(options),
      }),
      serializer: serializer,
      promiseHandler: createBoundedQueueExportPromiseHandler(options),
      metrics: createOtlpHttpExporterMetrics(
        metricsComponentType,
        exporterMetricsHelper,
        options.url,
        meterProvider
      ),
    },
    { timeout: options.timeoutMillis }
  );
}
