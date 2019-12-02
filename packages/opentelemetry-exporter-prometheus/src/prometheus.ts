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
import { Counter, Gauge, labelValues, Metric, Registry } from 'prom-client';
import * as url from 'url';
import { ExporterConfig } from './export/types';

export class PrometheusExporter implements MetricExporter {
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
  private readonly _server: Server;
  private readonly _prefix?: string;
  private readonly _invalidCharacterRegex = /[^a-z0-9_]/gi;

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
   * Saves the current values of all exported {@link ReadableMetric}s so that they can be pulled
   * by the Prometheus backend.
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
   * Shuts down the export server and clears the registry
   *
   * @param cb called when server is stopped
   */
  shutdown(cb?: () => void) {
    this._registry.clear();
    this.stopServer(cb);
  }

  /**
   * Updates the value of a single metric in the registry
   *
   * @param readableMetric Metric value to be saved
   */
  private _updateMetric(readableMetric: ReadableMetric) {
    const metric = this._registerMetric(readableMetric);
    if (!metric) return;

    const labelKeys = readableMetric.descriptor.labelKeys;

    if (metric instanceof Counter) {
      for (const ts of readableMetric.timeseries) {
        // Prometheus counter saves internal state and increments by given value.
        // ReadableMetric value is the current state, not the delta to be incremented by.
        // Currently, _registerMetric creates a new counter every time the value changes,
        // so the increment here behaves as a set value (increment from 0)
        metric.inc(
          this._getLabelValues(labelKeys, ts.labelValues),
          ts.points[0].value as number
        );
      }
    }

    if (metric instanceof Gauge) {
      for (const ts of readableMetric.timeseries) {
        metric.set(
          this._getLabelValues(labelKeys, ts.labelValues),
          ts.points[0].value as number
        );
      }
    }

    // TODO: only counter and gauge are implemented in metrics so far
  }

  private _getLabelValues(keys: string[], values: LabelValue[]) {
    const labelValues: labelValues = {};
    for (let i = 0; i < keys.length; i++) {
      if (values[i].value !== null) {
        labelValues[keys[i]] = values[i].value!;
      }
    }
    return labelValues;
  }

  private _registerMetric(readableMetric: ReadableMetric): Metric | undefined {
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
    if (metric instanceof Counter) {
      this._registry.removeSingleMetric(metricName);
    } else if (metric) return metric;

    return this._newMetric(readableMetric, metricName);
  }

  private _newMetric(
    readableMetric: ReadableMetric,
    name: string
  ): Metric | undefined {
    const metricObject = {
      name,
      // prom-client throws with empty description which is our default
      help: readableMetric.descriptor.description || 'description missing',
      labelNames: readableMetric.descriptor.labelKeys,
      // list of registries to register the newly created metric
      registers: [this._registry],
    };

    switch (readableMetric.descriptor.type) {
      case MetricDescriptorType.COUNTER_DOUBLE:
      case MetricDescriptorType.COUNTER_INT64:
        // there is no such thing as a non-monotonic counter in prometheus
        return readableMetric.descriptor.monotonic
          ? new Counter(metricObject)
          : new Gauge(metricObject);
      case MetricDescriptorType.GAUGE_DOUBLE:
      case MetricDescriptorType.GAUGE_INT64:
        return new Gauge(metricObject);
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

  /**
   * Ensures metric names are valid Prometheus metric names by removing
   * characters allowed by OpenTelemetry but disallowed by Prometheus.
   *
   * https://prometheus.io/docs/concepts/data_model/#metric-names-and-labels
   *
   * 1. Names must match `[a-zA-Z_:][a-zA-Z0-9_:]*`
   *
   * 2. Colons are reserved for user defined recording rules.
   * They should not be used by exporters or direct instrumentation.
   *
   * OpenTelemetry metric names are already validated in the Meter when they are created,
   * and they match the format `[a-zA-Z][a-zA-Z0-9_.\-]*` which is very close to a valid
   * prometheus metric name, so we only need to strip characters valid in OpenTelemetry
   * but not valid in prometheus and replace them with '_'.
   *
   * @param name name to be sanitized
   */
  private _sanitizePrometheusMetricName(name: string): string {
    return name.replace(this._invalidCharacterRegex, '_'); // replace all invalid characters with '_'
  }

  /**
   * Stops the Prometheus export server
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
    response.setHeader('content-type', this._registry.contentType);
    response.end(this._registry.metrics() || '# no registered metrics');
  };

  /**
   * Responds with 404 status code to all requests that do not match the configured endpoint.
   */
  private _notFound = (response: ServerResponse) => {
    response.statusCode = 404;
    response.end();
  };
}
