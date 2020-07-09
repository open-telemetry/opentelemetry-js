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
import * as api from '@opentelemetry/api';
import { ProbabilitySampler } from '../../src/trace/sampler/ProbabilitySampler';

describe('ProbabilitySampler', () => {
  it('should reflect sampler name with probability', () => {
    let sampler = new ProbabilitySampler(1.0);
    assert.strictEqual(sampler.toString(), 'ProbabilitySampler{1}');

    sampler = new ProbabilitySampler(0.5);
    assert.strictEqual(sampler.toString(), 'ProbabilitySampler{0.5}');

    sampler = new ProbabilitySampler(0);
    assert.strictEqual(sampler.toString(), 'ProbabilitySampler{0}');

    sampler = new ProbabilitySampler(-0);
    assert.strictEqual(sampler.toString(), 'ProbabilitySampler{0}');

    sampler = new ProbabilitySampler(undefined);
    assert.strictEqual(sampler.toString(), 'ProbabilitySampler{0}');

    sampler = new ProbabilitySampler(NaN);
    assert.strictEqual(sampler.toString(), 'ProbabilitySampler{0}');

    sampler = new ProbabilitySampler(+Infinity);
    assert.strictEqual(sampler.toString(), 'ProbabilitySampler{1}');

    sampler = new ProbabilitySampler(-Infinity);
    assert.strictEqual(sampler.toString(), 'ProbabilitySampler{0}');
  });

  it('should return a always sampler for 1', () => {
    const sampler = new ProbabilitySampler(1);
    assert.deepStrictEqual(sampler.shouldSample(), {
      decision: api.SamplingDecision.RECORD_AND_SAMPLED,
    });
  });

  it('should return a always sampler for >1', () => {
    const sampler = new ProbabilitySampler(100);
    assert.deepStrictEqual(sampler.shouldSample(), {
      decision: api.SamplingDecision.RECORD_AND_SAMPLED,
    });
  });

  it('should return a never sampler for 0', () => {
    const sampler = new ProbabilitySampler(0);
    assert.deepStrictEqual(sampler.shouldSample(), {
      decision: api.SamplingDecision.NOT_RECORD,
    });
  });

  it('should return a never sampler for <0', () => {
    const sampler = new ProbabilitySampler(-1);
    assert.deepStrictEqual(sampler.shouldSample(), {
      decision: api.SamplingDecision.NOT_RECORD,
    });
  });

  it('should sample according to the probability', () => {
    Math.random = () => 1 / 10;
    const sampler = new ProbabilitySampler(0.2);
    assert.deepStrictEqual(sampler.shouldSample(), {
      decision: api.SamplingDecision.RECORD_AND_SAMPLED,
    });

    Math.random = () => 5 / 10;
    assert.deepStrictEqual(sampler.shouldSample(), {
      decision: api.SamplingDecision.NOT_RECORD,
    });
  });

  it('should handle NaN', () => {
    const sampler = new ProbabilitySampler(NaN);
    assert.strictEqual(sampler.toString(), 'ProbabilitySampler{0}');
    assert.deepStrictEqual(sampler.shouldSample(), {
      decision: api.SamplingDecision.NOT_RECORD,
    });
  });

  it('should handle -NaN', () => {
    const sampler = new ProbabilitySampler(-NaN);
    assert.strictEqual(sampler.toString(), 'ProbabilitySampler{0}');
    assert.deepStrictEqual(sampler.shouldSample(), {
      decision: api.SamplingDecision.NOT_RECORD,
    });
  });

  it('should handle undefined', () => {
    const sampler = new ProbabilitySampler(undefined);
    assert.strictEqual(sampler.toString(), 'ProbabilitySampler{0}');
    assert.deepStrictEqual(sampler.shouldSample(), {
      decision: api.SamplingDecision.NOT_RECORD,
    });
  });
});
