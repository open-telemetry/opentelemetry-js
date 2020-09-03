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
  SamplingResult,
} from '@opentelemetry/api';

/** Sampler that samples a given fraction of traces. */
export class ProbabilitySampler implements Sampler {
  constructor(private readonly _probability: number = 0) {
    this._probability = this._normalize(_probability);
  }

  shouldSample(parentContext?: SpanContext): SamplingResult {
    // Respect the parent sampling decision if there is one.
    // TODO(#1284): add an option to ignore parent regarding to spec.
    if (parentContext) {
      return {
        decision:
          (TraceFlags.SAMPLED & parentContext.traceFlags) === TraceFlags.SAMPLED
            ? SamplingDecision.RECORD_AND_SAMPLED
            : SamplingDecision.NOT_RECORD,
      };
    }
    return {
      decision:
        Math.random() < this._probability
          ? SamplingDecision.RECORD_AND_SAMPLED
          : SamplingDecision.NOT_RECORD,
    };
  }

  toString(): string {
    return `ProbabilitySampler{${this._probability}}`;
  }

  private _normalize(probability: number): number {
    if (typeof probability !== 'number' || isNaN(probability)) return 0;
    return probability >= 1 ? 1 : probability <= 0 ? 0 : probability;
  }
}
