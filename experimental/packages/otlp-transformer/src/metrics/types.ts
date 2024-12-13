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
import { TFixed64, TInstrumentationScope, TKeyValue } from '../common/types';
import { TResource } from '../resource/types';
import { Type, type Static } from "@sinclair/typebox";

export interface IExportMetricsServiceResponse {
  /** ExportMetricsServiceResponse partialSuccess */
  partialSuccess?: IExportMetricsPartialSuccess;
}

export interface IExportMetricsPartialSuccess {
  /** ExportMetricsPartialSuccess rejectedDataPoints */
  rejectedDataPoints?: number;

  /** ExportMetricsPartialSuccess errorMessage */
  errorMessage?: string;
}

/**
 * AggregationTemporality defines how a metric aggregator reports aggregated
 * values. It describes how those values relate to the time interval over
 * which they are aggregated.
 */
export enum EAggregationTemporality {
  /* UNSPECIFIED is the default AggregationTemporality, it MUST not be used. */
  AGGREGATION_TEMPORALITY_UNSPECIFIED = 0,

  /** DELTA is an AggregationTemporality for a metric aggregator which reports
  changes since last report time. Successive metrics contain aggregation of
  values from continuous and non-overlapping intervals.

  The values for a DELTA metric are based only on the time interval
  associated with one measurement cycle. There is no dependency on
  previous measurements like is the case for CUMULATIVE metrics.

  For example, consider a system measuring the number of requests that
  it receives and reports the sum of these requests every second as a
  DELTA metric:

  1. The system starts receiving at time=t_0.
  2. A request is received, the system measures 1 request.
  3. A request is received, the system measures 1 request.
  4. A request is received, the system measures 1 request.
  5. The 1 second collection cycle ends. A metric is exported for the
      number of requests received over the interval of time t_0 to
      t_0+1 with a value of 3.
  6. A request is received, the system measures 1 request.
  7. A request is received, the system measures 1 request.
  8. The 1 second collection cycle ends. A metric is exported for the
      number of requests received over the interval of time t_0+1 to
      t_0+2 with a value of 2. */
  AGGREGATION_TEMPORALITY_DELTA = 1,

  /** CUMULATIVE is an AggregationTemporality for a metric aggregator which
  reports changes since a fixed start time. This means that current values
  of a CUMULATIVE metric depend on all previous measurements since the
  start time. Because of this, the sender is required to retain this state
  in some form. If this state is lost or invalidated, the CUMULATIVE metric
  values MUST be reset and a new fixed start time following the last
  reported measurement time sent MUST be used.

  For example, consider a system measuring the number of requests that
  it receives and reports the sum of these requests every second as a
  CUMULATIVE metric:

  1. The system starts receiving at time=t_0.
  2. A request is received, the system measures 1 request.
  3. A request is received, the system measures 1 request.
  4. A request is received, the system measures 1 request.
  5. The 1 second collection cycle ends. A metric is exported for the
      number of requests received over the interval of time t_0 to
      t_0+1 with a value of 3.
  6. A request is received, the system measures 1 request.
  7. A request is received, the system measures 1 request.
  8. The 1 second collection cycle ends. A metric is exported for the
      number of requests received over the interval of time t_0 to
      t_0+2 with a value of 5.
  9. The system experiences a fault and loses state.
  10. The system recovers and resumes receiving at time=t_1.
  11. A request is received, the system measures 1 request.
  12. The 1 second collection cycle ends. A metric is exported for the
      number of requests received over the interval of time t_1 to
      t_0+1 with a value of 1.

  Note: Even though, when reporting changes since last report time, using
  CUMULATIVE is valid, it is not recommended. This may cause problems for
  systems that do not use start_time to determine when the aggregation
  value was reset (e.g. Prometheus). */
  AGGREGATION_TEMPORALITY_CUMULATIVE = 2,
}

