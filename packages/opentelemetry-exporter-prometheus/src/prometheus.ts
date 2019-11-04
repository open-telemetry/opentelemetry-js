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
import {
  LabelValue,
  MetricDescriptor,
  MetricDescriptorType,
  MetricExporter,
  ReadableMetric,
} from '@opentelemetry/metrics';
import * as types from '@opentelemetry/types';
import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import * as Prometheus from 'prom-client';
import * as url from 'url';
import { ExporterConfig } from './export/types';

export class PrometheusExporter implements MetricExporter {
  static readonly DEFAULT_OPTIONS = {
    port: 9464,
    startServer: false,
    endpoint: '/metrics',
    prefix: '',
  };

  private readonly _registry = new Prometheus.Registry();
  private readonly _logger: types.Logger;
  private readonly _port: number;
  private readonly _endpoint: string;
  private _server: Server;
  private readonly _prefix?: string;

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
   * Save current metric state so that it can be pulled by the metrics backend.
   *
   * @todo reach into metrics to pull metric values on endpoint
   * In its current state, the exporter saves the current values of all metrics when export
   * is called and returns them when the export endpoint is called. In the future, this should
   * be a no-op and the exporter should reach into the metrics when the export endpoint is
   * called. As there is currently no interface to do this, this is our only option.
   *
   * @param readableMetrics Metrics to be sent to the prometheus backend
   * @param cb result callback to be called on finish
   */
  export(
    readableMetrics: ReadableMetric[],
    cb: (result: ExportResult) => void
  ) {
    if (!this._server) {
      // It is conceivable that the _server may not be started as it is an async startup
      // However unlikely, if this happens the caller may retry the export
      cb(ExportResult.FAILED_RETRYABLE);
      return;
    }

    this._logger.debug('Prometheus exporter export');

    for (const readableMetric of readableMetrics) {
      this._updateMetric(readableMetric);
    }

    cb(ExportResult.SUCCESS);
  }

  /**
   * Shut down the export server
   */
  shutdown() {
    this.stopServer();
  }

  /**
   * Save the value of one metric to be exported
   *
   * @param readableMetric Metric value to be saved
   */
  private _updateMetric(readableMetric: ReadableMetric) {
    const metric = this._registerMetric(readableMetric);
    if (!metric) return;

    const labelKeys = readableMetric.descriptor.labelKeys;

    if (metric instanceof Prometheus.Counter) {
      for (const ts of readableMetric.timeseries) {
        // Prometheus counter saves internal state and increments by given value.
        // ReadableMetric value is the current state, not the delta to be incremented by.
        // Currently, _registerMetric creates a new counter every time the value changes,
        // so the increment here behaves as a set value (increment from 0)
        metric.inc(this._getLabelValues(labelKeys, ts.labelValues), ts.points[0]
          .value as number);
      }
    }

    if (metric instanceof Prometheus.Gauge) {
      for (const ts of readableMetric.timeseries) {
        metric.set(this._getLabelValues(labelKeys, ts.labelValues), ts.points[0]
          .value as number);
      }
    }

    // TODO: only counter and gauge are implemented in metrics so far
  }

  private _getLabelValues(keys: string[], values: LabelValue[]) {
    const labelValues: Prometheus.labelValues = {};
    for (let i = 0; i < keys.length; i++) {
      if (values[i].value !== null) {
        labelValues[keys[i]] = values[i].value!;
      }
    }
    return labelValues;
  }

  private _registerMetric(
    readableMetric: ReadableMetric
  ): Prometheus.Metric | undefined {
    const metricName = this._getPrometheusMetricName(readableMetric.descriptor);
    const metric = this._registry.getSingleMetric(metricName);

    /**
     * Prometheus library does aggregation, which means its inc method must be called with
     * the value to be incremented by. It does not have a set method. As our ReadableMetric
     * contains the current value, not the value to be incremented by, we destroy and
     * recreate counters when they are updated.
     *
     * This works because counters are identified by their name and no other internal ID
     * https://prometheus.io/docs/instrumenting/exposition_formats/
     */
    if (metric instanceof Prometheus.Counter) {
      this._registry.removeSingleMetric(metricName);
    } else if (metric) return metric;

    const newMetric = this._newMetric(readableMetric, metricName);
    if (!newMetric) return;

    this._registry.registerMetric(newMetric);
    return newMetric;
  }

  private _newMetric(
    readableMetric: ReadableMetric,
    name: string
  ): Prometheus.Metric | undefined {
    const metricObject = {
      name,
      help: readableMetric.descriptor.description,
      labelNames: readableMetric.descriptor.labelKeys,
    };

    switch (readableMetric.descriptor.type) {
      case MetricDescriptorType.COUNTER_DOUBLE:
      case MetricDescriptorType.COUNTER_INT64:
        return new Prometheus.Counter(metricObject);
      case MetricDescriptorType.GAUGE_DOUBLE:
      case MetricDescriptorType.GAUGE_INT64:
        return new Prometheus.Gauge(metricObject);
      default:
        // Other metric types are currently unimplemented
        return undefined;
    }
  }

  private _getPrometheusMetricName(descriptor: MetricDescriptor): string {
    return this._sanitizePrometheusMetricName(
      this._prefix ? `${this._prefix}_${descriptor.name}` : descriptor.name
    );
  }

  private _sanitizePrometheusMetricName(name: string): string {
    return name.replace(/\W/g, '_');
  }

  /**
   * Stops the Prometheus exporter server
   * @param callback A callback that will be executed once the server is stopped
   */
  stopServer(callback?: () => void) {
    if (!this._server) {
      this._logger.debug(
        `Prometheus stopServer() was called but server was never started.`
      );
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
   * Route request based on incoming message url
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
   * Respond to incoming message with current state of all metrics
   */
  private _exportMetrics = (response: ServerResponse) => {
    response.statusCode = 200;
    response.setHeader('content-type', this._registry.contentType);
    response.end(this._registry.metrics());
  };

  /**
   * Respond with 404 status code to all requests that do not match the configured endpoint
   */
  private _notFound = (response: ServerResponse) => {
    response.statusCode = 404;
    response.end();
  };
}
