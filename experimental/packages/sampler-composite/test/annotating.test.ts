/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';

import { context, SpanKind } from '@opentelemetry/api';

import {
  createComposableAlwaysOnSampler,
  createComposableAnnotatingSampler,
} from '../src';

describe('ComposableAnnotatingSampler', () => {
  const alwaysOnSampler = createComposableAlwaysOnSampler();

  it('should have a description', () => {
    const sampler = createComposableAnnotatingSampler(alwaysOnSampler, {});
    assert.strictEqual(
      sampler.toString(),
      'ComposableAnnotatingSampler(ComposableAlwaysOnSampler, attributes)'
    );
  });

  it('should add attributes to SamplingIntent', () => {
    const delegateIntent = alwaysOnSampler.getSamplingIntent(
      context.active(),
      'unused',
      'span-name',
      SpanKind.SERVER,
      {},
      []
    );
    const sampler = createComposableAnnotatingSampler(alwaysOnSampler, {
      foo: 'bar',
    });
    const intent = sampler.getSamplingIntent(
      context.active(),
      'unused',
      'span-name',
      SpanKind.SERVER,
      {},
      []
    );
    assert.strictEqual(intent.threshold, delegateIntent.threshold);
    assert.strictEqual(
      intent.thresholdReliable,
      delegateIntent.thresholdReliable
    );
    assert.deepStrictEqual(intent.attributes, { foo: 'bar' });
  });

  it('should merge attributes', () => {
    const sampler = createComposableAnnotatingSampler(
      createComposableAnnotatingSampler(alwaysOnSampler, {
        foo: 'baz',
        wuz: 'here',
      }),
      { foo: 'bar', spam: 'eggs' }
    );
    const intent = sampler.getSamplingIntent(
      context.active(),
      'unused',
      'span-name',
      SpanKind.SERVER,
      {},
      []
    );
    assert.deepStrictEqual(intent.attributes, {
      foo: 'bar', // outer annotating sampler wins
      spam: 'eggs',
      wuz: 'here',
    });
  });
});
