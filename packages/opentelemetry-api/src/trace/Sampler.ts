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

import { SpanContext } from './span_context';
import { SpanKind } from './span_kind';
import { Attributes } from './attributes';
import { Link } from './link';
import { SamplingResult } from './SamplingResult';

/**
 * This interface represent a sampler. Sampling is a mechanism to control the
 * noise and overhead introduced by OpenTelemetry by reducing the number of
 * samples of traces collected and sent to the backend.
 */
export interface Sampler {
  /**
   * Checks whether span needs to be created and tracked.
   *
   * @param parentContext Parent span context. Typically taken from the wire.
   *     Can be null.
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
    parentContext: SpanContext | undefined,
    traceId: string,
    spanName: string,
    spanKind: SpanKind,
    attributes: Attributes,
    links: Link[]
  ): SamplingResult;

  /** Returns the sampler name or short description with the configuration. */
  toString(): string;
}
