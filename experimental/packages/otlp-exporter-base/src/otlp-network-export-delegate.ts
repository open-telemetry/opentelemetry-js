/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { internal } from '@opentelemetry/core';

import { createBoundedQueueExportPromiseHandler } from './bounded-queue-export-promise-handler';
import type { OtlpSharedConfiguration } from './configuration/shared-configuration';
import type { ISerializer } from '@opentelemetry/otlp-transformer';
import type { IExporterTransport } from './exporter-transport';
import type { IOtlpExportDelegate } from './otlp-export-delegate';
import { createOtlpExportDelegate } from './otlp-export-delegate';

export function createOtlpNetworkExportDelegate<Internal, Response>(
  options: OtlpSharedConfiguration,
  serializer: ISerializer<Internal, Response>,
  metrics: InstanceType<typeof internal.ExporterMetrics<Internal>>,
  transport: IExporterTransport
): IOtlpExportDelegate<Internal> {
  return createOtlpExportDelegate(
    {
      transport: transport,
      serializer,
      promiseHandler: createBoundedQueueExportPromiseHandler(options),
      metrics,
    },
    { timeout: options.timeoutMillis }
  );
}
