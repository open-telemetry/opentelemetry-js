/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as assert from 'assert';
import * as api from '@opentelemetry/api';
import { AlwaysOnSampler, createAlwaysOnSampler } from '../../../src';

describe('AlwaysOnSampler', () => {
  it('should reflect sampler name', () => {
    const sampler = new AlwaysOnSampler();
    assert.strictEqual(sampler.toString(), 'AlwaysOnSampler');
  });

  it('should return api.SamplingDecision.RECORD_AND_SAMPLED for AlwaysOnSampler', () => {
    const sampler = new AlwaysOnSampler();
    assert.deepStrictEqual(sampler.shouldSample(), {
      decision: api.SamplingDecision.RECORD_AND_SAMPLED,
    });
  });

  it('should create an always-on sampler with the factory function', () => {
    const sampler = createAlwaysOnSampler();
    assert.strictEqual(sampler.toString(), 'AlwaysOnSampler');
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
        decision: api.SamplingDecision.RECORD_AND_SAMPLED,
      }
    );
  });
});
