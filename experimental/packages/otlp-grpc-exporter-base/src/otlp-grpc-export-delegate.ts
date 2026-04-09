/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { MeterProvider } from '@opentelemetry/api';

import type { ServiceError } from '@grpc/grpc-js';
import type { IOtlpExportDelegate } from '@opentelemetry/otlp-exporter-base';
import {
  createOtlpNetworkExportDelegate,
  ExporterMetrics,
} from '@opentelemetry/otlp-exporter-base';
import type {
  IExporterMetricsHelper,
  ISerializer,
} from '@opentelemetry/otlp-transformer';
import type { OtlpGrpcConfiguration } from './configuration/otlp-grpc-configuration';
import { createOtlpGrpcExporterTransport } from './grpc-exporter-transport';
import { ATTR_RPC_RESPONSE_STATUS_CODE } from './semconv';

export function createOtlpGrpcExporterMetrics<Internal>(
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
          [ATTR_RPC_RESPONSE_STATUS_CODE]: 'OK',
        };
      }
      if (!isServiceError(error)) {
        return {};
      }
      // Lazy-load so that we don't need to require/import '@grpc/grpc-js' before it can be wrapped by instrumentation.
      const { status } =
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/consistent-type-imports
        require('@grpc/grpc-js') as typeof import('@grpc/grpc-js');
      const statusName = status[error.code] ?? 'UNKNOWN';
      return {
        [ATTR_RPC_RESPONSE_STATUS_CODE]: statusName,
      };
    },
  });
}

export function createOtlpGrpcExportDelegate<Internal, Response>(
  options: OtlpGrpcConfiguration,
  serializer: ISerializer<Internal, Response>,
  metricsComponentType: string,
  exporterMetricsHelper: IExporterMetricsHelper<Internal>,
  meterProvider: MeterProvider | undefined,
  grpcName: string,
  grpcPath: string
): IOtlpExportDelegate<Internal> {
  return createOtlpNetworkExportDelegate(
    options,
    serializer,
    createOtlpGrpcExporterMetrics(
      metricsComponentType,
      exporterMetricsHelper,
      options.url,
      meterProvider
    ),
    createOtlpGrpcExporterTransport({
      address: options.url,
      compression: options.compression,
      credentials: options.credentials,
      metadata: options.metadata,
      userAgent: options.userAgent,
      grpcName,
      grpcPath,
    })
  );
}

function isServiceError(error: unknown): error is ServiceError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'number'
  );
}
