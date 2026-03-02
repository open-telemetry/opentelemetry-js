/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';

import { context, SpanKind } from '@opentelemetry/api';
import { SamplingDecision } from '@opentelemetry/sdk-trace-base';

import {
  createCompositeSampler,
  createComposableAlwaysOffSampler,
} from '../src';
import { traceIdGenerator } from './util';

describe('ComposableAlwaysOffSampler', () => {
  const composableSampler = createComposableAlwaysOffSampler();

  it('should have a description', () => {
    assert.strictEqual(
      composableSampler.toString(),
      'ComposableAlwaysOffSampler'
    );
  });

  it('should have a constant threshold', () => {
    assert.strictEqual(
      composableSampler.getSamplingIntent(
        context.active(),
        'unused',
        'span',
        SpanKind.SERVER,
        {},
        []
      ).threshold,
      -1n
    );
  });

  it('should never sample', () => {
    const sampler = createCompositeSampler(composableSampler);
    const generator = traceIdGenerator();
    let numSampled = 0;
    for (let i = 0; i < 10000; i++) {
      const result = sampler.shouldSample(
        context.active(),
        generator(),
        'span',
        SpanKind.SERVER,
        {},
        []
      );
      if (result.decision === SamplingDecision.RECORD_AND_SAMPLED) {
        numSampled++;
      }
      assert.strictEqual(result.traceState, undefined);
    }
    assert.strictEqual(numSampled, 0);
  });
});
