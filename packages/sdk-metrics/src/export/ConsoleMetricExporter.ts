/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ExportResult } from '@opentelemetry/core';
import { ExportResultCode } from '@opentelemetry/core';
import type {
  AggregationTemporality,
  AggregationTemporalityPreference,
} from './AggregationTemporality';
import type { ResourceMetrics, InstrumentType } from './MetricData';
import type { PushMetricExporter } from './MetricExporter';
import type { AggregationTemporalitySelector } from './AggregationSelector';
import type { AggregationSelector } from './AggregationSelector';
import type { AggregationOption } from '../view/AggregationOption';
import {
  DEFAULT_AGGREGATION_SELECTOR,
  DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR,
  aggregationTemporalitySelectorFromPreference,
} from './AggregationSelector';

export interface ConsoleMetricExporterOptions {
  /**
   * Explicit temporality selector. When both this and
   * {@link ConsoleMetricExporterOptions.temporalityPreference} are given, this
   * one wins: it is the more specific of the two.
   */
  temporalitySelector?: AggregationTemporalitySelector;
  /**
   * Temporality preference, as used by declarative configuration's
   * `temporality_preference`. Resolved per instrument type; an unspecified
   * preference means cumulative.
   */
  temporalityPreference?:
    | AggregationTemporalityPreference
    | AggregationTemporality;
  /**
   * Aggregation selector, as used by declarative configuration's
   * `default_histogram_aggregation`. An unspecified preference leaves every
   * instrument type at its default aggregation.
   */
  aggregationPreference?: AggregationSelector;
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
  protected _aggregationSelector: AggregationSelector;

  constructor(options?: ConsoleMetricExporterOptions) {
    this._temporalitySelector =
      options?.temporalitySelector ??
      (options?.temporalityPreference != null
        ? aggregationTemporalitySelectorFromPreference(
            options.temporalityPreference
          )
        : DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR);
    this._aggregationSelector =
      options?.aggregationPreference ?? DEFAULT_AGGREGATION_SELECTOR;
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

  selectAggregation(instrumentType: InstrumentType): AggregationOption {
    return this._aggregationSelector(instrumentType);
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
