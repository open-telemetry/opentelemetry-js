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

import { CollectorTraceExporterBase } from '../../CollectorTraceExporterBase';
import { ReadableSpan } from '@opentelemetry/tracing';
import { toCollectorExportTraceServiceRequest } from '../../transform';
import { CollectorExporterConfigBrowser } from './types';
import * as collectorTypes from '../../types';
import { sendWithBeacon, sendWithXhr } from './util';
import { parseHeaders } from '../../util';

const DEFAULT_COLLECTOR_URL = 'http://localhost:55680/v1/trace';

/**
 * Collector Trace Exporter for Web
 */
export class CollectorTraceExporter extends CollectorTraceExporterBase<
  CollectorExporterConfigBrowser
> {
  DEFAULT_HEADERS: Record<string, string> = {
    [collectorTypes.OT_REQUEST_HEADER]: '1',
  };
  private _headers: Record<string, string>;
  private _useXHR: boolean = false;

  /**
   * @param config
   */
  constructor(config: CollectorExporterConfigBrowser = {}) {
    super(config);
    this._headers =
      parseHeaders(config.headers, this.logger) || this.DEFAULT_HEADERS;
    this._useXHR =
      !!config.headers || typeof navigator.sendBeacon !== 'function';
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

  sendSpans(
    spans: ReadableSpan[],
    onSuccess: () => void,
    onError: (error: collectorTypes.CollectorExporterError) => void
  ) {
    const exportTraceServiceRequest = toCollectorExportTraceServiceRequest(
      spans,
      this
    );
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
