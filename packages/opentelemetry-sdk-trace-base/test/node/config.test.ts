/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import {
  AlwaysOffSampler,
  AlwaysOnSampler,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from '../../src';
import { buildSamplerFromEnv } from '../../src/config';

describe('config', () => {
  describe('buildSamplerFromEnv()', () => {
    afterEach(() => {
      delete process.env.OTEL_TRACES_SAMPLER;
      delete process.env.OTEL_TRACES_SAMPLER_ARG;
    });

    it('should handle always_on case', () => {
      process.env.OTEL_TRACES_SAMPLER = 'always_on';
      assert.ok(buildSamplerFromEnv() instanceof AlwaysOnSampler);
      assert.strictEqual(buildSamplerFromEnv().toString(), 'AlwaysOnSampler');
    });

    it('should handle always_off case', () => {
      process.env.OTEL_TRACES_SAMPLER = 'always_off';
      assert.ok(buildSamplerFromEnv() instanceof AlwaysOffSampler);
      assert.strictEqual(buildSamplerFromEnv().toString(), 'AlwaysOffSampler');
    });

    it('should handle traceidratio case', () => {
      process.env.OTEL_TRACES_SAMPLER = 'traceidratio';
      process.env.OTEL_TRACES_SAMPLER_ARG = '0.1';
      assert.ok(buildSamplerFromEnv() instanceof TraceIdRatioBasedSampler);
      assert.strictEqual(
        buildSamplerFromEnv().toString(),
        'TraceIdRatioBased{0.1}'
      );
    });

    it('should handle parentbased_always_on case', () => {
      process.env.OTEL_TRACES_SAMPLER = 'parentbased_always_on';
      assert.ok(buildSamplerFromEnv() instanceof ParentBasedSampler);
      assert.strictEqual(
        buildSamplerFromEnv().toString(),
        'ParentBased{root=AlwaysOnSampler, remoteParentSampled=AlwaysOnSampler, remoteParentNotSampled=AlwaysOffSampler, localParentSampled=AlwaysOnSampler, localParentNotSampled=AlwaysOffSampler}'
      );
    });

    it('should handle parentbased_always_off case', () => {
      process.env.OTEL_TRACES_SAMPLER = 'parentbased_always_off';
      assert.ok(buildSamplerFromEnv() instanceof ParentBasedSampler);
      assert.strictEqual(
        buildSamplerFromEnv().toString(),
        'ParentBased{root=AlwaysOffSampler, remoteParentSampled=AlwaysOnSampler, remoteParentNotSampled=AlwaysOffSampler, localParentSampled=AlwaysOnSampler, localParentNotSampled=AlwaysOffSampler}'
      );
    });

    it('should handle parentbased_traceidratio case', () => {
      process.env.OTEL_TRACES_SAMPLER = 'parentbased_traceidratio';
      process.env.OTEL_TRACES_SAMPLER_ARG = '0.2';
      assert.ok(buildSamplerFromEnv() instanceof ParentBasedSampler);
      assert.strictEqual(
        buildSamplerFromEnv().toString(),
        'ParentBased{root=TraceIdRatioBased{0.2}, remoteParentSampled=AlwaysOnSampler, remoteParentNotSampled=AlwaysOffSampler, localParentSampled=AlwaysOnSampler, localParentNotSampled=AlwaysOffSampler}'
      );
    });

    it('should handle default case with probability 1', () => {
      assert.ok(buildSamplerFromEnv() instanceof ParentBasedSampler);
      assert.strictEqual(
        buildSamplerFromEnv().toString(),
        'ParentBased{root=AlwaysOnSampler, remoteParentSampled=AlwaysOnSampler, remoteParentNotSampled=AlwaysOffSampler, localParentSampled=AlwaysOnSampler, localParentNotSampled=AlwaysOffSampler}'
      );
    });

    it('should handle default case with probability lower than 1', () => {
      assert.ok(buildSamplerFromEnv() instanceof ParentBasedSampler);
      assert.strictEqual(
        buildSamplerFromEnv().toString(),
        'ParentBased{root=AlwaysOnSampler, remoteParentSampled=AlwaysOnSampler, remoteParentNotSampled=AlwaysOffSampler, localParentSampled=AlwaysOnSampler, localParentNotSampled=AlwaysOffSampler}'
      );
    });
  });
});
