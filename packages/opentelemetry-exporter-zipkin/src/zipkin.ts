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
import * as http from 'http';
import * as https from 'https';
import * as url from 'url';
import { ExportResult, NoopLogger } from '@opentelemetry/core';
import { SpanExporter, ReadableSpan } from '@opentelemetry/tracing';
import * as zipkinTypes from './types';
import {
  toZipkinSpan,
  statusCodeTagName,
  statusDescriptionTagName,
} from './transform';
import { OT_REQUEST_HEADER } from './utils';
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
  private readonly _reqOpts: http.RequestOptions;
  private _serviceName?: string;
  private _isShutdown: boolean;

  constructor(config: zipkinTypes.ExporterConfig = {}) {
    const urlStr = config.url || ZipkinExporter.DEFAULT_URL;
    const urlOpts = url.parse(urlStr);

    this._logger = config.logger || new NoopLogger();
    this._reqOpts = Object.assign(
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [OT_REQUEST_HEADER]: 1,
          ...config.headers,
        },
      },
      urlOpts
    );
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
    return this._sendSpans(spans, this._serviceName, resultCallback);
  }

  /**
   * Shutdown exporter. Noop operation in this exporter.
   */
  shutdown() {
    this._logger.debug('Zipkin exporter shutdown');
    if (this._isShutdown) {
      return;
    }
    this._isShutdown = true;
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

  /**
   * Send spans to the remote Zipkin service.
   */
  private _send(
    zipkinSpans: zipkinTypes.Span[],
    done: (result: ExportResult) => void
  ) {
    if (zipkinSpans.length === 0) {
      this._logger.debug('Zipkin send with empty spans');
      return done(ExportResult.SUCCESS);
    }

    const { request } = this._reqOpts.protocol === 'http:' ? http : https;
    const req = request(this._reqOpts, (res: http.IncomingMessage) => {
      let rawData = '';
      res.on('data', chunk => {
        rawData += chunk;
      });
      res.on('end', () => {
        const statusCode = res.statusCode || 0;
        this._logger.debug(
          'Zipkin response status code: %d, body: %s',
          statusCode,
          rawData
        );

        // Consider 2xx and 3xx as success.
        if (statusCode < 400) {
          return done(ExportResult.SUCCESS);
          // Consider 4xx as failed non-retriable.
        } else if (statusCode < 500) {
          return done(ExportResult.FAILED_NOT_RETRYABLE);
          // Consider 5xx as failed retriable.
        } else {
          return done(ExportResult.FAILED_RETRYABLE);
        }
      });
    });

    req.on('error', (err: Error) => {
      this._logger.error('Zipkin request error', err);
      return done(ExportResult.FAILED_RETRYABLE);
    });

    // Issue request to remote service
    const payload = JSON.stringify(zipkinSpans);
    this._logger.debug('Zipkin request payload: %s', payload);
    req.write(payload, 'utf8');
    req.end();
  }
}
