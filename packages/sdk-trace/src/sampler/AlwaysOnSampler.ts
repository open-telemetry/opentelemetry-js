/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Sampler, SamplingResult } from '../Sampler';
import { SamplingDecision } from '../Sampler';

/**
 * Creates a sampler that samples all traces.
 */
export function createAlwaysOnSampler(): Sampler {
  return new AlwaysOnSampler();
}

/**
 * Sampler that samples all traces.
 *
 * @deprecated Use {@link createAlwaysOnSampler} instead.
 */
export class AlwaysOnSampler implements Sampler {
  shouldSample(): SamplingResult {
    return {
      decision: SamplingDecision.RECORD_AND_SAMPLED,
    };
  }

  toString(): string {
    return 'AlwaysOnSampler';
  }
}
