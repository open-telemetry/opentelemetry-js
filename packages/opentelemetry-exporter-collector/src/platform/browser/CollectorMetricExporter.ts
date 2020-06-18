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
import { MetricRecord } from '@opentelemetry/metrics';
import { CollectorMetricExporterBase } from '../../CollectorMetricExporterBase';
import { toCollectorExportMetricServiceRequest } from '../../transform';
import { CollectorExporterError } from '../../types';

const DEFAULT_COLLECTOR_URL = 'http://localhost:55678/v1/trace';

export class CollectorMetricExporter extends CollectorMetricExporterBase {
  getDefaultUrl(url: string | undefined): string {
    return url || DEFAULT_COLLECTOR_URL;
  }

  onInit(): void {
    window.addEventListener('unload', this.shutdown);
  }

  onShutdown(): void {
    window.removeEventListener('unload', this.shutdown);
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
    console.log(body);
    if (typeof navigator.sendBeacon === 'function') {
      this._sendMetricsWithBeacon(body, onSuccess, onError);
    } else {
      this._sendMetricsWithXhr(body, onSuccess, onError);
    }
    return;
  }

  /**
   * send spans using browser navigator.sendBeacon
   * @param body
   * @param onSuccess
   * @param onError
   */
  private _sendMetricsWithBeacon(
    body: string,
    onSuccess: () => void,
    onError: (error: CollectorExporterError) => void
  ) {
    try {
      if (navigator.sendBeacon(this.url, body)) {
        this.logger.debug('sendBeacon - can send', body);
        onSuccess();
      } else {
        this.logger.error('sendBeacon - cannot send', body);
        onError({});
      }
    } catch (e) {
      onError({});
    }
  }

  /**
   * function to send spans using browser XMLHttpRequest
   *     used when navigator.sendBeacon is not available
   * @param body
   * @param onSuccess
   * @param onError
   */
  private _sendMetricsWithXhr(
    body: string,
    onSuccess: () => void,
    onError: (error: CollectorExporterError) => void
  ) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', this.url);
    xhr.setRequestHeader('x-opentelemetry-outgoing-request', '1');
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(body);

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status >= 200 && xhr.status <= 299) {
          this.logger.debug('xhr success', body);
          onSuccess();
        } else {
          this.logger.error('body', body);
          this.logger.error('xhr error', xhr);
          onError({
            code: xhr.status,
            message: xhr.responseText,
          });
        }
      }
    };
  }
}
