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
import { SamplingDecision } from '@opentelemetry/sdk-trace-base';

import { ConsistentAlwaysOffSampler } from '../src';
import { traceIdGenerator } from './util';

describe('ConsistentAlwaysOffSampler', () => {
  const sampler = new ConsistentAlwaysOffSampler();

  it('should have a description', () => {
    assert.strictEqual(sampler.toString(), 'ConsistentAlwaysOffSampler');
  });

  it('should have a constant threshold', () => {
    assert.strictEqual(sampler.getSamplingIntent().threshold, -1n);
  });

  it('should never sample', () => {
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
