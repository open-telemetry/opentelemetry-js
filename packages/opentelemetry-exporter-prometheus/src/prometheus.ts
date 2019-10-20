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


import * as url from 'url';

import { createServer, Server, IncomingMessage, ServerResponse } from 'http';

import * as types from '@opentelemetry/types';

import {

} from '@opentelemetry/metrics'

import { ExporterConfig } from './types';
import { NoopLogger } from '@opentelemetry/core';
import {
  Registry,
} from 'prom-client';

export class PrometheusExporter {

  static readonly DEFAULT_OPTIONS = {
    port: 9464,
    startServer: false,
    endpoint: '/metrics',
    prefix: '',
  };

  private readonly _registry = new Registry();
  private readonly _logger: types.Logger;
  private readonly _port: number;
  private readonly _endpoint: string;
  private _server?: Server;
  // private readonly _prefix: string;

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
    // this._prefix = config.prefix || PrometheusExporter.DEFAULT_OPTIONS.prefix;

    let endpoint = config.endpoint || PrometheusExporter.DEFAULT_OPTIONS.endpoint;

    if (!endpoint.startsWith('/')) {
      endpoint = `/${endpoint}`;
    }
    this._endpoint = endpoint;

    if (config.startServer || PrometheusExporter.DEFAULT_OPTIONS.startServer) {
      this.startServer(callback);
    }
  }

  /**
   * Stops the Prometheus exporter server
   * @param callback A callback that will be executed once the server is stopped
   */
  stopServer(callback?: () => void) {
    if (!this._server) {
      this._logger.debug(`Prometheus stopServer() was called but server was never started.`);
      if (callback) {
        callback();
      }
    } else {
      this._server.close(() => {
        this._logger.debug(`Prometheus exporter was stopped`);
        if (callback) {
          callback();
        }
      });
    }
  }

  /**
   * Starts the Prometheus exporter server and registers the request handler
   * @param callback A callback that will be called once the server is reade
   */
  startServer(callback?: () => void) {
    const requestHandler = ((request: IncomingMessage, response: ServerResponse) => {
      const parsedUrl = url.parse(request.url as string);
      if (parsedUrl.pathname === this._endpoint) {
        response.statusCode = 200;
        response.setHeader('content-type', this._registry.contentType);
        response.end(this._registry.metrics());
      } else {
        response.statusCode = 404;
        response.end();
      }

    });
    this._server = createServer(requestHandler);
    this._server.listen(this._port, () => {
      this._logger.debug(`Prometheus exporter started on port ${this._port}
        at endpoint ${this._endpoint}`);
      if (callback) {
        callback();
      }
    });
  }
}