export const OtelMetricTypes = Type.Module({
  IExportMetricsServiceRequest: Type.Object({
    resourceMetrics: Type.Array(Type.Ref("IResourceMetrics")),
  }),
  IResourceMetrics: Type.Object({
    resource: Type.Optional(TResource),
    scopeMetrics: Type.Array(Type.Ref("IScopeMetrics")),
    schemaUrl: Type.Optional(Type.String()),
  }),
  IScopeMetrics: Type.Object({
    scope: Type.Optional(TInstrumentationScope),
    metrics: Type.Array(Type.Ref("IMetric")),
    schemaUrl: Type.Optional(Type.String()),
  }),
  IMetric: Type.Object({
    name: Type.String(),
    description: Type.Optional(Type.String()),
    unit: Type.Optional(Type.String()),
    gauge: Type.Optional(Type.Ref("IGauge")),
    sum: Type.Optional(Type.Ref("ISum")),
    histogram: Type.Optional(Type.Ref("IHistogram")),
    exponentialHistogram: Type.Optional(Type.Ref("IExponentialHistogram")),
    summary: Type.Optional(Type.Ref("ISummary")),
  }),
  IGauge: Type.Object({
    dataPoints: Type.Array(Type.Ref("INumberDataPoint")),
  }),
  ISum: Type.Object({
    dataPoints: Type.Array(Type.Ref("INumberDataPoint")),
    aggregationTemporality: Type.Enum(EAggregationTemporality),
    isMonotonic: Type.Optional(Type.Union([Type.Boolean(), Type.Null()])),
  }),
  IHistogram: Type.Object({
    dataPoints: Type.Array(Type.Ref("IHistogramDataPoint")),
    aggregationTemporality: Type.Optional(Type.Enum(EAggregationTemporality)),
  }),
  IExponentialHistogram: Type.Object({
    dataPoints: Type.Array(Type.Ref("IExponentialHistogramDataPoint")),
    aggregationTemporality: Type.Optional(Type.Enum(EAggregationTemporality)),
  }),
  ISummary: Type.Object({
    dataPoints: Type.Array(Type.Ref("ISummaryDataPoint")),
  }),
  INumberDataPoint: Type.Object({
    attributes: Type.Array(TKeyValue),
    startTimeUnixNano: Type.Optional(TFixed64),
    timeUnixNano: Type.Optional(TFixed64),
    asDouble: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
    asInt: Type.Optional(Type.Number()),
    exemplars: Type.Optional(Type.Array(Type.Ref("IExemplar"))),
    flags: Type.Optional(Type.Number()),
  }),
  IHistogramDataPoint: Type.Object({
    attributes: Type.Optional(Type.Array(TKeyValue)),
    startTimeUnixNano: Type.Optional(TFixed64),
    timeUnixNano: Type.Optional(TFixed64),
    count: Type.Optional(Type.Number()),
    sum: Type.Optional(Type.Number()),
    bucketCounts: Type.Optional(Type.Array(Type.Number())),
    explicitBounds: Type.Optional(Type.Array(Type.Number())),
    exemplars: Type.Optional(Type.Array(Type.Ref("IExemplar"))),
    flags: Type.Optional(Type.Number()),
    min: Type.Optional(Type.Number()),
    max: Type.Optional(Type.Number()),
  }),
  IExponentialHistogramDataPoint: Type.Object({
    attributes: Type.Optional(Type.Array(TKeyValue)),
    startTimeUnixNano: Type.Optional(TFixed64),
    timeUnixNano: Type.Optional(TFixed64),
    count: Type.Optional(Type.Number()),
    sum: Type.Optional(Type.Number()),
    scale: Type.Optional(Type.Number()),
    zeroCount: Type.Optional(Type.Number()),
    positive: Type.Optional(Type.Ref("IBuckets")),
    negative: Type.Optional(Type.Ref("IBuckets")),
    flags: Type.Optional(Type.Number()),
    exemplars: Type.Optional(Type.Array(Type.Ref("IExemplar"))),
    min: Type.Optional(Type.Number()),
    max: Type.Optional(Type.Number()),
  }),
  ISummaryDataPoint: Type.Object({
    attributes: Type.Optional(Type.Array(TKeyValue)),
    startTimeUnixNano: Type.Optional(Type.Number()),
    timeUnixNano: Type.Optional(Type.String()),
    count: Type.Optional(Type.Number()),
    sum: Type.Optional(Type.Number()),
    quantileValues: Type.Optional(Type.Array(Type.Ref("IValueAtQuantile"))),
    flags: Type.Optional(Type.Number()),
  }),
  IValueAtQuantile: Type.Object({
    quantile: Type.Optional(Type.Number()),
    value: Type.Optional(Type.Number()),
  }),
  IBuckets: Type.Object({
    offset: Type.Optional(Type.Number()),
    bucketCounts: Type.Optional(Type.Array(Type.Number())),
  }),
  IExemplar: Type.Object({
    filteredAttributes: Type.Optional(Type.Array(TKeyValue)),
    timeUnixNano: Type.Optional(Type.String()),
    asDouble: Type.Optional(Type.Number()),
    asInt: Type.Optional(Type.Number()),
    spanId: Type.Optional(Type.Union([Type.String(), Type.Uint8Array()])),
    traceId: Type.Optional(Type.Union([Type.String(), Type.Uint8Array()])),
  }),
});

