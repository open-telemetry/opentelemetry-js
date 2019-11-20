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

import { ExportResult } from '@opentelemetry/base';
import { NoopLogger } from '@opentelemetry/core';
import { ReadableSpan, SpanExporter } from '@opentelemetry/tracing';
import { Attributes, Logger } from '@opentelemetry/types';
import { OTCSpan } from './types';
import { convertSpan } from './util';

import { onInit, onShutdown, sendSpans } from './platform/index';

/**
 * Collector Exporter Config
 */
export interface CollectorExporterConfig {
  hostName?: string;
  logger?: Logger;
  serviceName?: string;
  spanAttributes?: Attributes;
  url?: string;
}

const defaultServiceName = 'collector-exporter';
const defaultCollectorUrl = 'http://localhost:55678/v1/trace';

/**
 * Collector Exporter
 */
export class CollectorExporter implements SpanExporter {
  readonly serviceName: string;
  readonly url: string;
  readonly logger: Logger;
  readonly hostName: string | undefined;
  private _isShutdown: boolean = false;

  /**
   * @param config
   */
  constructor(config: CollectorExporterConfig = {}) {
    this.serviceName = config.serviceName || defaultServiceName;
    this.url = config.url || defaultCollectorUrl;
    if (typeof config.hostName === 'string') {
      this.hostName = config.hostName;
    }

    this.logger = config.logger || new NoopLogger();

    this.shutdown = this.shutdown.bind(this);

    // platform dependent
    onInit(this.shutdown);
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
    this._exportSpans(spans)
      .then(() => {
        resultCallback(ExportResult.SUCCESS);
      })
      .catch((status: number = 0) => {
        if (status < 500) {
          resultCallback(ExportResult.FAILED_NOT_RETRYABLE);
        } else {
          resultCallback(ExportResult.FAILED_RETRYABLE);
        }
      });
  }

  private _exportSpans(spans: ReadableSpan[]): Promise<unknown> {
    return new Promise((resolve, reject) => {
      try {
        const spansToBeSent: OTCSpan[] = spans.map(span => convertSpan(span));
        this.logger.debug('spans to be sent', spansToBeSent);
        this.sendSpan(spansToBeSent, resolve, reject);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Send spans to [opentelemetry collector]{@link https://github.com/open-telemetry/opentelemetry-collector}
   *     it will use the appropriate transport layer automatically depends on platform
   * @param spans
   * @param onSuccess
   * @param onError
   */
  sendSpan(
    spans: OTCSpan[],
    onSuccess: () => void,
    onError: (status?: number) => void
  ) {
    // platform dependent
    sendSpans(spans, onSuccess, onError, this);
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
    onShutdown(this.shutdown);

    this._exportSpans([]).then(() => {
      this.logger.debug('shutdown completed');
    });
  }
}
