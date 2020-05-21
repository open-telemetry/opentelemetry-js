/*!
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

import {
  CollectorExporterBase,
  CollectorExporterConfigBase,
} from '../../CollectorExporterBase';
import { ReadableSpan } from '@opentelemetry/tracing';
import { toCollectorExportTraceServiceRequest } from '../../transform';
import * as collectorTypes from '../../types';

export type CollectorExporterConfig = CollectorExporterConfigBase;

/**
 * Collector Exporter for Web
 */
export class CollectorExporter extends CollectorExporterBase<
  CollectorExporterConfig
> {
  onInit(): void {
    window.addEventListener('unload', this.shutdown);
  }

  onShutdown(): void {
    window.removeEventListener('unload', this.shutdown);
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

    if (typeof navigator.sendBeacon === 'function') {
      this._sendSpansWithBeacon(body, onSuccess, onError);
    } else {
      this._sendSpansWithXhr(body, onSuccess, onError);
    }
  }

  /**
   * send spans using browser navigator.sendBeacon
   * @param body
   * @param onSuccess
   * @param onError
   */
  private _sendSpansWithBeacon(
    body: string,
    onSuccess: () => void,
    onError: (error: collectorTypes.CollectorExporterError) => void
  ) {
    if (navigator.sendBeacon(this.url, body)) {
      this.logger.debug('sendBeacon - can send', body);
      onSuccess();
    } else {
      this.logger.error('sendBeacon - cannot send', body);
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
  private _sendSpansWithXhr(
    body: string,
    onSuccess: () => void,
    onError: (error: collectorTypes.CollectorExporterError) => void
  ) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', this.url);
    xhr.setRequestHeader(collectorTypes.OT_REQUEST_HEADER, '1');
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
