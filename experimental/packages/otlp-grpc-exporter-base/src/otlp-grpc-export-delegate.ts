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
  type IExporterSignal,
} from '@opentelemetry/otlp-exporter-base';
import type { ISerializer } from '@opentelemetry/otlp-transformer';
import type { OtlpGrpcConfiguration } from './configuration/otlp-grpc-configuration';
import { createOtlpGrpcExporterTransport } from './grpc-exporter-transport';
import { ATTR_RPC_RESPONSE_STATUS_CODE } from './semconv';

export function createOtlpGrpcExportDelegate<Internal, Response>(
  options: OtlpGrpcConfiguration,
  serializer: ISerializer<Internal, Response>,
  metricsComponentType: string,
  signal: IExporterSignal<Internal>,
  meterProvider: MeterProvider | undefined,
  grpcName: string,
  grpcPath: string
): IOtlpExportDelegate<Internal> {
  return createOtlpNetworkExportDelegate(
    options,
    serializer,
    new ExporterMetrics({
      componentType: metricsComponentType,
      signal,
      url: options.url,
      meterProvider,
      errorAttributes: (error: unknown) => {
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
    }),
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
