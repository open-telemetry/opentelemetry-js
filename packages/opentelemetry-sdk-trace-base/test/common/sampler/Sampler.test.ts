/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { context, SpanKind } from '@opentelemetry/api';
import {
  AlwaysOffSampler,
  AlwaysOnSampler,
  ParentBasedSampler,
  Sampler,
  SamplingDecision,
  SamplingResult,
  TraceIdRatioBasedSampler,
} from '../../../src';
import { assertAssignable } from '../util';

describe('Sampler', () => {
  const samplers = [
    new AlwaysOffSampler(),
    new AlwaysOnSampler(),
    new ParentBasedSampler({ root: new AlwaysOffSampler() }),
    new TraceIdRatioBasedSampler(),
  ] as const;

  it('Samplers defined in @opentelemetry/core should fit the interface', () => {
    for (const sampler of samplers) {
      assertAssignable<Sampler>(sampler);
    }
  });

  it('Sampler return values should fit SamplerResult', () => {
    function assertResult<T extends Sampler>(sampler: T) {
      const result = sampler.shouldSample(
        context.active(),
        'trace-id',
        'span-name',
        SpanKind.INTERNAL,
        {},
        []
      );
      assertAssignable<SamplingResult>(result);
      assertAssignable<SamplingDecision>(result.decision);
    }

    for (const sampler of samplers) {
      assertResult<Sampler>(sampler);
    }
  });
});
