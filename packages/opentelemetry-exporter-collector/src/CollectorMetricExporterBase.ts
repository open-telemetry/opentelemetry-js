/*
 * Copyright 2020, OpenTelemetry Authors
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
import { MetricExporter, MetricRecord } from '@opentelemetry/metrics';
import { Attributes, Logger } from '@opentelemetry/api';
import { ExporterOptions } from './types';
import { NoopLogger, ExportResult } from '@opentelemetry/core';
import * as collectorTypes from './types';

const DEFAULT_SERVICE_NAME = 'collector-metric-exporter';

export abstract class CollectorMetricExporterBase implements MetricExporter {
  public readonly logger: Logger;
  public readonly url: string;
  protected readonly _startTime = new Date().getTime() * 1000000;
  private _isShutdown: boolean = false;
  public readonly attributes?: Attributes;
  public readonly hostName: string | undefined;
  public readonly serviceName: string;

  constructor(options: ExporterOptions = {}) {
    this.logger = options.logger || new NoopLogger();
    this.serviceName = options.serviceName || DEFAULT_SERVICE_NAME;
    this.url = this.getDefaultUrl(options.url);
    this.attributes = options.attributes;
    if (typeof options.hostName === 'string') {
      this.hostName = options.hostName;
    }
    this.onInit();
  }

  export(metrics: MetricRecord[], cb: (result: ExportResult) => void) {
    if (this._isShutdown) {
      cb(ExportResult.FAILED_NOT_RETRYABLE);
      return;
    }

    this._exportMetrics(metrics)
      .then(() => {
        cb(ExportResult.SUCCESS);
      })
      .catch(
        (
          error: collectorTypes.opentelemetryProto.collector.trace.v1.ExportTraceServiceError
        ) => {
          if (error.message) {
            this.logger.error(error.message);
          }
          if (error.code && error.code < 500) {
            cb(ExportResult.FAILED_NOT_RETRYABLE);
          } else {
            cb(ExportResult.FAILED_RETRYABLE);
          }
        }
      );
  }

  private _exportMetrics(metrics: MetricRecord[]): Promise<unknown> {
    return new Promise((resolve, reject) => {
      try {
        this.logger.debug('metrics to be sent', metrics);
        // Send metrics to [opentelemetry collector]{@link https://github.com/open-telemetry/opentelemetry-collector}
        // it will use the appropriate transport layer automatically depends on platform
        this.sendMetrics(metrics, resolve, reject);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Shutdown the exporter.
   */
  shutdown(): void {
    if (this._isShutdown) {
      this.logger.debug('shutdown already started');
      return;
    }
    this._isShutdown = true;
    this.logger.debug('shutdown started');

    // platform dependent
    this.onShutdown();
  }

  abstract getDefaultUrl(url: string | undefined): string;
  abstract onInit(): void;
  abstract onShutdown(): void;
  abstract sendMetrics(
    metrics: MetricRecord[],
    onSuccess: () => void,
    onError: (error: collectorTypes.CollectorExporterError) => void
  ): void;
}
