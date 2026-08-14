/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';

import { diag } from '@opentelemetry/api';
import {
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';

import type { StartSdkFromEnvOptions } from '../src/types';
import {
  createPropagatorFromOptsAndEnv,
  createResourceFromOptsAndEnv,
  createSamplerFromEnv,
} from '../src/create-from-env';
import type { ResourceDetector } from '@opentelemetry/resources';
import {
  detectResources,
  emptyResource,
  hostDetector,
  osDetector,
  processDetector,
  resourceFromAttributes,
  serviceInstanceIdDetector,
} from '@opentelemetry/resources';

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
  let diagWarnSpy: sinon.SinonSpy;
  let diagErrorSpy: sinon.SinonSpy;

  beforeEach(function () {
    clearOTelEnv();
    diagWarnSpy = sinon.spy(diag, 'warn');
    diagErrorSpy = sinon.spy(diag, 'error');
  });

  afterEach(function () {
    clearOTelEnv();
    sinon.restore();
  });

  describe('createPropagatorFromOptsAndEnv', () => {
    const corpus: {
      name: string;
      opts?: StartSdkFromEnvOptions;
      env?: Record<string, string>;
      propagatorFields?: string[];
      throws?: RegExp;
      diagWarn?: string;
    }[] = [
      {
        name: 'no opts or env',
        propagatorFields: ['traceparent', 'tracestate', 'baggage'],
      },
      {
        name: 'opts.propagators=null',
        opts: { propagators: null },
        // Asserts propagator is null.
      },
      {
        name: 'opts.propagators=[]',
        opts: { propagators: [] },
        throws: /invalid "propagators" option: must have at least one item/,
      },
      {
        name: 'opts.propagators=[W3CBaggagePropagator]',
        opts: { propagators: [new W3CBaggagePropagator()] },
        propagatorFields: ['baggage'],
      },
      {
        name: 'opts.propagators=[W3CBaggagePropagator, W3CTraceContextPropagator]',
        opts: {
          propagators: [
            new W3CBaggagePropagator(),
            new W3CTraceContextPropagator(),
          ],
        },
        propagatorFields: ['baggage', 'traceparent', 'tracestate'],
      },
      {
        name: 'OTEL_PROPAGATORS=none',
        env: { OTEL_PROPAGATORS: 'none' },
        // Asserts propagator is null.
      },
      {
        name: 'OTEL_PROPAGATORS= should use defaults',
        env: { OTEL_PROPAGATORS: '' },
        propagatorFields: ['traceparent', 'tracestate', 'baggage'],
      },
      {
        name: 'OTEL_PROPAGATORS= should use defaults',
        env: { OTEL_PROPAGATORS: '' },
        propagatorFields: ['traceparent', 'tracestate', 'baggage'],
      },
      {
        name: 'OTEL_PROPAGATORS=baggage',
        env: { OTEL_PROPAGATORS: 'baggage' },
        propagatorFields: ['baggage'],
      },
      {
        name: 'OTEL_PROPAGATORS=baggage,b3,baggage dedupes',
        env: { OTEL_PROPAGATORS: 'baggage, b3, baggage' },
        propagatorFields: ['baggage', 'b3'],
      },
      {
        name: 'OTEL_PROPAGATORS=b3multi,some_unknown_propagator warns',
        env: { OTEL_PROPAGATORS: 'b3multi,some_unknown_propagator' },
        propagatorFields: [
          'x-b3-traceid',
          'x-b3-spanid',
          'x-b3-flags',
          'x-b3-sampled',
          'x-b3-parentspanid',
        ],
        diagWarn:
          'unknown propagator from "OTEL_PROPAGATORS": "some_unknown_propagator"',
      },
      {
        name: 'only known names on OTEL_PROPAGATORS results in no propagator',
        env: { OTEL_PROPAGATORS: 'some_unknown_propagator,another_unknown' },
        // Asserts propagator is null.
      },
      {
        name: 'OTEL_PROPAGATORS=jaeger warns it is deprecated',
        env: { OTEL_PROPAGATORS: 'jaeger' },
        propagatorFields: ['uber-trace-id'],
        diagWarn:
          'The Jaeger propagator is deprecated and will be removed in a future release. Use the W3C TraceContext propagator ("tracecontext") instead.',
      },
      {
        name: 'opts.propagators beats OTEL_PROPAGATORS',
        opts: { propagators: [new W3CTraceContextPropagator()] },
        env: { OTEL_PROPAGATORS: 'baggage' },
        propagatorFields: ['traceparent', 'tracestate'],
      },
    ];

    for (const item of corpus) {
      it(item.name, function () {
        if (item.env) {
          setEnv(item.env);
        }

        if (item.throws) {
          assert.throws(() => {
            createPropagatorFromOptsAndEnv(item.opts);
          }, item.throws);
        } else {
          const propagator = createPropagatorFromOptsAndEnv(item.opts);
          if (item.propagatorFields) {
            assert.deepStrictEqual(propagator!.fields(), item.propagatorFields);
          } else {
            assert.strictEqual(propagator, null);
          }
        }
        if (item.diagWarn) {
          sinon.assert.calledOnceWithMatch(diagWarnSpy, item.diagWarn);
        }
      });
    }
  });

  describe('createResourceFromOptsAndEnv', async () => {
    // Helper to make it a one-liner to get attributes from resource detectors.
    const attrsFromDetectors = async (
      detectors: ResourceDetector | ResourceDetector[]
    ) => {
      const res = detectResources({
        detectors: Array.isArray(detectors) ? detectors : [detectors],
      });
      await res.waitForAsyncAttributes?.();
      return res.attributes;
    };

    const SDK_VERSION =
      require('@opentelemetry/resources/package.json').version;
    const defaultResourceAttrs = {
      'service.name': 'unknown_service:node',
      'telemetry.sdk.language': 'nodejs',
      'telemetry.sdk.name': 'opentelemetry',
      'telemetry.sdk.version': SDK_VERSION,
    };
    const defaultDetectors = [
      serviceInstanceIdDetector,
      hostDetector,
      osDetector,
      processDetector,
    ];

    it('no opts or env -> default resource detectors', async function () {
      const resource = createResourceFromOptsAndEnv(undefined);
      await resource.waitForAsyncAttributes?.();
      assert.deepEqual(resource.attributes, {
        ...defaultResourceAttrs,
        ...(await attrsFromDetectors(defaultDetectors)),
      });
    });

    it('opts.baseResource=emptyResource() removes defaultResource attrs', async function () {
      const resource = createResourceFromOptsAndEnv({
        baseResource: emptyResource(),
      });
      await resource.waitForAsyncAttributes?.();
      assert.deepEqual(resource.attributes, {
        ...(await attrsFromDetectors(defaultDetectors)),
      });
    });

    it('opts.baseResource && no detectors to get empty resource', async function () {
      const resource = createResourceFromOptsAndEnv({
        resourceDetectors: [],
        baseResource: emptyResource(),
      });
      await resource.waitForAsyncAttributes?.();
      assert.deepEqual(resource.attributes, {});
    });

    it('opts.resourceDetectors', async function () {
      const resource = createResourceFromOptsAndEnv({
        resourceDetectors: [hostDetector, osDetector],
      });
      await resource.waitForAsyncAttributes?.();
      assert.deepEqual(resource.attributes, {
        ...defaultResourceAttrs,
        ...(await attrsFromDetectors(hostDetector)),
        ...(await attrsFromDetectors(osDetector)),
      });
    });

    it('opts.resourceDetectors wins over OTEL_NODE_RESOURCE_DETECTORS', async function () {
      process.env.OTEL_NODE_RESOURCE_DETECTORS = 'process';
      const resource = createResourceFromOptsAndEnv({
        resourceDetectors: [serviceInstanceIdDetector],
      });
      await resource.waitForAsyncAttributes?.();
      assert.deepEqual(resource.attributes, {
        ...defaultResourceAttrs,
        ...(await attrsFromDetectors(serviceInstanceIdDetector)),
      });
    });

    it('OTEL_NODE_RESOURCE_DETECTORS', async function () {
      process.env.OTEL_NODE_RESOURCE_DETECTORS = 'process,service';
      const resource = createResourceFromOptsAndEnv();
      await resource.waitForAsyncAttributes?.();
      assert.deepEqual(resource.attributes, {
        ...defaultResourceAttrs,
        ...(await attrsFromDetectors(processDetector)),
        ...(await attrsFromDetectors(serviceInstanceIdDetector)),
      });
    });

    it('none in OTEL_NODE_RESOURCE_DETECTORS', async function () {
      process.env.OTEL_NODE_RESOURCE_DETECTORS = 'process,service,none';
      const resource = createResourceFromOptsAndEnv();
      await resource.waitForAsyncAttributes?.();
      assert.deepEqual(resource.attributes, {
        ...defaultResourceAttrs,
      });
    });

    it('OTEL_NODE_RESOURCE_DETECTORS=all', async function () {
      process.env.OTEL_NODE_RESOURCE_DETECTORS = 'all';
      const resource = createResourceFromOptsAndEnv();
      await resource.waitForAsyncAttributes?.();
      assert.deepEqual(resource.attributes, {
        ...defaultResourceAttrs,
        ...(await attrsFromDetectors([
          hostDetector,
          osDetector,
          processDetector,
          serviceInstanceIdDetector,
        ])),
      });
    });

    it('OTEL_NODE_RESOURCE_DETECTORS=host does host.* and os.* attrs', async function () {
      process.env.OTEL_NODE_RESOURCE_DETECTORS = 'host';
      const resource = createResourceFromOptsAndEnv();
      await resource.waitForAsyncAttributes?.();
      assert.deepEqual(resource.attributes, {
        ...defaultResourceAttrs,
        ...(await attrsFromDetectors([hostDetector, osDetector])),
      });
    });

    it('OTEL_NODE_RESOURCE_DETECTORS=service reads OTEL_SERVICE_NAME', async function () {
      process.env.OTEL_SERVICE_NAME = 'my-svc-from-envvar';
      process.env.OTEL_NODE_RESOURCE_DETECTORS = 'service';
      const resource = createResourceFromOptsAndEnv();
      await resource.waitForAsyncAttributes?.();
      assert.deepEqual(resource.attributes, {
        ...defaultResourceAttrs,
        ...(await attrsFromDetectors(serviceInstanceIdDetector)),
        // XXX ATTR_
        'service.name': 'my-svc-from-envvar',
      });
    });

    it('OTEL_NODE_RESOURCE_DETECTORS=env warns', async function () {
      process.env.OTEL_NODE_RESOURCE_DETECTORS = 'env';
      const resource = createResourceFromOptsAndEnv();
      await resource.waitForAsyncAttributes?.();
      sinon.assert.calledOnceWithMatch(
        diagWarnSpy,
        '"env" resource detector name is no longer supported, `OTEL_RESOURCE_ATTRIBUTES` is always read, use "service" to handle reading `OTEL_SERVICE_NAME` (see https://opentelemetry.io/docs/specs/otel/resource/sdk/#resource-detector-name)'
      );
      assert.deepEqual(resource.attributes, {
        ...defaultResourceAttrs,
      });
    });

    it('OTEL_NODE_RESOURCE_DETECTORS=os warns', async function () {
      process.env.OTEL_NODE_RESOURCE_DETECTORS = 'os';
      const resource = createResourceFromOptsAndEnv();
      await resource.waitForAsyncAttributes?.();
      sinon.assert.calledOnceWithMatch(
        diagWarnSpy,
        '"os" resource detector name is no longer supported, use "host" which populates \'host.*\' and \'os.*\' resource attributes (see https://opentelemetry.io/docs/specs/otel/resource/sdk/#resource-detector-name)'
      );
      assert.deepEqual(resource.attributes, {
        ...defaultResourceAttrs,
      });
    });

    it('OTEL_NODE_RESOURCE_DETECTORS=serviceinstance warns', async function () {
      process.env.OTEL_NODE_RESOURCE_DETECTORS = 'serviceinstance';
      const resource = createResourceFromOptsAndEnv();
      await resource.waitForAsyncAttributes?.();
      sinon.assert.calledOnceWithMatch(
        diagWarnSpy,
        '"serviceinstance" resource detector name is no longer supported, use "service" which populates \'service.instance.id\' and reads OTEL_SERVICE_NAME (see https://opentelemetry.io/docs/specs/otel/resource/sdk/#resource-detector-name)'
      );
      assert.deepEqual(resource.attributes, {
        ...defaultResourceAttrs,
      });
    });

    it('unknown name in OTEL_NODE_RESOURCE_DETECTORS warns', async function () {
      process.env.OTEL_NODE_RESOURCE_DETECTORS =
        'process,some_unknown_detector';
      const resource = createResourceFromOptsAndEnv();
      await resource.waitForAsyncAttributes?.();
      sinon.assert.calledOnceWithMatch(
        diagWarnSpy,
        'unknown resource detector "some_unknown_detector" in OTEL_NODE_RESOURCE_DETECTORS environment variable: this detector will be skipped'
      );
      assert.deepEqual(resource.attributes, {
        ...defaultResourceAttrs,
        ...(await attrsFromDetectors(processDetector)),
      });
    });

    it('OTEL_RESOURCE_ATTRIBUTES', async function () {
      process.env.OTEL_RESOURCE_ATTRIBUTES = 'foo=bar,breakfast=ham%2C eggs';
      const resource = createResourceFromOptsAndEnv();
      await resource.waitForAsyncAttributes?.();
      assert.deepEqual(resource.attributes, {
        ...defaultResourceAttrs,
        ...(await attrsFromDetectors(defaultDetectors)),
        foo: 'bar',
        breakfast: 'ham, eggs',
      });
    });

    it('opts.resourceAttributes', async function () {
      const resource = createResourceFromOptsAndEnv({
        resourceAttributes: { foo: 'bar' },
      });
      await resource.waitForAsyncAttributes?.();
      assert.deepEqual(resource.attributes, {
        ...defaultResourceAttrs,
        ...(await attrsFromDetectors(defaultDetectors)),
        foo: 'bar',
      });
    });

    it('priority: opts.resourceAttributes > OTEL_RESOURCE_ATTRIBUTES > detector > baseResource', async function () {
      process.env.OTEL_RESOURCE_ATTRIBUTES = 'winner=OTEL_RESOURCE_ATTRIBUTES';
      const winnerDetector = {
        detect: () => {
          return { attributes: { winner: 'winnerDetector ' } };
        },
      };
      const resource = createResourceFromOptsAndEnv({
        resourceAttributes: { winner: 'opts.resourceAttributes' },
        resourceDetectors: [winnerDetector],
        baseResource: resourceFromAttributes({ winner: 'opts.baseResource' }),
      });
      await resource.waitForAsyncAttributes?.();
      assert.deepEqual(resource.attributes, {
        winner: 'opts.resourceAttributes',
      });
    });

    it('service.name priority: OTEL_SERVICE_NAME > OTEL_RESOURCE_ATTRIBUTES (if service detector being used)', async function () {
      process.env.OTEL_SERVICE_NAME = 'svc-from-OTEL_SERVICE_NAME';
      process.env.OTEL_RESOURCE_ATTRIBUTES =
        'service.name=svc-from-OTEL_RESOURCE_ATTRIBUTES';
      const resource = createResourceFromOptsAndEnv();
      await resource.waitForAsyncAttributes?.();
      assert.deepEqual(resource.attributes, {
        ...defaultResourceAttrs,
        ...(await attrsFromDetectors(defaultDetectors)),
        'service.name': 'svc-from-OTEL_SERVICE_NAME',
      });
    });
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
