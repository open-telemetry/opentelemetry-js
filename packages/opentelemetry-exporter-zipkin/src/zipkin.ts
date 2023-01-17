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

import { diag } from '@opentelemetry/api';
import { ExportResult, ExportResultCode, getEnv, internal } from '@opentelemetry/core';
import { SpanExporter, ReadableSpan } from '@opentelemetry/sdk-trace-base';
import * as zipkinTypes from './types';
import {
  toZipkinSpan,
  defaultStatusCodeTagName,
  defaultStatusErrorTagName,
} from './transform';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

/**
 * Zipkin Exporter
 */
export class ZipkinExporter implements SpanExporter {
  private readonly DEFAULT_SERVICE_NAME = 'OpenTelemetry Service';
  private readonly _statusCodeTagName: string;
  private readonly _statusDescriptionTagName: string;

  private _urlStr: string;
  private _getExportRequestHeaders: zipkinTypes.GetHeaders | undefined;
  private _headers: Record<string, string> | undefined;
  private _request: internal.HttpExportClient;

  private _serviceName?: string;
  private _isShutdown: boolean;
  private _sendingPromises: Promise<unknown>[] = [];

  constructor(config: zipkinTypes.ExporterConfig = {}) {
    this._urlStr = config.url || getEnv().OTEL_EXPORTER_ZIPKIN_ENDPOINT;
    this._headers = config.headers;
    this._serviceName = config.serviceName;
    this._statusCodeTagName =
      config.statusCodeTagName || defaultStatusCodeTagName;
    this._statusDescriptionTagName =
      config.statusDescriptionTagName || defaultStatusErrorTagName;
    this._isShutdown = false;
    if (typeof config.getExportRequestHeaders === 'function') {
      this._getExportRequestHeaders = config.getExportRequestHeaders;
    }

    const preferredClients: internal.HttpClient[] = ['node:http'];
    if (config.headers && this._getExportRequestHeaders) {
      preferredClients.push('XMLHttpReuqest');
    } else {
      preferredClients.push('sendBeacon', 'XMLHttpReuqest');
    }
    this._request = internal.createHttpExportClient(preferredClients);
  }

  /**
   * Export spans.
   */
  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ): void {
    const serviceName = String(
      this._serviceName ||
        spans[0].resource.attributes[SemanticResourceAttributes.SERVICE_NAME] ||
        this.DEFAULT_SERVICE_NAME
    );

    diag.debug('Zipkin exporter export');
    if (this._isShutdown) {
      setTimeout(() =>
        resultCallback({
          code: ExportResultCode.FAILED,
          error: new Error('Exporter has been shutdown'),
        })
      );
      return;
    }
    const promise = new Promise<void>(resolve => {
      this._sendSpans(spans, serviceName, result => {
        resolve();
        resultCallback(result);
      });
    });

    this._sendingPromises.push(promise);
    const popPromise = () => {
      const index = this._sendingPromises.indexOf(promise);
      this._sendingPromises.splice(index, 1);
    };
    promise.then(popPromise, popPromise);
  }

  /**
   * Shutdown exporter. Noop operation in this exporter.
   */
  shutdown(): Promise<void> {
    diag.debug('Zipkin exporter shutdown');
    this._isShutdown = true;
    return new Promise((resolve, reject) => {
      Promise.all(this._sendingPromises).then(() => {
        resolve();
      }, reject);
    });
  }

  /**
   * if user defines getExportRequestHeaders in config then this will be called
   * everytime before send, otherwise it will be replaced with noop in
   * constructor
   * @default noop
   */
  private _getHeaders() {
    if (this._getExportRequestHeaders) {
      return this._getExportRequestHeaders();
    }
    return this._headers;
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
        String(
          span.attributes[SemanticResourceAttributes.SERVICE_NAME] ||
            span.resource.attributes[SemanticResourceAttributes.SERVICE_NAME] ||
            serviceName
        ),
        this._statusCodeTagName,
        this._statusDescriptionTagName
      )
    );

    const headers = this._getHeaders();
    return this._request(this._urlStr, JSON.stringify(zipkinSpans), {
      headers,
    });
  }
}
