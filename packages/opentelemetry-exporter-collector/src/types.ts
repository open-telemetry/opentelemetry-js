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

import { SpanKind, Logger, Attributes } from '@opentelemetry/api';
import * as api from '@opentelemetry/api';
import * as grpc from 'grpc';

// header to prevent instrumentation on request
export const OT_REQUEST_HEADER = 'x-opentelemetry-outgoing-request';

/* eslint-disable @typescript-eslint/no-namespace */
export namespace opentelemetryProto {
  export namespace collector {
    export namespace trace.v1 {
      export interface TraceService {
        service: opentelemetryProto.collector.trace.v1.TraceService;
      }

      export interface ExportTraceServiceRequest {
        resourceSpans: opentelemetryProto.trace.v1.ResourceSpans[];
      }
    }
  }

  export namespace resource.v1 {
    export interface Resource {
      attributes: opentelemetryProto.common.v1.AttributeKeyValue[];
      droppedAttributesCount: number;
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

/**
 * Interface for handling error
 */
export interface CollectorExporterError {
  code?: number;
  message?: string;
  stack?: string;
}

/**
 * Interface for handling export service errors
 */
export interface ExportServiceError {
  code: number;
  details: string;
  metadata: { [key: string]: unknown };
  message: string;
  stack: string;
}

/**
 * Collector Exporter base config
 */
export interface CollectorExporterConfigBase {
  hostname?: string;
  logger?: Logger;
  serviceName?: string;
  attributes?: Attributes;
  url?: string;
}

/**
 * Collector Exporter Config for Web
 */
export interface CollectorExporterConfigBrowser
  extends CollectorExporterConfigBase {
  headers?: { [key: string]: string };
}

/**
 * Collector Exporter Config for Node
 */
export interface CollectorExporterConfigNode
  extends CollectorExporterConfigBase {
  credentials?: grpc.ChannelCredentials;
  metadata?: grpc.Metadata;
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
