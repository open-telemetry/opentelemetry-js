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
import { IInstrumentationScope, IKeyValue } from '../common/types';
import { IResource } from '../resource/types';

/** Properties of an ExportMetricsServiceRequest. */
export interface IExportMetricsServiceRequest {

  /** ExportMetricsServiceRequest resourceMetrics */
  resourceMetrics: IResourceMetrics[]
}

/** Properties of a ResourceMetrics. */
export interface IResourceMetrics {

  /** ResourceMetrics resource */
  resource?: IResource;

  /** ResourceMetrics scopeMetrics */
  scopeMetrics: IScopeMetrics[]

  /** ResourceMetrics schemaUrl */
  schemaUrl?: string;
}

/** Properties of an IScopeMetrics. */
export interface IScopeMetrics {

  /** ScopeMetrics scope */
  scope?: IInstrumentationScope;

  /** ScopeMetrics metrics */
  metrics: IMetric[];

  /** ScopeMetrics schemaUrl */
  schemaUrl?: string;
}

/** Properties of a Metric. */
export interface IMetric {

  /** Metric name */
  name: string;

  /** Metric description */
  description?: string;

  /** Metric unit */
  unit?: string;

  /** Metric gauge */
  gauge?: IGauge;

  /** Metric sum */
  sum?: ISum;

  /** Metric histogram */
  histogram?: IHistogram;

  /** Metric exponentialHistogram */
  exponentialHistogram?: IExponentialHistogram;

  /** Metric summary */
  summary?: ISummary;
}

/** Properties of a Gauge. */
export interface IGauge {
  /** Gauge dataPoints */
  dataPoints: INumberDataPoint[]
}

/** Properties of a Sum. */
export interface ISum {

  /** Sum dataPoints */
  dataPoints: INumberDataPoint[];

  /** Sum aggregationTemporality */
  aggregationTemporality: EAggregationTemporality

  /** Sum isMonotonic */
  isMonotonic?: (boolean | null);
}

/** Properties of a Histogram. */
export interface IHistogram {
  /** Histogram dataPoints */
  dataPoints: IHistogramDataPoint[]

  /** Histogram aggregationTemporality */
  aggregationTemporality?: EAggregationTemporality
}

/** Properties of an ExponentialHistogram. */
export interface IExponentialHistogram {
  /** ExponentialHistogram dataPoints */
  dataPoints: IExponentialHistogramDataPoint[];

  /** ExponentialHistogram aggregationTemporality */
  aggregationTemporality?: EAggregationTemporality;
}

/** Properties of a Summary. */
export interface ISummary {
  /** Summary dataPoints */
  dataPoints: ISummaryDataPoint[];
}

/** Properties of a NumberDataPoint. */
export interface INumberDataPoint {

  /** NumberDataPoint attributes */
  attributes: IKeyValue[]

  /** NumberDataPoint startTimeUnixNano */
  startTimeUnixNano?: number;

  /** NumberDataPoint timeUnixNano */
  timeUnixNano?: number;

  /** NumberDataPoint asDouble */
  asDouble?: (number | null);

  /** NumberDataPoint asInt */
  asInt?: number;

  /** NumberDataPoint exemplars */
  exemplars?: IExemplar[];

  /** NumberDataPoint flags */
  flags?: number;
}


/** Properties of a HistogramDataPoint. */
export interface IHistogramDataPoint {
  /** HistogramDataPoint attributes */
  attributes?: IKeyValue[];

  /** HistogramDataPoint startTimeUnixNano */
  startTimeUnixNano?: number;

  /** HistogramDataPoint timeUnixNano */
  timeUnixNano?: number;

  /** HistogramDataPoint count */
  count?: number;

  /** HistogramDataPoint sum */
  sum?: number;

  /** HistogramDataPoint bucketCounts */
  bucketCounts?: number[]

  /** HistogramDataPoint explicitBounds */
  explicitBounds?: number[]

  /** HistogramDataPoint exemplars */
  exemplars?: IExemplar[];

  /** HistogramDataPoint flags */
  flags?: number;

  /** HistogramDataPoint min */
  min?: number;

  /** HistogramDataPoint max */
  max?: number;
}

/** Properties of an ExponentialHistogramDataPoint. */
export interface IExponentialHistogramDataPoint {

  /** ExponentialHistogramDataPoint attributes */
  attributes?: IKeyValue[];

  /** ExponentialHistogramDataPoint startTimeUnixNano */
  startTimeUnixNano?: number;

  /** ExponentialHistogramDataPoint timeUnixNano */
  timeUnixNano?: string;

  /** ExponentialHistogramDataPoint count */
  count?: number;

  /** ExponentialHistogramDataPoint sum */
  sum?: number;

  /** ExponentialHistogramDataPoint scale */
  scale?: number;

  /** ExponentialHistogramDataPoint zeroCount */
  zeroCount?: number;

  /** ExponentialHistogramDataPoint positive */
  positive?: IBuckets;

  /** ExponentialHistogramDataPoint negative */
  negative?: IBuckets;

  /** ExponentialHistogramDataPoint flags */
  flags?: number;

  /** ExponentialHistogramDataPoint exemplars */
  exemplars?: IExemplar[]
}


/** Properties of a SummaryDataPoint. */
export interface ISummaryDataPoint {
  /** SummaryDataPoint attributes */
  attributes?: IKeyValue[];

  /** SummaryDataPoint startTimeUnixNano */
  startTimeUnixNano?: number;

  /** SummaryDataPoint timeUnixNano */
  timeUnixNano?: string;

  /** SummaryDataPoint count */
  count?: number;

  /** SummaryDataPoint sum */
  sum?: number;

  /** SummaryDataPoint quantileValues */
  quantileValues?: IValueAtQuantile[];

  /** SummaryDataPoint flags */
  flags?: number;
}

/** Properties of a ValueAtQuantile. */
export interface IValueAtQuantile {
  /** ValueAtQuantile quantile */
  quantile?: number;

  /** ValueAtQuantile value */
  value?: number;
}

/** Properties of a Buckets. */
export interface IBuckets {
  /** Buckets offset */
  offset?: number;

  /** Buckets bucketCounts */
  bucketCounts?: number[];
}

/** Properties of an Exemplar. */
export interface IExemplar {
  /** Exemplar filteredAttributes */
  filteredAttributes?: IKeyValue[];

  /** Exemplar timeUnixNano */
  timeUnixNano?: string;

  /** Exemplar asDouble */
  asDouble?: number;

  /** Exemplar asInt */
  asInt?: number;

  /** Exemplar spanId */
  spanId?: string;

  /** Exemplar traceId */
  traceId?: string;
}

/**
 * AggregationTemporality defines how a metric aggregator reports aggregated
 * values. It describes how those values relate to the time interval over
 * which they are aggregated.
 */
export const enum EAggregationTemporality {
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
  AGGREGATION_TEMPORALITY_CUMULATIVE = 2
}
