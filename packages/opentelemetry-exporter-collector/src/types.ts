/*!
 * Copyright 2020, OpenTelemetry Authors
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

import { SpanKind, Logger, Attributes } from '@opentelemetry/api';
import * as api from '@opentelemetry/api';
import * as grpc from 'grpc';

// header to prevent instrumentation on request
export const OT_REQUEST_HEADER = 'x-opentelemetry-outgoing-request';

/* eslint-disable @typescript-eslint/no-namespace */
export namespace opentelemetryProto {
  export namespace collector {
    export namespace metrics.v1 {
      export interface ExportMetricsServiceError {
        code: number;
        details: string;
        metadata: { [key: string]: unknown };
        message: string;
        stack: string;
      }
    }
    export namespace trace.v1 {
      export interface TraceService {
        service: opentelemetryProto.collector.trace.v1.TraceService;
      }

      export interface ExportTraceServiceRequest {
        resourceSpans: opentelemetryProto.trace.v1.ResourceSpans[];
      }

      export interface ExportTraceServiceError {
        code: number;
        details: string;
        metadata: { [key: string]: unknown };
        message: string;
        stack: string;
      }
    }
  }

  export namespace resource.v1 {
    export interface Resource {
      attributes: opentelemetryProto.common.v1.AttributeKeyValue[];
      droppedAttributesCount: number;
    }
  }

  export namespace metrics.v1 {
    export interface ExportMetricsServiceRequest {
      resourceMetrics: opentelemetryProto.metrics.v1.ResourceMetrics[];
    }
    export interface Metric {
      metricDescriptor: opentelemetryProto.metrics.v1.MetricDescriptor;
      int64DataPoints?: opentelemetryProto.metrics.v1.Int64DataPoint[];
      doubleDataPoints?: opentelemetryProto.metrics.v1.DoubleDataPoint[];
      histogramDataPoints?: opentelemetryProto.metrics.v1.HistogramDataPoint[];
      summaryDataPoints?: opentelemetryProto.metrics.v1.SummaryDataPoint[];
    }

    export interface Int64DataPoint {
      labels: opentelemetryProto.common.v1.StringKeyValue[];
      startTimeUnixNano: number;
      timeUnixNano: number;
      value: number;
    }

    export interface DoubleDataPoint {
      labels: opentelemetryProto.common.v1.StringKeyValue[];
      startTimeUnixNano: number;
      timeUnixNano: number;
      value: number;
    }

    export interface HistogramDataPoint {
      labels: opentelemetryProto.common.v1.StringKeyValue[];
      startTimeUnixNano: number;
      timeUnixNano: number;
      value: number;
      count: number;
      sum: number;
      buckets: opentelemetryProto.metrics.v1.HistogramDataPoint_Bucket;
      explicitBounds: number[];
    }

    export interface HistogramDataPoint_Bucket {
      count: number;
      exemplar: number; // CHANGE LATER
    }

    export interface SummaryDataPoint {
      labels: opentelemetryProto.common.v1.StringKeyValue[];
      startTimeUnixNano: number;
      timeUnixNano: number;
      value: number;
      count: number;
      sum: number;
      percentileValues: opentelemetryProto.metrics.v1.SummaryDataPoint_ValueAtPercentile[];
    }

    export interface SummaryDataPoint_ValueAtPercentile {
      percentile: number;
      value: number;
    }

    export interface MetricDescriptor {
      name: string;
      description: string;
      unit: string;
      labels: opentelemetryProto.common.v1.StringKeyValue[];
      type: opentelemetryProto.metrics.v1.MetricDescriptor_Type;
      temporality: opentelemetryProto.metrics.v1.MetricDescriptor_Temporality;
    }

    export interface InstrumentationLibraryMetrics {
      instrumentationLibrary?: opentelemetryProto.common.v1.InstrumentationLibrary;
      metrics: opentelemetryProto.metrics.v1.Metric[];
    }

    export interface ResourceMetrics {
      resource?: opentelemetryProto.resource.v1.Resource;
      instrumentationLibraryMetrics: opentelemetryProto.metrics.v1.InstrumentationLibraryMetrics[];
    }

    export enum MetricDescriptor_Type {
      UNSPECIFIED,
      GAUGE_INT64,
      GAUGE_DOUBLE,
      GAUGE_HISTOGRAM,
      COUNTER_INT64,
      COUNTER_DOUBLE,
      CUMULATIVE_HISTOGRAM,
      SUMMARY,
    }

