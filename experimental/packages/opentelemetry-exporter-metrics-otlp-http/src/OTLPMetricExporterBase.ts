/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { getStringFromEnv } from '@opentelemetry/core';
import {
  AggregationTemporality,
  AggregationTemporalitySelector,
  InstrumentType,
  PushMetricExporter,
  ResourceMetrics,
  AggregationSelector,
  AggregationOption,
  AggregationType,
} from '@opentelemetry/sdk-metrics';
import {
  AggregationTemporalityPreference,
  OTLPMetricExporterOptions,
} from './OTLPMetricExporterOptions';
import {
  IOtlpExportDelegate,
  OTLPExporterBase,
} from '@opentelemetry/otlp-exporter-base';
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

function chooseAggregationSelector(
  config: OTLPMetricExporterOptions | undefined
): AggregationSelector {
  return config?.aggregationPreference ?? (() => DEFAULT_AGGREGATION);
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
