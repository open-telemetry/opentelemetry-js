/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as api from '@opentelemetry/api';
import { TraceIdRatioBasedSampler } from '../../../src/sampler/TraceIdRatioBasedSampler';

const spanContext = (traceId = '1') => ({
  traceId,
  spanId: '1.1',
  traceFlags: api.TraceFlags.NONE,
});

const traceId = (part: string) => ('0'.repeat(32) + part).slice(-32);

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
    assert.deepStrictEqual(
      sampler.shouldSample(spanContext(traceId('1')), traceId('1')),
      {
        decision: api.SamplingDecision.RECORD_AND_SAMPLED,
      }
    );
  });

  it('should return a always sampler for >1', () => {
    const sampler = new TraceIdRatioBasedSampler(100);
    assert.deepStrictEqual(
      sampler.shouldSample(spanContext(traceId('1')), traceId('1')),
      {
        decision: api.SamplingDecision.RECORD_AND_SAMPLED,
      }
    );
  });

  it('should return a never sampler for 0', () => {
    const sampler = new TraceIdRatioBasedSampler(0);
    assert.deepStrictEqual(
      sampler.shouldSample(spanContext(traceId('1')), traceId('1')),
      {
        decision: api.SamplingDecision.NOT_RECORD,
      }
    );
  });

  it('should return a never sampler for <0', () => {
    const sampler = new TraceIdRatioBasedSampler(-1);
    assert.deepStrictEqual(
      sampler.shouldSample(spanContext(traceId('1')), traceId('1')),
      {
        decision: api.SamplingDecision.NOT_RECORD,
      }
    );
  });

  it('should handle NaN', () => {
    const sampler = new TraceIdRatioBasedSampler(NaN);
    assert.strictEqual(sampler.toString(), 'TraceIdRatioBased{0}');
    assert.deepStrictEqual(
      sampler.shouldSample(spanContext(traceId('1')), traceId('1')),
      {
        decision: api.SamplingDecision.NOT_RECORD,
      }
    );
  });

  it('should handle -NaN', () => {
    const sampler = new TraceIdRatioBasedSampler(-NaN);
    assert.strictEqual(sampler.toString(), 'TraceIdRatioBased{0}');
    assert.deepStrictEqual(
      sampler.shouldSample(spanContext(traceId('1')), traceId('1')),
      {
        decision: api.SamplingDecision.NOT_RECORD,
      }
    );
  });

  it('should handle undefined', () => {
    const sampler = new TraceIdRatioBasedSampler(undefined);
    assert.strictEqual(sampler.toString(), 'TraceIdRatioBased{0}');
    assert.deepStrictEqual(
      sampler.shouldSample(spanContext(traceId('1')), traceId('1')),
      {
        decision: api.SamplingDecision.NOT_RECORD,
      }
    );
  });

  it('should sample based on trace id', () => {
    const sampler = new TraceIdRatioBasedSampler(0.2);
    assert.deepStrictEqual(
      sampler.shouldSample(spanContext(traceId('1')), traceId('1')),
      {
        decision: api.SamplingDecision.RECORD_AND_SAMPLED,
      }
    );

    assert.deepStrictEqual(
      sampler.shouldSample(
        spanContext(traceId('33333333')),
        traceId('33333333')
      ),
      {
        decision: api.SamplingDecision.NOT_RECORD,
      }
    );
  });

  it('should not sample with a invalid trace id', () => {
    const sampler = new TraceIdRatioBasedSampler(1);
    assert.deepStrictEqual(sampler.shouldSample(spanContext(''), ''), {
      decision: api.SamplingDecision.NOT_RECORD,
    });

    assert.deepStrictEqual(
      sampler.shouldSample(spanContext(traceId('g')), traceId('g')),
      {
        decision: api.SamplingDecision.NOT_RECORD,
      }
    );
  });

  it('should sample traces that a lower sampling ratio would sample', () => {
    const sampler10 = new TraceIdRatioBasedSampler(0.1);
    const sampler20 = new TraceIdRatioBasedSampler(0.2);

    const id1 = traceId((Math.floor(0xffffffff * 0.1) - 1).toString(16));
    assert.deepStrictEqual(sampler10.shouldSample(spanContext(id1), id1), {
      decision: api.SamplingDecision.RECORD_AND_SAMPLED,
    });
    assert.deepStrictEqual(sampler20.shouldSample(spanContext(id1), id1), {
      decision: api.SamplingDecision.RECORD_AND_SAMPLED,
    });

    const id2 = traceId((Math.floor(0xffffffff * 0.2) - 1).toString(16));
    assert.deepStrictEqual(sampler10.shouldSample(spanContext(id2), id2), {
      decision: api.SamplingDecision.NOT_RECORD,
    });
    assert.deepStrictEqual(sampler20.shouldSample(spanContext(id2), id2), {
      decision: api.SamplingDecision.RECORD_AND_SAMPLED,
    });

    const id2delta = traceId(Math.floor(0xffffffff * 0.2).toString(16));
    assert.deepStrictEqual(
      sampler10.shouldSample(spanContext(id2delta), id2delta),
      {
        decision: api.SamplingDecision.NOT_RECORD,
      }
    );
    assert.deepStrictEqual(
      sampler20.shouldSample(spanContext(id2delta), id2delta),
      {
        decision: api.SamplingDecision.NOT_RECORD,
      }
    );
  });
});
