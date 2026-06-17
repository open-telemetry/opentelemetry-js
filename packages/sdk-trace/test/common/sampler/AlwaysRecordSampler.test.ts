/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as api from '@opentelemetry/api';
import {
  AlwaysOffSampler,
  AlwaysOnSampler,
  createAlwaysRecordSampler,
  SamplingDecision,
} from '../../../src';

describe('AlwaysRecordSampler', () => {
  it('should reflect delegate name in toString()', () => {
    const sampler = createAlwaysRecordSampler(new AlwaysOffSampler());
    assert.strictEqual(
      sampler.toString(),
      'AlwaysRecordSampler{AlwaysOffSampler}'
    );
  });

  it('should throw when delegate is null', () => {
    assert.throws(
      () => createAlwaysRecordSampler(null as unknown as api.Sampler),
      /AlwaysRecordSampler requires a delegate sampler/
    );
  });

  it('should throw when delegate is undefined', () => {
    assert.throws(
      () => createAlwaysRecordSampler(undefined as unknown as api.Sampler),
      /AlwaysRecordSampler requires a delegate sampler/
    );
  });

  it('should pass through RECORD_AND_SAMPLED unchanged', () => {
    const sampler = createAlwaysRecordSampler(new AlwaysOnSampler());
    const result = sampler.shouldSample(
      api.context.active(),
      '0af7651916cd43dd8448eb211c80319c',
      'spanName',
      api.SpanKind.CLIENT,
      {},
      []
    );
    assert.strictEqual(result.decision, SamplingDecision.RECORD_AND_SAMPLED);
  });

  it('should pass through RECORD unchanged', () => {
    const delegate: api.Sampler = {
      shouldSample: () => ({ decision: SamplingDecision.RECORD }),
      toString: () => 'RecordSampler',
    };
    const sampler = createAlwaysRecordSampler(delegate);
    const result = sampler.shouldSample(
      api.context.active(),
      '0af7651916cd43dd8448eb211c80319c',
      'spanName',
      api.SpanKind.CLIENT,
      {},
      []
    );
    assert.strictEqual(result.decision, SamplingDecision.RECORD);
  });

  it('should upgrade NOT_RECORD to RECORD and preserve attributes and traceState', () => {
    const traceState = api.createTraceState('key=value');
    const attrs = { foo: 'bar' };
    const delegate: api.Sampler = {
      shouldSample: () => ({
        decision: SamplingDecision.NOT_RECORD,
        attributes: attrs,
        traceState,
      }),
      toString: () => 'DropSampler',
    };
    const sampler = createAlwaysRecordSampler(delegate);
    const result = sampler.shouldSample(
      api.context.active(),
      '0af7651916cd43dd8448eb211c80319c',
      'spanName',
      api.SpanKind.CLIENT,
      {},
      []
    );
    assert.strictEqual(result.decision, SamplingDecision.RECORD);
    assert.strictEqual(result.attributes, attrs);
    assert.strictEqual(result.traceState, traceState);
  });
});
