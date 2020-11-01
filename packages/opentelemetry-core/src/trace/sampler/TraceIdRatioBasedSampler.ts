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

import { Sampler, SamplingDecision, SamplingResult } from '@opentelemetry/api';

/** Sampler that samples a given fraction of traces based of trace id deterministically. */
export class TraceIdRatioBasedSampler implements Sampler {
  constructor(private readonly _ratio: number = 0) {
    this._ratio = this._normalize(_ratio);
  }

  shouldSample(context: unknown, traceId: string): SamplingResult {
    let accumulation = 0;
    for (let idx = 0; idx < traceId.length; idx++) {
      accumulation += traceId.charCodeAt(idx);
    }
    const cmp = (accumulation % 100) / 100;
    return {
      decision:
        cmp < this._ratio
          ? SamplingDecision.RECORD_AND_SAMPLED
          : SamplingDecision.NOT_RECORD,
    };
  }

  toString(): string {
    return `TraceIdRatioBased{${this._ratio}}`;
  }

  private _normalize(ratio: number): number {
    if (typeof ratio !== 'number' || isNaN(ratio)) return 0;
    return ratio >= 1 ? 1 : ratio <= 0 ? 0 : ratio;
  }
}
