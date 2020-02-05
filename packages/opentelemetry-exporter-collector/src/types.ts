/*!
 * Copyright 2019, OpenTelemetry Authors
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

import { SpanKind, Status } from '@opentelemetry/api';

// header to prevent instrumentation on request
export const OT_REQUEST_HEADER = 'x-opentelemetry-outgoing-request';

/**
 * {@link https://github.com/open-telemetry/opentelemetry-proto/blob/master/opentelemetry/proto/agent/common/v1/common.proto#L66}
 */
export const enum LibraryInfoLanguage {
  LANGUAGE_UNSPECIFIED = 0,
  NODE_JS = 6,
  WEB_JS = 10,
}

export interface AttributeMap {
  [key: string]: AttributeValue;
}

/**
 * A text annotation with a set of attributes.
 */
export interface Annotation {
  /**
   * A user-supplied message describing the event.
   */
  description?: TruncatableString;
  /**
   * A set of attributes on the annotation.
   */
  attributes?: Attributes;
}

/**
 * A set of attributes, each with a key and a value.
 */
export interface Attributes {
  /**
   * \"/instance_id\": \"my-instance\"     \"/http/user_agent\": \"\"
   * \"/http/server_latency\": 300     \"abc.com/myattribute\": true
   */
  attributeMap?: AttributeMap;
  /**
   * The number of attributes that were discarded. Attributes can be discarded
   * because their keys are too long or because there are too many attributes.
   * If this value is 0, then no attributes were dropped.
   */
  droppedAttributesCount?: number;
}

/**
 * The value of an Attribute.
 */
export interface AttributeValue {
  /**
   * A string up to 256 bytes long.
   */
  stringValue?: TruncatableString;
  /**
   * A 64-bit signed integer. May be sent to the API as either number or string
   * type (string is needed to accurately express some 64-bit ints).
   */
  intValue?: string | number;
  /**
   * A Boolean value represented by `true` or `false`.
   */
  boolValue?: boolean;
  /**
   * A double precision floating point value.
   */
  doubleValue?: number;
}

/**
 * Format for an HTTP/JSON request to a grpc-gateway for a trace span exporter.
 */
export interface ExportTraceServiceRequest {
  node?: Node;

  /** A list of Spans that belong to the last received Node. */
  spans?: Span[];

  /**
   * The resource for the spans in this message that do not have an explicit
   * resource set.
   * If unset, the most recently set resource in the RPC stream applies. It is
   * valid to never be set within a stream, e.g. when no resource info is known.
   */
  resource?: Resource;
}

/** Information on OpenTelemetry library that produced the spans/metrics. */
export interface LibraryInfo {
  /** Language of OpenTelemetry Library. */
  language?: LibraryInfoLanguage;

  /** Version of collector exporter of Library. */
  exporterVersion?: string;

  /** Version of OpenTelemetry Library. */
  coreLibraryVersion?: string;
}

/**
 * A pointer from the current span to another span in the same trace or in a
 * different trace. For example, this can be used in batching operations, where
 * a single batch handler processes multiple requests from different traces or
 * when the handler receives a request from a different project.
 */
export interface Link {
  /**
   * A unique identifier for a trace. All spans from the same trace share the
   * same `trace_id`. The ID is a 16-byte array.
   */
  traceId?: string;
  /**
   * A unique identifier for a span within a trace, assigned when the span is
   * created. The ID is an 8-byte array.
   */
  spanId?: string;
  /**
   * The relationship of the current span relative to the linked span.
   */
  type?: LinkType;
  /**
   * A set of attributes on the link.
   */
  attributes?: Attributes;
}

/**
 * A collection of links, which are references from this span to a span in the
 * same or different trace.
 */
export interface Links {
  /**
   * A collection of links.
   */
  link?: Link[];
  /**
   * The number of dropped links after the maximum size was enforced. If this
   * value is 0, then no links were dropped.
   */
  droppedLinksCount?: number;
}

/**
 * The relationship of the current span relative to the linked span: child,
 * parent, or unspecified.
 */
export const enum LinkType {
  /**
   * The relationship of the two spans is unknown, or known but other than
   * parent-child.
   */
  UNSPECIFIED,
  /** The linked span is a child of the current span. */
  CHILD_LINKED_SPAN,
  /** The linked span is a parent of the current span. */
  PARENT_LINKED_SPAN,
}

/**
 * An event describing a message sent/received between Spans.
 */
export interface MessageEvent {
  /**
   * The type of MessageEvent. Indicates whether the message was sent or
   * received.
   */
  type?: MessageEventType;
  /**
   * An identifier for the MessageEvent's message that can be used to match SENT
   * and RECEIVED MessageEvents. For example, this field could represent a
   * sequence ID for a streaming RPC. It is recommended to be unique within a
   * Span.
   */
  id?: string | number;
  /**
   * The number of uncompressed bytes sent or received.
   */
  uncompressedSize?: string | number;
  /**
   * The number of compressed bytes sent or received. If zero, assumed to be the
   * same size as uncompressed.
   */
  compressedSize?: string | number;
}

