/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Attributes,
  Context,
  isSpanContextValid,
  Link,
  SpanKind,
  TraceFlags,
  trace,
} from '@opentelemetry/api';
import { ComposableSampler, SamplingIntent } from './types';
import { parseOtelTraceState } from './tracestate';
import { INVALID_THRESHOLD, isValidThreshold, MIN_THRESHOLD } from './util';

class ComposableParentThresholdSampler implements ComposableSampler {
  private readonly description: string;
  private readonly rootSampler: ComposableSampler;

  constructor(rootSampler: ComposableSampler) {
    this.rootSampler = rootSampler;
    this.description = `ComposableParentThresholdSampler(rootSampler=${rootSampler})`;
  }

  getSamplingIntent(
    context: Context,
    traceId: string,
    spanName: string,
    spanKind: SpanKind,
    attributes: Attributes,
    links: Link[]
  ): SamplingIntent {
    const parentSpanContext = trace.getSpanContext(context);
    if (!parentSpanContext || !isSpanContextValid(parentSpanContext)) {
      return this.rootSampler.getSamplingIntent(
        context,
        traceId,
        spanName,
        spanKind,
        attributes,
        links
      );
    }

    const otTraceState = parseOtelTraceState(parentSpanContext.traceState);

    if (isValidThreshold(otTraceState.threshold)) {
      return {
        threshold: otTraceState.threshold,
        thresholdReliable: true,
      };
    }

    const threshold =
      parentSpanContext.traceFlags & TraceFlags.SAMPLED
        ? MIN_THRESHOLD
        : INVALID_THRESHOLD;
    return {
      threshold,
      thresholdReliable: false,
    };
  }

  toString(): string {
    return this.description;
  }
}

/**
 * Returns a composable sampler that respects the sampling decision of the
 * parent span or falls back to the given sampler if it is a root span.
 */
export function createComposableParentThresholdSampler(
  rootSampler: ComposableSampler
): ComposableSampler {
  return new ComposableParentThresholdSampler(rootSampler);
}
