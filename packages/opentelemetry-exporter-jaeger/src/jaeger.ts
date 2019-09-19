/*!
 * Copyright 2019, OpenTelemetry Authors
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
  SpanExporter,
  ReadableSpan,
  ExportResult,
} from '@opentelemetry/basic-tracer';
import * as jaegerTypes from './types';
import { NoopLogger } from '@opentelemetry/core';
import * as types from '@opentelemetry/types';
import { spanToThrift } from './transform';

/**
 * Format and sends span information to Jaeger Exporter.
 */
export class JaegerExporter implements SpanExporter {
  private readonly _logger: types.Logger;
  private readonly _process: jaegerTypes.ThriftProcess;
  private readonly _sender: typeof jaegerTypes.UDPSender;

  constructor(config: jaegerTypes.ExporterConfig) {
    this._logger = config.logger || new NoopLogger();
    const tags: jaegerTypes.Tag[] = config.tags || [];

    this._sender = new jaegerTypes.UDPSender(config);
    this._process = {
      serviceName: config.serviceName,
      tags: jaegerTypes.ThriftUtils.getThriftTags(tags),
    };
    this._sender.setProcess(this._process);
  }

  /** Exports a list of spans to Jaeger. */
  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ): void {
    this._logger.debug('Jaeger exporter export');
    return this._sendSpans(spans, resultCallback);
  }

  /** Shutdown exporter. */
  shutdown(): void {
    this._sender.flush((numSpans: number, err?: string) => {
      if (err) {
        this._logger.error(`failed to flush span: ${err}`);
      }
    });
    // Sleeping 2 seconds before closing the sender's connection to ensure all spans are flushed.
    setTimeout(() => {
      this._sender.close();
    }, 2000);
  }

  /** Transform spans and sends to Jaeger service. */
  private _sendSpans(
    spans: ReadableSpan[],
    done?: (result: ExportResult) => void
  ) {
    const thriftSpan = spans.map(span => spanToThrift(span));
    for (const span of thriftSpan) {
      this._sender.append(span, (numSpans: number, err?: string) => {
        if (err) {
          // @todo: decide whether to break out the loop on first error.
          this._logger.error(`failed to append span: ${err}`);
          if (done) return done(ExportResult.FAILED_NOT_RETRYABLE);
        }
      });
    }
    // @todo: We should wait for all the callbacks of the append calls to
    // complete before it calls done with success.
    this._logger.debug('successful append for : %s', thriftSpan.length);
    if (done) return done(ExportResult.SUCCESS);
  }
}
