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
  ProxyTracerProvider,
} from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import { Tracer } from '@opentelemetry/sdk-trace-base';
import * as assert from 'assert';
import { StackContextManager, WebTracerProvider } from '../src';

describe('Node Globals Foolproofing', () => {
  const originalProcess = globalThis?.process;
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
  });

  it('Can get TraceProvider without node globals such as process', () => {
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
    const apiTracerProvider = trace.getTracerProvider() as ProxyTracerProvider;
    assert.ok(apiTracerProvider.getDelegate() === tracerProvider);
  });

  it('Can get TraceProvider with custom id generator and without node globals such as process', () => {
    const getRandomString = (length: number) => {
      const alphanumericsList = 'abcdefghijklmnopqrstuvwxyz0123456789'.split(
        ''
      );
      alphanumericsList.sort(() => 0.5 - Math.random());

      return alphanumericsList.slice(0, length).join('');
    };

    const tracer = new WebTracerProvider({
      resource: new Resource({
        'service.name': 'web-core',
      }),
      idGenerator: {
        generateTraceId: () => getRandomString(32),
        generateSpanId: () => getRandomString(16),
      },
    }).getTracer('default');

    assert.ok(tracer instanceof Tracer);
  });
});
