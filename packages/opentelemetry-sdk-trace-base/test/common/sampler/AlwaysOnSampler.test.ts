/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as assert from 'assert';
import * as api from '@opentelemetry/api';
import { AlwaysOnSampler } from '../../../src/sampler/AlwaysOnSampler';

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
});
