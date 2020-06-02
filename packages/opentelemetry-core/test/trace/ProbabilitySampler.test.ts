/*!
 * Copyright 2019, OpenTelemetry Authors
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
import {
  ProbabilitySampler,
  ALWAYS_SAMPLER,
  NEVER_SAMPLER,
} from '../../src/trace/sampler/ProbabilitySampler';

describe('ProbabilitySampler', () => {
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
    assert.strictEqual(sampler.toString(), 'ProbabilitySampler{1}');
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
    assert.strictEqual(sampler.toString(), 'ProbabilitySampler{0.2}');

    Math.random = () => 5 / 10;
    assert.deepStrictEqual(sampler.shouldSample(), {
      decision: api.SamplingDecision.NOT_RECORD,
    });
  });

  it('should return api.SamplingDecision.RECORD_AND_SAMPLED for ALWAYS_SAMPLER', () => {
    assert.deepStrictEqual(ALWAYS_SAMPLER.shouldSample(), {
      decision: api.SamplingDecision.RECORD_AND_SAMPLED,
    });
    assert.strictEqual(ALWAYS_SAMPLER.toString(), 'ProbabilitySampler{1}');
  });

  it('should return decision: api.SamplingDecision.NOT_RECORD for NEVER_SAMPLER', () => {
    assert.deepStrictEqual(NEVER_SAMPLER.shouldSample(), {
      decision: api.SamplingDecision.NOT_RECORD,
    });
    assert.strictEqual(NEVER_SAMPLER.toString(), 'ProbabilitySampler{0}');
  });

  it('should handle NaN', () => {
    const sampler = new ProbabilitySampler(NaN);
    assert.deepStrictEqual(sampler.shouldSample(), {
      decision: api.SamplingDecision.NOT_RECORD,
    });
    assert.strictEqual(sampler.toString(), 'ProbabilitySampler{0}');
  });

  it('should handle -NaN', () => {
    const sampler = new ProbabilitySampler(-NaN);
    assert.deepStrictEqual(sampler.shouldSample(), {
      decision: api.SamplingDecision.NOT_RECORD,
    });
    assert.strictEqual(sampler.toString(), 'ProbabilitySampler{0}');
  });

  it('should handle undefined', () => {
    const sampler = new ProbabilitySampler(undefined);
    assert.deepStrictEqual(sampler.shouldSample(), {
      decision: api.SamplingDecision.NOT_RECORD,
    });
    assert.strictEqual(sampler.toString(), 'ProbabilitySampler{0}');
  });
});
