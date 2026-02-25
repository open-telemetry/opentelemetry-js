/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createBoundedQueueExportPromiseHandler } from './bounded-queue-export-promise-handler';
import { OtlpSharedConfiguration } from './configuration/shared-configuration';
import { ISerializer } from '@opentelemetry/otlp-transformer';
import { IExporterTransport } from './exporter-transport';
import {
  createOtlpExportDelegate,
  IOtlpExportDelegate,
} from './otlp-export-delegate';

export function createOtlpNetworkExportDelegate<Internal, Response>(
  options: OtlpSharedConfiguration,
  serializer: ISerializer<Internal, Response>,
  transport: IExporterTransport
): IOtlpExportDelegate<Internal> {
  return createOtlpExportDelegate(
    {
      transport: transport,
      serializer,
      promiseHandler: createBoundedQueueExportPromiseHandler(options),
    },
    { timeout: options.timeoutMillis }
  );
}
