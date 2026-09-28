/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';

import type { Attributes, Context } from '@opentelemetry/api';
import { context, SpanKind } from '@opentelemetry/api';

import {
  createComposableAlwaysOffSampler,
  createComposableAlwaysOnSampler,
  createComposableAnnotatingSampler,
  createComposableRuleBasedSampler,
} from '../src';
import type { SamplingPredicate } from '../src/types';
import { INVALID_THRESHOLD } from '../src/util';

describe('ComposableRuleBasedSampler', () => {
  // Building a test sampler something like the example given in the spec:
  // https://opentelemetry.io/docs/specs/otel/trace/sdk/#composablerulebased
  const alwaysOn = createComposableAlwaysOnSampler();
  const alwaysOff = createComposableAlwaysOffSampler();
  const isHealthCheck: SamplingPredicate = (
    _context,
    _traceId,
    _spanName,
    _spanKind,
    attributes: Attributes,
    _links
  ) => {
    return attributes['http.route'] === '/healthcheck';
  };
  function isCheckout(
    _context: Context,
    _traceId: string,
    _spanName: string,
    _spanKind: SpanKind,
    attributes: Attributes
  ) {
    return attributes['http.route'] === '/checkout';
  }
  const sampler = createComposableRuleBasedSampler([
    [isHealthCheck, alwaysOff],
    [
      isCheckout,
      createComposableAnnotatingSampler(alwaysOn, { is: 'checkout' }),
    ],
    [
      () => true,
      createComposableAnnotatingSampler(alwaysOn, { is: 'catchall' }),
    ],
  ]);

  it('should have a description', () => {
    assert.strictEqual(
      sampler.toString(),
      'ComposableRuleBasedSampler([' +
        '(isHealthCheck, ComposableAlwaysOffSampler), ' +
        '(isCheckout, ComposableAnnotatingSampler(ComposableAlwaysOnSampler, attributes)), ' +
        '((anonymous), ComposableAnnotatingSampler(ComposableAlwaysOnSampler, attributes))' +
        '])'
    );
  });

  it('should use the matched samplers', () => {
    let intent;

    intent = sampler.getSamplingIntent(
      context.active(),
      'unused-trace-id',
      'span-name',
      SpanKind.SERVER,
      { 'http.route': '/healthcheck' },
      []
    );
    assert.strictEqual(intent.threshold, -1n); // used the alwaysOff sampler
    assert.strictEqual(intent.attributes, undefined);

    intent = sampler.getSamplingIntent(
      context.active(),
      'unused-trace-id',
      'span-name',
      SpanKind.SERVER,
      { 'http.route': '/checkout' },
      []
    );
    assert.strictEqual(intent.threshold, 0n); // used the alwaysOn sampler
    assert.deepStrictEqual(intent.attributes, { is: 'checkout' });

    intent = sampler.getSamplingIntent(
      context.active(),
      'unused-trace-id',
      'span-name',
      SpanKind.SERVER,
      { 'http.route': '/another' },
      []
    );
    assert.strictEqual(intent.threshold, 0n); // used the alwaysOn sampler
    assert.deepStrictEqual(intent.attributes, { is: 'catchall' });
  });

  it('should fallback to a non-sampling intent', () => {
    const sampler2 = createComposableRuleBasedSampler([]);
    const intent = sampler2.getSamplingIntent(
      context.active(),
      'unused-trace-id',
      'span-name',
      SpanKind.SERVER,
      {},
      []
    );
    assert.strictEqual(intent.threshold, INVALID_THRESHOLD);
    assert.strictEqual(intent.thresholdReliable, false);
  });
});
