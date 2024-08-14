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

import { SpanAttributes } from './attributes';
import { TraceState } from './trace_state';

/**
 * @deprecated use the one declared in @opentelemetry/sdk-trace-base instead.
 * A sampling decision that determines how a {@link Span} will be recorded
 * and collected.
 *
 * @since 1.0.0
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
 * @deprecated use the one declared in @opentelemetry/sdk-trace-base instead.
 * A sampling result contains a decision for a {@link Span} and additional
 * attributes the sampler would like to added to the Span.
 *
 * @since 1.0.0
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
  attributes?: Readonly<SpanAttributes>;
  /**
   * A {@link TraceState} that will be associated with the {@link Span} through
   * the new {@link SpanContext}. Samplers SHOULD return the TraceState from
   * the passed-in {@link Context} if they do not intend to change it. Leaving
   * the value undefined will also leave the TraceState unchanged.
   */
  traceState?: TraceState;
}
