/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ComposableSampler, SamplingIntent } from './types';
import { INVALID_THRESHOLD, MAX_THRESHOLD } from './util';
import { serializeTh } from './tracestate';

class ComposableTraceIDRatioBasedSampler implements ComposableSampler {
  private readonly intent: SamplingIntent;
  private readonly description: string;

  constructor(ratio: number) {
    if (ratio < 0 || ratio > 1) {
      throw new Error(
        `Invalid sampling probability: ${ratio}. Must be between 0 and 1.`
      );
    }
    const threshold = calculateThreshold(ratio);
    const thresholdStr =
      threshold === MAX_THRESHOLD ? 'max' : serializeTh(threshold);
    if (threshold !== MAX_THRESHOLD) {
      this.intent = Object.freeze({
        threshold: threshold,
        thresholdReliable: true,
      });
    } else {
      // Same as AlwaysOff, notably the threshold is not considered reliable. The spec mentions
      // returning an instance of ComposableAlwaysOffSampler in this case but it seems clearer
      // if the description of the sampler matches the user's request.
      this.intent = Object.freeze({
        threshold: INVALID_THRESHOLD,
        thresholdReliable: false,
      });
    }
    this.description = `ComposableTraceIDRatioBasedSampler(threshold=${thresholdStr}, ratio=${ratio})`;
  }

  getSamplingIntent(): SamplingIntent {
    return this.intent;
  }

  toString(): string {
    return this.description;
  }
}

/**
 * Returns a composable sampler that samples each span with a fixed ratio.
 */
export function createComposableTraceIDRatioBasedSampler(
  ratio: number
): ComposableSampler {
  return new ComposableTraceIDRatioBasedSampler(ratio);
}

const probabilityThresholdScale = Math.pow(2, 56);

// TODO: Reduce threshold precision following spec recommendation of 4
// to reduce size of serialized tracestate.
function calculateThreshold(samplingProbability: number): bigint {
  return (
    MAX_THRESHOLD -
    BigInt(Math.round(samplingProbability * probabilityThresholdScale))
  );
}