/** Indicates whether the message was sent or received. */
export const enum MessageEventType {
  /** Unknown message event type. */
  MESSAGE_EVENT_TYPE_UNSPECIFIED,
  /** Indicates a sent message. */
  MESSAGE_EVENT_TYPE_SENT,
  /** Indicates a received message. */
  MESSAGE_EVENT_TYPE_RECEIVED,
}

/**
 * A description of a binary module.
 */
export interface Module {
  /**
   * TODO: document the meaning of this field. For example: main binary, kernel
   * modules, and dynamic libraries such as libc.so, sharedlib.so.
   */
  module?: TruncatableString;
  /**
   * A unique identifier for the module, usually a hash of its contents.
   */
  buildId?: TruncatableString;
}

/**
 * Identifier metadata of the Node (Application instrumented with OpenTelemetry)
 * that connects to OpenTelemetry Agent.
 * In the future we plan to extend the identifier proto definition to support
 * additional information (e.g cloud id, etc.)
 */
export interface Node {
  /** Identifier that uniquely identifies a process within a VM/container. */
  identifier?: ProcessIdentifier;

  /** Information on the OpenTelemetry Library that initiates the stream. */
  libraryInfo?: LibraryInfo;

  /** Additional information on service. */
  serviceInfo?: ServiceInfo;

  /** Additional attributes. */
  attributes?: { [key: string]: unknown };
}

/**
 * Identifier that uniquely identifies a process within a VM/container.
 * For OpenTelemetry Web, this identifies the domain name of the site.
 */
export interface ProcessIdentifier {
  /**
   * The host name. Usually refers to the machine/container name.
   * For example: os.Hostname() in Go, socket.gethostname() in Python.
   * This will be the value of `window.location.host` for OpenTelemetry Web.
   */
  hostName?: string;

  /** Process id. Not used in OpenTelemetry Web. */
  pid?: number;

  /** Start time of this ProcessIdentifier. Represented in epoch time.. */
  startTimestamp?: string;
}

/** Resource information. */
export interface Resource {
  /** Type identifier for the resource. */
  type?: string;

  /** Set of labels that describe the resource. */
  labels?: { [key: string]: string };
}

/** Additional service information. */
export interface ServiceInfo {
  /** Name of the service. */
  name?: string;
}

/**
 * A span represents a single operation within a trace. Spans can be nested to
 * form a trace tree. Often, a trace contains a root span that describes the
 * end-to-end latency, and one or more subspans for its sub-operations. A trace
 * can also contain multiple root spans, or none at all. Spans do not need to be
 * contiguous - there may be gaps or overlaps between spans in a trace.  The
 * next id is 16.
 */
export interface Span {
  /**
   * A unique identifier for a trace. All spans from the same trace share the
   * same `trace_id`. The ID is a 16-byte array.  This field is required.
   */
  traceId: string;
  /**
   * A unique identifier for a span within a trace, assigned when the span is
   * created. The ID is an 8-byte array.  This field is required.
   */
  spanId: string;
  /**
   * The `tracestate` field conveys information about request position in
   * multiple distributed tracing graphs.  There can be a maximum of 32 members
   * in the map.  The key must begin with a lowercase letter, and can only
   * contain lowercase letters 'a'-'z', digits '0'-'9', underscores '_', dashes
   * '-', asterisks '*', and forward slashes '/'. For multi-tenant vendors
   * scenarios '@' sign can be used to prefix vendor name. The maximum length
   * for the key is 256 characters.  The value is opaque string up to 256
   * characters printable ASCII RFC0020 characters (i.e., the range 0x20 to
   * 0x7E) except ',' and '='. Note that this also excludes tabs, newlines,
   * carriage returns, etc.  See the https://github.com/w3c/distributed-tracing
   * for more details about this field.
   */
  tracestate?: TraceState;
  /**
   * The `span_id` of this span's parent span. If this is a root span, then this
   * field must be empty. The ID is an 8-byte array.
   */
  parentSpanId?: string;
  /**
   * A description of the span's operation.  For example, the name can be a
   * qualified method name or a file name and a line number where the operation
   * is called. A best practice is to use the same display name at the same call
   * point in an application. This makes it easier to correlate spans in
   * different traces.  This field is required.
   */
  name?: TruncatableString;
  /**
   * Distinguishes between spans generated in a particular context. For example,
   * two spans with the same name may be distinguished using `CLIENT` and
   * `SERVER` to identify queueing latency associated with the span.
   */
  kind?: SpanKind;
  /**
   * The start time of the span. On the client side, this is the time kept by
   * the local machine where the span execution starts. On the server side, this
   * is the time when the server's application handler starts running.
   * the format should be a timestamp for example '2019-11-15T18:59:36.489343982Z'
   */
  startTime?: string;
  /**
   * The end time of the span. On the client side, this is the time kept by the
   * local machine where the span execution ends. On the server side, this is
   * the time when the server application handler stops running.
   * the format should be a timestamp for example '2019-11-15T18:59:36.489343982Z'
   */
  endTime?: string;
  /**
   * A set of attributes on the span.
   */
  attributes?: Attributes;
  /**
   * A stack trace captured at the start of the span.
   * Currently not used
   */
  stackTrace?: StackTrace;
  /**
   * The included time events.
   */
  timeEvents?: TimeEvents;
  /**
   * An optional final status for this span.
   */
  status?: Status;
  /**
   * A highly recommended but not required flag that identifies when a trace
   * crosses a process boundary. True when the parent_span belongs to the same
   * process as the current span.
   */
  sameProcessAsParentSpan?: boolean;

