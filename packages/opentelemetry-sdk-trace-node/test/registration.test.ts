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
import { inspect } from 'util';

import {
  context,
  propagation,
  trace,
  ProxyTracerProvider,
} from '@opentelemetry/api';
import {
  AsyncHooksContextManager,
  AsyncLocalStorageContextManager,
} from '@opentelemetry/context-async-hooks';
import { CompositePropagator } from '@opentelemetry/core';
import { NodeTracerProvider } from '../src';
import * as semver from 'semver';

const assertInstanceOf = (actual: object, ExpectedInstance: Function) => {
  assert.ok(
    actual instanceof ExpectedInstance,
    `Expected ${inspect(actual)} to be instance of ${ExpectedInstance.name}`
  );
};

const DefaultContextManager = semver.gte(process.version, '14.8.0')
  ? AsyncLocalStorageContextManager
  : AsyncHooksContextManager;

describe('API registration', () => {
  beforeEach(() => {
    context.disable();
    trace.disable();
    propagation.disable();
  });

  it('should register default implementations', () => {
    const tracerProvider = new NodeTracerProvider();
    tracerProvider.register();

    assertInstanceOf(context['_getContextManager'](), DefaultContextManager);
    assertInstanceOf(
      propagation['_getGlobalPropagator'](), CompositePropagator
    );
    const apiTracerProvider = trace.getTracerProvider() as ProxyTracerProvider;

    assert.ok(apiTracerProvider.getDelegate() === tracerProvider);
  });

  it('should register configured implementations', () => {
    const tracerProvider = new NodeTracerProvider();

    const mockContextManager = { disable() {} } as any;
    const mockPropagator = {} as any;

    tracerProvider.register({
      contextManager: mockContextManager,
      propagator: mockPropagator,
    });

    assert.strictEqual(context['_getContextManager'](), mockContextManager);
    assert.strictEqual(propagation['_getGlobalPropagator'](), mockPropagator);

    const apiTracerProvider = trace.getTracerProvider() as ProxyTracerProvider;
    assert.strictEqual(apiTracerProvider.getDelegate(), tracerProvider);
  });

  it('should skip null context manager', () => {
    const tracerProvider = new NodeTracerProvider();
    const ctxManager = context['_getContextManager']();
    tracerProvider.register({
      contextManager: null,
    });

    assert.strictEqual(context['_getContextManager'](), ctxManager, 'context manager should not change');

    assertInstanceOf(
      propagation['_getGlobalPropagator'](), CompositePropagator
    );

    const apiTracerProvider = trace.getTracerProvider() as ProxyTracerProvider;
    assert.ok(apiTracerProvider.getDelegate() === tracerProvider);
  });

  it('should skip null propagator', () => {
    const propagator = propagation['_getGlobalPropagator']();

    const tracerProvider = new NodeTracerProvider();
    tracerProvider.register({
      propagator: null,
    });

    assert.strictEqual(propagation['_getGlobalPropagator'](), propagator);

    assertInstanceOf(context['_getContextManager'](), DefaultContextManager);

    const apiTracerProvider = trace.getTracerProvider() as ProxyTracerProvider;
    assert.ok(apiTracerProvider.getDelegate() === tracerProvider);
  });
});
