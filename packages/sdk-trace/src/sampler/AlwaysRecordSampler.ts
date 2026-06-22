/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Context, Link, Attributes, SpanKind } from '@opentelemetry/api';
import type { Sampler, SamplingResult } from '../Sampler';
import { SamplingDecision } from '../Sampler';

/**
 * Wraps a delegate sampler and upgrades NOT_RECORD decisions to RECORD,
 * ensuring all spans are recorded without affecting the sampling rate.
 */
export class AlwaysRecordSampler implements Sampler {
  private readonly _delegate: Sampler;

  constructor(options: {
    /** Sampler whose NOT_RECORD decisions are upgraded to RECORD */
    delegate: Sampler;
  }) {
    if (!options.delegate) {
      throw new Error('AlwaysRecordSampler requires a delegate sampler');
    }
    this._delegate = options.delegate;
  }

  shouldSample(
    context: Context,
    traceId: string,
    spanName: string,
    spanKind: SpanKind,
    attributes: Attributes,
    links: Link[]
  ): SamplingResult {
    const result = this._delegate.shouldSample(
      context,
      traceId,
      spanName,
      spanKind,
      attributes,
      links
    );
    if (result.decision === SamplingDecision.NOT_RECORD) {
      return {
        decision: SamplingDecision.RECORD,
        attributes: result.attributes,
        traceState: result.traceState,
      };
    }
    return result;
  }

  toString(): string {
    return `AlwaysRecordSampler{${this._delegate.toString()}}`;
  }
}
