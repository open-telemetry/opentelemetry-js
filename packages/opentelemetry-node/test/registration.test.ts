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
  NoopTextMapPropagator,
  propagation,
  trace,
} from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { NoopContextManager } from '@opentelemetry/context-base';
import { CompositePropagator } from '@opentelemetry/core';
import * as assert from 'assert';
import { NodeTracerProvider } from '../src';

describe('API registration', () => {
  beforeEach(() => {
    context.disable();
    trace.disable();
    propagation.disable();
  });

  it('should register default implementations', () => {
    const tracerProvider = new NodeTracerProvider();
    tracerProvider.register();

    assert.ok(
      context['_getContextManager']() instanceof AsyncHooksContextManager
    );
    assert.ok(
      propagation['_getGlobalPropagator']() instanceof CompositePropagator
    );
    assert.ok(trace.getTracerProvider() === tracerProvider);
  });

  it('should register configured implementations', () => {
    const tracerProvider = new NodeTracerProvider();

    const contextManager = new NoopContextManager();
    const propagator = new NoopTextMapPropagator();

    tracerProvider.register({
      contextManager,
      propagator,
    });

    assert.ok(context['_getContextManager']() === contextManager);
    assert.ok(propagation['_getGlobalPropagator']() === propagator);

    assert.ok(trace.getTracerProvider() === tracerProvider);
  });

  it('should skip null context manager', () => {
    const tracerProvider = new NodeTracerProvider();
    tracerProvider.register({
      contextManager: null,
    });

    assert.ok(context['_getContextManager']() instanceof NoopContextManager);

    assert.ok(
      propagation['_getGlobalPropagator']() instanceof CompositePropagator
    );
    assert.ok(trace.getTracerProvider() === tracerProvider);
  });

  it('should skip null propagator', () => {
    const tracerProvider = new NodeTracerProvider();
    tracerProvider.register({
      propagator: null,
    });

    assert.ok(
      propagation['_getGlobalPropagator']() instanceof NoopTextMapPropagator
    );

    assert.ok(
      context['_getContextManager']() instanceof AsyncHooksContextManager
    );
    assert.ok(trace.getTracerProvider() === tracerProvider);
  });
});
