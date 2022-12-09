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
  Aggregation,
  AggregationTemporality,
  MetricReader,
} from '@opentelemetry/sdk-metrics';
import {
  createServer,
  IncomingMessage,
  RequestListener,
  Server,
  ServerResponse,
} from 'http';
import { ExporterConfig } from './export/types';
import { PrometheusSerializer } from './PrometheusSerializer';
/** Node.js v8.x compat */
import { URL } from 'url';
import { AddressInfo, ListenOptions } from 'net';

/**
 * Creates http server if one is not provider and attaches the prometheus RequestListener to it
 */
function prepareServer(
  config: ExporterConfig,
  requestHandler: RequestListener
): Server {
  const server = config.server ?? createServer();

  server.addListener('request', requestHandler);

  return server;
}

/**
 * Creates ListenOptions object using the provided ExporterConfig or default values
 */
function createListenOptions(config: ExporterConfig): ListenOptions {
  const host =
    config.host ||
    process.env.OTEL_EXPORTER_PROMETHEUS_HOST ||
    PrometheusExporter.DEFAULT_OPTIONS.host;
  const port = Number(
    config.port ||
      process.env.OTEL_EXPORTER_PROMETHEUS_PORT ||
      PrometheusExporter.DEFAULT_OPTIONS.port
  );

  return { host, port };
}

/**
 * Formats a endpoint string ensuring no double slash
 */
function formatEndpoint(...args: (string | undefined)[]): string {
  return (
    '/' +
    args
      .flatMap(e => e?.split('/'))
      .filter(e => e !== '')
      .join('/')
  );
}

export class PrometheusExporter extends MetricReader {
  static readonly DEFAULT_OPTIONS = {
    host: undefined,
    port: 9464,
    endpoint: '/metrics',
    prefix: '',
    appendTimestamp: true,
  };

  private readonly _server: Server;
  private readonly _endpoint: string;
  private readonly _prefix?: string;
  private readonly _appendTimestamp: boolean;
  private _listenOptions: ListenOptions;
  private _serializer: PrometheusSerializer;

  // This will be required when histogram is implemented. Leaving here so it is not forgotten
  // Histogram cannot have a attribute named 'le'
  // private static readonly RESERVED_HISTOGRAM_LABEL = 'le';

  /**
   * Constructor
   * @param config Exporter configuration
   * @param callback Callback to be called after a server was started
   */
  constructor(config: ExporterConfig = {}, callback?: () => void) {
    super({
      aggregationSelector: _instrumentType => Aggregation.Default(),
      aggregationTemporalitySelector: _instrumentType =>
        AggregationTemporality.CUMULATIVE,
    });
    this._prefix = config.prefix || PrometheusExporter.DEFAULT_OPTIONS.prefix;
    this._appendTimestamp =
      typeof config.appendTimestamp === 'boolean'
        ? config.appendTimestamp
        : PrometheusExporter.DEFAULT_OPTIONS.appendTimestamp;
    // unref to prevent prometheus exporter from holding the process open on exit
    this._server = prepareServer(config, this._requestHandler).unref();
    this._serializer = new PrometheusSerializer(
      this._prefix,
      this._appendTimestamp
    );

    this._listenOptions = createListenOptions(config);
    this._endpoint = formatEndpoint(
      config.endpoint || PrometheusExporter.DEFAULT_OPTIONS.endpoint
    );

    if (config.preventServerStart !== true) {
      this.startServer(this._listenOptions)
        .then(callback)
        .catch(err => diag.error(err));
    } else if (callback) {
      callback();
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
   *
   * @param options Listening options
   */
  startServer(options?: ListenOptions): Promise<void> {
    if (options !== undefined) {
      this._listenOptions = options;
    }

    return new Promise(resolve => {
      this._server.listen(this._listenOptions, () => {
        const address = this._server.address() as AddressInfo;
        const baseUrl = `http://${address.address}:${address.port}${this._endpoint}`;

        diag.debug(`Prometheus exporter server started: ${baseUrl}`);
        resolve();
      });
    });
  }

  /**
   * Request handler that responds with the current state of metrics
   */
  public getServerListenOptions(): ListenOptions {
    return this._listenOptions;
  }

  /**
   * Request handler that responds with the current state of metrics
   * @param _request Incoming HTTP request of server instance
   * @param response HTTP response objet used to response to request
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
    const baseUrl = `http://${this._listenOptions?.host}:${this._listenOptions?.port}`;
    const endpoint = formatEndpoint(this._listenOptions?.path, this._endpoint);
    const url = new URL(formatEndpoint(request.url), baseUrl);
    const pathname = url?.pathname;

    if (pathname === endpoint) {
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
