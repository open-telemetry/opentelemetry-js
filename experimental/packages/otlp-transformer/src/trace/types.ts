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

import { Fixed64, IInstrumentationScope, IKeyValue } from '../common/types';
import { IResource } from '../resource/types';

/** Properties of an ExportTraceServiceRequest. */
export interface IExportTraceServiceRequest {
  /** ExportTraceServiceRequest resourceSpans */
  resourceSpans?: IResourceSpans[];
}

export interface IExportTraceServiceResponse {
  /** ExportTraceServiceResponse partialSuccess */
  partialSuccess?: IExportTracePartialSuccess;
}

export interface IExportTracePartialSuccess {
  /** ExportLogsServiceResponse rejectedLogRecords */
  rejectedSpans?: number;

  /** ExportLogsServiceResponse errorMessage */
  errorMessage?: string;
}

/** Properties of a ResourceSpans. */
export interface IResourceSpans {
  /** ResourceSpans resource */
  resource?: IResource;

  /** ResourceSpans scopeSpans */
  scopeSpans: IScopeSpans[];

  /** ResourceSpans schemaUrl */
  schemaUrl?: string;
}

/** Properties of an ScopeSpans. */
export interface IScopeSpans {
  /** IScopeSpans scope */
  scope?: IInstrumentationScope;

  /** IScopeSpans spans */
  spans?: ISpan[];

  /** IScopeSpans schemaUrl */
  schemaUrl?: string | null;
}

/** Properties of a Span. */
export interface ISpan {
  /** Span traceId */
  traceId: string | Uint8Array;

  /** Span spanId */
  spanId: string | Uint8Array;

  /** Span traceState */
  traceState?: string | null;

  /** Span parentSpanId */
  parentSpanId?: string | Uint8Array;

  /** Span name */
  name: string;

  /** Span kind */
  kind: ESpanKind;

  /** Span startTimeUnixNano */
  startTimeUnixNano: Fixed64;

  /** Span endTimeUnixNano */
  endTimeUnixNano: Fixed64;

  /** Span attributes */
  attributes: IKeyValue[];

  /** Span droppedAttributesCount */
  droppedAttributesCount: number;

  /** Span events */
  events: IEvent[];

  /** Span droppedEventsCount */
  droppedEventsCount: number;

  /** Span links */
  links: ILink[];

  /** Span droppedLinksCount */
  droppedLinksCount: number;

  /** Span status */
  status: IStatus;
}

/**
 * SpanKind is the type of span. Can be used to specify additional relationships between spans
 * in addition to a parent/child relationship.
 */
export enum ESpanKind {
  /** Unspecified. Do NOT use as default. Implementations MAY assume SpanKind to be INTERNAL when receiving UNSPECIFIED. */
  SPAN_KIND_UNSPECIFIED = 0,

  /** Indicates that the span represents an internal operation within an application,
   * as opposed to an operation happening at the boundaries. Default value.
   */
  SPAN_KIND_INTERNAL = 1,

  /** Indicates that the span covers server-side handling of an RPC or other
   * remote network request.
   */
  SPAN_KIND_SERVER = 2,

  /** Indicates that the span describes a request to some remote service.
   */
  SPAN_KIND_CLIENT = 3,

  /** Indicates that the span describes a producer sending a message to a broker.
   * Unlike CLIENT and SERVER, there is often no direct critical path latency relationship
   * between producer and consumer spans. A PRODUCER span ends when the message was accepted
   * by the broker while the logical processing of the message might span a much longer time.
   */
  SPAN_KIND_PRODUCER = 4,

  /** Indicates that the span describes consumer receiving a message from a broker.
   * Like the PRODUCER kind, there is often no direct critical path latency relationship
   * between producer and consumer spans.
   */
  SPAN_KIND_CONSUMER = 5,
}

/** Properties of a Status. */
export interface IStatus {
  /** Status message */
  message?: string;

  /** Status code */
  code: EStatusCode;
}

/** StatusCode enum. */
export const enum EStatusCode {
  /** The default status. */
  STATUS_CODE_UNSET = 0,
  /** The Span has been evaluated by an Application developers or Operator to have completed successfully. */
  STATUS_CODE_OK = 1,
  /** The Span contains an error. */
  STATUS_CODE_ERROR = 2,
}

/** Properties of an Event. */
export interface IEvent {
  /** Event timeUnixNano */
  timeUnixNano: Fixed64;

  /** Event name */
  name: string;

  /** Event attributes */
  attributes: IKeyValue[];

  /** Event droppedAttributesCount */
  droppedAttributesCount: number;
}

/** Properties of a Link. */
export interface ILink {
  /** Link traceId */
  traceId: string | Uint8Array;

  /** Link spanId */
  spanId: string | Uint8Array;

  /** Link traceState */
  traceState?: string;

  /** Link attributes */
  attributes: IKeyValue[];

  /** Link droppedAttributesCount */
  droppedAttributesCount: number;
}
