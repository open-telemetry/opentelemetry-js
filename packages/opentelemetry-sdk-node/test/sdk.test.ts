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
  metrics,
  NoopHttpTextPropagator,
  NoopMeterProvider,
  NoopTracerProvider,
  propagation,
  trace,
} from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { NoopContextManager } from '@opentelemetry/context-base';
import { CompositePropagator } from '@opentelemetry/core';
import { ConsoleMetricExporter, MeterProvider } from '@opentelemetry/metrics';
import { NodeTracerProvider } from '@opentelemetry/node';
import {
  ConsoleSpanExporter,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/tracing';
import * as assert from 'assert';
import { api, NodeSDK, tracing } from '../src';

describe('Node SDK', () => {
  beforeEach(() => {
    context.disable();
    trace.disable();
    propagation.disable();
    metrics.disable();
  });

  describe('Basic Registration', () => {
    it('should not register any unconfigured SDK components', async () => {
      const sdk = new NodeSDK({
        autoDetectResources: false,
      });

      await sdk.start();

      assert.ok(context['_getContextManager']() instanceof NoopContextManager);
      assert.ok(
        propagation['_getGlobalPropagator']() instanceof NoopHttpTextPropagator
      );

      assert.ok(trace.getTracerProvider() instanceof NoopTracerProvider);
      assert.ok(metrics.getMeterProvider() instanceof NoopMeterProvider);
    });

    it('should register a tracer provider if an exporter is provided', async () => {
      const sdk = new NodeSDK({
        traceExporter: new ConsoleSpanExporter(),
        autoDetectResources: false,
      });

      await sdk.start();

      assert.ok(metrics.getMeterProvider() instanceof NoopMeterProvider);

      assert.ok(
        context['_getContextManager']() instanceof AsyncHooksContextManager
      );
      assert.ok(
        propagation['_getGlobalPropagator']() instanceof CompositePropagator
      );
      assert.ok(trace.getTracerProvider() instanceof NodeTracerProvider);
    });

    it('should register a tracer provider if a span processor is provided', async () => {
      const exporter = new ConsoleSpanExporter();
      const spanProcessor = new SimpleSpanProcessor(exporter);

      const sdk = new NodeSDK({
        spanProcessor,
        autoDetectResources: false,
      });

      await sdk.start();

      assert.ok(metrics.getMeterProvider() instanceof NoopMeterProvider);

      assert.ok(
        context['_getContextManager']() instanceof AsyncHooksContextManager
      );
      assert.ok(
        propagation['_getGlobalPropagator']() instanceof CompositePropagator
      );
      assert.ok(trace.getTracerProvider() instanceof NodeTracerProvider);
    });

    it('should register a meter provider if an exporter is provided', async () => {
      const exporter = new ConsoleMetricExporter();

      const sdk = new NodeSDK({
        metricExporter: exporter,
        autoDetectResources: false,
      });

      await sdk.start();

      assert.ok(context['_getContextManager']() instanceof NoopContextManager);
      assert.ok(
        propagation['_getGlobalPropagator']() instanceof NoopHttpTextPropagator
      );

      assert.ok(trace.getTracerProvider() instanceof NoopTracerProvider);

      assert.ok(metrics.getMeterProvider() instanceof MeterProvider);
    });

    describe('Tracing Options', () => {
      let traceExporter: InMemorySpanExporter;
      let spanProcessor: SimpleSpanProcessor;

      beforeEach(() => {
        traceExporter = new InMemorySpanExporter();
        spanProcessor = new SimpleSpanProcessor(traceExporter);
      });

      afterEach(() => {
        traceExporter.reset();
      });

      it('should apply global attributes to every span', async () => {
        const sdk = new NodeSDK({
          spanProcessor,
          defaultAttributes: {
            'default.attribute': 'test',
          },
          autoDetectResources: false,
        });

        await sdk.start();
        const tracer = api.trace.getTracer('test');

        assert(tracer instanceof tracing.Tracer);

        const provider = tracer['_tracerProvider'];

        assert(provider instanceof NodeTracerProvider);

        const span = api.trace.getTracer('test').startSpan('test');

        assert(span instanceof tracing.Span);
        assert.strictEqual(span.attributes['default.attribute'], 'test');
      });
    });
  });
});
