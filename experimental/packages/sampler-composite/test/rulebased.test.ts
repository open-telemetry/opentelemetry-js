/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
