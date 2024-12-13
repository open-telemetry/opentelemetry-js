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
import { Type, type Static } from "@sinclair/typebox";
import { TResource } from '../resource/types';

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

/** StatusCode enum. */
export enum EStatusCode {
  /** The default status. */
  STATUS_CODE_UNSET = 0,
  /** The Span has been evaluated by an Application developers or Operator to have completed successfully. */
  STATUS_CODE_OK = 1,
  /** The Span contains an error. */
  STATUS_CODE_ERROR = 2,
}

export const OtelTraceTypes = Type.Module({
  IExportTraceServiceRequest: Type.Object({
    resourceSpans: Type.Optional(Type.Array(Type.Ref("IResourceSpans"))),
  }),
  IResourceSpans: Type.Object({
    resource: Type.Optional(TResource),
    scopeSpans: Type.Array(Type.Ref("IScopeSpans")),
    schemaUrl: Type.Optional(Type.String()),
  }),
  IScopeSpans: Type.Object({
    scope: Type.Optional(TInstrumentationScope),
    spans: Type.Optional(Type.Array(Type.Ref("ISpan"))),
    schemaUrl: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  }),
  ISpan: Type.Object({
    traceId: Type.Union([Type.String(), Type.Uint8Array()]),
    spanId: Type.Union([Type.String(), Type.Uint8Array()]),
    traceState: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    parentSpanId: Type.Optional(Type.Union([Type.String(), Type.Uint8Array()])),
    name: Type.String(),
    kind: Type.Enum(ESpanKind),
    startTimeUnixNano: TFixed64,
    endTimeUnixNano: TFixed64,
    attributes: Type.Array(TKeyValue),
    droppedAttributesCount: Type.Number(),
    events: Type.Array(Type.Ref("IEvent")),
    droppedEventsCount: Type.Number(),
    links: Type.Array(Type.Ref("ILink")),
    droppedLinksCount: Type.Number(),
    status: Type.Ref("IStatus"),
  }),
  IStatus: Type.Object({
    message: Type.Optional(Type.String()),
    code: Type.Enum(EStatusCode),
  }),
  IEvent: Type.Object({
    timeUnixNano: TFixed64,
    name: Type.String(),
    attributes: Type.Array(TKeyValue),
    droppedAttributesCount: Type.Number(),
  }),
  ILink: Type.Object({
    traceId: Type.Union([Type.String(), Type.Uint8Array()]),
    spanId: Type.Union([Type.String(), Type.Uint8Array()]),
    traceState: Type.Optional(Type.String()),
    attributes: Type.Array(TKeyValue),
    droppedAttributesCount: Type.Number(),
  }),
});

export const TExportTraceServiceRequest = OtelTraceTypes.Import("IExportTraceServiceRequest");
export type IExportTraceServiceRequest = Static<typeof TExportTraceServiceRequest>;

export const TResourceSpans = OtelTraceTypes.Import("IResourceSpans");
export type IResourceSpans = Static<typeof TResourceSpans>;

export const TScopeSpans = OtelTraceTypes.Import("IScopeSpans");
export type IScopeSpans = Static<typeof TScopeSpans>;

export const TSpan = OtelTraceTypes.Import("ISpan");
export type ISpan = Static<typeof TSpan>;

export const TStatus = OtelTraceTypes.Import("IStatus");
export type IStatus = Static<typeof TStatus>;

export const TEvent = OtelTraceTypes.Import("IEvent");
export type IEvent = Static<typeof TEvent>;

export const TLink = OtelTraceTypes.Import("ILink");
export type ILink = Static<typeof TLink>;
