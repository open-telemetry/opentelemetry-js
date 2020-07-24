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

import { Attributes, Logger } from '@opentelemetry/api';
import { ExportResult, NoopLogger } from '@opentelemetry/core';
import {
  CollectorExporterError,
  CollectorExporterConfigBase,
  ExportServiceError,
} from './types';

/**
 * Collector Exporter abstract base class
 */
export abstract class CollectorExporterBase<
  T extends CollectorExporterConfigBase,
  ExportItem,
  ServiceRequest
> {
  public readonly serviceName: string;
  public readonly url: string;
  public readonly logger: Logger;
  public readonly hostname: string | undefined;
  public readonly attributes?: Attributes;
  protected _isShutdown: boolean = false;

  /**
   * @param config
   */
  constructor(config: T = {} as T) {
    this.serviceName = this.getDefaultServiceName(config);
    this.url = this.getDefaultUrl(config);
    if (typeof config.hostname === 'string') {
      this.hostname = config.hostname;
    }

    this.attributes = config.attributes;

    this.logger = config.logger || new NoopLogger();

    this.shutdown = this.shutdown.bind(this);

    // platform dependent
    this.onInit(config);
  }

  /**
   * Export items.
   * @param items
   * @param resultCallback
   */
  export(items: ExportItem[], resultCallback: (result: ExportResult) => void) {
    if (this._isShutdown) {
      resultCallback(ExportResult.FAILED_NOT_RETRYABLE);
      return;
    }

    this._export(items)
      .then(() => {
        resultCallback(ExportResult.SUCCESS);
      })
      .catch((error: ExportServiceError) => {
        if (error.message) {
          this.logger.error(error.message);
        }
        if (error.code && error.code < 500) {
          resultCallback(ExportResult.FAILED_NOT_RETRYABLE);
        } else {
          resultCallback(ExportResult.FAILED_RETRYABLE);
        }
      });
  }

  private _export(items: ExportItem[]): Promise<unknown> {
    return new Promise((resolve, reject) => {
      try {
        this.logger.debug('items to be sent', items);
        this.send(items, resolve, reject);
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
    this.onShutdown();
  }

  abstract onShutdown(): void;
  abstract onInit(config: T): void;
  abstract send(
    items: ExportItem[],
    onSuccess: () => void,
    onError: (error: CollectorExporterError) => void
  ): void;
  abstract getDefaultUrl(config: T): string;
  abstract getDefaultServiceName(config: T): string;
  abstract convert(objects: ExportItem[]): ServiceRequest;
}
