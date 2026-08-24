/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Context, SpanKind, Attributes, Link } from '@opentelemetry/api';
import { diag, isSpanContextValid, trace } from '@opentelemetry/api';
import type { Sampler, SamplingResult } from '@opentelemetry/sdk-trace';

import { createCompositeSampler } from './composite';
import { createComposableProbabilitySampler } from './probability';
import { parseOtelTraceState } from './tracestate';
import { isValidRandomValue } from './util';

/**
 * The `random` flag from W3C Trace Context Level 2. When set, it confirms that
 * the rightmost 56 bits of the trace ID are truly random.
 *
 * This is deliberately not taken from the API's `TraceFlags` enum, which only
 * defines `SAMPLED` so far.
 *
 * https://www.w3.org/TR/trace-context-2/#random-trace-id-flag
 */
const TRACE_FLAG_RANDOM = 0x2;

const COMPATIBILITY_WARNING =
  'The ProbabilitySampler sampler is presuming TraceIDs are random and expects ' +
  'the Trace random flag to be set in confirmation. Please upgrade your ' +
  'caller(s) to use W3C Trace Context Level 2.';

class ProbabilitySampler implements Sampler {
  private readonly _delegate: Sampler;
  private readonly _description: string;
  /**
   * The spec asks for a warning, not for one warning per span. Sampling runs on
   * every span, so the warning is emitted at most once per sampler instance.
   */
  private _warned = false;

  constructor(ratio: number) {
    this._delegate = createCompositeSampler(
      createComposableProbabilitySampler(ratio)
    );
    this._description = `ProbabilitySampler{${ratio}}`;
  }

  shouldSample(
    context: Context,
    traceId: string,
    spanName: string,
    spanKind: SpanKind,
    attributes: Attributes,
    links: Link[]
  ): SamplingResult {
    this._warnOnPresumedRandomness(context);

    return this._delegate.shouldSample(
      context,
      traceId,
      spanName,
      spanKind,
      attributes,
      links
    );
  }

  toString(): string {
    return this._description;
  }

  /**
   * Warns when a decision is made for a non-root span using trace ID randomness
   * while the trace random flag is unset, as the trace ID may have come from an
   * SDK that predates the randomness requirement.
   *
   * https://opentelemetry.io/docs/specs/otel/trace/sdk/#compatibility-warnings-for-probabilitysampler
   */
  private _warnOnPresumedRandomness(context: Context): void {
    if (this._warned) {
      return;
    }

    const parentSpanContext = trace.getSpanContext(context);
    // A root span carries no risk: nothing upstream could have generated the
    // trace ID with an older SDK.
    if (!parentSpanContext || !isSpanContextValid(parentSpanContext)) {
      return;
    }

    // The flag confirms the trace ID is random, so there is nothing to presume.
    if ((parentSpanContext.traceFlags & TRACE_FLAG_RANDOM) !== 0) {
      return;
    }

    // An explicit `rv` means the decision does not rest on trace ID randomness.
    const { randomValue } = parseOtelTraceState(parentSpanContext.traceState);
    if (isValidRandomValue(randomValue)) {
      return;
    }

    this._warned = true;
    diag.warn(COMPATIBILITY_WARNING);
  }
}

/**
 * Returns a sampler that samples each span with a fixed ratio, consistently
 * across a trace, using the randomness features of
 * {@link https://www.w3.org/TR/trace-context-2/ | W3C Trace Context Level 2}.
 *
 * The parent `SampledFlag` is ignored; wrap this sampler in a `ParentBased`
 * sampler to respect it.
 *
 * This is the non-composable form of probability sampling, for direct use as an
 * SDK sampler. Use {@link createComposableProbabilitySampler} to compose it with
 * other samplers instead.
 *
 * @param ratio the fraction of traces to sample, between 0 and 1 inclusive.
 */
export function createProbabilitySampler(ratio: number): Sampler {
  return new ProbabilitySampler(ratio);
}
