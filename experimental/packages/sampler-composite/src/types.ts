/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  Attributes,
  Context,
  Link,
  SpanKind,
  TraceState,
} from '@opentelemetry/api';

/** Information to make a sampling decision. */
export type SamplingIntent = {
  /** The sampling threshold value. A lower threshold increases the likelihood of sampling. */
  threshold: bigint;

  /** Whether the threshold can be reliably used for Span-to-Metrics estimation. */
  adjustedCountReliable: boolean;

  /** Any attributes to add to the span for the sampling result. */
  attributes?: Attributes;

  /** How to update the TraceState for the span. */
  updateTraceState?: (ts: TraceState | undefined) => TraceState | undefined;
};

/** A sampler that can be composed to make a final sampling decision. */
export interface ComposableSampler {
  /** Returns the information to make a sampling decision. */
  getSamplingIntent(
    context: Context,
    spanName: string,
    spanKind: SpanKind,
    attributes: Attributes,
    links: Link[]
  ): SamplingIntent;

  /** Returns the sampler name or short description with the configuration. */
  toString(): string;
}

export type SamplingPredicate = (
  ...args: Parameters<ComposableSampler['getSamplingIntent']>
) => boolean;
export type SamplingRule = [SamplingPredicate, ComposableSampler];
