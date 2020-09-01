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

  NoopMeterProvider, NoopTextMapPropagator,

  NoopTracerProvider,
  propagation,

  ProxyTracerProvider, trace
} from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { NoopContextManager } from '@opentelemetry/context-base';
import { CompositePropagator } from '@opentelemetry/core';
import { ConsoleMetricExporter, MeterProvider } from '@opentelemetry/metrics';
import { NodeTracerProvider } from '@opentelemetry/node';
import * as NodeConfig from '@opentelemetry/node/build/src/config';
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor
} from '@opentelemetry/tracing';
import * as assert from 'assert';
import * as nock from 'nock';
import * as Sinon from 'sinon';
import { NodeSDK } from '../src';

describe('Node SDK', () => {
  before(() => {
    // Disable attempted load of default plugins
    Sinon.replace(NodeConfig, 'DEFAULT_INSTRUMENTATION_PLUGINS', {});
    nock.disableNetConnect();
  });

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
        propagation['_getGlobalPropagator']() instanceof NoopTextMapPropagator
      );

      const apiTracerProvider = trace.getTracerProvider();
      console.log(apiTracerProvider);
      assert.ok(apiTracerProvider instanceof ProxyTracerProvider);
      assert.ok(apiTracerProvider.getDelegate() instanceof NoopTracerProvider);

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
      const apiTracerProvider = trace.getTracerProvider();
      assert.ok(apiTracerProvider instanceof ProxyTracerProvider);
      assert.ok(apiTracerProvider.getDelegate() instanceof NodeTracerProvider);
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
      const apiTracerProvider = trace.getTracerProvider();
      assert.ok(apiTracerProvider instanceof ProxyTracerProvider);
      assert.ok(apiTracerProvider.getDelegate() instanceof NodeTracerProvider);
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
        propagation['_getGlobalPropagator']() instanceof NoopTextMapPropagator
      );

      const apiTracerProvider = trace.getTracerProvider();
      assert.ok(apiTracerProvider instanceof ProxyTracerProvider);
      assert.ok(apiTracerProvider.getDelegate() instanceof NoopTracerProvider);

      assert.ok(metrics.getMeterProvider() instanceof MeterProvider);
    });
  });
});
