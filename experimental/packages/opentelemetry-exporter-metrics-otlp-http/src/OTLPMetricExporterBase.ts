/*
 * Copyright The OpenTelemetry Authors
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

import { ExportResult, getEnv } from '@opentelemetry/core';
import {
  Aggregation,
  AggregationSelector,
  AggregationTemporality,
  AggregationTemporalitySelector,
  DefaultAggregationSelector,
  InstrumentType,
  PushMetricExporter,
  ResourceMetrics,
} from '@opentelemetry/sdk-metrics';
import {
  AggregationTemporalityPreference,
  HistogramAggregationPreference,
  OTLPMetricExporterOptions,
} from './OTLPMetricExporterOptions';
import { OTLPExporterBase } from '@opentelemetry/otlp-exporter-base';
import { IExportMetricsServiceRequest } from '@opentelemetry/otlp-transformer';
import { diag } from '@opentelemetry/api';

export const CumulativeTemporalitySelector: AggregationTemporalitySelector =
  () => AggregationTemporality.CUMULATIVE;

export const DeltaTemporalitySelector: AggregationTemporalitySelector = (
  instrumentType: InstrumentType
) => {
  switch (instrumentType) {
    case InstrumentType.COUNTER:
    case InstrumentType.OBSERVABLE_COUNTER:
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
    case InstrumentType.UP_DOWN_COUNTER:
    case InstrumentType.OBSERVABLE_UP_DOWN_COUNTER:
    case InstrumentType.OBSERVABLE_COUNTER:
    case InstrumentType.OBSERVABLE_GAUGE:
      return AggregationTemporality.CUMULATIVE;
  }
};

function chooseTemporalitySelectorFromEnvironment() {
  const env = getEnv();
  const configuredTemporality =
    env.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE.trim().toLowerCase();

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
    `OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE is set to '${env.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE}', but only 'cumulative' and 'delta' are allowed. Using default ('cumulative') instead.`
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

function makeCompoundAggregatorSelector(
  aggregationSelector: AggregationSelector,
  instrumentType: InstrumentType,
  aggregation: Aggregation
): AggregationSelector {
  return (_instrumentType: InstrumentType) => {
    if (_instrumentType === instrumentType) {
      return aggregation;
    }
    return aggregationSelector(_instrumentType);
  };
}

export const ExplicitHistogramAggregationSelector =
  makeCompoundAggregatorSelector(
    DefaultAggregationSelector,
    InstrumentType.HISTOGRAM,
    Aggregation.Histogram()
  );

export const ExponentialHistogramAggregationSelector =
  makeCompoundAggregatorSelector(
    DefaultAggregationSelector,
    InstrumentType.HISTOGRAM,
    Aggregation.ExponentialHistogram()
  );

function chooseHistogramAggregationFromEnvironment(): AggregationSelector {
  const env = getEnv();
  const configuredHistogramAggregation =
    env.OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION.trim().toLowerCase();

  if (configuredHistogramAggregation === 'base2_exponential_bucket_histogram') {
    return ExponentialHistogramAggregationSelector;
  }
  if (configuredHistogramAggregation === 'explicit_bucket_histogram') {
    return ExplicitHistogramAggregationSelector;
  }

  diag.warn(
    `OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION is set to '${env.OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION}', but only 'explicit_bucket_histogram' and 'base2_exponential_bucket_histogram' are allowed. Using default ('explicit_bucket_histogram') instead.`
  );
  return ExplicitHistogramAggregationSelector;
}

function chooseHistogramAggregation(
  histogramPreference?: HistogramAggregationPreference
): AggregationSelector {
  // Directly passed preference has priority.
  if (histogramPreference != null) {
    if (
      histogramPreference ===
      HistogramAggregationPreference.EXPONENTIAL_BUCKET_HISTOGRAM
    ) {
      return ExponentialHistogramAggregationSelector;
    }
    return ExplicitHistogramAggregationSelector;
  }
  return chooseHistogramAggregationFromEnvironment();
}

export class OTLPMetricExporterBase<
  T extends OTLPExporterBase<
    OTLPMetricExporterOptions,
    ResourceMetrics,
    IExportMetricsServiceRequest
  >
> implements PushMetricExporter
{
  public _otlpExporter: T;
  private _aggregationTemporalitySelector: AggregationTemporalitySelector;
  private _aggregationSelector: AggregationSelector;

  constructor(exporter: T, config?: OTLPMetricExporterOptions) {
    this._otlpExporter = exporter;
    this._aggregationTemporalitySelector = chooseTemporalitySelector(
      config?.temporalityPreference
    );
    this._aggregationSelector = chooseHistogramAggregation(
      config?.histogramPreference
    );
  }

  export(
    metrics: ResourceMetrics,
    resultCallback: (result: ExportResult) => void
  ): void {
    this._otlpExporter.export([metrics], resultCallback);
  }

  async shutdown(): Promise<void> {
    await this._otlpExporter.shutdown();
  }

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }

  selectAggregationTemporality(
    instrumentType: InstrumentType
  ): AggregationTemporality {
    return this._aggregationTemporalitySelector(instrumentType);
  }

  selectAggregation(instrumentType: InstrumentType): Aggregation {
    return this._aggregationSelector(instrumentType);
  }
}
