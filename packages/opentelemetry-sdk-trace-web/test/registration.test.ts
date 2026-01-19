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

import {
  context,
  propagation,
  trace,
} from '@opentelemetry/api';
import { CompositePropagator } from '@opentelemetry/core';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { StackContextManager, WebTracerProvider } from '../src';

describe('API registration', function () {
  let setGlobalTracerProviderSpy: sinon.SinonSpy;

  beforeEach(() => {
    context.disable();
    trace.disable();
    propagation.disable();
    setGlobalTracerProviderSpy = sinon.spy(trace, 'setGlobalTracerProvider');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should register default implementations', function () {
    const tracerProvider = new WebTracerProvider();
    tracerProvider.register();

    assert.ok(context['_getContextManager']() instanceof StackContextManager);
    assert.ok(
      propagation['_getGlobalPropagator']() instanceof CompositePropagator
    );
    assert.strictEqual(setGlobalTracerProviderSpy.callCount, 1);
    assert.ok(setGlobalTracerProviderSpy.lastCall.args[0] === tracerProvider);
  });

  it('should register configured implementations', function () {
    const tracerProvider = new WebTracerProvider();

    const contextManager = { disable() {}, enable() {} } as any;
    const propagator = {} as any;

    tracerProvider.register({
      contextManager,
      propagator,
    });

    assert.ok(context['_getContextManager']() === contextManager);
    assert.ok(propagation['_getGlobalPropagator']() === propagator);

    assert.strictEqual(setGlobalTracerProviderSpy.callCount, 1);
    assert.ok(setGlobalTracerProviderSpy.lastCall.args[0] === tracerProvider);
  });

  it('should skip null context manager', function () {
    const ctxManager = context['_getContextManager']();
    const tracerProvider = new WebTracerProvider();
    tracerProvider.register({
      contextManager: null,
    });

    assert.strictEqual(
      context['_getContextManager'](),
      ctxManager,
      'context manager should not change'
    );

    assert.ok(
      propagation['_getGlobalPropagator']() instanceof CompositePropagator
    );
    assert.strictEqual(setGlobalTracerProviderSpy.callCount, 1);
    assert.ok(setGlobalTracerProviderSpy.lastCall.args[0] === tracerProvider);
  });

  it('should skip null propagator', function () {
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
});
