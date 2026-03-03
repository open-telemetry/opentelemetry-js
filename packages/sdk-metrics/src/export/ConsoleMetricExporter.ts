/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import { AggregationTemporality } from './AggregationTemporality';
import { ResourceMetrics, InstrumentType } from './MetricData';
import { PushMetricExporter } from './MetricExporter';
import {
  AggregationTemporalitySelector,
  DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR,
} from './AggregationSelector';

interface ConsoleMetricExporterOptions {
  temporalitySelector?: AggregationTemporalitySelector;
}

/**
 * This is an implementation of {@link PushMetricExporter} that prints metrics to the
 * console. This class can be used for diagnostic purposes.
 *
 * NOTE: This {@link PushMetricExporter} is intended for diagnostics use only, output rendered to the console may change at any time.
 */

/* eslint-disable no-console */
export class ConsoleMetricExporter implements PushMetricExporter {
  protected _shutdown = false;
  protected _temporalitySelector: AggregationTemporalitySelector;

  constructor(options?: ConsoleMetricExporterOptions) {
    this._temporalitySelector =
      options?.temporalitySelector ?? DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR;
  }

  export(
    metrics: ResourceMetrics,
    resultCallback: (result: ExportResult) => void
  ): void {
    if (this._shutdown) {
      // If the exporter is shutting down, by spec, we need to return FAILED as export result
      resultCallback({ code: ExportResultCode.FAILED });
      return;
    }

    return ConsoleMetricExporter._sendMetrics(metrics, resultCallback);
  }

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }

  selectAggregationTemporality(
    _instrumentType: InstrumentType
  ): AggregationTemporality {
    return this._temporalitySelector(_instrumentType);
  }

  shutdown(): Promise<void> {
    this._shutdown = true;
    return Promise.resolve();
  }

  private static _sendMetrics(
    metrics: ResourceMetrics,
    done: (result: ExportResult) => void
  ): void {
    for (const scopeMetrics of metrics.scopeMetrics) {
      for (const metric of scopeMetrics.metrics) {
        console.dir(
          {
            descriptor: metric.descriptor,
            dataPointType: metric.dataPointType,
            dataPoints: metric.dataPoints,
          },
          { depth: null }
        );
      }
    }

    done({ code: ExportResultCode.SUCCESS });
  }
}
