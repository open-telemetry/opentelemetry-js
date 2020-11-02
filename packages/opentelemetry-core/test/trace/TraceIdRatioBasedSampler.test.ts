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
import { TraceIdRatioBasedSampler } from '../../src/trace/sampler/TraceIdRatioBasedSampler';

const spanContext = (traceId = '1') => ({
  traceId,
  spanId: '1.1',
  traceFlags: api.TraceFlags.NONE,
});

describe('TraceIdRatioBasedSampler', () => {
  it('should reflect sampler name with ratio', () => {
    let sampler = new TraceIdRatioBasedSampler(1.0);
    assert.strictEqual(sampler.toString(), 'TraceIdRatioBased{1}');

    sampler = new TraceIdRatioBasedSampler(0.5);
    assert.strictEqual(sampler.toString(), 'TraceIdRatioBased{0.5}');

    sampler = new TraceIdRatioBasedSampler(0);
    assert.strictEqual(sampler.toString(), 'TraceIdRatioBased{0}');

    sampler = new TraceIdRatioBasedSampler(-0);
    assert.strictEqual(sampler.toString(), 'TraceIdRatioBased{0}');

    sampler = new TraceIdRatioBasedSampler(undefined);
    assert.strictEqual(sampler.toString(), 'TraceIdRatioBased{0}');

    sampler = new TraceIdRatioBasedSampler(NaN);
    assert.strictEqual(sampler.toString(), 'TraceIdRatioBased{0}');

    sampler = new TraceIdRatioBasedSampler(+Infinity);
    assert.strictEqual(sampler.toString(), 'TraceIdRatioBased{1}');

    sampler = new TraceIdRatioBasedSampler(-Infinity);
    assert.strictEqual(sampler.toString(), 'TraceIdRatioBased{0}');
  });

  it('should return a always sampler for 1', () => {
    const sampler = new TraceIdRatioBasedSampler(1);
    assert.deepStrictEqual(sampler.shouldSample(spanContext('1'), '1'), {
      decision: api.SamplingDecision.RECORD_AND_SAMPLED,
    });
  });

  it('should return a always sampler for >1', () => {
    const sampler = new TraceIdRatioBasedSampler(100);
    assert.deepStrictEqual(sampler.shouldSample(spanContext('1'), '1'), {
      decision: api.SamplingDecision.RECORD_AND_SAMPLED,
    });
  });

  it('should return a never sampler for 0', () => {
    const sampler = new TraceIdRatioBasedSampler(0);
    assert.deepStrictEqual(sampler.shouldSample(spanContext('1'), '1'), {
      decision: api.SamplingDecision.NOT_RECORD,
    });
  });

  it('should return a never sampler for <0', () => {
    const sampler = new TraceIdRatioBasedSampler(-1);
    assert.deepStrictEqual(sampler.shouldSample(spanContext('1'), '1'), {
      decision: api.SamplingDecision.NOT_RECORD,
    });
  });

  it('should handle NaN', () => {
    const sampler = new TraceIdRatioBasedSampler(NaN);
    assert.strictEqual(sampler.toString(), 'TraceIdRatioBased{0}');
    assert.deepStrictEqual(sampler.shouldSample(spanContext('1'), '1'), {
      decision: api.SamplingDecision.NOT_RECORD,
    });
  });

  it('should handle -NaN', () => {
    const sampler = new TraceIdRatioBasedSampler(-NaN);
    assert.strictEqual(sampler.toString(), 'TraceIdRatioBased{0}');
    assert.deepStrictEqual(sampler.shouldSample(spanContext('1'), '1'), {
      decision: api.SamplingDecision.NOT_RECORD,
    });
  });

  it('should handle undefined', () => {
    const sampler = new TraceIdRatioBasedSampler(undefined);
    assert.strictEqual(sampler.toString(), 'TraceIdRatioBased{0}');
    assert.deepStrictEqual(sampler.shouldSample(spanContext('1'), '1'), {
      decision: api.SamplingDecision.NOT_RECORD,
    });
  });

  it('should sample based on trace id', () => {
    const sampler = new TraceIdRatioBasedSampler(0.2);
    assert.deepStrictEqual(sampler.shouldSample(spanContext('\x00'), '\x00'), {
      decision: api.SamplingDecision.RECORD_AND_SAMPLED,
    });

    assert.deepStrictEqual(sampler.shouldSample(spanContext('\x15'), '\x15'), {
      decision: api.SamplingDecision.NOT_RECORD,
    });
  });

  it('should sample traces that a lower sampling ratio would sample', () => {
    const sampler10 = new TraceIdRatioBasedSampler(0.1);
    const sampler20 = new TraceIdRatioBasedSampler(0.2);
    assert.deepStrictEqual(
      sampler10.shouldSample(spanContext('\x00'), '\x00'),
      {
        decision: api.SamplingDecision.RECORD_AND_SAMPLED,
      }
    );
    assert.deepStrictEqual(
      sampler20.shouldSample(spanContext('\x00'), '\x00'),
      {
        decision: api.SamplingDecision.RECORD_AND_SAMPLED,
      }
    );

    assert.deepStrictEqual(
      sampler10.shouldSample(spanContext('\x0a'), '\x0a'),
      {
        decision: api.SamplingDecision.NOT_RECORD,
      }
    );
    assert.deepStrictEqual(
      sampler20.shouldSample(spanContext('\x0a'), '\x0a'),
      {
        decision: api.SamplingDecision.RECORD_AND_SAMPLED,
      }
    );
  });
});
