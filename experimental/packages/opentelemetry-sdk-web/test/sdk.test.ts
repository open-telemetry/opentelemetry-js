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
  ProxyTracerProvider,
  trace,
  diag,
} from '@opentelemetry/api';
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  BatchSpanProcessor,
  NoopSpanProcessor,
  IdGenerator,
} from '@opentelemetry/sdk-trace-base';
import * as assert from 'assert';
import * as Sinon from 'sinon';
import { WebSDK } from '../src';
import {
  StackContextManager,
  WebTracerProvider,
} from '@opentelemetry/sdk-trace-web';
import { Resource } from '@opentelemetry/resources';
import {
  SEMRESATTRS_PROCESS_RUNTIME_DESCRIPTION,
  SEMRESATTRS_PROCESS_RUNTIME_NAME,
  SEMRESATTRS_PROCESS_RUNTIME_VERSION,
  SEMRESATTRS_SERVICE_NAME,
} from '@opentelemetry/semantic-conventions';
import sinon = require('sinon');

describe('Web SDK', () => {
  let ctxManager: any;
  let propagator: any;
  let delegate: any;

  beforeEach(() => {
    diag.disable();
    context.disable();
    trace.disable();
    propagation.disable();

    ctxManager = context['_getContextManager']();
    propagator = propagation['_getGlobalPropagator']();
    delegate = (trace.getTracerProvider() as ProxyTracerProvider).getDelegate();
  });

  afterEach(() => {
    Sinon.restore();
  });

  describe('Basic Registration', () => {
    it('should not set global traceprovider if not configured', async () => {
      const sdk = new WebSDK({
        autoDetectResources: false,
      });

      sdk.start();

      assert.strictEqual(
        (trace.getTracerProvider() as ProxyTracerProvider).getDelegate(),
        delegate,
        'tracer provider should not have changed'
      );

      await sdk.shutdown();
    });

    it('should register a tracer provider if an exporter is provided', async () => {
      const sdk = new WebSDK({
        traceExporter: new ConsoleSpanExporter(),
        autoDetectResources: false,
      });

      sdk.start();

      const apiTracerProvider =
        trace.getTracerProvider() as ProxyTracerProvider;
      assert.ok(apiTracerProvider.getDelegate() instanceof WebTracerProvider);

      await sdk.shutdown();
    });

    it('should register a tracer provider if span processors are provided', async () => {
      const exporter = new ConsoleSpanExporter();

      const sdk = new WebSDK({
        spanProcessors: [
          new NoopSpanProcessor(),
          new SimpleSpanProcessor(exporter),
          new BatchSpanProcessor(exporter),
        ],
        autoDetectResources: false,
      });

      sdk.start();

      const apiTracerProvider =
        trace.getTracerProvider() as ProxyTracerProvider;
      assert.ok(apiTracerProvider.getDelegate() instanceof WebTracerProvider);

      const listOfProcessors =
        sdk['_tracerProvider']!['_registeredSpanProcessors']!;

      assert(sdk['_tracerProvider'] instanceof WebTracerProvider);
      assert(listOfProcessors.length === 3);
      assert(listOfProcessors[0] instanceof NoopSpanProcessor);
      assert(listOfProcessors[1] instanceof SimpleSpanProcessor);
      assert(listOfProcessors[2] instanceof BatchSpanProcessor);

      await sdk.shutdown();
    });

    it('sets global context manager to StackContextManager by default', async () => {
      const sdk = new WebSDK({
        traceExporter: new ConsoleSpanExporter(),
        autoDetectResources: false,
      });

      sdk.start();

      assert.notEqual(
        context['_getContextManager'](),
        ctxManager,
        'global context manager should be updated'
      );

      assert.ok(context['_getContextManager']() instanceof StackContextManager);

      await sdk.shutdown();
    });

    it('sets global propagator to W3C trace context and baggage', async () => {
      const sdk = new WebSDK({
        traceExporter: new ConsoleSpanExporter(),
        autoDetectResources: false,
      });

      sdk.start();

      assert.notEqual(
        propagation['_getGlobalPropagator'](),
        propagator,
        'propagator should not change'
      );

      const globalPropagator = propagation['_getGlobalPropagator']();
      assert.deepStrictEqual(globalPropagator.fields(), [
        'traceparent',
        'tracestate',
        'baggage',
      ]);

      await sdk.shutdown();
    });
  });

  describe('detectResources', async () => {
    afterEach(() => {
      sinon.restore();
    });

    describe('default resource detectors', () => {
      it('default detectors populate values properly', async () => {
        sinon.stub(globalThis, 'navigator').value({
          userAgent: 'abcd',
          language: 'en-US',
          userAgentData: {
            platform: 'platform',
            brands: [
              {
                brand: 'Chromium',
                version: '106',
              },
              {
                brand: 'Google Chrome',
                version: '106',
              },
              {
                brand: 'Not;A=Brand',
                version: '99',
              },
            ],
            mobile: false,
          },
        });

        const sdk = new WebSDK();
        sdk.start();
        const resource = sdk['_resource'];
        await resource.waitForAsyncAttributes?.();

        assert.deepStrictEqual(resource.attributes, {
          [SEMRESATTRS_PROCESS_RUNTIME_NAME]: 'browser',
          [SEMRESATTRS_PROCESS_RUNTIME_DESCRIPTION]: 'Web Browser',
          [SEMRESATTRS_PROCESS_RUNTIME_VERSION]: 'abcd',
          'browser.platform': 'platform',
          'browser.brands': [
            'Chromium 106',
            'Google Chrome 106',
            'Not;A=Brand 99',
          ],
          'browser.mobile': false,
          'browser.language': 'en-US',
        });
      });
    });

    describe('with a custom resource', () => {
      it('returns a merged resource', async () => {
        const sdk = new WebSDK({
          autoDetectResources: true,
          resource: new Resource({ someAttr1: 'someValue1' }),
          resourceDetectors: [
            {
              async detect(): Promise<Resource> {
                return new Resource({ someAttr2: 'someValue2' });
              },
            },
            {
              async detect(): Promise<Resource> {
                return new Resource({ someAttr3: 'someValue3' });
              },
            },
          ],
        });

        sdk.start();

        const resource = sdk['_resource'];
        await resource.waitForAsyncAttributes?.();
        assert.deepStrictEqual(resource.attributes, {
          someAttr1: 'someValue1',
          someAttr2: 'someValue2',
          someAttr3: 'someValue3',
        });

        await sdk.shutdown();
      });
    });

    describe('with a buggy detector', () => {
      it('returns a merged resource', async () => {
        sinon.stub(globalThis, 'navigator').value({
          userAgent: 'abcd',
        });

        const sdk = new WebSDK({
          autoDetectResources: true,
          resourceDetectors: [
            {
              async detect(): Promise<Resource> {
                return new Resource({ someAttr: 'someValue' });
              },
            },
            {
              detect() {
                throw new Error('Buggy detector');
              },
            },
          ],
        });

        sdk.start();
        const resource = sdk['_resource'];
        await resource.waitForAsyncAttributes?.();

        assert.deepStrictEqual(resource.attributes, {
          someAttr: 'someValue',
        });

        await sdk.shutdown();
      });
    });
  });

  describe('configureServiceName', async () => {
    it('should configure service name via config', async () => {
      const sdk = new WebSDK({
        serviceName: 'config-set-name',
      });

      sdk.start();
      const resource = sdk['_resource'];

      assert.deepStrictEqual(resource.attributes, {
        [SEMRESATTRS_SERVICE_NAME]: 'config-set-name',
      });

      await sdk.shutdown();
    });
  });

  describe('configure IdGenerator', async () => {
    class CustomIdGenerator implements IdGenerator {
      generateTraceId(): string {
        return 'constant-test-trace-id';
      }
      generateSpanId(): string {
        return 'constant-test-span-id';
      }
    }

    it('should configure IdGenerator via config', async () => {
      const idGenerator = new CustomIdGenerator();
      const spanProcessors = [
        new SimpleSpanProcessor(new ConsoleSpanExporter()),
      ];
      const sdk = new WebSDK({
        idGenerator,
        spanProcessors,
      });
      sdk.start();

      const span = trace.getTracer('test').startSpan('testName');
      span.end();

      assert.strictEqual(span.spanContext().spanId, 'constant-test-span-id');
      assert.strictEqual(span.spanContext().traceId, 'constant-test-trace-id');
      await sdk.shutdown();
    });
  });
});
