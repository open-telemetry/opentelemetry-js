/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sampler, SamplingDecision, SamplingResult } from '../Sampler';

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
