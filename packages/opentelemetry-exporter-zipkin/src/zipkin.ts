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
import { ExportResult, NoopLogger } from '@opentelemetry/core';
import { SpanExporter, ReadableSpan } from '@opentelemetry/tracing';
import { prepareSend } from './platform/index';
import * as zipkinTypes from './types';
import {
  toZipkinSpan,
  statusCodeTagName,
  statusDescriptionTagName,
} from './transform';
import { SERVICE_RESOURCE } from '@opentelemetry/resources';

/**
 * Zipkin Exporter
 */
export class ZipkinExporter implements SpanExporter {
  static readonly DEFAULT_URL = 'http://localhost:9411/api/v2/spans';
  private readonly DEFAULT_SERVICE_NAME = 'OpenTelemetry Service';
  private readonly _logger: api.Logger;
  private readonly _statusCodeTagName: string;
  private readonly _statusDescriptionTagName: string;
  private _send: zipkinTypes.SendFunction;
  private _serviceName?: string;
  private _isShutdown: boolean;
  private _sendingPromises: Promise<unknown>[] = [];

  constructor(config: zipkinTypes.ExporterConfig = {}) {
    const urlStr = config.url || ZipkinExporter.DEFAULT_URL;
    this._logger = config.logger || new NoopLogger();
    this._send = prepareSend(this._logger, urlStr, config.headers);
    this._serviceName = config.serviceName;
    this._statusCodeTagName = config.statusCodeTagName || statusCodeTagName;
    this._statusDescriptionTagName =
      config.statusDescriptionTagName || statusDescriptionTagName;
    this._isShutdown = false;
  }

  /**
   * Export spans.
   */
  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ) {
    if (typeof this._serviceName !== 'string') {
      this._serviceName = String(
        spans[0].resource.attributes[SERVICE_RESOURCE.NAME] ||
          this.DEFAULT_SERVICE_NAME
      );
    }
    this._logger.debug('Zipkin exporter export');
    if (this._isShutdown) {
      setTimeout(() => resultCallback(ExportResult.FAILED_NOT_RETRYABLE));
      return;
    }
    const promise = new Promise(resolve => {
      this._sendSpans(spans, this._serviceName!, result => {
        resolve();
        resultCallback(result);
        const index = this._sendingPromises.indexOf(promise);
        this._sendingPromises.splice(index, 1);
      });
    });
    this._sendingPromises.push(promise);
  }

  /**
   * Shutdown exporter. Noop operation in this exporter.
   */
  shutdown(): Promise<void> {
    this._logger.debug('Zipkin exporter shutdown');
    this._isShutdown = true;
    return new Promise((resolve, reject) => {
      Promise.all(this._sendingPromises).then(() => {
        resolve();
      }, reject);
    });
  }

  /**
   * Transform spans and sends to Zipkin service.
   */
  private _sendSpans(
    spans: ReadableSpan[],
    serviceName: string,
    done?: (result: ExportResult) => void
  ) {
    const zipkinSpans = spans.map(span =>
      toZipkinSpan(
        span,
        serviceName,
        this._statusCodeTagName,
        this._statusDescriptionTagName
      )
    );
    return this._send(zipkinSpans, (result: ExportResult) => {
      if (done) {
        return done(result);
      }
    });
  }
}
