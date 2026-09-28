/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Sampler, SamplingResult } from '../Sampler';
import { SamplingDecision } from '../Sampler';

/** Sampler that samples all traces. */
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
