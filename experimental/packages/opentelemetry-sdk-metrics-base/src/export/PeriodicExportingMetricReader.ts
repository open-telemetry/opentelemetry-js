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
import { ExportResultCode, globalErrorHandler } from '@opentelemetry/core';
import { MetricReader } from './MetricReader';
import { PushMetricExporter } from './MetricExporter';
import { callWithTimeout, TimeoutError } from '../utils';

export type PeriodicExportingMetricReaderOptions = {
  exporter: PushMetricExporter
  exportIntervalMillis?: number,
  exportTimeoutMillis?: number
};

/**
 * {@link MetricReader} which collects metrics based on a user-configurable time interval, and passes the metrics to
 * the configured {@link MetricExporter}
 */
export class PeriodicExportingMetricReader extends MetricReader {
  private _interval?: ReturnType<typeof setInterval>;

  private _exporter: PushMetricExporter;

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
    const metrics = await this.collect({});

    if (metrics === undefined) {
      return;
    }

    return new Promise((resolve, reject) => {
      this._exporter.export(metrics, result => {
        if (result.code !== ExportResultCode.SUCCESS) {
          reject(
            result.error ??
              new Error(
                `PeriodicExportingMetricReader: metrics export failed (error ${result.error})`
              )
          );
        } else {
          resolve();
        }
      });
    });
  }

  protected override onInitialized(): void {
    // start running the interval as soon as this reader is initialized and keep handle for shutdown.
    this._interval = setInterval(async () => {
      try {
        await callWithTimeout(this._runOnce(), this._exportTimeout);
      } catch (err) {
        if (err instanceof TimeoutError) {
          api.diag.error('Export took longer than %s milliseconds and timed out.', this._exportTimeout);
          return;
        }

        globalErrorHandler(err);
      }
    }, this._exportInterval);
  }

  protected async onForceFlush(): Promise<void> {
    await this._exporter.forceFlush();
  }

  protected async onShutdown(): Promise<void> {
    if (this._interval) {
      clearInterval(this._interval);
    }

    await this._exporter.shutdown();
  }
}
