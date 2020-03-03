/*!
 * Copyright 2020, OpenTelemetry Authors
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
  NoopHttpTextFormat,
  NoopTracerProvider,
  propagation,
  trace,
} from '@opentelemetry/api';
import { HttpTraceContext } from '@opentelemetry/core';
import { ZoneScopeManager } from '@opentelemetry/scope-zone';
import { NoopScopeManager } from '@opentelemetry/scope-base';
import * as assert from 'assert';
import { WebTracerProvider } from '../src';

describe('API registration', () => {
  beforeEach(() => {
    context.initGlobalContextManager(new NoopScopeManager());
    propagation.initGlobalPropagator(new NoopHttpTextFormat());
    trace.initGlobalTracerProvider(new NoopTracerProvider());
  });

  it('should register default implementations', () => {
    const tracerProvider = new WebTracerProvider();
    tracerProvider.register();

    assert.ok(context['_scopeManager'] instanceof ZoneScopeManager);
    assert.ok(propagation['_propagator'] instanceof HttpTraceContext);
    assert.ok(trace['_tracerProvider'] === tracerProvider);
  });

  it('should register configured implementations', () => {
    const tracerProvider = new WebTracerProvider();

    const contextManager = new NoopScopeManager();
    const propagator = new NoopHttpTextFormat();

    tracerProvider.register({
      contextManager,
      propagator,
    });

    assert.ok(context['_scopeManager'] === contextManager);
    assert.ok(propagation['_propagator'] === propagator);

    assert.ok(trace['_tracerProvider'] === tracerProvider);
  });

  it('should skip null context manager', () => {
    const tracerProvider = new WebTracerProvider();
    tracerProvider.register({
      contextManager: null,
    });

    assert.ok(context['_scopeManager'] instanceof NoopScopeManager);

    assert.ok(propagation['_propagator'] instanceof HttpTraceContext);
    assert.ok(trace['_tracerProvider'] === tracerProvider);
  });

  it('should skip null propagator', () => {
    const tracerProvider = new WebTracerProvider();
    tracerProvider.register({
      propagator: null,
    });

    assert.ok(propagation['_propagator'] instanceof NoopHttpTextFormat);

    assert.ok(context['_scopeManager'] instanceof ZoneScopeManager);
    assert.ok(trace['_tracerProvider'] === tracerProvider);
  });
});
