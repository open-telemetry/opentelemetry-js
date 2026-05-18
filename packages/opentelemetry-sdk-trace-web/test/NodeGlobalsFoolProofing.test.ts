/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { context, propagation, trace } from '@opentelemetry/api';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { StackContextManager, WebTracerProvider } from '../src';
import { resourceFromAttributes } from '@opentelemetry/resources';

describe('Node Globals Foolproofing', function () {
  const originalProcess = globalThis?.process;
  let setGlobalTracerProviderSpy: sinon.SinonSpy;

  before(() => {
    Object.assign(globalThis, { process: false });
  });

  after(() => {
    Object.assign(globalThis, { process: originalProcess });
  });

  beforeEach(() => {
    context.disable();
    trace.disable();
    propagation.disable();
    setGlobalTracerProviderSpy = sinon.spy(trace, 'setGlobalTracerProvider');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Can get TraceProvider without node globals such as process', function () {
    const propagator = propagation['_getGlobalPropagator']();
    const tracerProvider = new WebTracerProvider();
    tracerProvider.register({
      propagator: null,
    });

    assert.strictEqual(
      propagation['_getGlobalPropagator'](),
      propagator,
      'propagator should not change'
    );

    assert.ok(context['_getContextManager']() instanceof StackContextManager);
    sinon.assert.calledOnceWithMatch(
      setGlobalTracerProviderSpy,
      (provider: any) => provider === tracerProvider
    );
  });

  it('Can get TraceProvider with custom id generator and without node globals such as process', function () {
    const getRandomString = (length: number) => {
      const alphanumericsList = 'abcdefghijklmnopqrstuvwxyz0123456789'.split(
        ''
      );
      alphanumericsList.sort(() => 0.5 - Math.random());

      return alphanumericsList.slice(0, length).join('');
    };

    const tracer = new WebTracerProvider({
      resource: resourceFromAttributes({
        'service.name': 'web-core',
      }),
      idGenerator: {
        generateTraceId: () => getRandomString(32),
        generateSpanId: () => getRandomString(16),
      },
    }).getTracer('default');
    assert.ok(tracer);
  });
});
