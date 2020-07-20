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

import { MetricExporter, MetricRecord } from '@opentelemetry/metrics';
import { Attributes, Logger } from '@opentelemetry/api';
import { CollectorExporterConfigBase } from './types';
import { NoopLogger, ExportResult } from '@opentelemetry/core';
import * as collectorTypes from './types';

const DEFAULT_SERVICE_NAME = 'collector-metric-exporter';

/**
 * Collector Metric Exporter abstract base class
 */
export abstract class CollectorMetricExporterBase<
  T extends CollectorExporterConfigBase
> implements MetricExporter {
  public readonly serviceName: string;
  public readonly url: string;
  public readonly logger: Logger;
  public readonly hostname: string | undefined;
  public readonly attributes?: Attributes;
  protected readonly _startTime = new Date().getTime() * 1000000;
  private _isShutdown: boolean = false;

  /**
   * @param config
   */
  constructor(config: T = {} as T) {
    this.logger = config.logger || new NoopLogger();
    this.serviceName = config.serviceName || DEFAULT_SERVICE_NAME;
    this.url = this.getDefaultUrl(config.url);
    this.attributes = config.attributes;
    if (typeof config.hostname === 'string') {
      this.hostname = config.hostname;
    }
    this.onInit();
  }

  /**
   * Export metrics
   * @param metrics
   * @param resultCallback
   */
  export(
    metrics: MetricRecord[],
    resultCallback: (result: ExportResult) => void
  ) {
    if (this._isShutdown) {
      resultCallback(ExportResult.FAILED_NOT_RETRYABLE);
      return;
    }

    this._exportMetrics(metrics)
      .then(() => {
        resultCallback(ExportResult.SUCCESS);
      })
      .catch((error: collectorTypes.ExportServiceError) => {
        if (error.message) {
          this.logger.error(error.message);
        }
        if (error.code && error.code < 500) {
          resultCallback(ExportResult.FAILED_NOT_RETRYABLE);
        } else {
          resultCallback(ExportResult.FAILED_RETRYABLE);
        }
      });
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
