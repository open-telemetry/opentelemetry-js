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

import { Attributes, TraceState } from '@opentelemetry/api';
import { type Sampler } from '@opentelemetry/sdk-trace-base';

/** Information to make a sampling decision. */
export type SamplingIntent = {
  /** The sampling threshold value. A lower threshold increases the likelihood of sampling. */
  threshold: bigint;

  /** Whether the threshold can be reliably used for Span-to-Metrics estimation. */
  thresholdReliable: boolean;

  /** Any attributes to add to the span for the sampling result. */
  attributes?: Attributes;

  /** How to update the TraceState for the span. */
  updateTraceState?: (ts: TraceState | undefined) => TraceState | undefined;
};

/** A sampler that can be composed to make a final sampling decision. */
export interface ComposableSampler {
  /** Returns the information to make a sampling decision. */
  getSamplingIntent(
    ...args: Parameters<Sampler['shouldSample']>
  ): SamplingIntent;

  /** Returns the sampler name or short description with the configuration. */
  toString(): string;
}
