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

import { Compute, JWT, OAuth2Client } from 'google-auth-library';

export interface Span {
  name?: string;
  spanId?: string;
  parentSpanId?: string;
  displayName?: TruncatableString;
  startTime?: string;
  endTime?: string;
  attributes?: Attributes;
  // This property is currently unused. keeping it here as it is part
  // of the stack driver trace types and may be used in the future
  stackTrace?: StackTrace;
  timeEvents?: TimeEvents;
  links?: Links;
  status?: Status;
  sameProcessAsParentSpan?: boolean;
  childSpanCount?: number;
}

export interface AttributeMap {
  [key: string]: AttributeValue;
}

export interface Attributes {
  attributeMap?: AttributeMap;
  droppedAttributesCount?: number;
}

export interface AttributeValue {
  boolValue?: boolean;
  intValue?: string;
  stringValue?: TruncatableString;
}

export interface TruncatableString {
  value?: string;
  truncatedByteCount?: number;
}

export interface Links {
  droppedLinksCount?: number;
  link?: Link[];
}

export interface Link {
  attributes?: Attributes;
  spanId?: string;
  traceId?: string;
  type?: LinkType;
}

export interface StackTrace {
  stackFrames?: StackFrames;
  stackTraceHashId?: string;
}

export interface StackFrames {
  droppedFramesCount?: number;
  frame?: StackFrame[];
}

export interface StackFrame {
  columnNumber?: string;
  fileName?: TruncatableString;
  functionName?: TruncatableString;
  lineNumber?: string;
  loadModule?: Module;
  originalFunctionName?: TruncatableString;
  sourceVersion?: TruncatableString;
}

export interface Module {
  buildId?: TruncatableString;
  module?: TruncatableString;
}

export interface Status {
  /** gRPC status code */
  code?: number;
  message?: string;
}

export interface TimeEvents {
  droppedAnnotationsCount?: number;
  droppedMessageEventsCount?: number;
  timeEvent?: TimeEvent[];
}

export interface TimeEvent {
  annotation?: Annotation;
  time?: string;
  // This property is currently unused. keeping it here as it is part
  // of the stack driver trace types and may be used in the future
  messageEvent?: MessageEvent;
}

export interface Annotation {
  attributes?: Attributes;
  description?: TruncatableString;
}

export interface MessageEvent {
  id?: string;
  type?: Type;
  compressedSizeBytes?: string;
  uncompressedSizeBytes?: string;
}

export enum Type {
  TYPE_UNSPECIFIED = 0,
  SENT = 1,
  RECEIVED = 2,
}

export enum LinkType {
  UNSPECIFIED = 0,
  CHILD_LINKED_SPAN = 1,
  PARENT_LINKED_SPAN = 2,
}

export interface SpansWithCredentials {
  name: string;
  resource: { spans: {} };
  auth: JWT | OAuth2Client | Compute;
}
