/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ComposableSampler, SamplingIntent } from './types';
import { INVALID_THRESHOLD } from './util';

const intent: SamplingIntent = Object.freeze({
  threshold: INVALID_THRESHOLD,
  thresholdReliable: false,
});

class ComposableAlwaysOffSampler implements ComposableSampler {
  getSamplingIntent(): SamplingIntent {
    return intent;
  }

  toString(): string {
    return 'ComposableAlwaysOffSampler';
  }
}

const _sampler = new ComposableAlwaysOffSampler();

/**
 * Returns a composable sampler that does not sample any span.
 */
export function createComposableAlwaysOffSampler(): ComposableSampler {
  return _sampler;
}
