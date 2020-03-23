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

import * as api from '@opentelemetry/api';

export namespace opentelemetry.proto {
  export namespace collector {
    export namespace trace.v1 {
      export interface TraceService {
        service: opentelemetry.proto.collector.trace.v1.TraceService;
      }

      export interface ExportTraceServiceRequest {
        resourceSpans: opentelemetry.proto.trace.v1.ResourceSpans[];
      }

      export interface ExportTraceServiceResponse {}

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
      attributes: opentelemetry.proto.common.v1.AttributeKeyValue[];
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
        attributes?: opentelemetry.proto.common.v1.AttributeKeyValue[];
        droppedAttributesCount: number;
      }

      export interface Link {
        traceId: Uint8Array;
        spanId: Uint8Array;
        traceState?: TraceState;
        attributes?: opentelemetry.proto.common.v1.AttributeKeyValue[];
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
      decision?: opentelemetry.proto.trace.v1.ConstantSampler.ConstantDecision;
    }

    export interface InstrumentationLibrarySpans {
      instrumentationLibrary: opentelemetry.proto.common.v1.InstrumentationLibrary | null;
      spans: opentelemetry.proto.trace.v1.Span[];
    }

    export interface ProbabilitySampler {
      samplingProbability?: number | null;
    }

    export interface RateLimitingSampler {
      qps?: number | null;
    }

    export interface ResourceSpans {
      resource?: opentelemetry.proto.resource.v1.Resource;
      instrumentationLibrarySpans: opentelemetry.proto.trace.v1.InstrumentationLibrarySpans[];
    }

    export interface Span {
      traceId: Uint8Array;
      spanId: Uint8Array;
      traceState: opentelemetry.proto.trace.v1.Span.TraceState;
      parentSpanId?: Uint8Array;
      name?: opentelemetry.proto.trace.v1.TruncatableString;
      kind?: opentelemetry.proto.trace.v1.Span.SpanKind;
      startTimeUnixNano?: number;
      endTimeUnixNano?: number;
      attributes?: opentelemetry.proto.common.v1.AttributeKeyValue[];
      droppedAttributesCount: number;
      events?: opentelemetry.proto.trace.v1.Span.Event[];
      droppedEventsCount: number;
      links?: opentelemetry.proto.trace.v1.Span.Link[];
      droppedLinksCount: number;
      status?: Status;
    }

    export interface Status extends api.Status {}

    export interface TraceConfig {
      constantSampler?: ConstantSampler | null;
      probabilitySampler?: ProbabilitySampler | null;
      rateLimitingSampler?: RateLimitingSampler | null;
    }

    export interface TruncatableString {
      value?: string | null;
      truncatedByteCount?: number | null;
    }
  }
  export namespace common.v1 {
    export interface AttributeKeyValue {
      key: string;
      type: opentelemetry.proto.common.v1.ValueType;
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
