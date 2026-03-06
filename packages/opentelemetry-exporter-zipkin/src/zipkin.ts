/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { diag } from '@opentelemetry/api';
import { type ExportResult, internal } from '@opentelemetry/core';
import { ExportResultCode, getStringFromEnv } from '@opentelemetry/core';
import type { SpanExporter, ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { prepareSend } from './platform/index';
import type * as zipkinTypes from './types';
import {
  toZipkinSpan,
  defaultStatusCodeTagName,
  defaultStatusErrorTagName,
} from './transform';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import {
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  OTEL_COMPONENT_TYPE_VALUE_ZIPKIN_HTTP_SPAN_EXPORTER,
} from './semconv';
import { prepareGetHeaders } from './utils';

/**
 * Zipkin Exporter
 */
export class ZipkinExporter implements SpanExporter {
  private readonly DEFAULT_SERVICE_NAME = 'OpenTelemetry Service';
  private readonly _statusCodeTagName: string;
  private readonly _statusDescriptionTagName: string;
  private readonly _metrics: InstanceType<
    typeof internal.ExporterMetrics<ReadableSpan[]>
  >;
  private _urlStr: string;
  private _send: zipkinTypes.SendFunction;
  private _getHeaders: zipkinTypes.GetHeaders | undefined;
  private _serviceName?: string;
  private _isShutdown: boolean;
  private _sendingPromises: Promise<unknown>[] = [];

  constructor(config: zipkinTypes.ExporterConfig = {}) {
    this._urlStr =
      config.url ||
      (getStringFromEnv('OTEL_EXPORTER_ZIPKIN_ENDPOINT') ??
        'http://localhost:9411/api/v2/spans');
    this._send = prepareSend(this._urlStr, config.headers);
    this._serviceName = config.serviceName;
    this._statusCodeTagName =
      config.statusCodeTagName || defaultStatusCodeTagName;
    this._statusDescriptionTagName =
      config.statusDescriptionTagName || defaultStatusErrorTagName;
    this._isShutdown = false;
    if (typeof config.getExportRequestHeaders === 'function') {
      this._getHeaders = prepareGetHeaders(config.getExportRequestHeaders);
    } else {
      // noop
      this._beforeSend = function () {};
    }
    this._metrics = new internal.ExporterMetrics({
      componentType: OTEL_COMPONENT_TYPE_VALUE_ZIPKIN_HTTP_SPAN_EXPORTER,
      signal: {
        name: 'span',
        countItems: (spans: ReadableSpan[]) => spans.length,
      },
      url: this._urlStr,
      meterProvider: config.meterProvider,
      errorAttributes: (error: unknown) => {
        if (!(error instanceof Error)) {
          return {};
        }
        if (
          error.message.startsWith('`Got unexpected status code from zipkin: ')
        ) {
          const statusStr = error.message.substring(
            '`Got unexpected status code from zipkin: '.length
          );
          return {
            [ATTR_HTTP_RESPONSE_STATUS_CODE]: Number(statusStr),
          };
        }
        return {};
      },
    });
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
        spans[0].resource.attributes[ATTR_SERVICE_NAME] ||
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
      void this._sendingPromises.splice(index, 1);
    };
    promise.then(popPromise, popPromise);
  }

  /**
   * Shutdown exporter. Noop operation in this exporter.
   */
  shutdown(): Promise<void> {
    diag.debug('Zipkin exporter shutdown');
    this._isShutdown = true;
    return this.forceFlush();
  }

  /**
   * Exports any pending spans in exporter
   */
  forceFlush(): Promise<void> {
    return new Promise((resolve, reject) => {
      Promise.all(this._sendingPromises).then(() => {
        resolve();
      }, reject);
    });
  }

  /**
   * if user defines getExportRequestHeaders in config then this will be called
   * every time before send, otherwise it will be replaced with noop in
   * constructor
   * @default noop
   */
  private _beforeSend() {
    if (this._getHeaders) {
      this._send = prepareSend(this._urlStr, this._getHeaders());
    }
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
          span.attributes[ATTR_SERVICE_NAME] ||
            span.resource.attributes[ATTR_SERVICE_NAME] ||
            serviceName
        ),
        this._statusCodeTagName,
        this._statusDescriptionTagName
      )
    );
    this._beforeSend();
    const finishExport = this._metrics.startExport(spans);
    return this._send(zipkinSpans, (result: ExportResult) => {
      finishExport(result.error?.name);
      if (done) {
        return done(result);
      }
    });
  }
}
