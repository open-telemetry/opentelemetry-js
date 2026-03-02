/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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

export type SamplingPredicate = (
  ...args: Parameters<Sampler['shouldSample']>
) => boolean;
export type SamplingRule = [SamplingPredicate, ComposableSampler];
