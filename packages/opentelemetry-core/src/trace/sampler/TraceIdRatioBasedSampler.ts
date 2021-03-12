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

const SAMPLE_HEX_LEN = 8;

/** Sampler that samples a given fraction of traces based of trace id deterministically. */
export class TraceIdRatioBasedSampler implements Sampler {
  private _upperBound: number;

  constructor(private readonly _ratio: number = 0) {
    this._ratio = this._normalize(_ratio);
    this._upperBound = Math.floor(this._ratio * 16 ** SAMPLE_HEX_LEN);
  }

  shouldSample(context: unknown, traceId: string): SamplingResult {
    const value = parseInt(traceId.slice(0, SAMPLE_HEX_LEN), 16);
    return {
      decision:
        value < this._upperBound
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
