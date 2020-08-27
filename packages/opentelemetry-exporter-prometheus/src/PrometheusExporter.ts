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
import { ExportResult, NoopLogger } from '@opentelemetry/core';
import { MetricExporter, MetricRecord } from '@opentelemetry/metrics';
import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import * as url from 'url';
import { ExporterConfig } from './export/types';
import { PrometheusSerializer } from './PrometheusSerializer';
import { PrometheusLabelsBatcher } from './PrometheusLabelsBatcher';

export class PrometheusExporter implements MetricExporter {
  static readonly DEFAULT_OPTIONS = {
    port: 9464,
    startServer: false,
    endpoint: '/metrics',
    prefix: '',
  };

  private readonly _logger: api.Logger;
  private readonly _port: number;
  private readonly _endpoint: string;
  private readonly _server: Server;
  private readonly _prefix?: string;
  private _serializer: PrometheusSerializer;
  private _batcher = new PrometheusLabelsBatcher();

  // This will be required when histogram is implemented. Leaving here so it is not forgotten
  // Histogram cannot have a label named 'le'
  // private static readonly RESERVED_HISTOGRAM_LABEL = 'le';

  /**
   * Constructor
   * @param config Exporter configuration
   * @param callback Callback to be called after a server was started
   */
  constructor(config: ExporterConfig = {}, callback?: () => void) {
    this._logger = config.logger || new NoopLogger();
    this._port = config.port || PrometheusExporter.DEFAULT_OPTIONS.port;
    this._prefix = config.prefix || PrometheusExporter.DEFAULT_OPTIONS.prefix;
    this._server = createServer(this._requestHandler);
    this._serializer = new PrometheusSerializer(this._prefix);

    this._endpoint = (
      config.endpoint || PrometheusExporter.DEFAULT_OPTIONS.endpoint
    ).replace(/^([^/])/, '/$1');

    if (config.startServer || PrometheusExporter.DEFAULT_OPTIONS.startServer) {
      this.startServer(callback);
    } else if (callback) {
      callback();
    }
  }

  /**
   * Saves the current values of all exported {@link MetricRecord}s so that
   * they can be pulled by the Prometheus backend.
   *
   * In its current state, the exporter saves the current values of all metrics
   * when export is called and returns them when the export endpoint is called.
   * In the future, this should be a no-op and the exporter should reach into
   * the metrics when the export endpoint is called. As there is currently no
   * interface to do this, this is our only option.
   *
   * @param records Metrics to be sent to the prometheus backend
   * @param cb result callback to be called on finish
   */
  export(records: MetricRecord[], cb: (result: ExportResult) => void) {
    if (!this._server) {
      // It is conceivable that the _server may not be started as it is an async startup
      // However unlikely, if this happens the caller may retry the export
      cb(ExportResult.FAILED_RETRYABLE);
      return;
    }

    this._logger.debug('Prometheus exporter export');

    for (const record of records) {
      this._batcher.process(record);
    }

    cb(ExportResult.SUCCESS);
  }

  /**
   * Shuts down the export server and clears the registry
   *
   * @param cb called when server is stopped
   */
  shutdown(cb?: () => void) {
    this.stopServer(cb);
  }

  /**
   * Stops the Prometheus export server
   * @param callback A callback that will be executed once the server is stopped
   */
  stopServer(callback?: () => void) {
    if (!this._server) {
      this._logger.debug(
        'Prometheus stopServer() was called but server was never started.'
      );
      if (callback) {
        callback();
      }
    } else {
      this._server.close(() => {
        this._logger.debug('Prometheus exporter was stopped');
        if (callback) {
          callback();
        }
      });
    }
  }

  /**
   * Starts the Prometheus export server
   *
   * @param callback called once the server is ready
   */
  startServer(callback?: () => void) {
    this._server.listen(this._port, () => {
      this._logger.debug(
        `Prometheus exporter started on port ${this._port} at endpoint ${this._endpoint}`
      );
      if (callback) {
        callback();
      }
    });
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
    if (url.parse(request.url!).pathname === this._endpoint) {
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
    if (!this._batcher.hasMetric) {
      response.end('# no registered metrics');
      return;
    }
    response.end(this._serializer.serialize(this._batcher.checkPointSet()));
  };

  /**
   * Responds with 404 status code to all requests that do not match the configured endpoint.
   */
  private _notFound = (response: ServerResponse) => {
    response.statusCode = 404;
    response.end();
  };
}
