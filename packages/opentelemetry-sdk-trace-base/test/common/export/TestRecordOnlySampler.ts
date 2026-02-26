/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sampler, SamplingDecision, SamplingResult } from '../../../src';

/** Sampler that always records but doesn't sample spans. */
export class TestRecordOnlySampler implements Sampler {
  shouldSample(): SamplingResult {
    return {
      decision: SamplingDecision.RECORD,
    };
  }

  toString(): string {
    return 'TestRecordOnlySampler';
  }
}
