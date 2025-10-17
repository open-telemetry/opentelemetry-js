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
import { globalErrorHandler } from '@opentelemetry/core';
import {
  AggregationTemporality,
  AggregationType,
  MetricReader,
} from '@opentelemetry/sdk-metrics';
import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { ExporterConfig } from './export/types';
import { PrometheusSerializer } from './PrometheusSerializer';
/** Node.js v8.x compat */
import { URL } from 'url';

export class PrometheusExporter extends MetricReader {
  static readonly DEFAULT_OPTIONS = {
    host: undefined,
    port: 9464,
    endpoint: '/metrics',
    prefix: '',
    appendTimestamp: false,
    withResourceConstantLabels: undefined,
    withoutScopeInfo: false,
    withoutTargetInfo: false,
  };

  private readonly _host?: string;
  private readonly _port: number;
  private readonly _baseUrl: string;
  private readonly _endpoint: string;
  private readonly _server: Server;
  private readonly _prefix?: string;
  private readonly _appendTimestamp: boolean;
  private _serializer: PrometheusSerializer;
  private _startServerPromise: Promise<void> | undefined;

  // This will be required when histogram is implemented. Leaving here so it is not forgotten
  // Histogram cannot have a attribute named 'le'
  // private static readonly RESERVED_HISTOGRAM_LABEL = 'le';

  /**
   * Constructor
   * @param config Exporter configuration
   * @param callback Callback to be called after a server was started
   */
  constructor(
    config: ExporterConfig = {},
    callback: (error: Error | void) => void = () => {}
  ) {
    super({
      aggregationSelector: _instrumentType => {
        return {
          type: AggregationType.DEFAULT,
        };
      },
      aggregationTemporalitySelector: _instrumentType =>
        AggregationTemporality.CUMULATIVE,
      metricProducers: config.metricProducers,
    });
    this._host =
      config.host ||
      process.env.OTEL_EXPORTER_PROMETHEUS_HOST ||
      PrometheusExporter.DEFAULT_OPTIONS.host;
    this._port =
      config.port ||
      Number(process.env.OTEL_EXPORTER_PROMETHEUS_PORT) ||
      PrometheusExporter.DEFAULT_OPTIONS.port;
    this._prefix = config.prefix || PrometheusExporter.DEFAULT_OPTIONS.prefix;
    this._appendTimestamp =
      typeof config.appendTimestamp === 'boolean'
        ? config.appendTimestamp
        : PrometheusExporter.DEFAULT_OPTIONS.appendTimestamp;
    const _withResourceConstantLabels =
      config.withResourceConstantLabels ||
      PrometheusExporter.DEFAULT_OPTIONS.withResourceConstantLabels;
    const _withoutScopeInfo =
      config.withoutScopeInfo ||
      PrometheusExporter.DEFAULT_OPTIONS.withoutScopeInfo;
    const _withoutTargetInfo =
      config.withoutTargetInfo ||
      PrometheusExporter.DEFAULT_OPTIONS.withoutTargetInfo;
    // unref to prevent prometheus exporter from holding the process open on exit
    this._server = createServer(this._requestHandler).unref();
    this._serializer = new PrometheusSerializer(
      this._prefix,
      this._appendTimestamp,
      _withResourceConstantLabels,
      _withoutTargetInfo,
      _withoutScopeInfo
    );

    this._baseUrl = `http://${this._host}:${this._port}/`;
    this._endpoint = (
      config.endpoint || PrometheusExporter.DEFAULT_OPTIONS.endpoint
    ).replace(/^([^/])/, '/$1');

    if (config.preventServerStart !== true) {
      this.startServer().then(callback, err => {
        diag.error(err);
        callback(err);
      });
    } else if (callback) {
      // Do not invoke callback immediately to avoid zalgo problem.
      queueMicrotask(callback);
    }
  }

  override async onForceFlush(): Promise<void> {
    /** do nothing */
  }

  /**
   * Shuts down the export server and clears the registry
   */
  override onShutdown(): Promise<void> {
    return this.stopServer();
  }

  /**
   * Stops the Prometheus export server
   */
  stopServer(): Promise<void> {
    if (!this._server) {
      diag.debug(
        'Prometheus stopServer() was called but server was never started.'
      );
      return Promise.resolve();
    } else {
      return new Promise(resolve => {
        this._server.close(err => {
          if (!err) {
            diag.debug('Prometheus exporter was stopped');
          } else {
            if (
              (err as unknown as { code: string }).code !==
              'ERR_SERVER_NOT_RUNNING'
            ) {
              globalErrorHandler(err);
            }
          }
          resolve();
        });
      });
    }
  }

  /**
   * Starts the Prometheus export server
   */
  startServer(): Promise<void> {
    this._startServerPromise ??= new Promise((resolve, reject) => {
      this._server.once('error', reject);
      this._server.listen(
        {
          port: this._port,
          host: this._host,
        },
        () => {
          diag.debug(
            `Prometheus exporter server started: ${this._host}:${this._port}/${this._endpoint}`
          );
          resolve();
        }
      );
    });

    return this._startServerPromise;
  }

  /**
   * Request handler that responds with the current state of metrics
   * @param _request Incoming HTTP request of server instance
   * @param response HTTP response object used to response to request
   */
  public getMetricsRequestHandler(
    _request: IncomingMessage,
    response: ServerResponse
  ): void {
    this._exportMetrics(response);
  }

  /**
   * Request handler used by http library to respond to incoming requests
   * for the current state of metrics by the Prometheus backend.
   *
   * @param request Incoming HTTP request to export server
   * @param response HTTP response object used to respond to request
   */
  private _requestHandler = (
    request: IncomingMessage,
    response: ServerResponse
  ) => {
    if (
      request.url != null &&
      new URL(request.url, this._baseUrl).pathname === this._endpoint
    ) {
      this._exportMetrics(response);
    } else {
      this._notFound(response);
    }
  };

  /**
   * Responds to incoming message with current state of all metrics.
   */
  private _exportMetrics = (response: ServerResponse) => {
    response.statusCode = 200;
    response.setHeader('content-type', 'text/plain');
    this.collect().then(
      collectionResult => {
        const { resourceMetrics, errors } = collectionResult;
        if (errors.length) {
          diag.error(
            'PrometheusExporter: metrics collection errors',
            ...errors
          );
        }
        response.end(this._serializer.serialize(resourceMetrics));
      },
      err => {
        response.end(`# failed to export metrics: ${err}`);
      }
    );
  };

  /**
   * Responds with 404 status code to all requests that do not match the configured endpoint.
   */
  private _notFound = (response: ServerResponse) => {
    response.statusCode = 404;
    response.end();
  };
}
