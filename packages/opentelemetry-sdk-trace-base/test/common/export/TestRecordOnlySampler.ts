/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Sampler, SamplingResult } from '@opentelemetry/sdk-trace';
import { SamplingDecision } from '@opentelemetry/sdk-trace';

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
