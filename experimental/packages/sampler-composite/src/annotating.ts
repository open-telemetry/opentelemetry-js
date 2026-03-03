/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import { Attributes, Context, Link, SpanKind } from '@opentelemetry/api';
import type { ComposableSampler, SamplingIntent } from './types';

class ComposableAnnotatingSampler implements ComposableSampler {
  private readonly delegate: ComposableSampler;
  private readonly attributes: Attributes;
  private readonly description: string;

  constructor(delegate: ComposableSampler, attributes: Attributes) {
    // Shallow copy `attributes` to avoid changes to the original object (at
    // least top-level fields) impacting the sampler. Freeze the object so
    // we can return it in `getSamplingIntent` without copying there.
    this.attributes = Object.freeze({ ...attributes });
    this.delegate = delegate;
    this.description = `ComposableAnnotatingSampler(${delegate}, attributes)`;
  }

  getSamplingIntent(
    context: Context,
    traceId: string,
    spanName: string,
    spanKind: SpanKind,
    attributes: Attributes,
    links: Link[]
  ): SamplingIntent {
    const intent = this.delegate.getSamplingIntent(
      context,
      traceId,
      spanName,
      spanKind,
      attributes,
      links
    );
    return {
      threshold: intent.threshold,
      thresholdReliable: intent.thresholdReliable,
      attributes: intent.attributes
        ? { ...intent.attributes, ...this.attributes }
        : this.attributes,
      updateTraceState: intent.updateTraceState,
    };
  }

  toString(): string {
    return this.description;
  }
}

export function createComposableAnnotatingSampler(
  delegate: ComposableSampler,
  attributes: Attributes
): ComposableSampler {
  return new ComposableAnnotatingSampler(delegate, attributes);
}
