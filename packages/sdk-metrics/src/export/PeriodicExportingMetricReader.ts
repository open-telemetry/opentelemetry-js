/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as api from '@opentelemetry/api';
import {
  internal,
  ExportResultCode,
  globalErrorHandler,
  hrTime,
  hrTimeDuration,
} from '@opentelemetry/core';
import { MetricReader } from './MetricReader';
import { PushMetricExporter } from './MetricExporter';
import { callWithTimeout, TimeoutError } from '../utils';
import { MetricProducer } from './MetricProducer';
import { MetricReaderMetrics } from './MetricReaderMetrics';
import { OTEL_COMPONENT_TYPE_VALUE_PERIODIC_METRIC_READER } from '../semconv';
import { VERSION } from '../version';

export type PeriodicExportingMetricReaderOptions = {
  /**
   * The backing exporter for the metric reader.
   */
  exporter: PushMetricExporter;
  /**
   * An internal milliseconds for the metric reader to initiate metric
   * collection.
   */
  exportIntervalMillis?: number;
  /**
   * Milliseconds for the async observable callback to timeout.
   */
  exportTimeoutMillis?: number;
  /**
   * **Note, this option is experimental**. Additional MetricProducers to use as a source of
   * aggregated metric data in addition to the SDK's metric data. The resource returned by
   * these MetricProducers is ignored; the SDK's resource will be used instead.
   * @experimental
   */
  metricProducers?: MetricProducer[];
};

/**
 * {@link MetricReader} which collects metrics based on a user-configurable time interval, and passes the metrics to
 * the configured {@link PushMetricExporter}
 */
export class PeriodicExportingMetricReader extends MetricReader {
  private _interval?: ReturnType<typeof setInterval>;
  private _exporter: PushMetricExporter;
  private _metrics: MetricReaderMetrics;
  private readonly _exportInterval: number;
  private readonly _exportTimeout: number;

  constructor(options: PeriodicExportingMetricReaderOptions) {
    const { exporter, exportIntervalMillis = 60000, metricProducers } = options;
    let { exportTimeoutMillis = 30000 } = options;

    super({
      aggregationSelector: exporter.selectAggregation?.bind(exporter),
      aggregationTemporalitySelector:
        exporter.selectAggregationTemporality?.bind(exporter),
      metricProducers,
    });

    if (exportIntervalMillis <= 0) {
      throw Error('exportIntervalMillis must be greater than 0');
    }

    if (exportTimeoutMillis <= 0) {
      throw Error('exportTimeoutMillis must be greater than 0');
    }

    if (exportIntervalMillis < exportTimeoutMillis) {
      if (
        'exportIntervalMillis' in options &&
        'exportTimeoutMillis' in options
      ) {
        // An invalid combination of values was explicitly provided.
        throw Error(
          'exportIntervalMillis must be greater than or equal to exportTimeoutMillis'
        );
      } else {
        // An invalid combination of value was implicitly provided.
        api.diag.info(
          `Timeout of ${exportTimeoutMillis} exceeds the interval of ${exportIntervalMillis}. Clamping timeout to interval duration.`
        );
        exportTimeoutMillis = exportIntervalMillis;
      }
    }

    this._exportInterval = exportIntervalMillis;
    this._exportTimeout = exportTimeoutMillis;
    this._exporter = exporter;
    this._metrics = new MetricReaderMetrics(
      OTEL_COMPONENT_TYPE_VALUE_PERIODIC_METRIC_READER,
      api.createNoopMeter()
    );
  }

  setMeterProvider(meterProvider: api.MeterProvider) {
    const meter = meterProvider.getMeter('@opentelemetry/sdk-metrics', VERSION);
    this._metrics = new MetricReaderMetrics(
      OTEL_COMPONENT_TYPE_VALUE_PERIODIC_METRIC_READER,
      meter
    );
  }

  private async _runOnce(): Promise<void> {
    try {
      await callWithTimeout(this._doRun(), this._exportTimeout);
    } catch (err) {
      if (err instanceof TimeoutError) {
        api.diag.error(
          'Export took longer than %s milliseconds and timed out.',
          this._exportTimeout
        );
        return;
      }

      globalErrorHandler(err);
    }
  }

  private async _doRun(): Promise<void> {
    const startTime = hrTime();
    const { resourceMetrics, errors } = await this.collect({
      timeoutMillis: this._exportTimeout,
    });
    const endTime = hrTime();
    let collectError: string | undefined = undefined;

    if (errors.length > 0) {
      api.diag.error(
        'PeriodicExportingMetricReader: metrics collection errors',
        ...errors
      );
      collectError = (errors[0] as Error).name ?? 'collect_error';
    }

    const collectDuration = hrTimeDuration(startTime, endTime);
    const collectDurationSecs = collectDuration[0] + collectDuration[1] / 1e9;
    this._metrics.recordCollection(collectDurationSecs, collectError);

    if (resourceMetrics.resource.asyncAttributesPending) {
      try {
        await resourceMetrics.resource.waitForAsyncAttributes?.();
      } catch (e) {
        api.diag.debug('Error while resolving async portion of resource: ', e);
        globalErrorHandler(e);
      }
    }

    if (resourceMetrics.scopeMetrics.length === 0) {
      return;
    }

    const result = await internal._export(this._exporter, resourceMetrics);
    if (result.code !== ExportResultCode.SUCCESS) {
      throw new Error(
        `PeriodicExportingMetricReader: metrics export failed (error ${result.error})`
      );
    }
  }

  protected override onInitialized(): void {
    // start running the interval as soon as this reader is initialized and keep handle for shutdown.
    this._interval = setInterval(() => {
      // this._runOnce never rejects. Using void operator to suppress @typescript-eslint/no-floating-promises.
      void this._runOnce();
    }, this._exportInterval);

    // depending on runtime, this may be a 'number' or NodeJS.Timeout
    if (typeof this._interval !== 'number') {
      this._interval.unref();
    }
  }

  protected async onForceFlush(): Promise<void> {
    await this._runOnce();
    await this._exporter.forceFlush();
  }

  protected async onShutdown(): Promise<void> {
    if (this._interval) {
      clearInterval(this._interval);
    }
    await this.onForceFlush();
    await this._exporter.shutdown();
  }
}
