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
import { MetricRecord } from '@opentelemetry/metrics';
import { CollectorMetricExporterBase } from '../../CollectorMetricExporterBase';
import { toCollectorExportMetricServiceRequest } from '../../transform';
import {
  CollectorExporterError,
  CollectorExporterConfigBrowser,
  OT_REQUEST_HEADER,
} from '../../types';
import { sendWithBeacon, sendWithXhr } from './util';

const DEFAULT_COLLECTOR_URL = 'http://localhost:55678/v1/metrics';

/**
 * Collector Metric Exporter for Web
 */
export class CollectorMetricExporter extends CollectorMetricExporterBase<
  CollectorExporterConfigBrowser
> {
  DEFAULT_HEADERS: { [key: string]: string } = {
    [OT_REQUEST_HEADER]: '1',
  };
  private _headers: { [key: string]: string };
  private _useXHR: boolean = false;
  /**
   * @param config
   */
  constructor(config: CollectorExporterConfigBrowser = {}) {
    super(config);
    this._headers = config.headers || this.DEFAULT_HEADERS;
    this._useXHR =
      !!config.headers || typeof navigator.sendBeacon !== 'function';
  }

  onInit(): void {
    window.addEventListener('unload', this.shutdown);
  }

  onShutdown(): void {
    window.removeEventListener('unload', this.shutdown);
  }

  getDefaultUrl(url: string | undefined): string {
    return url || DEFAULT_COLLECTOR_URL;
  }

  sendMetrics(
    metrics: MetricRecord[],
    onSuccess: () => void,
    onError: (error: CollectorExporterError) => void
  ): void {
    const exportMetricServiceRequest = toCollectorExportMetricServiceRequest(
      metrics,
      this._startTime,
      this
    );
    const body = JSON.stringify(exportMetricServiceRequest);
    if (this._useXHR) {
      sendWithXhr(
        body,
        this.url,
        this._headers,
        this.logger,
        onSuccess,
        onError
      );
    } else {
      sendWithBeacon(body, this.url, this.logger, onSuccess, onError);
    }
  }
}
