/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { getStringFromEnv } from '@opentelemetry/core';
import type {
  AggregationOption,
  AggregationSelector,
  AggregationTemporality,
  AggregationTemporalityPreference,
  AggregationTemporalitySelector,
  InstrumentType,
  PushMetricExporter,
  ResourceMetrics,
} from '@opentelemetry/sdk-metrics';
import {
  AggregationType,
  CumulativeTemporalitySelector,
  DeltaTemporalitySelector,
  LowMemoryTemporalitySelector,
  aggregationTemporalitySelectorFromPreference,
} from '@opentelemetry/sdk-metrics';
import type { OTLPMetricExporterOptions } from './OTLPMetricExporterOptions';
import type { IOtlpExportDelegate } from '@opentelemetry/otlp-exporter-base';
import { OTLPExporterBase } from '@opentelemetry/otlp-exporter-base';
import { diag } from '@opentelemetry/api';

// Re-exported for backward compatibility. These now live in `@opentelemetry/sdk-metrics`
// so that exporters which do not depend on OTLP can use them too.
// See https://github.com/open-telemetry/opentelemetry-js/issues/6957
export {
  CumulativeTemporalitySelector,
  DeltaTemporalitySelector,
  LowMemoryTemporalitySelector,
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
    AggregationTemporalityPreference | AggregationTemporality
): AggregationTemporalitySelector {
  // Directly passed preference has priority.
  if (temporalityPreference != null) {
    return aggregationTemporalitySelectorFromPreference(temporalityPreference);
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
