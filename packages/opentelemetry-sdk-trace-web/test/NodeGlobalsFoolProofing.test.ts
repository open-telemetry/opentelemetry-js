/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
    assert.strictEqual(setGlobalTracerProviderSpy.callCount, 1);
    assert.ok(setGlobalTracerProviderSpy.lastCall.args[0] === tracerProvider);
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
