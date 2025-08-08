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

import { ConsistentSampler } from './sampler';
import { SamplingIntent } from './types';
import { INVALID_THRESHOLD, MAX_THRESHOLD } from './util';
import { serializeTh } from './tracestate';

export class ConsistentFixedThresholdSampler extends ConsistentSampler {
  private readonly intent: SamplingIntent;
  private readonly description: string;

  constructor(samplingProbability: number) {
    super();
    if (samplingProbability < 0 || samplingProbability > 1) {
      throw new Error(
        `Invalid sampling probability: ${samplingProbability}. Must be between 0 and 1.`
      );
    }
    const threshold = calculateThreshold(samplingProbability);
    const thresholdStr =
      threshold === MAX_THRESHOLD ? 'max' : serializeTh(threshold);
    this.intent = {
      threshold: threshold === MAX_THRESHOLD ? INVALID_THRESHOLD : threshold,
    };
    this.description = `ConsistentFixedThresholdSampler(threshold=${thresholdStr}, sampling probability=${samplingProbability})`;
  }

  override getSamplingIntent(): SamplingIntent {
    return this.intent;
  }

  override toString(): string {
    return this.description;
  }
}

const probabilityThresholdScale = Math.pow(2, 56);

function calculateThreshold(samplingProbability: number): bigint {
  return (
    MAX_THRESHOLD -
    BigInt(Math.round(samplingProbability * probabilityThresholdScale))
  );
}
