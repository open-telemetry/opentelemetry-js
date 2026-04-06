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
import { buildSamplerFromConfig, buildSamplerFromEnv } from '../../src/config';

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

  describe('buildSamplerFromConfig()', () => {
    it('should return AlwaysOnSampler for always_on config', () => {
      const sampler = buildSamplerFromConfig({ always_on: {} });
      assert.ok(sampler instanceof AlwaysOnSampler);
      assert.strictEqual(sampler.toString(), 'AlwaysOnSampler');
    });

    it('should return AlwaysOffSampler for always_off config', () => {
      const sampler = buildSamplerFromConfig({ always_off: {} });
      assert.ok(sampler instanceof AlwaysOffSampler);
      assert.strictEqual(sampler.toString(), 'AlwaysOffSampler');
    });

    it('should return TraceIdRatioBasedSampler with specified ratio', () => {
      const sampler = buildSamplerFromConfig({
        trace_id_ratio_based: { ratio: 0.5 },
      });
      assert.ok(sampler instanceof TraceIdRatioBasedSampler);
      assert.strictEqual(sampler.toString(), 'TraceIdRatioBased{0.5}');
    });

    it('should return TraceIdRatioBasedSampler with default ratio when omitted', () => {
      const sampler = buildSamplerFromConfig({ trace_id_ratio_based: {} });
      assert.ok(sampler instanceof TraceIdRatioBasedSampler);
      assert.strictEqual(sampler.toString(), 'TraceIdRatioBased{1}');
    });

    it('should return ParentBasedSampler with default always_on root when root is omitted', () => {
      const sampler = buildSamplerFromConfig({ parent_based: {} });
      assert.ok(sampler instanceof ParentBasedSampler);
      assert.strictEqual(
        sampler.toString(),
        'ParentBased{root=AlwaysOnSampler, remoteParentSampled=AlwaysOnSampler, remoteParentNotSampled=AlwaysOffSampler, localParentSampled=AlwaysOnSampler, localParentNotSampled=AlwaysOffSampler}'
      );
    });

    it('should return ParentBasedSampler with always_on root', () => {
      const sampler = buildSamplerFromConfig({
        parent_based: { root: { always_on: {} } },
      });
      assert.ok(sampler instanceof ParentBasedSampler);
      assert.strictEqual(
        sampler.toString(),
        'ParentBased{root=AlwaysOnSampler, remoteParentSampled=AlwaysOnSampler, remoteParentNotSampled=AlwaysOffSampler, localParentSampled=AlwaysOnSampler, localParentNotSampled=AlwaysOffSampler}'
      );
    });

    it('should return ParentBasedSampler with always_off root', () => {
      const sampler = buildSamplerFromConfig({
        parent_based: { root: { always_off: {} } },
      });
      assert.ok(sampler instanceof ParentBasedSampler);
      assert.strictEqual(
        sampler.toString(),
        'ParentBased{root=AlwaysOffSampler, remoteParentSampled=AlwaysOnSampler, remoteParentNotSampled=AlwaysOffSampler, localParentSampled=AlwaysOnSampler, localParentNotSampled=AlwaysOffSampler}'
      );
    });

    it('should return ParentBasedSampler with trace_id_ratio_based root', () => {
      const sampler = buildSamplerFromConfig({
        parent_based: { root: { trace_id_ratio_based: { ratio: 0.25 } } },
      });
      assert.ok(sampler instanceof ParentBasedSampler);
      assert.strictEqual(
        sampler.toString(),
        'ParentBased{root=TraceIdRatioBased{0.25}, remoteParentSampled=AlwaysOnSampler, remoteParentNotSampled=AlwaysOffSampler, localParentSampled=AlwaysOnSampler, localParentNotSampled=AlwaysOffSampler}'
      );
    });

    it('should override sub-samplers in parent_based config', () => {
      const sampler = buildSamplerFromConfig({
        parent_based: {
          root: { always_on: {} },
          remote_parent_sampled: { always_off: {} },
          remote_parent_not_sampled: { always_on: {} },
          local_parent_sampled: { always_off: {} },
          local_parent_not_sampled: { always_on: {} },
        },
      });
      assert.ok(sampler instanceof ParentBasedSampler);
      assert.strictEqual(
        sampler.toString(),
        'ParentBased{root=AlwaysOnSampler, remoteParentSampled=AlwaysOffSampler, remoteParentNotSampled=AlwaysOnSampler, localParentSampled=AlwaysOffSampler, localParentNotSampled=AlwaysOnSampler}'
      );
    });

    it('should default to ParentBased(AlwaysOn) for empty config', () => {
      const sampler = buildSamplerFromConfig({});
      assert.ok(sampler instanceof ParentBasedSampler);
      assert.strictEqual(
        sampler.toString(),
        'ParentBased{root=AlwaysOnSampler, remoteParentSampled=AlwaysOnSampler, remoteParentNotSampled=AlwaysOffSampler, localParentSampled=AlwaysOnSampler, localParentNotSampled=AlwaysOffSampler}'
      );
    });

    it('should produce same result as buildSamplerFromEnv for always_on', () => {
      process.env.OTEL_TRACES_SAMPLER = 'always_on';
      const fromEnv = buildSamplerFromEnv();
      const fromConfig = buildSamplerFromConfig({ always_on: {} });
      assert.strictEqual(fromEnv.toString(), fromConfig.toString());
      delete process.env.OTEL_TRACES_SAMPLER;
    });

    it('should produce same result as buildSamplerFromEnv for parentbased_traceidratio', () => {
      process.env.OTEL_TRACES_SAMPLER = 'parentbased_traceidratio';
      process.env.OTEL_TRACES_SAMPLER_ARG = '0.3';
      const fromEnv = buildSamplerFromEnv();
      const fromConfig = buildSamplerFromConfig({
        parent_based: { root: { trace_id_ratio_based: { ratio: 0.3 } } },
      });
      assert.strictEqual(fromEnv.toString(), fromConfig.toString());
      delete process.env.OTEL_TRACES_SAMPLER;
      delete process.env.OTEL_TRACES_SAMPLER_ARG;
    });
  });
});
