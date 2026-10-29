/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Writable } from 'stream';
import type {
  AggregationSelector,
  AggregationTemporality,
  AggregationTemporalitySelector,
  InstrumentType,
} from '@opentelemetry/sdk-metrics';
import {
  AggregationTemporality as AggregationTemporalityEnum,
  InstrumentType as InstrumentTypeEnum,
} from '@opentelemetry/sdk-metrics';

/**
 * Configuration options for OTLP JSON File Exporters.
 */
export interface OtlpJsonFileExporterConfig {
  /**
   * The destination writable stream to which OTLP JSON records are written.
   * Defaults to `process.stdout`.
   */
  out?: Writable;
}

/**
 * Aggregation temporality preferences for metric export.
 */
export enum AggregationTemporalityPreference {
  DELTA = 0,
  CUMULATIVE = 1,
  LOWMEMORY = 2,
}

/**
 * Configuration options specifically for {@link OtlpJsonFileMetricExporter}.
 */
export interface OtlpJsonFileMetricExporterOptions
  extends OtlpJsonFileExporterConfig {
  /**
   * Defines the aggregation temporality preference for metric export.
   * Defaults to cumulative.
   */
  temporalityPreference?:
    | AggregationTemporalityPreference
    | AggregationTemporality;

  /**
   * Custom aggregation selector for mapping instrument types to aggregation options.
   */
  aggregationPreference?: AggregationSelector;
}

/**
 * Temporality selector returning cumulative aggregation for all instruments.
 */
export const CumulativeTemporalitySelector: AggregationTemporalitySelector =
  () => AggregationTemporalityEnum.CUMULATIVE;

/**
 * Temporality selector returning delta aggregation for cumulative instruments
 * (Counter, ObservableCounter, Histogram, Gauge, ObservableGauge) and cumulative for UpDownCounter.
 */
export const DeltaTemporalitySelector: AggregationTemporalitySelector = (
  instrumentType: InstrumentType
) => {
  switch (instrumentType) {
    case InstrumentTypeEnum.COUNTER:
    case InstrumentTypeEnum.OBSERVABLE_COUNTER:
    case InstrumentTypeEnum.GAUGE:
    case InstrumentTypeEnum.HISTOGRAM:
    case InstrumentTypeEnum.OBSERVABLE_GAUGE:
      return AggregationTemporalityEnum.DELTA;
    case InstrumentTypeEnum.UP_DOWN_COUNTER:
    case InstrumentTypeEnum.OBSERVABLE_UP_DOWN_COUNTER:
      return AggregationTemporalityEnum.CUMULATIVE;
  }
};

/**
 * Temporality selector returning delta aggregation for synchronous monotonic counters and histograms,
 * and cumulative aggregation for other instruments.
 */
export const LowMemoryTemporalitySelector: AggregationTemporalitySelector = (
  instrumentType: InstrumentType
) => {
  switch (instrumentType) {
    case InstrumentTypeEnum.COUNTER:
    case InstrumentTypeEnum.HISTOGRAM:
      return AggregationTemporalityEnum.DELTA;
    case InstrumentTypeEnum.GAUGE:
    case InstrumentTypeEnum.UP_DOWN_COUNTER:
    case InstrumentTypeEnum.OBSERVABLE_UP_DOWN_COUNTER:
    case InstrumentTypeEnum.OBSERVABLE_COUNTER:
    case InstrumentTypeEnum.OBSERVABLE_GAUGE:
      return AggregationTemporalityEnum.CUMULATIVE;
  }
};
