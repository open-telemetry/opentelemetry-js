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
  Sampler,
  SpanContext,
  TraceFlags,
  SamplingDecision,
  SpanKind,
  Attributes,
  Link,
  SamplingResult,
} from '@opentelemetry/api';

/**
 * A composite sampler that either respects the parent span's sampling decision
 * or delegates to `delegateSampler` for root spans.
 */
export class ParentOrElseSampler implements Sampler {
  constructor(private _delegateSampler: Sampler) {}

  shouldSample(
    parentContext: SpanContext | undefined,
    traceId: string,
    spanName: string,
    spanKind: SpanKind,
    attributes: Attributes,
    links: Link[]
  ): SamplingResult {
    // Respect the parent sampling decision if there is one
    if (parentContext) {
      return {
        decision:
          (TraceFlags.SAMPLED & parentContext.traceFlags) === TraceFlags.SAMPLED
            ? SamplingDecision.RECORD_AND_SAMPLED
            : SamplingDecision.NOT_RECORD,
      };
    }
    return this._delegateSampler.shouldSample(
      parentContext,
      traceId,
      spanName,
      spanKind,
      attributes,
      links
    );
  }

  toString(): string {
    return `ParentOrElse{${this._delegateSampler.toString()}}`;
  }
}
