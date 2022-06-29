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
  DiagLogLevel,
} from '@opentelemetry/api';
import { metrics, NoopMeterProvider } from '@opentelemetry/api-metrics';
import {
  AsyncHooksContextManager,
  AsyncLocalStorageContextManager,
} from '@opentelemetry/context-async-hooks';
import { CompositePropagator } from '@opentelemetry/core';
import { ConsoleMetricExporter, MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import {
  assertServiceResource,
} from './util/resource-assertions';
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import * as assert from 'assert';
import * as semver from 'semver';
import * as Sinon from 'sinon';
import { NodeSDK } from '../src';
import { envDetector, processDetector } from '@opentelemetry/resources';


const DefaultContextManager = semver.gte(process.version, '14.8.0')
  ? AsyncLocalStorageContextManager
  : AsyncHooksContextManager;

describe('Node SDK', () => {
  let ctxManager: any;
  let propagator: any;
  let delegate: any;

  beforeEach(() => {
    context.disable();
    trace.disable();
    propagation.disable();
    metrics.disable();

    ctxManager = context['_getContextManager']();
    propagator = propagation['_getGlobalPropagator']();
    delegate = (trace.getTracerProvider() as ProxyTracerProvider).getDelegate();
  });

  describe('Basic Registration', () => {
    it('should not register any unconfigured SDK components', async () => {
      const sdk = new NodeSDK({
        autoDetectResources: false,
      });

      await sdk.start();

      assert.strictEqual(context['_getContextManager'](), ctxManager, 'context manager should not change');
      assert.strictEqual(propagation['_getGlobalPropagator'](), propagator, 'propagator should not change');
      assert.strictEqual((trace.getTracerProvider() as ProxyTracerProvider).getDelegate(), delegate, 'tracer provider should not have changed');

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
        context['_getContextManager']().constructor.name === DefaultContextManager.name
      );
      assert.ok(
        propagation['_getGlobalPropagator']() instanceof CompositePropagator
      );
      const apiTracerProvider = trace.getTracerProvider() as ProxyTracerProvider;
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
        context['_getContextManager']().constructor.name === DefaultContextManager.name
      );
      assert.ok(
        propagation['_getGlobalPropagator']() instanceof CompositePropagator
      );
      const apiTracerProvider = trace.getTracerProvider() as ProxyTracerProvider;
      assert.ok(apiTracerProvider.getDelegate() instanceof NodeTracerProvider);
    });

    it('should register a meter provider if a reader is provided', async () => {
      const exporter = new ConsoleMetricExporter();
      const metricReader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: 100,
        exportTimeoutMillis: 100
      });

      const sdk = new NodeSDK({
        metricReader: metricReader,
        autoDetectResources: false,
      });

      await sdk.start();

      assert.strictEqual(context['_getContextManager'](), ctxManager, 'context manager should not change');
      assert.strictEqual(propagation['_getGlobalPropagator'](), propagator, 'propagator should not change');
      assert.strictEqual((trace.getTracerProvider() as ProxyTracerProvider).getDelegate(), delegate, 'tracer provider should not have changed');

      assert.ok(metrics.getMeterProvider() instanceof MeterProvider);

      await sdk.shutdown();
    });
  });

  describe('detectResources', async () => {
    beforeEach(() => {
      process.env.OTEL_RESOURCE_ATTRIBUTES =
        'service.instance.id=627cc493,service.name=my-service,service.namespace=default,service.version=0.0.1';
    });

    afterEach(() => {
      delete process.env.OTEL_RESOURCE_ATTRIBUTES;
    });

    describe('with a buggy detector', () => {
      it('returns a merged resource', async () => {
        const sdk = new NodeSDK({
          autoDetectResources: true,
        });
        await sdk.detectResources({
          detectors: [ processDetector, {
            detect() {
              throw new Error('Buggy detector');
            }
          },
          envDetector ]
        });
        const resource = sdk['_resource'];

        assertServiceResource(resource, {
          instanceId: '627cc493',
          name: 'my-service',
          namespace: 'default',
          version: '0.0.1',
        });
      });
    });

    describe('with a debug logger', () => {
      // Local functions to test if a mocked method is ever called with a specific argument or regex matching for an argument.
      // Needed because of race condition with parallel detectors.
      const callArgsContains = (
        mockedFunction: sinon.SinonSpy,
        arg: any
      ): boolean => {
        return mockedFunction.getCalls().some(call => {
          return call.args.some(callarg => arg === callarg);
        });
      };
      const callArgsMatches = (
        mockedFunction: sinon.SinonSpy,
        regex: RegExp
      ): boolean => {
        return mockedFunction.getCalls().some(call => {
          return call.args.some(callArgs => regex.test(callArgs.toString()));
        });
      };

      it('prints detected resources and debug messages to the logger', async () => {
        const sdk = new NodeSDK({
          autoDetectResources: true,
        });

        // This test depends on the env detector to be functioning as intended
        const mockedLoggerMethod = Sinon.fake();
        const mockedVerboseLoggerMethod = Sinon.fake();
        diag.setLogger(
          {
            debug: mockedLoggerMethod,
            verbose: mockedVerboseLoggerMethod,
          } as any,
          DiagLogLevel.VERBOSE
        );

        await sdk.detectResources();

        // Test that the Env Detector successfully found its resource and populated it with the right values.
        assert.ok(
          callArgsContains(mockedLoggerMethod, 'EnvDetector found resource.')
        );
        // Regex formatting accounts for whitespace variations in util.inspect output over different node versions
        assert.ok(
          callArgsMatches(
            mockedVerboseLoggerMethod,
            /{\s+'service\.instance\.id':\s+'627cc493',\s+'service\.name':\s+'my-service',\s+'service\.namespace':\s+'default',\s+'service\.version':\s+'0\.0\.1'\s+}\s*/
          )
        );
      });

      describe('with a faulty environment variable', () => {
        beforeEach(() => {
          process.env.OTEL_RESOURCE_ATTRIBUTES = 'bad=~attribute';
        });

        it('prints correct error messages when EnvDetector has an invalid variable', async () => {
          const sdk = new NodeSDK({
            autoDetectResources: true,
          });
          const mockedLoggerMethod = Sinon.fake();
          diag.setLogger(
            {
              debug: mockedLoggerMethod,
            } as any,
            DiagLogLevel.DEBUG
          );

          await sdk.detectResources();

          assert.ok(
            callArgsContains(
              mockedLoggerMethod,
              'EnvDetector failed: Attribute value should be a ASCII string with a length not exceed 255 characters.'
            )
          );
        });
      });
    });
  });

  describe('configureServiceName', async () => {
    it('should configure service name via config', async () => {
      const sdk = new NodeSDK({
        serviceName: 'config-set-name',
      });

      await sdk.start();
      const resource = sdk['_resource'];

      assertServiceResource(resource, {
        name: 'config-set-name',
      });
    });

    it('should configure service name via OTEL_SERVICE_NAME env var', async () => {
      process.env.OTEL_SERVICE_NAME='env-set-name';
      const sdk = new NodeSDK();

      await sdk.start();
      const resource = sdk['_resource'];

      assertServiceResource(resource, {
        name: 'env-set-name',
      });
      delete process.env.OTEL_SERVICE_NAME;
    });

    it('should favor config set service name over OTEL_SERVICE_NAME env set service name', async () => {
      process.env.OTEL_SERVICE_NAME='env-set-name';
      const sdk = new NodeSDK({
        serviceName: 'config-set-name',
      });

      await sdk.start();
      const resource = sdk['_resource'];

      assertServiceResource(resource, {
        name: 'config-set-name',
      });
      delete process.env.OTEL_SERVICE_NAME;
    });


    it('should configure service name via OTEL_RESOURCE_ATTRIBUTES env var', async () => {
      process.env.OTEL_RESOURCE_ATTRIBUTES = 'service.name=resource-env-set-name';
      const sdk = new NodeSDK();

      await sdk.start();
      const resource = sdk['_resource'];

      assertServiceResource(resource, {
        name: 'resource-env-set-name',
      });
      delete process.env.OTEL_RESOURCE_ATTRIBUTES;
    });

    it('should favor config set service name over OTEL_RESOURCE_ATTRIBUTES env set service name', async () => {
      process.env.OTEL_RESOURCE_ATTRIBUTES = 'service.name=resource-env-set-name';
      const sdk = new NodeSDK({
        serviceName: 'config-set-name',
      });

      await sdk.start();
      const resource = sdk['_resource'];

      assertServiceResource(resource, {
        name: 'config-set-name',
      });
      delete process.env.OTEL_RESOURCE_ATTRIBUTES;
    });
  });
});
