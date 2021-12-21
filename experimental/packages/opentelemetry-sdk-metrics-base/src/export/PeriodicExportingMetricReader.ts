/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as api from '@opentelemetry/api';
import { MetricReader, ReaderResult, ReaderResultCode } from './MetricReader';
import { MetricExporter } from './MetricExporter';
import { MetricData } from './MetricData';

export type PeriodicExportingMetricReaderOptions = {
  exporter: MetricExporter
  exportIntervalMillis?: number,
  exportTimeoutMillis?: number
}

/**
 * {@link MetricReader} which collects metrics based on a user-configurable time interval, and passes the metrics to
 * the configured {@link MetricExporter}
 */
export class PeriodicExportingMetricReader extends MetricReader {
  private _interval?: ReturnType<typeof setInterval>;

  private _exporter: MetricExporter;

  private readonly _exportInterval: number;

  private readonly _exportTimeout: number;

  constructor(options: PeriodicExportingMetricReaderOptions) {
    super(options.exporter.getPreferredAggregationTemporality());

    if (options.exportIntervalMillis !== undefined && options.exportIntervalMillis <= 0) {
      throw Error('exportIntervalMillis must be greater than 0');
    }

    if (options.exportTimeoutMillis !== undefined && options.exportTimeoutMillis <= 0) {
      throw Error('exportTimeoutMillis must be greater than 0');
    }

    if (options.exportTimeoutMillis !== undefined &&
      options.exportIntervalMillis !== undefined &&
      options.exportIntervalMillis < options.exportTimeoutMillis) {
      throw Error('exportIntervalMillis must be greater than or equal to exportTimeoutMillis');
    }

    this._exportInterval = options.exportIntervalMillis ?? 60000;
    this._exportTimeout = options.exportTimeoutMillis ?? 30000;
    this._exporter = options.exporter;
  }

  private async _runOnce(): Promise<void> {
    const collectionResult = await new Promise<ReaderResult<MetricData[]>>(resolve => {
      this.collect(100, (result => {
        resolve(result);
      }))
    });

    if (collectionResult.code !== ReaderResultCode.SUCCESS) {
      throw collectionResult.error ?? new Error('Unknown error occurred during collection.');
    }

    if (collectionResult.returnValue == null) {
      throw new Error('Unknown error occurred during collection.');
    }

    await this._exporter.export(collectionResult.returnValue);
  }

  protected onInitialized(): void {
    this._interval = setInterval(async () => {
      MetricReader.promiseWithTimeout(this._runOnce(), this._exportTimeout, (result => {
        if (result.code === ReaderResultCode.TIMED_OUT) {
          api.diag.error('Export took longer than %s milliseconds and timed out.', this._exportTimeout);
          return;
        }
        if (result.code === ReaderResultCode.FAILED) {
          api.diag.error('Unexpected error during export: %s', result.error);
          return;
        }
      }));
    }, this._exportInterval);
  }

  protected async onForceFlush(): Promise<void> {
    await this._runOnce();
  }

  protected async onShutdown(): Promise<void> {
    if (this._interval) {
      clearInterval(this._interval);
    }

    await this._runOnce();
    await this._exporter.shutdown();
  }
}
