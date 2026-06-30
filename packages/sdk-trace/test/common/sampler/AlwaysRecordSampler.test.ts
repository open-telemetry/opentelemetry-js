/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { context, SpanKind } from '@opentelemetry/api';
import { TraceState } from '@opentelemetry/core';
import type { Sampler } from '../../../src';
import {
  AlwaysOffSampler,
  AlwaysOnSampler,
  createAlwaysRecordSampler,
  SamplingDecision,
} from '../../../src';

describe('AlwaysRecordSampler', function () {
  it('should reflect delegate name in toString()', function () {
    const sampler = createAlwaysRecordSampler(new AlwaysOffSampler());
    assert.strictEqual(
      sampler.toString(),
      'AlwaysRecordSampler{AlwaysOffSampler}'
    );
  });

  it('should throw when delegate is null', function () {
    assert.throws(
      () => createAlwaysRecordSampler(null as unknown as Sampler),
      /AlwaysRecordSampler requires a delegate sampler/
    );
  });

  it('should throw when delegate is undefined', function () {
    assert.throws(
      () => createAlwaysRecordSampler(undefined as unknown as Sampler),
      /AlwaysRecordSampler requires a delegate sampler/
    );
  });

  it('should pass through RECORD_AND_SAMPLED unchanged', function () {
    const sampler = createAlwaysRecordSampler(new AlwaysOnSampler());
    const result = sampler.shouldSample(
      context.active(),
      '0af7651916cd43dd8448eb211c80319c',
      'spanName',
      SpanKind.CLIENT,
      {},
      []
    );
    assert.strictEqual(result.decision, SamplingDecision.RECORD_AND_SAMPLED);
  });

  it('should pass through RECORD unchanged', function () {
    const delegate: Sampler = {
      shouldSample: () => ({ decision: SamplingDecision.RECORD }),
      toString: () => 'RecordSampler',
    };
    const sampler = createAlwaysRecordSampler(delegate);
    const result = sampler.shouldSample(
      context.active(),
      '0af7651916cd43dd8448eb211c80319c',
      'spanName',
      SpanKind.CLIENT,
      {},
      []
    );
    assert.strictEqual(result.decision, SamplingDecision.RECORD);
  });

  it('should upgrade NOT_RECORD to RECORD and preserve attributes and traceState', function () {
    const traceState = new TraceState('key=value');
    const attrs = { foo: 'bar' };
    const delegate: Sampler = {
      shouldSample: () => ({
        decision: SamplingDecision.NOT_RECORD,
        attributes: attrs,
        traceState,
      }),
      toString: () => 'DropSampler',
    };
    const sampler = createAlwaysRecordSampler(delegate);
    const result = sampler.shouldSample(
      context.active(),
      '0af7651916cd43dd8448eb211c80319c',
      'spanName',
      SpanKind.CLIENT,
      {},
      []
    );
    assert.strictEqual(result.decision, SamplingDecision.RECORD);
    assert.strictEqual(result.attributes, attrs);
    assert.strictEqual(result.traceState, traceState);
  });
});
