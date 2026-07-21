/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import type { ConfigurationModel } from '@opentelemetry/configuration';
import {
  AlwaysOffSampler,
  AlwaysOnSampler,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace';
import {
  buildSamplerFromConfig,
  getSamplerFromConfiguration,
} from '../src/utils';

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
});

describe('getSamplerFromConfiguration()', () => {
  it('returns undefined when tracer_provider.sampler is omitted', () => {
    assert.strictEqual(
      getSamplerFromConfiguration({} as ConfigurationModel),
      undefined
    );
    assert.strictEqual(
      getSamplerFromConfiguration({
        tracer_provider: { processors: [] },
      } as ConfigurationModel),
      undefined
    );
  });

  it('returns the sampler defined under tracer_provider.sampler', () => {
    const sampler = getSamplerFromConfiguration({
      tracer_provider: {
        processors: [],
        sampler: { always_off: {} },
      },
    } as ConfigurationModel);
    assert.ok(sampler instanceof AlwaysOffSampler);
  });

  it('builds a parent_based sampler from configuration', () => {
    const sampler = getSamplerFromConfiguration({
      tracer_provider: {
        processors: [],
        sampler: {
          parent_based: { root: { trace_id_ratio_based: { ratio: 0.25 } } },
        },
      },
    } as ConfigurationModel);
    assert.ok(sampler instanceof ParentBasedSampler);
    assert.ok(
      sampler.toString().startsWith('ParentBased{root=TraceIdRatioBased{0.25}')
    );
  });
});
