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

export type {
  Sum,
  LastValue,
  Histogram,
  ExponentialHistogram,
} from './aggregator/types';

export type {
  AggregationSelector,
  AggregationTemporalitySelector,
} from './export/AggregationSelector';

export { AggregationTemporality } from './export/AggregationTemporality';

export { DataPointType, InstrumentType } from './export/MetricData';
export type {
  DataPoint,
  SumMetricData,
  GaugeMetricData,
  HistogramMetricData,
  ExponentialHistogramMetricData,
  ResourceMetrics,
  ScopeMetrics,
  MetricData,
  MetricDescriptor,
  CollectionResult,
} from './export/MetricData';

export type { PushMetricExporter } from './export/MetricExporter';

export { MetricReader } from './export/MetricReader';
export type { IMetricReader, MetricReaderOptions } from './export/MetricReader';

export { PeriodicExportingMetricReader } from './export/PeriodicExportingMetricReader';
export type { PeriodicExportingMetricReaderOptions } from './export/PeriodicExportingMetricReader';

export { InMemoryMetricExporter } from './export/InMemoryMetricExporter';

export { ConsoleMetricExporter } from './export/ConsoleMetricExporter';

export type {
  MetricCollectOptions,
  MetricProducer,
} from './export/MetricProducer';

export { MeterProvider } from './MeterProvider';
export type { MeterProviderOptions } from './MeterProvider';

export { AggregationType } from './view/AggregationOption';
export type { AggregationOption } from './view/AggregationOption';

export type { ViewOptions } from './view/View';

export type { IAttributesProcessor } from './view/AttributesProcessor';
export {
  createAllowListAttributesProcessor,
  createDenyListAttributesProcessor,
} from './view/AttributesProcessor';

export { TimeoutError } from './utils';