    export enum MetricDescriptor_Temporality {
      INVALID_TEMPORALITY,
      INSTANTANEOUS,
      DELTA,
      CUMULATIVE,
    }
  }

  export namespace trace.v1 {
    export namespace ConstantSampler {
      export enum ConstantDecision {
        ALWAYS_OFF = 0,
        ALWAYS_ON = 1,
        ALWAYS_PARENT = 2,
      }
    }
    export namespace Span {
      export interface Event {
        timeUnixNano: number;
        name: string;
        attributes?: opentelemetryProto.common.v1.AttributeKeyValue[];
        droppedAttributesCount: number;
      }

      export interface Link {
        traceId: string;
        spanId: string;
        traceState?: opentelemetryProto.trace.v1.Span.TraceState;
        attributes?: opentelemetryProto.common.v1.AttributeKeyValue[];
        droppedAttributesCount: number;
      }

      export enum SpanKind {
        SPAN_KIND_UNSPECIFIED,
        INTERNAL,
        SERVER,
        CLIENT,
        PRODUCER,
        CONSUMER,
      }
      export type TraceState = string | undefined;
    }

    export interface ConstantSampler {
      decision?: opentelemetryProto.trace.v1.ConstantSampler.ConstantDecision;
    }

    export interface InstrumentationLibrarySpans {
      instrumentationLibrary?: opentelemetryProto.common.v1.InstrumentationLibrary;
      spans: opentelemetryProto.trace.v1.Span[];
    }

    export interface ProbabilitySampler {
      samplingProbability?: number | null;
    }

    export interface RateLimitingSampler {
      qps?: number | null;
    }

    export interface ResourceSpans {
      resource?: opentelemetryProto.resource.v1.Resource;
      instrumentationLibrarySpans: opentelemetryProto.trace.v1.InstrumentationLibrarySpans[];
    }

    export interface Span {
      traceId: string;
      spanId: string;
      traceState: opentelemetryProto.trace.v1.Span.TraceState;
      parentSpanId?: string;
      name?: string;
      kind?: opentelemetryProto.trace.v1.Span.SpanKind;
      startTimeUnixNano?: number;
      endTimeUnixNano?: number;
      attributes?: opentelemetryProto.common.v1.AttributeKeyValue[];
      droppedAttributesCount: number;
      events?: opentelemetryProto.trace.v1.Span.Event[];
      droppedEventsCount: number;
      links?: opentelemetryProto.trace.v1.Span.Link[];
      droppedLinksCount: number;
      status?: Status;
    }

    export type Status = api.Status;

    export interface TraceConfig {
      constantSampler?: ConstantSampler | null;
      probabilitySampler?: ProbabilitySampler | null;
      rateLimitingSampler?: RateLimitingSampler | null;
    }
  }
  export namespace common.v1 {
    export interface AttributeKeyValue {
      key: string;
      type: opentelemetryProto.common.v1.ValueType;
      stringValue?: string;
      intValue?: number;
      doubleValue?: number;
      boolValue?: boolean;
    }

    export interface InstrumentationLibrary {
      name: string;
      version: string;
    }

    export interface StringKeyValue {
      key: string;
      value: string;
    }

    export enum ValueType {
      STRING,
      INT,
      DOUBLE,
      BOOL,
    }
  }
}

export interface ExporterOptions {
  /**
   * App prefix for metrics, if needed
   */
  prefix?: string;

  /**
   * Object implementing the logger interface
   */
  logger?: Logger;

  url?: string;

  credentials?: grpc.ChannelCredentials;
  attributes?: Attributes;
  hostName?: string;
  serviceName?: string;
}

/**
 * Interface for handling error
 */
export interface CollectorExporterError {
  code?: number;
  message?: string;
  stack?: string;
}

/**
 * Mapping between api SpanKind and proto SpanKind
 */
export const COLLECTOR_SPAN_KIND_MAPPING = {
  [SpanKind.INTERNAL]: opentelemetryProto.trace.v1.Span.SpanKind.INTERNAL,
  [SpanKind.SERVER]: opentelemetryProto.trace.v1.Span.SpanKind.SERVER,
  [SpanKind.CLIENT]: opentelemetryProto.trace.v1.Span.SpanKind.CLIENT,
  [SpanKind.PRODUCER]: opentelemetryProto.trace.v1.Span.SpanKind.PRODUCER,
  [SpanKind.CONSUMER]: opentelemetryProto.trace.v1.Span.SpanKind.CONSUMER,
};
