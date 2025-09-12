/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
      this.intent = {
        threshold: threshold,
        thresholdReliable: true,
      };
    } else {
      // Same as AlwaysOff, notably the threshold is not considered reliable. The spec mentions
      // returning an instance of ComposableAlwaysOffSampler in this case but it seems clearer
      // if the description of the sampler matches the user's request.
      this.intent = {
        threshold: INVALID_THRESHOLD,
        thresholdReliable: false,
      };
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

function calculateThreshold(samplingProbability: number): bigint {
  return (
    MAX_THRESHOLD -
    BigInt(Math.round(samplingProbability * probabilityThresholdScale))
  );
}
