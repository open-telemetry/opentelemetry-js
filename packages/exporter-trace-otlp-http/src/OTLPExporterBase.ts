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

import { SpanAttributes, diag } from '@opentelemetry/api';
import { ExportResult, ExportResultCode, BindOnceFuture } from '@opentelemetry/core';
import {
  OTLPExporterError,
  OTLPExporterConfigBase,
  ExportServiceError,
} from './types';

/**
 * Collector Exporter abstract base class
 */
export abstract class OTLPExporterBase<
  T extends OTLPExporterConfigBase,
  ExportItem,
  ServiceRequest
> {
  public readonly url: string;
  public readonly hostname: string | undefined;
  public readonly attributes?: SpanAttributes;
  protected _concurrencyLimit: number;
  protected _sendingPromises: Promise<unknown>[] = [];
  protected _shutdownOnce: BindOnceFuture<void>;

  /**
   * @param config
   */
  constructor(config: T = {} as T) {
    this.url = this.getDefaultUrl(config);
    if (typeof config.hostname === 'string') {
      this.hostname = config.hostname;
    }

    this.attributes = config.attributes;

    this.shutdown = this.shutdown.bind(this);
    this._shutdownOnce = new BindOnceFuture(this._shutdown, this);

    this._concurrencyLimit =
      typeof config.concurrencyLimit === 'number'
        ? config.concurrencyLimit
        : Infinity;

    // platform dependent
    this.onInit(config);
  }

  /**
   * Export items.
   * @param items
   * @param resultCallback
   * @param exportTimeoutMillis - optional
   * @param onError - optional
   */

  export(items: ExportItem[], resultCallback: (result: ExportResult) => void, exportTimeoutMillis?: number, onError?: (error: object) => void): void {
    const DEFAULT_MAX_ATTEMPTS = 4;
    const DEFAULT_INITIAL_BACKOFF = 1000;
    const DEFAULT_BACKOFF_MULTIPLIER = 1.5;

    let retryTimer: ReturnType<typeof setTimeout>;

    const exportTimer = setTimeout(() => {
      clearTimeout(retryTimer);
      if (onError !== undefined) {
        onError(new Error('Timeout'));
      }
    }, exportTimeoutMillis);


    if (this._shutdownOnce.isCalled) {
      resultCallback({
        code: ExportResultCode.FAILED,
        error: new Error('Exporter has been shutdown'),
      });
      return;
    }

    if (this._sendingPromises.length >= this._concurrencyLimit) {
      resultCallback({
        code: ExportResultCode.FAILED,
        error: new Error('Concurrent export limit reached'),
      });
      return;
    }

    const exportWithRetry = (retries = DEFAULT_MAX_ATTEMPTS, backoffMillis = DEFAULT_INITIAL_BACKOFF) => {
      this._export(items)
      .then(() => {
        clearTimeout(exportTimer);
        resultCallback({ code: ExportResultCode.SUCCESS });
      })
      .catch((error: ExportServiceError) => {
        if (this._isRetryable(error.code) && retries > 0) {
            retryTimer = setTimeout(() => {
                return exportWithRetry(retries - 1, backoffMillis *DEFAULT_BACKOFF_MULTIPLIER);
            }, backoffMillis);
        } else {
            clearTimeout(exportTimer);
            resultCallback({ code: ExportResultCode.FAILED, error });
        }
      });
    };

    exportWithRetry();
  }

  private _export(items: ExportItem[]): Promise<unknown> {
    return new Promise<void>((resolve, reject) => {
      try {
        diag.debug('items to be sent', items);
        this.send(items, resolve, reject);
      } catch (e) {
        reject(e);
      }
    });
  }

  private _isRetryable(statusCode: number): boolean {
    const retryCodes = [429, 502, 503, 504];

    return retryCodes.includes(statusCode);
  }

  /**
   * Shutdown the exporter.
   */
  shutdown(): Promise<void> {
    return this._shutdownOnce.call();
  }

  private _shutdown(): Promise<void> {
    diag.debug('shutdown started');
    this.onShutdown();
    return Promise.all(this._sendingPromises)
      .then(() => {
        /** ignore resolved values */
      });
  }

  abstract onShutdown(): void;
  abstract onInit(config: T): void;
  abstract send(
    items: ExportItem[],
    onSuccess: () => void,
    onError: (error: OTLPExporterError) => void
  ): void;
  abstract getDefaultUrl(config: T): string;
  abstract convert(objects: ExportItem[]): ServiceRequest;
}
