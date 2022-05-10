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

import { ExportResult } from '@opentelemetry/core';
import {
  AggregationTemporality,
  AggregationTemporalitySelector,
  InstrumentType,
  PushMetricExporter,
  ResourceMetrics
} from '@opentelemetry/sdk-metrics-base';
import { defaultOptions, OTLPMetricExporterOptions } from './OTLPMetricExporterOptions';
import { OTLPExporterBase } from '@opentelemetry/otlp-exporter-base';
import { IExportMetricsServiceRequest } from '@opentelemetry/otlp-transformer';

export const CumulativeTemporalitySelector: AggregationTemporalitySelector = () => AggregationTemporality.CUMULATIVE;

export const DeltaTemporalitySelector: AggregationTemporalitySelector = (instrumentType: InstrumentType) => {
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

function chooseTemporalitySelector(temporalityPreference?: AggregationTemporality): AggregationTemporalitySelector {
  if (temporalityPreference === AggregationTemporality.DELTA) {
    return DeltaTemporalitySelector;
  }

  return CumulativeTemporalitySelector;
}

export class OTLPMetricExporterBase<T extends OTLPExporterBase<OTLPMetricExporterOptions,
  ResourceMetrics,
  IExportMetricsServiceRequest>>
implements PushMetricExporter {
  public _otlpExporter: T;
  protected _aggregationTemporalitySelector: AggregationTemporalitySelector;

  constructor(exporter: T,
    config: OTLPMetricExporterOptions = defaultOptions) {
    this._otlpExporter = exporter;
    this._aggregationTemporalitySelector = chooseTemporalitySelector(config.temporalityPreference);
  }

  export(metrics: ResourceMetrics, resultCallback: (result: ExportResult) => void): void {
    this._otlpExporter.export([metrics], resultCallback);
  }

  async shutdown(): Promise<void> {
    await this._otlpExporter.shutdown();
  }

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }

  selectAggregationTemporality(instrumentType: InstrumentType): AggregationTemporality {
    return this._aggregationTemporalitySelector(instrumentType);
  }
}
