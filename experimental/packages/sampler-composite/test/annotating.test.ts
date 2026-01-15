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

import { context, SpanKind } from '@opentelemetry/api';

import {
  createComposableAlwaysOnSampler,
  createComposableAnnotatingSampler,
} from '../src';

describe('ComposableAnnotatingSampler', () => {
  const alwaysOnSampler = createComposableAlwaysOnSampler();

  it('should have a description', () => {
    const sampler = createComposableAnnotatingSampler({}, alwaysOnSampler);
    assert.strictEqual(
      sampler.toString(),
      'ComposableAnnotatingSampler(attributes, delegate=ComposableAlwaysOnSampler)'
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
    const sampler = createComposableAnnotatingSampler(
      { foo: 'bar' },
      alwaysOnSampler
    );
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
      { foo: 'bar', spam: 'eggs' },
      createComposableAnnotatingSampler(
        { foo: 'baz', wuz: 'here' },
        alwaysOnSampler
      )
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
      foo: 'bar',  // outer annotating sampler wins
      spam: 'eggs',
      wuz: 'here'
    });
  });
});
