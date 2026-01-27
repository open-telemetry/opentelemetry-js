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
