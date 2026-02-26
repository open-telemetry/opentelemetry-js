/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as assert from 'assert';
import * as api from '@opentelemetry/api';
import { AlwaysOffSampler } from '../../../src/sampler/AlwaysOffSampler';

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
});
