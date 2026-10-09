/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { getStringFromEnv } from '@opentelemetry/core';
import type {
  AggregationTemporalitySelector,
  PushMetricExporter,
  ResourceMetrics,
  AggregationSelector,
  AggregationOption,
} from '@opentelemetry/sdk-metrics';
import {
  AggregationTemporality,
  InstrumentType,
  AggregationType,
} from '@opentelemetry/sdk-metrics';
import type { OTLPMetricExporterOptions } from './OTLPMetricExporterOptions';
import { AggregationTemporalityPreference } from './OTLPMetricExporterOptions';
import type { IOtlpExportDelegate } from '@opentelemetry/otlp-exporter-base';
import { OTLPExporterBase } from '@opentelemetry/otlp-exporter-base';
import { diag } from '@opentelemetry/api';

export const CumulativeTemporalitySelector: AggregationTemporalitySelector =
  () => AggregationTemporality.CUMULATIVE;

export const DeltaTemporalitySelector: AggregationTemporalitySelector = (
  instrumentType: InstrumentType
) => {
  switch (instrumentType) {
    case InstrumentType.COUNTER:
    case InstrumentType.OBSERVABLE_COUNTER:
    case InstrumentType.GAUGE:
    case InstrumentType.HISTOGRAM:
    case InstrumentType.OBSERVABLE_GAUGE:
      return AggregationTemporality.DELTA;
    case InstrumentType.UP_DOWN_COUNTER:
    case InstrumentType.OBSERVABLE_UP_DOWN_COUNTER:
      return AggregationTemporality.CUMULATIVE;
  }
};

export const LowMemoryTemporalitySelector: AggregationTemporalitySelector = (
  instrumentType: InstrumentType
) => {
  switch (instrumentType) {
    case InstrumentType.COUNTER:
    case InstrumentType.HISTOGRAM:
      return AggregationTemporality.DELTA;
    case InstrumentType.GAUGE:
    case InstrumentType.UP_DOWN_COUNTER:
    case InstrumentType.OBSERVABLE_UP_DOWN_COUNTER:
    case InstrumentType.OBSERVABLE_COUNTER:
    case InstrumentType.OBSERVABLE_GAUGE:
      return AggregationTemporality.CUMULATIVE;
  }
};

function chooseTemporalitySelectorFromEnvironment() {
  const configuredTemporality = (
    getStringFromEnv('OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE') ??
    'cumulative'
  ).toLowerCase();

  if (configuredTemporality === 'cumulative') {
    return CumulativeTemporalitySelector;
  }
  if (configuredTemporality === 'delta') {
    return DeltaTemporalitySelector;
  }
  if (configuredTemporality === 'lowmemory') {
    return LowMemoryTemporalitySelector;
  }

  diag.warn(
    `OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE is set to '${configuredTemporality}', but only 'cumulative' and 'delta' are allowed. Using default ('cumulative') instead.`
  );
  return CumulativeTemporalitySelector;
}

function chooseTemporalitySelector(
  temporalityPreference?:
    | AggregationTemporalityPreference
    | AggregationTemporality
): AggregationTemporalitySelector {
  // Directly passed preference has priority.
  if (temporalityPreference != null) {
    if (temporalityPreference === AggregationTemporalityPreference.DELTA) {
      return DeltaTemporalitySelector;
    } else if (
      temporalityPreference === AggregationTemporalityPreference.LOWMEMORY
    ) {
      return LowMemoryTemporalitySelector;
    }
    return CumulativeTemporalitySelector;
  }

  return chooseTemporalitySelectorFromEnvironment();
}

const DEFAULT_AGGREGATION = Object.freeze({
  type: AggregationType.DEFAULT,
});

function chooseAggregationSelectorFromEnvironment(): AggregationSelector {
  const configuredAggregation = (
    getStringFromEnv(
      'OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION'
    ) ?? 'explicit_bucket_histogram'
  ).toLowerCase();

  let histogramAggregation: AggregationOption;
  switch (configuredAggregation) {
    case 'base2_exponential_bucket_histogram':
      histogramAggregation = { type: AggregationType.EXPONENTIAL_HISTOGRAM };
      break;
    case 'explicit_bucket_histogram':
      histogramAggregation = {
        type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
      };
      break;
    default:
      diag.warn(
        `OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION is set to '${configuredAggregation}', but only 'explicit_bucket_histogram' and 'base2_exponential_bucket_histogram' are allowed. Using default instead.`
      );
      return () => DEFAULT_AGGREGATION;
  }

  return instrumentType =>
    instrumentType === InstrumentType.HISTOGRAM
      ? histogramAggregation
      : DEFAULT_AGGREGATION;
}

function chooseAggregationSelector(
  config: OTLPMetricExporterOptions | undefined
): AggregationSelector {
  return (
    config?.aggregationPreference ?? chooseAggregationSelectorFromEnvironment()
  );
}

export class OTLPMetricExporterBase
  extends OTLPExporterBase<ResourceMetrics>
  implements PushMetricExporter
{
  private readonly _aggregationTemporalitySelector: AggregationTemporalitySelector;
  private readonly _aggregationSelector: AggregationSelector;

  constructor(
    delegate: IOtlpExportDelegate<ResourceMetrics>,
    config?: OTLPMetricExporterOptions
  ) {
    super(delegate);
    this._aggregationSelector = chooseAggregationSelector(config);
    this._aggregationTemporalitySelector = chooseTemporalitySelector(
      config?.temporalityPreference
    );
  }

  selectAggregation(instrumentType: InstrumentType): AggregationOption {
    return this._aggregationSelector(instrumentType);
  }

  selectAggregationTemporality(
    instrumentType: InstrumentType
  ): AggregationTemporality {
    return this._aggregationTemporalitySelector(instrumentType);
  }
}
