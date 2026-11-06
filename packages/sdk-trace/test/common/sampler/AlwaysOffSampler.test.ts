/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as assert from 'assert';
import * as api from '@opentelemetry/api';
import { AlwaysOffSampler, createAlwaysOffSampler } from '../../../src';

describe('AlwaysOffSampler', () => {
  it('should reflect sampler name', () => {
    const sampler = new AlwaysOffSampler();
    assert.strictEqual(sampler.toString(), 'AlwaysOffSampler');
  });

  it('should return decision: api.SamplingDecision.NOT_RECORD for AlwaysOffSampler', () => {
    const sampler = new AlwaysOffSampler();
    assert.deepStrictEqual(sampler.shouldSample(), {
      decision: api.SamplingDecision.NOT_RECORD,
    });
  });

  it('should create an always-off sampler with the factory function', () => {
    const sampler = createAlwaysOffSampler();
    assert.strictEqual(sampler.toString(), 'AlwaysOffSampler');
    assert.deepStrictEqual(
      sampler.shouldSample(
        api.ROOT_CONTEXT,
        '0af7651916cd43dd8448eb211c80319c',
        'spanName',
        api.SpanKind.INTERNAL,
        {},
        []
      ),
      {
        decision: api.SamplingDecision.NOT_RECORD,
      }
    );
  });
});
