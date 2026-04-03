/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createNoopMeter } from '@opentelemetry/api';
import type { ExportResult } from '@opentelemetry/core';
import {
  BindOnceFuture,
  ExportResultCode,
  globalErrorHandler,
  internal,
} from '@opentelemetry/core';
import type { LogRecordExporter } from './LogRecordExporter';
import type { LogRecordProcessor } from '../LogRecordProcessor';
import type { SdkLogRecord } from './SdkLogRecord';
import type { LogRecordProcessorConfig } from './LogRecordProcessorConfig';
import { OTEL_COMPONENT_TYPE_VALUE_SIMPLE_LOG_PROCESSOR } from '../semconv';
import { LogRecordProcessorMetrics } from './LogRecordProcessorMetrics';

/**
 * An implementation of the {@link LogRecordProcessor} interface that exports
 * each {@link LogRecord} as it is emitted.
 *
 * NOTE: This {@link LogRecordProcessor} exports every {@link LogRecord}
 * individually instead of batching them together, which can cause significant
 * performance overhead with most exporters. For production use, please consider
 * using the {@link BatchLogRecordProcessor} instead.
 */
export class SimpleLogRecordProcessor implements LogRecordProcessor {
  private readonly _exporter: LogRecordExporter;
  private readonly _metrics: LogRecordProcessorMetrics;
  private _shutdownOnce: BindOnceFuture<void>;
  private _unresolvedExports: Set<Promise<void>>;

  constructor(exporter: LogRecordExporter, config?: LogRecordProcessorConfig) {
    this._exporter = exporter;
    this._shutdownOnce = new BindOnceFuture(this._shutdown, this);
    this._unresolvedExports = new Set<Promise<void>>();

    const meter = config?.meterProvider
      ? config.meterProvider.getMeter('@opentelemetry/sdk-logs')
      : createNoopMeter();
    this._metrics = new LogRecordProcessorMetrics(
      OTEL_COMPONENT_TYPE_VALUE_SIMPLE_LOG_PROCESSOR,
      meter
    );
  }

  public onEmit(logRecord: SdkLogRecord): void {
    if (this._shutdownOnce.isCalled) {
      return;
    }

    const doExport = () =>
      internal
        ._export(this._exporter, [logRecord])
        .then((result: ExportResult) => {
          this._metrics.finishLogs(1, result.error);
          if (result.code !== ExportResultCode.SUCCESS) {
            globalErrorHandler(
              result.error ??
                new Error(
                  `SimpleLogRecordProcessor: log record export failed (status ${result})`
                )
            );
          }
        })
        .catch(globalErrorHandler);

    // Avoid scheduling a promise to make the behavior more predictable and easier to test
    if (logRecord.resource.asyncAttributesPending) {
      const exportPromise = logRecord.resource
        .waitForAsyncAttributes?.()
        .then(() => {
          // Using TS Non-null assertion operator because exportPromise could not be null in here
          // if waitForAsyncAttributes is not present this code will never be reached
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this._unresolvedExports.delete(exportPromise!);
          return doExport();
        }, globalErrorHandler);

      // store the unresolved exports
      if (exportPromise != null) {
        this._unresolvedExports.add(exportPromise);
      }
    } else {
      void doExport();
    }
  }

  public async forceFlush(): Promise<void> {
    // await unresolved resources before resolving
    await Promise.all(Array.from(this._unresolvedExports));
  }

  public shutdown(): Promise<void> {
    return this._shutdownOnce.call();
  }

  private _shutdown(): Promise<void> {
    this._metrics.shutdown();
    return this._exporter.shutdown();
  }
}
