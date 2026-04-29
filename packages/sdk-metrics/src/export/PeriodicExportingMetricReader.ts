/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as api from '@opentelemetry/api';
import {
  internal,
  ExportResultCode,
  globalErrorHandler,
} from '@opentelemetry/core';
import { MetricReader } from './MetricReader';
import type { PushMetricExporter } from './MetricExporter';
import { callWithTimeout, TimeoutError } from '../utils';
import type { MetricProducer } from './MetricProducer';
import { InstrumentType, ResourceMetrics, ScopeMetrics } from './MetricData';

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
  /**
   * Cardinality limits for the metric reader, applied per instrument. If not configured, defaults to 2000 time series per instrument. These are wrapped in a cardinalitySelector function that returns limits based on the instrument type, so they can be configured differently per type if desired.
   *
   */
  cardinalityLimits?: {
    counter?: number;
    gauge?: number;
    histogram?: number;
    upDownCounter?: number;
    observableCounter?: number;
    observableGauge?: number;
    observableUpDownCounter?: number;
    default?: number;
  };
  /**
   * The maximum batch size for exports. If configured, the reader will split
   * batches larger than this size into smaller batches.
   */
  maxExportBatchSize?: number;
};

/**
 * {@link MetricReader} which collects metrics based on a user-configurable time interval, and passes the metrics to
 * the configured {@link PushMetricExporter}
 */
export class PeriodicExportingMetricReader extends MetricReader {
  private _interval?: ReturnType<typeof setInterval>;
  private _exporter: PushMetricExporter;
  private readonly _exportInterval: number;
  private readonly _exportTimeout: number;
  private readonly _maxExportBatchSize?: number;
  private _previousExportPromise: Promise<void> = Promise.resolve();

  constructor(options: PeriodicExportingMetricReaderOptions) {
    const {
      exporter,
      exportIntervalMillis = 60000,
      metricProducers,
      cardinalityLimits,
      maxExportBatchSize,
    } = options;
    let { exportTimeoutMillis = 30000 } = options;

    super({
      aggregationSelector: exporter.selectAggregation?.bind(exporter),
      aggregationTemporalitySelector:
        exporter.selectAggregationTemporality?.bind(exporter),
      metricProducers,
      cardinalitySelector: (instrumentType: InstrumentType) => {
        const limits = {
          default: 2000,
          ...cardinalityLimits,
        };

        switch (instrumentType) {
          case InstrumentType.COUNTER:
            return limits.counter ?? limits.default;
          case InstrumentType.GAUGE:
            return limits.gauge ?? limits.default;
          case InstrumentType.HISTOGRAM:
            return limits.histogram ?? limits.default;
          case InstrumentType.OBSERVABLE_COUNTER:
            return limits.observableCounter ?? limits.default;
          case InstrumentType.OBSERVABLE_UP_DOWN_COUNTER:
            return limits.observableUpDownCounter ?? limits.default;
          case InstrumentType.OBSERVABLE_GAUGE:
            return limits.observableGauge ?? limits.default;
          case InstrumentType.UP_DOWN_COUNTER:
            return limits.upDownCounter ?? limits.default;
          default:
            return limits.default;
        }
      },
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
    this._maxExportBatchSize = maxExportBatchSize;
  }

  private _splitResourceMetrics(
    resourceMetrics: ResourceMetrics,
    maxExportBatchSize: number
  ): ResourceMetrics[] {
    const batches: ResourceMetrics[] = [];
    let currentBatchPoints = 0;
    let currentScopeMetrics: ScopeMetrics[] = [];

    function flush() {
      if (currentScopeMetrics.length > 0) {
        batches.push({
          resource: resourceMetrics.resource,
          scopeMetrics: currentScopeMetrics,
        });
        currentScopeMetrics = [];
        currentBatchPoints = 0;
      }
    }

    for (const scopeMetric of resourceMetrics.scopeMetrics) {
      let scopeMetricCopy: ScopeMetrics | null = null;

      for (const metric of scopeMetric.metrics) {
        let dataPointsRemaining = metric.dataPoints;

        if (dataPointsRemaining.length === 0) {
          if (!scopeMetricCopy) {
            scopeMetricCopy = { scope: scopeMetric.scope, metrics: [] };
            currentScopeMetrics.push(scopeMetricCopy);
          }
          scopeMetricCopy.metrics.push(metric);
          continue;
        }

        while (dataPointsRemaining.length > 0) {
          const spaceLeft = maxExportBatchSize - currentBatchPoints;
          if (spaceLeft === 0) {
            flush();
            scopeMetricCopy = null;
            continue;
          }

          const take = Math.min(spaceLeft, dataPointsRemaining.length);
          const chunk = dataPointsRemaining.slice(0, take);
          dataPointsRemaining = dataPointsRemaining.slice(take);

          if (!scopeMetricCopy) {
            scopeMetricCopy = { scope: scopeMetric.scope, metrics: [] };
            currentScopeMetrics.push(scopeMetricCopy);
          }

          let metricCopy = scopeMetricCopy.metrics.find(
            m => m.descriptor.name === metric.descriptor.name
          );
          if (!metricCopy) {
            metricCopy = { ...metric, dataPoints: [] };
            scopeMetricCopy.metrics.push(metricCopy);
          }

          (metricCopy.dataPoints as any[]).push(...chunk);
          currentBatchPoints += take;

          if (currentBatchPoints === maxExportBatchSize) {
            flush();
            scopeMetricCopy = null;
          }
        }
      }
    }

    flush();
    return batches;
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
    const { resourceMetrics, errors } = await this.collect({
      timeoutMillis: this._exportTimeout,
    });

    if (errors.length > 0) {
      api.diag.error(
        'PeriodicExportingMetricReader: metrics collection errors',
        ...errors
      );
    }

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

    const batches = this._maxExportBatchSize
      ? this._splitResourceMetrics(resourceMetrics, this._maxExportBatchSize)
      : [resourceMetrics];

    const currentExport = async () => {
      let anyErr: Error | null = null;
      for (const batch of batches) {
        const result = await internal._export(this._exporter, batch);
        if (result.code !== ExportResultCode.SUCCESS) {
          const err = new Error(
            `PeriodicExportingMetricReader: metrics export failed (error ${result.error})`
          );
          api.diag.error(err.message);
          anyErr = err;
        }
      }
      if (anyErr) {
        throw anyErr;
      }
    };

    // Schedules the current export to run after all previously scheduled exports have finished.
    const promise = this._previousExportPromise.then(currentExport);
    this._previousExportPromise = promise.catch(() => { });
    await promise;
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
