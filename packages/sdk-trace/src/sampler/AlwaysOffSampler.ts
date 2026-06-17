/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Sampler, SamplingResult } from '../Sampler';
import { SamplingDecision } from '../Sampler';

/** Sampler that samples no traces. */
export class AlwaysOffSampler implements Sampler {
  shouldSample(): SamplingResult {
    return {
      decision: SamplingDecision.NOT_RECORD,
    };
  }

  toString(): string {
    return 'AlwaysOffSampler';
  }
}