  //@TODO - do we use it in opentelemetry or it is not needed?
  // /**
  //  * An optional number of child spans that were generated while this span was
  //  * active. If set, allows an implementation to detect missing child spans.
  //  */
  // childSpanCount?: number;
  /**
   * The included links.
   */
  links?: Links;
}

/**
 * A single stack frame in a stack trace.
 */
export interface StackFrame {
  /**
   * The fully-qualified name that uniquely identifies the function or method
   * that is active in this frame.
   */
  functionName?: TruncatableString;
  /**
   * An un-mangled function name, if `function_name` is
   * [mangled](http://www.avabodh.com/cxxin/namemangling.html). The name can be
   * fully qualified.
   */
  originalFunctionName?: TruncatableString;
  /**
   * The name of the source file where the function call appears.
   */
  fileName?: TruncatableString;
  /**
   * The line number in `file_name` where the function call appears.
   */
  lineNumber?: string;
  /**
   * The column number where the function call appears, if available. This is
   * important in JavaScript because of its anonymous functions.
   */
  columnNumber?: string;
  /**
   * The binary module from where the code was loaded.
   */
  loadModule?: Module;
  /**
   * The version of the deployed source code.
   */
  sourceVersion?: TruncatableString;
}

/**
 * A collection of stack frames, which can be truncated.
 */
export interface StackFrames {
  /**
   * Stack frames in this call stack.
   */
  frame?: StackFrame[];
  /**
   * The number of stack frames that were dropped because there were too many
   * stack frames. If this value is 0, then no stack frames were dropped.
   */
  droppedFramesCount?: number;
}

/**
 * The call stack which originated this span.
 */
export interface StackTrace {
  /**
   * Stack frames in this stack trace.
   */
  stackFrames?: StackFrames;
  /**
   * The hash ID is used to conserve network bandwidth for duplicate stack
   * traces within a single trace.  Often multiple spans will have identical
   * stack traces. The first occurrence of a stack trace should contain both
   * `stack_frames` and a value in `stack_trace_hash_id`.  Subsequent spans
   * within the same request can refer to that stack trace by setting only
   * `stack_trace_hash_id`.
   */
  stackTraceHashId?: string;
}

/**
 * A time-stamped annotation or message event in the Span.
 */
export interface TimeEvent {
  /**
   * The time the event occurred.
   */
  time?: string;
  /**
   * A text annotation with a set of attributes.
   */
  annotation?: Annotation;
  /**
   * An event describing a message sent/received between Spans.
   */
  messageEvent?: MessageEvent;
}

/**
 * A collection of `TimeEvent`s. A `TimeEvent` is a time-stamped annotation on
 * the span, consisting of either user-supplied key-value pairs, or details of a
 * message sent/received between Spans.
 */
export interface TimeEvents {
  /**
   * A collection of `TimeEvent`s.
   */
  timeEvent?: TimeEvent[];
  /**
   * The number of dropped annotations in all the included time events. If the
   * value is 0, then no annotations were dropped.
   */
  droppedAnnotationsCount?: number;
  /**
   * The number of dropped message events in all the included time events. If
   * the value is 0, then no message events were dropped.
   */
  droppedMessageEventsCount?: number;
}

/**
 * A string that might be shortened to a specified length.
 */
export interface TruncatableString {
  /**
   * The shortened string. For example, if the original string was 500 bytes
   * long and the limit of the string was 128 bytes, then this value contains
   * the first 128 bytes of the 500-byte string. Note that truncation always
   * happens on a character boundary, to ensure that a truncated string is still
   * valid UTF-8. Because it may contain multi-byte characters, the size of the
   * truncated string may be less than the truncation limit.
   */
  value?: string;
  /**
   * The number of bytes removed from the original string. If this value is 0,
   * then the string was not shortened.
   */
  truncatedByteCount?: number;
}

export interface TraceState {
  [key: string]: string;
}