export const TExportMetricsServiceRequest = OtelMetricTypes.Import("IExportMetricsServiceRequest");
export type IExportMetricsServiceRequest = Static<typeof TExportMetricsServiceRequest>;

export const TResourceMetrics = OtelMetricTypes.Import("IResourceMetrics");
export type IResourceMetrics = Static<typeof TResourceMetrics>;

export const TScopeMetrics = OtelMetricTypes.Import("IScopeMetrics");
export type IScopeMetrics = Static<typeof TScopeMetrics>;

export const TMetric = OtelMetricTypes.Import("IMetric");
export type IMetric = Static<typeof TMetric>;

export const TGauge = OtelMetricTypes.Import("IGauge");
export type IGauge = Static<typeof TGauge>;

export const TSum = OtelMetricTypes.Import("ISum");
export type ISum = Static<typeof TSum>;

export const THistogram = OtelMetricTypes.Import("IHistogram");
export type IHistogram = Static<typeof THistogram>;

export const TExponentialHistogram = OtelMetricTypes.Import("IExponentialHistogram");
export type IExponentialHistogram = Static<typeof TExponentialHistogram>;

export const TSummary = OtelMetricTypes.Import("ISummary");
export type ISummary = Static<typeof TSummary>;

export const TNumberDataPoint = OtelMetricTypes.Import("INumberDataPoint");
export type INumberDataPoint = Static<typeof TNumberDataPoint>;

export const THistogramDataPoint = OtelMetricTypes.Import("IHistogramDataPoint");
export type IHistogramDataPoint = Static<typeof THistogramDataPoint>;

export const TExponentialHistogramDataPoint = OtelMetricTypes.Import("IExponentialHistogramDataPoint");
export type IExponentialHistogramDataPoint = Static<typeof TExponentialHistogramDataPoint>;

export const TSummaryDataPoint = OtelMetricTypes.Import("ISummaryDataPoint");
export type ISummaryDataPoint = Static<typeof TSummaryDataPoint>;

export const TValueAtQuantile = OtelMetricTypes.Import("IValueAtQuantile");
export type IValueAtQuantile = Static<typeof TValueAtQuantile>;

export const TBuckets = OtelMetricTypes.Import("IBuckets");
export type IBuckets = Static<typeof TBuckets>;

export const TExemplar = OtelMetricTypes.Import("IExemplar");
export type IExemplar = Static<typeof TExemplar>;
