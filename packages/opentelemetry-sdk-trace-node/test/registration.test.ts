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

import * as assert from 'assert';
import * as sinon from 'sinon';
import { inspect } from 'util';

import {
  context,
  propagation,
  trace,
} from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { CompositePropagator } from '@opentelemetry/core';
import { NodeTracerProvider } from '../src';

// Here we are looking for a `AnyConstructor` type, and `Function` is a close
// enough approximation that exists in the standard library.
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const assertInstanceOf = (actual: object, ExpectedConstructor: Function) => {
  assert.ok(
    actual instanceof ExpectedConstructor,
    `Expected ${inspect(actual)} to be instance of ${ExpectedConstructor.name}`
  );
};

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
    const tracerProvider = new NodeTracerProvider();
    tracerProvider.register();

    assertInstanceOf(
      context['_getContextManager'](),
      AsyncLocalStorageContextManager
    );
    assertInstanceOf(
      propagation['_getGlobalPropagator'](),
      CompositePropagator
    );
    assert.strictEqual(setGlobalTracerProviderSpy.callCount, 1);
    assert.ok(setGlobalTracerProviderSpy.lastCall.args[0] === tracerProvider);
  });

  it('should register configured implementations', function () {
    const tracerProvider = new NodeTracerProvider();

    const mockContextManager = {
      enable() {},
      disable() {},
    } as any;
    const mockPropagator = {} as any;

    tracerProvider.register({
      contextManager: mockContextManager,
      propagator: mockPropagator,
    });

    assert.strictEqual(context['_getContextManager'](), mockContextManager);
    assert.strictEqual(propagation['_getGlobalPropagator'](), mockPropagator);

    assert.strictEqual(setGlobalTracerProviderSpy.callCount, 1);
    assert.ok(setGlobalTracerProviderSpy.lastCall.args[0] === tracerProvider);
  });

  it('should skip null context manager', function () {
    const tracerProvider = new NodeTracerProvider();
    const ctxManager = context['_getContextManager']();
    tracerProvider.register({
      contextManager: null,
    });

    assert.strictEqual(
      context['_getContextManager'](),
      ctxManager,
      'context manager should not change'
    );

    assertInstanceOf(
      propagation['_getGlobalPropagator'](),
      CompositePropagator
    );

    assert.strictEqual(setGlobalTracerProviderSpy.callCount, 1);
    assert.ok(setGlobalTracerProviderSpy.lastCall.args[0] === tracerProvider);
  });

  it('should skip null propagator', function () {
    const propagator = propagation['_getGlobalPropagator']();

    const tracerProvider = new NodeTracerProvider();
    tracerProvider.register({
      propagator: null,
    });

    assert.strictEqual(propagation['_getGlobalPropagator'](), propagator);

    assertInstanceOf(
      context['_getContextManager'](),
      AsyncLocalStorageContextManager
    );

    assert.strictEqual(setGlobalTracerProviderSpy.callCount, 1);
    assert.ok(setGlobalTracerProviderSpy.lastCall.args[0] === tracerProvider);
  });
});
