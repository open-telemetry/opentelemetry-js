/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { isValidTraceId } from '@opentelemetry/api';
import type { Sampler, SamplingResult } from '../Sampler';
import { SamplingDecision } from '../Sampler';

/** Sampler that samples a given fraction of traces based of trace id deterministically. */
export class TraceIdRatioBasedSampler implements Sampler {
  private readonly _ratio;
  private _upperBound: number;

  constructor(ratio = 0) {
    this._ratio = this._normalize(ratio);
    this._upperBound = Math.floor(this._ratio * 0xffffffff);
  }

  shouldSample(context: unknown, traceId: string): SamplingResult {
    return {
      decision:
        isValidTraceId(traceId) && this._accumulate(traceId) < this._upperBound
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

  private _accumulate(traceId: string): number {
    let accumulation = 0;
    for (let i = 0; i < 32; i += 8) {
      let part = 0;
      for (let j = 0; j < 8; j++) {
        const c = traceId.charCodeAt(i + j);
        // Convert hex char code to value: '0'-'9' -> 0-9, 'a'-'f' -> 10-15, 'A'-'F' -> 10-15
        const v = c < 58 ? c - 48 : c < 71 ? c - 55 : c - 87;
        part = (part << 4) | v;
      }
      accumulation = (accumulation ^ part) >>> 0;
    }
    return accumulation;
  }
}
