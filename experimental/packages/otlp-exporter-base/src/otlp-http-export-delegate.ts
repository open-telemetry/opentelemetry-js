/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  createOtlpExportDelegate,
  IOtlpExportDelegate,
} from './otlp-export-delegate';
import { ISerializer } from '@opentelemetry/otlp-transformer';
import { createHttpExporterTransport } from './transport/http-exporter-transport';
import { createBoundedQueueExportPromiseHandler } from './bounded-queue-export-promise-handler';
import { createRetryingTransport } from './retrying-transport';
import { OtlpNodeHttpConfiguration } from './configuration/otlp-node-http-configuration';

export function createOtlpHttpExportDelegate<Internal, Response>(
  options: OtlpNodeHttpConfiguration,
  serializer: ISerializer<Internal, Response>
): IOtlpExportDelegate<Internal> {
  return createOtlpExportDelegate(
    {
      transport: createRetryingTransport({
        transport: createHttpExporterTransport(options),
      }),
      serializer: serializer,
      promiseHandler: createBoundedQueueExportPromiseHandler(options),
    },
    { timeout: options.timeoutMillis }
  );
}
