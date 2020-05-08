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

import { ExportResult, NoopLogger } from '@opentelemetry/core';
import { ReadableSpan, SpanExporter } from '@opentelemetry/tracing';
import { Attributes, Logger } from '@opentelemetry/api';
import { onInit, onShutdown, sendSpans } from './platform/index';
import { opentelemetryProto } from './types';

/**
 * Collector Exporter Config
 */
export interface CollectorExporterConfig {
  hostName?: string;
  logger?: Logger;
  serviceName?: string;
  attributes?: Attributes;
  url?: string;
}

const DEFAULT_SERVICE_NAME = 'collector-exporter';
const DEFAULT_COLLECTOR_URL = 'http://localhost:55678/v1/trace';

/**
 * Collector Exporter
 */
export class CollectorExporter implements SpanExporter {
  readonly serviceName: string;
  readonly url: string;
  readonly logger: Logger;
  readonly hostName: string | undefined;
  readonly attributes?: Attributes;
  private _isShutdown: boolean = false;

  /**
   * @param config
   */
  constructor(config: CollectorExporterConfig = {}) {
    this.serviceName = config.serviceName || DEFAULT_SERVICE_NAME;
    this.url = config.url || DEFAULT_COLLECTOR_URL;
    if (typeof config.hostName === 'string') {
      this.hostName = config.hostName;
    }

    this.attributes = config.attributes;

    this.logger = config.logger || new NoopLogger();

    this.shutdown = this.shutdown.bind(this);

    // platform dependent
    onInit(this);
  }

  /**
   * Export spans.
   * @param spans
   * @param resultCallback
   */
  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ) {
    if (this._isShutdown) {
      resultCallback(ExportResult.FAILED_NOT_RETRYABLE);
      return;
    }

    this._exportSpans(spans)
      .then(() => {
        resultCallback(ExportResult.SUCCESS);
      })
      .catch(
        (
          error: opentelemetryProto.collector.trace.v1.ExportTraceServiceError
        ) => {
          if (error.message) {
            this.logger.error(error.message);
          }
          if (error.code && error.code < 500) {
            resultCallback(ExportResult.FAILED_NOT_RETRYABLE);
          } else {
            resultCallback(ExportResult.FAILED_RETRYABLE);
          }
        }
      );
  }

  private _exportSpans(spans: ReadableSpan[]): Promise<unknown> {
    return new Promise((resolve, reject) => {
      try {
        this.logger.debug('spans to be sent', spans);
        // Send spans to [opentelemetry collector]{@link https://github.com/open-telemetry/opentelemetry-collector}
        // it will use the appropriate transport layer automatically depends on platform
        sendSpans(spans, resolve, reject, this);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Shutdown the exporter.
   */
  shutdown(): void {
    if (this._isShutdown) {
      this.logger.debug('shutdown already started');
      return;
    }
    this._isShutdown = true;
    this.logger.debug('shutdown started');

    // platform dependent
    onShutdown(this);
  }
}
