/**
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

import { SpanContext } from './span_context';

/** This interface represent a sampler. */
export interface Sampler {
  /**
   * A string that uniquely describes the sampling behavior of this instance.
   */
  readonly description: string;

  /**
   * Checks whether span needs to be created and tracked.
   *
   * @param traceId the TraceId for the new Span. This will be identical to
   *     that in the parentContext, unless this is a root span.
   * @param spanId the SpanId for the new Span.
   * @param [name] the name of the new Span.
   * @param [parentContext] Parent span context. Typically taken from the wire.
   *     Can be null.
   * @returns whether span should be sampled or not.
   */
  shouldSample(
    traceId: string,
    spanId: string,
    name?: string,
    parentContext?: SpanContext
  ): boolean;
}
