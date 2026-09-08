/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import { diag } from '@opentelemetry/api';
import { createSamplerFromEnv } from '../src/create-from-env';

function clearOTelEnv() {
  for (const key of Object.keys(process.env)) {
    if (key.startsWith('OTEL_')) {
      delete process.env[key];
    }
  }
}

function setEnv(env: Record<string, string>) {
  for (const [k, v] of Object.entries(env)) {
    process.env[k] = v;
  }
}

describe('create-from-env', () => {
  let diagErrorSpy: sinon.SinonSpy;

  beforeEach(function () {
    clearOTelEnv();
    diagErrorSpy = sinon.spy(diag, 'error');
  });

  afterEach(function () {
    clearOTelEnv();
    sinon.restore();
  });

  describe('createSamplerFromEnv', () => {
    const corpus: {
      env: Record<string, string>;
      samplerRepr: string;
      diagErr?: string;
      only?: boolean;
    }[] = [
      {
        // empty env returns no sampler
        env: {},
        samplerRepr: 'undefined',
      },
      {
        env: { OTEL_TRACES_SAMPLER: 'always_on' },
        samplerRepr: 'AlwaysOnSampler',
      },
      {
        env: { OTEL_TRACES_SAMPLER: 'always_off' },
        samplerRepr: 'AlwaysOffSampler',
      },
      {
        env: { OTEL_TRACES_SAMPLER: 'parentbased_always_on' },
        samplerRepr:
          'ParentBased{root=AlwaysOnSampler, remoteParentSampled=AlwaysOnSampler, remoteParentNotSampled=AlwaysOffSampler, localParentSampled=AlwaysOnSampler, localParentNotSampled=AlwaysOffSampler}',
      },
      {
        env: { OTEL_TRACES_SAMPLER: 'parentbased_always_off' },
        samplerRepr:
          'ParentBased{root=AlwaysOffSampler, remoteParentSampled=AlwaysOnSampler, remoteParentNotSampled=AlwaysOffSampler, localParentSampled=AlwaysOnSampler, localParentNotSampled=AlwaysOffSampler}',
      },
      {
        env: { OTEL_TRACES_SAMPLER: 'traceidratio' },
        samplerRepr: 'TraceIdRatioBased{1}',
      },
      {
        env: {
          OTEL_TRACES_SAMPLER: 'traceidratio',
          OTEL_TRACES_SAMPLER_ARG: '0.2',
        },
        samplerRepr: 'TraceIdRatioBased{0.2}',
      },
      {
        env: {
          OTEL_TRACES_SAMPLER: 'traceidratio',
          OTEL_TRACES_SAMPLER_ARG: '-42',
        },
        samplerRepr: 'TraceIdRatioBased{1}',
        diagErr:
          'OTEL_TRACES_SAMPLER_ARG=-42 was given, but it is out of range',
      },
      {
        env: {
          OTEL_TRACES_SAMPLER: 'parentbased_traceidratio',
          OTEL_TRACES_SAMPLER_ARG: '0.2',
        },
        samplerRepr:
          'ParentBased{root=TraceIdRatioBased{0.2}, remoteParentSampled=AlwaysOnSampler, remoteParentNotSampled=AlwaysOffSampler, localParentSampled=AlwaysOnSampler, localParentNotSampled=AlwaysOffSampler}',
      },
      {
        env: { OTEL_TRACES_SAMPLER: 'bogus' },
        samplerRepr: 'undefined',
        diagErr: 'unknown OTEL_TRACES_SAMPLER value "bogus", using default',
      },
    ];

    for (const item of corpus) {
      const testName =
        Object.entries(item.env)
          .map(([k, v]) => `${k}=${v}`)
          .join(', ') || '(empty env)';
      (item.only ? it.only : it)(testName, function () {
        setEnv(item.env);
        const sampler = createSamplerFromEnv();

        assert.deepStrictEqual(String(sampler), item.samplerRepr);
        if ('diagErr' in item) {
          sinon.assert.calledOnceWithMatch(diagErrorSpy, item.diagErr);
        }
      });
    }
  });
});
