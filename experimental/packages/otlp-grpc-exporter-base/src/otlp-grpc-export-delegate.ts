/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { IOtlpExportDelegate } from '@opentelemetry/otlp-exporter-base';
import { createOtlpNetworkExportDelegate } from '@opentelemetry/otlp-exporter-base';
import type { ISerializer } from '@opentelemetry/otlp-transformer';
import type { OtlpGrpcConfiguration } from './configuration/otlp-grpc-configuration';
import { createOtlpGrpcExporterTransport } from './grpc-exporter-transport';

export function createOtlpGrpcExportDelegate<Internal, Response>(
  options: OtlpGrpcConfiguration,
  serializer: ISerializer<Internal, Response>,
  grpcName: string,
  grpcPath: string
): IOtlpExportDelegate<Internal> {
  return createOtlpNetworkExportDelegate(
    options,
    serializer,
    createOtlpGrpcExporterTransport({
      address: options.url,
      compression: options.compression,
      credentials: options.credentials,
      metadata: options.metadata,
      userAgent: options.userAgent,
      channelOptions: options.channelOptions,
      grpcName,
      grpcPath,
    })
  );
}
