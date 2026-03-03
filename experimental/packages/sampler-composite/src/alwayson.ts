/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ComposableSampler, SamplingIntent } from './types';
import { MIN_THRESHOLD } from './util';

const intent: SamplingIntent = Object.freeze({
  threshold: MIN_THRESHOLD,
  thresholdReliable: true,
});

class ComposableAlwaysOnSampler implements ComposableSampler {
  getSamplingIntent(): SamplingIntent {
    return intent;
  }

  toString(): string {
    return 'ComposableAlwaysOnSampler';
  }
}

const _sampler = new ComposableAlwaysOnSampler();

/**
 * Returns a composable sampler that samples all span.
 */
export function createComposableAlwaysOnSampler(): ComposableSampler {
  return _sampler;
}
