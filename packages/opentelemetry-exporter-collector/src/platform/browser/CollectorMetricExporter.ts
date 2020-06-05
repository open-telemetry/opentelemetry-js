import {
    MetricExporter,
    MetricRecord,
  } from '@opentelemetry/metrics';

import {Logger} from '@opentelemetry/api';
import { toCollectorExportMetricServiceRequest } from '../../transform';
import {CollectorExporterError, ExporterOptions} from '../../types';
import { ExportResult, NoopLogger } from '@opentelemetry/core';
export class CollectorMetricExporter implements MetricExporter {
  public readonly logger: Logger;
  public readonly url: string;
  
  constructor(options: ExporterOptions = {}) {
    this.logger = options.logger || new NoopLogger();
    this.url = options.url || 'http://localhost:55678/v1/metrics';
  }

  export(metrics: MetricRecord[], cb: (result: ExportResult) => void) {
    this._exportMetrics(metrics);
  }

  private _exportMetrics(metrics: MetricRecord[]) {
    return new Promise((resolve, reject) => {
      try {
        this.logger.debug('metrics to be sent', metrics);
        // Send spans to [opentelemetry collector]{@link https://github.com/open-telemetry/opentelemetry-collector}
        // it will use the appropriate transport layer automatically depends on platform
        this.sendMetrics(metrics, resolve, reject);
      } catch (e) {
        console.log("Error");
        console.log(e);
        reject(e);
      }
    });
  }

  sendMetrics(metrics: MetricRecord[], onSuccess: () => void, onError: (error: CollectorExporterError) => void): void {
    const exportMetricServiceRequest = toCollectorExportMetricServiceRequest(metrics);
    const body = JSON.stringify(exportMetricServiceRequest);
    console.log(body);
    if (typeof navigator.sendBeacon === 'function') { // Fix this later
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
      console.log(":(");
      onError({});
    }
  } catch (e) {
    console.log("huh");
    console.log(e);
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

// ExportMetricsServiceRequest <-----

  /**
   * Prometheus Exporter: No shutdown
   * GCM exporter: No shutdown
   */
  shutdown(): void {}
}