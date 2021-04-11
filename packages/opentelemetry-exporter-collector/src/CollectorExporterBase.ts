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
import {
  ExportResult,
  ExportResultCode,
  getEnv,
  baggageUtils,
} from '@opentelemetry/core';
import {
  CollectorExporterError,
  CollectorExporterConfigBase,
  ExportServiceError,
} from './types';
import { parseHeaders } from './util';

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
  public readonly hostname: string | undefined;
  public readonly attributes?: SpanAttributes;
  public readonly headers: Record<string, string>;
  protected _concurrencyLimit: number;
  protected _isShutdown: boolean = false;
  private _shuttingDownPromise: Promise<void> = Promise.resolve();
  protected _sendingPromises: Promise<unknown>[] = [];

  private _defaultEndpoint = 'localhost:4317';

  /**
   * @param config
   */
  constructor(config: T = {} as T) {
    this.serviceName = this._getDefaultServiceName(config);
    this.url = this._getUrl(config);
    this.headers = this._getHeaders(config);

    if (typeof config.hostname === 'string') {
      this.hostname = config.hostname;
    }

    this.attributes = config.attributes;

    this.shutdown = this.shutdown.bind(this);

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
   */
  export(items: ExportItem[], resultCallback: (result: ExportResult) => void) {
    if (this._isShutdown) {
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

    this._export(items)
      .then(() => {
        resultCallback({ code: ExportResultCode.SUCCESS });
      })
      .catch((error: ExportServiceError) => {
        resultCallback({ code: ExportResultCode.FAILED, error });
      });
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

  /**
   * Shutdown the exporter.
   */
  shutdown(): Promise<void> {
    if (this._isShutdown) {
      diag.debug('shutdown already started');
      return this._shuttingDownPromise;
    }
    this._isShutdown = true;
    diag.debug('shutdown started');
    this._shuttingDownPromise = new Promise((resolve, reject) => {
      Promise.resolve()
        .then(() => {
          return this.onShutdown();
        })
        .then(() => {
          return Promise.all(this._sendingPromises);
        })
        .then(() => {
          resolve();
        })
        .catch(e => {
          reject(e);
        });
    });
    return this._shuttingDownPromise;
  }

  private _getUrl(config: T): string {
    // if given, use url defined in config
    if (typeof config.url !== 'undefined') {
      return config.url;
    }
    const endpointFromEnv = getEnv().OTEL_EXPORTER_OTLP_ENDPOINT;
    const defaultEndpoint = this.getProtocol().includes('http')
      ? `http://${this._defaultEndpoint}/v1/${this.getExporterType()}s`
      : this._defaultEndpoint;
    console.log(this.getExporterType(), this.getProtocol(), defaultEndpoint)
    switch (this.getExporterType()) {
      case 'metric': {
        const url = getEnv().OTEL_EXPORTER_OTLP_METRICS_ENDPOINT;
        return url && url.length > 0
          ? url
          : endpointFromEnv && endpointFromEnv.length > 0
          ? endpointFromEnv
          : defaultEndpoint;
      }
      case 'trace': {
        const url = getEnv().OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;
        return url && url.length > 0
          ? url
          : endpointFromEnv && endpointFromEnv.length > 0
          ? endpointFromEnv
          : defaultEndpoint;
      }
      default: {
        return getEnv().OTEL_EXPORTER_OTLP_ENDPOINT;
      }
    }
  }

  private _getDefaultServiceName(config: T): string {
    // if given, use url defined in config
    if (typeof config.serviceName !== 'undefined') {
      return config.serviceName;
    }
    switch (this.getExporterType()) {
      case 'metric':
        return 'collector-metric-exporter';
      case 'trace':
        return 'collector-trace-exporter';
      default:
        return 'collector-exporter';
    }
  }

  private _getHeaders(config: T): Record<string, string> {
    const configuredHeaders = parseHeaders(config.headers ?? {});
    switch (this.getExporterType()) {
      case 'metric': {
        return Object.assign(
          configuredHeaders,
          this._parseHeadersFromEnv(getEnv().OTEL_EXPORTER_OTLP_HEADERS),
          this._parseHeadersFromEnv(getEnv().OTEL_EXPORTER_OTLP_METRICS_HEADERS)
        );
      }
      case 'trace': {
        return Object.assign(
          configuredHeaders,
          this._parseHeadersFromEnv(getEnv().OTEL_EXPORTER_OTLP_HEADERS),
          this._parseHeadersFromEnv(getEnv().OTEL_EXPORTER_OTLP_TRACES_HEADERS)
        );
      }
      default: {
        return Object.assign(
          configuredHeaders,
          this._parseHeadersFromEnv(getEnv().OTEL_EXPORTER_OTLP_HEADERS)
        );
      }
    }
  }

  /**
   * Parse headers from environment variable in the baggage HTTP Format:
   * https://github.com/w3c/baggage/blob/master/baggage/HTTP_HEADER_FORMAT.md
   */
  private _parseHeadersFromEnv(envValue?: string) {
    if (typeof envValue !== 'string' || envValue.length === 0) return {};
    return envValue
      .split(baggageUtils.ITEMS_SEPARATOR)
      .map(entry => {
        return baggageUtils.parsePairKeyValue(entry);
      })
      .filter(keyPair => keyPair !== undefined && keyPair.value.length > 0)
      .reduce((headers, keyPair) => {
        headers[keyPair!.key] = keyPair!.value;
        return headers;
      }, {} as Record<string, string>);
  }

  abstract onShutdown(): void;
  abstract onInit(config: T): void;
  abstract send(
    items: ExportItem[],
    onSuccess: () => void,
    onError: (error: CollectorExporterError) => void
  ): void;
  abstract convert(objects: ExportItem[]): ServiceRequest;
  public abstract getExporterType(): 'trace' | 'metric';
  public abstract getProtocol(): 'http/json' | 'grpc' | 'http/protobuf';
}
