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
import { CollectorExporterConfigBase } from '../../types';
import * as collectorTypes from '../../types';
import { parseHeaders } from '../../util';
import { sendWithBeacon, sendWithXhr } from './util';

/**
 * Collector Metric Exporter abstract base class
 */
export abstract class CollectorExporterBrowserBase<
  ExportItem,
  ServiceRequest
> extends CollectorExporterBase<
  CollectorExporterConfigBase,
  ExportItem,
  ServiceRequest
> {
  private _headers: Record<string, string>;
  private _useXHR: boolean = false;

  /**
   * @param config
   */
  constructor(config: CollectorExporterConfigBase = {}) {
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

  send(
    items: ExportItem[],
    onSuccess: () => void,
    onError: (error: collectorTypes.CollectorExporterError) => void
  ) {
    const serviceRequest = this.convert(items);
    const body = JSON.stringify(serviceRequest);

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
