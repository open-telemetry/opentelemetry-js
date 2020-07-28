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

import { CollectorExporterBase } from '../../CollectorExporterBase';
import { ReadableSpan, SpanExporter } from '@opentelemetry/tracing';
import { toCollectorExportTraceServiceRequest } from '../../transform';
import { CollectorExporterConfigBrowser } from './types';
import * as collectorTypes from '../../types';
import { sendWithBeacon, sendWithXhr } from './util';
import { parseHeaders } from '../../util';

const DEFAULT_SERVICE_NAME = 'collector-trace-exporter';
const DEFAULT_COLLECTOR_URL = 'http://localhost:55681/v1/trace';

/**
 * Collector Trace Exporter for Web
 */
export class CollectorTraceExporter
  extends CollectorExporterBase<
    CollectorExporterConfigBrowser,
    ReadableSpan,
    collectorTypes.opentelemetryProto.collector.trace.v1.ExportTraceServiceRequest
  >
  implements SpanExporter {
  private _headers: Record<string, string>;
  private _useXHR: boolean = false;

  /**
   * @param config
   */
  constructor(config: CollectorExporterConfigBrowser = {}) {
    super(config);
    this._useXHR =
      !!config.headers || typeof navigator.sendBeacon !== 'function';
    if (this._useXHR) {
      this._headers = parseHeaders(config.headers, this.logger);
    } else {
      this._headers = {};
    }
  }

  onInit(): void {
    window.addEventListener('unload', this.shutdown);
  }

  onShutdown(): void {
    window.removeEventListener('unload', this.shutdown);
  }

  getDefaultUrl(config: CollectorExporterConfigBrowser) {
    return config.url || DEFAULT_COLLECTOR_URL;
  }

  getDefaultServiceName(config: CollectorExporterConfigBrowser): string {
    return config.serviceName || DEFAULT_SERVICE_NAME;
  }

  convert(
    spans: ReadableSpan[]
  ): collectorTypes.opentelemetryProto.collector.trace.v1.ExportTraceServiceRequest {
    return toCollectorExportTraceServiceRequest(spans, this);
  }

  send(
    spans: ReadableSpan[],
    onSuccess: () => void,
    onError: (error: collectorTypes.CollectorExporterError) => void
  ) {
    const exportTraceServiceRequest = this.convert(spans);
    const body = JSON.stringify(exportTraceServiceRequest);

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
