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

import {
  Context,
  Link,
  Attributes,
  SpanKind,
  TraceState,
} from '@opentelemetry/api';

/**
 * A sampling decision that determines how a {@link Span} will be recorded
 * and collected.
 */
export enum SamplingDecision {
  /**
   * `Span.isRecording() === false`, span will not be recorded and all events
   * and attributes will be dropped.
   */
  NOT_RECORD,
  /**
   * `Span.isRecording() === true`, but `Sampled` flag in {@link TraceFlags}
   * MUST NOT be set.
   */
  RECORD,
  /**
   * `Span.isRecording() === true` AND `Sampled` flag in {@link TraceFlags}
   * MUST be set.
   */
  RECORD_AND_SAMPLED,
}

/**
 * A sampling result contains a decision for a {@link Span} and additional
 * attributes the sampler would like to added to the Span.
 */
export interface SamplingResult {
  /**
   * A sampling decision, refer to {@link SamplingDecision} for details.
   */
  decision: SamplingDecision;
  /**
   * The list of attributes returned by SamplingResult MUST be immutable.
   * Caller may call {@link Sampler}.shouldSample any number of times and
   * can safely cache the returned value.
   */
  attributes?: Readonly<Attributes>;
  /**
   * A {@link TraceState} that will be associated with the {@link Span} through
   * the new {@link SpanContext}. Samplers SHOULD return the TraceState from
   * the passed-in {@link Context} if they do not intend to change it. Leaving
   * the value undefined will also leave the TraceState unchanged.
   */
  traceState?: TraceState;
}

/**
 * This interface represent a sampler. Sampling is a mechanism to control the
 * noise and overhead introduced by OpenTelemetry by reducing the number of
 * samples of traces collected and sent to the backend.
 */
export interface Sampler {
  /**
   * Checks whether span needs to be created and tracked.
   *
   * @param context Parent Context which may contain a span.
   * @param traceId of the span to be created. It can be different from the
   *     traceId in the {@link SpanContext}. Typically in situations when the
   *     span to be created starts a new trace.
   * @param spanName of the span to be created.
   * @param spanKind of the span to be created.
   * @param attributes Initial set of Attributes for the Span being constructed.
   * @param links Collection of links that will be associated with the Span to
   *     be created. Typically useful for batch operations.
   * @returns a {@link SamplingResult}.
   */
  shouldSample(
    context: Context,
    traceId: string,
    spanName: string,
    spanKind: SpanKind,
    attributes: Attributes,
    links: Link[]
  ): SamplingResult;

  /** Returns the sampler name or short description with the configuration. */
  toString(): string;
}
