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
  metrics,
  DiagConsoleLogger,
} from '@opentelemetry/api';
import {
  AsyncHooksContextManager,
  AsyncLocalStorageContextManager,
} from '@opentelemetry/context-async-hooks';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import {
  AggregationTemporality,
  ConsoleMetricExporter,
  InMemoryMetricExporter,
  InstrumentType,
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter as OTLPGrpcMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPMetricExporter as OTLPProtoMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPMetricExporter as OTLPHttpMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PrometheusExporter as PrometheusMetricExporter } from '@opentelemetry/exporter-prometheus';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import {
  assertServiceInstanceIdIsUUID,
  assertServiceResource,
} from './util/resource-assertions';
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  BatchSpanProcessor,
  NoopSpanProcessor,
  IdGenerator,
  AlwaysOffSampler,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import * as assert from 'assert';
import * as Sinon from 'sinon';
import { NodeSDK } from '../src';
import { env } from 'process';
import {
  envDetector,
  processDetector,
  hostDetector,
  serviceInstanceIdDetector,
  DetectedResource,
  defaultResource,
} from '@opentelemetry/resources';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { logs, ProxyLoggerProvider } from '@opentelemetry/api-logs';
import {
  SimpleLogRecordProcessor,
  InMemoryLogRecordExporter,
  LoggerProvider,
  ConsoleLogRecordExporter,
  BatchLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import { OTLPLogExporter as OTLPProtoLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import { OTLPLogExporter as OTLPHttpLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPLogExporter as OTLPGrpcLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { OTLPTraceExporter as OTLPProtoTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPTraceExporter as OTLPGrpcTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';

import { ATTR_HOST_NAME, ATTR_PROCESS_PID } from './semconv';

function assertDefaultContextManagerRegistered() {
  assert.ok(
    context['_getContextManager']().constructor.name ===
      AsyncLocalStorageContextManager.name
  );
}

function assertDefaultPropagatorRegistered() {
  assert.deepStrictEqual(propagation.fields(), [
    'traceparent',
    'tracestate',
    'baggage',
  ]);
}

describe('Node SDK', () => {
  let delegate: any;
  let logsDelegate: any;

  beforeEach(() => {
    diag.disable();
    context.disable();
    trace.disable();
    propagation.disable();
    metrics.disable();
    logs.disable();

    delegate = (trace.getTracerProvider() as ProxyTracerProvider).getDelegate();
    logsDelegate = (
      logs.getLoggerProvider() as ProxyLoggerProvider
    )._getDelegate();
  });

  afterEach(() => {
    Sinon.restore();
  });

  describe('Basic Registration', () => {
    it('should not register more than the minimal SDK components', async () => {
      // need to set these to none, since the deafult value is 'otlp'
      env.OTEL_TRACES_EXPORTER = 'none';
      env.OTEL_LOGS_EXPORTER = 'none';
      env.OTEL_METRIC_EXPORTER = 'none';
      const sdk = new NodeSDK({
        autoDetectResources: false,
      });

      sdk.start();

      // These are minimal OTel functionality and always registered.
      assertDefaultContextManagerRegistered();
      assertDefaultPropagatorRegistered();

      assert.strictEqual(
        (trace.getTracerProvider() as ProxyTracerProvider).getDelegate(),
        delegate,
        'tracer provider should not have changed'
      );
      assert.ok(!(metrics.getMeterProvider() instanceof MeterProvider));
      assert.strictEqual(
        (logs.getLoggerProvider() as ProxyLoggerProvider)._getDelegate(),
        logsDelegate,
        'logger provider should not have changed'
      );
      delete env.OTEL_TRACES_EXPORTER;
      delete env.OTEL_METRICS_EXPORTER;
      await sdk.shutdown();
    });

    it('should register a diag logger with OTEL_LOG_LEVEL', () => {
      env.OTEL_LOG_LEVEL = 'ERROR';

      const spy = Sinon.spy(diag, 'setLogger');
      const sdk = new NodeSDK({
        autoDetectResources: false,
      });

      sdk.start();

      assert.strictEqual(spy.callCount, 1);
      assert.ok(spy.args[0][0] instanceof DiagConsoleLogger);
      assert.deepStrictEqual(spy.args[0][1], {
        logLevel: DiagLogLevel.ERROR,
      });

      delete env.OTEL_LOG_LEVEL;
      sdk.shutdown();
    });

    it('should not register a diag logger with OTEL_LOG_LEVEL unset', () => {
      delete env.OTEL_LOG_LEVEL;

      const spy = Sinon.spy(diag, 'setLogger');
      const sdk = new NodeSDK({
        autoDetectResources: false,
      });

      sdk.start();

      assert.strictEqual(spy.callCount, 0);
      sdk.shutdown();
    });

    it('should register a tracer provider if an exporter is provided', async () => {
      const sdk = new NodeSDK({
        traceExporter: new ConsoleSpanExporter(),
        autoDetectResources: false,
      });

      sdk.start();

      assert.ok(!(metrics.getMeterProvider() instanceof MeterProvider));

      assertDefaultContextManagerRegistered();
      assertDefaultPropagatorRegistered();

      const apiTracerProvider =
        trace.getTracerProvider() as ProxyTracerProvider;
      assert.ok(apiTracerProvider.getDelegate() instanceof NodeTracerProvider);
      await sdk.shutdown();
    });

    it('should register a tracer provider if an exporter is provided via env', async () => {
      env.OTEL_TRACES_EXPORTER = 'console';
      const sdk = new NodeSDK({
        autoDetectResources: false,
      });

      sdk.start();

      assert.ok(!(metrics.getMeterProvider() instanceof MeterProvider));

      assertDefaultContextManagerRegistered();
      assertDefaultPropagatorRegistered();

      const apiTracerProvider =
        trace.getTracerProvider() as ProxyTracerProvider;
      assert.ok(apiTracerProvider.getDelegate() instanceof NodeTracerProvider);
      delete env.OTEL_TRACES_EXPORTER;
      await sdk.shutdown();
    });

    it('should register a tracer provider if span processors are provided', async () => {
      const exporter = new ConsoleSpanExporter();

      const sdk = new NodeSDK({
        spanProcessors: [
          new NoopSpanProcessor(),
          new SimpleSpanProcessor(exporter),
          new BatchSpanProcessor(exporter),
        ],
        autoDetectResources: false,
      });

      sdk.start();

      assert.ok(!(metrics.getMeterProvider() instanceof MeterProvider));

      assertDefaultContextManagerRegistered();
      assertDefaultPropagatorRegistered();

      const apiTracerProvider =
        trace.getTracerProvider() as ProxyTracerProvider;
      const nodeTracerProvider = apiTracerProvider.getDelegate();

      assert.ok(nodeTracerProvider instanceof NodeTracerProvider);

      const spanProcessor = nodeTracerProvider['_activeSpanProcessor'] as any;

      assert.ok(
        spanProcessor.constructor.name === 'MultiSpanProcessor',
        'is MultiSpanProcessor'
      );

      const listOfProcessors = spanProcessor[
        '_spanProcessors'
      ] as SpanProcessor[];

      assert.ok(
        listOfProcessors.length === 3,
        'it has the right amount of processors'
      );
      assert.ok(listOfProcessors[0] instanceof NoopSpanProcessor);
      assert.ok(listOfProcessors[1] instanceof SimpleSpanProcessor);
      assert.ok(listOfProcessors[2] instanceof BatchSpanProcessor);
      await sdk.shutdown();
    });

    it('should register a meter provider if a reader is provided', async () => {
      // need to set OTEL_TRACES_EXPORTER to none since default value is otlp
      // which sets up an exporter and affects the context manager
      env.OTEL_TRACES_EXPORTER = 'none';
      const exporter = new ConsoleMetricExporter();
      const metricReader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: 100,
        exportTimeoutMillis: 100,
      });

      const sdk = new NodeSDK({
        metricReader: metricReader,
        autoDetectResources: false,
      });

      sdk.start();

      assertDefaultContextManagerRegistered();
      assertDefaultPropagatorRegistered();

      assert.strictEqual(
        (trace.getTracerProvider() as ProxyTracerProvider).getDelegate(),
        delegate,
        'tracer provider should not have changed'
      );

      assert.ok(metrics.getMeterProvider() instanceof MeterProvider);

      await sdk.shutdown();
      delete env.OTEL_TRACES_EXPORTER;
    });

    it('should register a logger provider if a log record processor is provided', async () => {
      env.OTEL_TRACES_EXPORTER = 'none';
      const logRecordExporter = new InMemoryLogRecordExporter();
      const logRecordProcessor = new SimpleLogRecordProcessor(
        logRecordExporter
      );
      const sdk = new NodeSDK({
        logRecordProcessor: logRecordProcessor,
        autoDetectResources: false,
      });

      sdk.start();

      assertDefaultContextManagerRegistered();
      assertDefaultPropagatorRegistered();

      assert.strictEqual(
        (trace.getTracerProvider() as ProxyTracerProvider).getDelegate(),
        delegate,
        'tracer provider should not have changed'
      );

      assert.ok(
        (logs.getLoggerProvider() as ProxyLoggerProvider) instanceof
          LoggerProvider
      );
      await sdk.shutdown();
      delete env.OTEL_TRACES_EXPORTER;
    });

    it('should register a logger provider if multiple log record processors are provided', async () => {
      const logRecordExporter = new InMemoryLogRecordExporter();
      const simpleLogRecordProcessor = new SimpleLogRecordProcessor(
        logRecordExporter
      );
      const batchLogRecordProcessor = new BatchLogRecordProcessor(
        logRecordExporter
      );
      const sdk = new NodeSDK({
        logRecordProcessors: [
          simpleLogRecordProcessor,
          batchLogRecordProcessor,
        ],
      });

      sdk.start();

      const loggerProvider = logs.getLoggerProvider();
      const sharedState = (loggerProvider as any)['_sharedState'];
      assert.ok(sharedState.registeredLogRecordProcessors.length === 2);
      assert.ok(
        sharedState.registeredLogRecordProcessors[0]._exporter instanceof
          InMemoryLogRecordExporter
      );
      assert.ok(
        sharedState.registeredLogRecordProcessors[0] instanceof
          SimpleLogRecordProcessor
      );
      assert.ok(
        sharedState.registeredLogRecordProcessors[1]._exporter instanceof
          InMemoryLogRecordExporter
      );
      assert.ok(
        sharedState.registeredLogRecordProcessors[1] instanceof
          BatchLogRecordProcessor
      );
    });

    it('should register a context manager if only a context manager is provided', async () => {
      // arrange
      const expectedContextManager = new AsyncHooksContextManager();
      const sdk = new NodeSDK({
        contextManager: expectedContextManager,
      });

      // act
      sdk.start();

      // assert
      const actualContextManager = context['_getContextManager']();
      assert.equal(actualContextManager, expectedContextManager);
      await sdk.shutdown();
    });

    it('should register a propagator if only a propagator is provided', async () => {
      // arrange
      const expectedPropagator = new W3CTraceContextPropagator();
      const sdk = new NodeSDK({
        textMapPropagator: expectedPropagator,
      });

      // act
      sdk.start();

      // assert
      const actualPropagator = propagation['_getGlobalPropagator']();
      assert.equal(actualPropagator, expectedPropagator);
      await sdk.shutdown();
    });

    it('should register propagators as defined in OTEL_PROPAGATORS if trace SDK is configured', async () => {
      process.env.OTEL_PROPAGATORS = 'b3';
      const sdk = new NodeSDK({
        traceExporter: new ConsoleSpanExporter(),
        autoDetectResources: false,
      });

      sdk.start();

      assert.deepStrictEqual(propagation.fields(), ['b3']);

      await sdk.shutdown();
      delete process.env.OTEL_PROPAGATORS;
    });

    it('should not register propagators OTEL_PROPAGATORS contains "none"', async () => {
      process.env.OTEL_PROPAGATORS = 'none';
      const sdk = new NodeSDK({
        traceExporter: new ConsoleSpanExporter(),
        autoDetectResources: false,
      });

      sdk.start();

      assert.deepStrictEqual(propagation.fields(), []);

      await sdk.shutdown();
      delete process.env.OTEL_PROPAGATORS;
    });

    it('should not register propagators OTEL_PROPAGATORS contains "none" alongside valid propagator', async () => {
      process.env.OTEL_PROPAGATORS = 'b3, none';
      const sdk = new NodeSDK({
        traceExporter: new ConsoleSpanExporter(),
        autoDetectResources: false,
      });

      sdk.start();

      assert.deepStrictEqual(propagation.fields(), []);

      await sdk.shutdown();
      delete process.env.OTEL_PROPAGATORS;
    });

    it('should not register propagators OTEL_PROPAGATORS contains valid propagator but option is set to null', async () => {
      process.env.OTEL_PROPAGATORS = 'b3';
      const sdk = new NodeSDK({
        traceExporter: new ConsoleSpanExporter(),
        autoDetectResources: false,
        textMapPropagator: null,
      });

      sdk.start();

      assert.deepStrictEqual(propagation.fields(), []);

      await sdk.shutdown();
      delete process.env.OTEL_PROPAGATORS;
    });
  });

  async function waitForNumberOfMetrics(
    exporter: InMemoryMetricExporter,
    numberOfMetrics: number
  ): Promise<void> {
    if (numberOfMetrics <= 0) {
      throw new Error('numberOfMetrics must be greater than or equal to 0');
    }

    let totalExports = 0;
    while (totalExports < numberOfMetrics) {
      await new Promise(resolve => setTimeout(resolve, 20));
      const exportedMetrics = exporter.getMetrics();
      totalExports = exportedMetrics.length;
    }
  }

  it('should register meter views when provided', async () => {
    // need to set OTEL_TRACES_EXPORTER to none since default value is otlp
    // which sets up an exporter and affects the context manager
    env.OTEL_TRACES_EXPORTER = 'none';
    const exporter = new InMemoryMetricExporter(
      AggregationTemporality.CUMULATIVE
    );
    const metricReader = new PeriodicExportingMetricReader({
      exporter: exporter,
      exportIntervalMillis: 100,
      exportTimeoutMillis: 100,
    });

    const sdk = new NodeSDK({
      metricReader: metricReader,
      views: [
        {
          name: 'test-view',
          instrumentName: 'test_counter',
          instrumentType: InstrumentType.COUNTER,
        },
      ],
      autoDetectResources: false,
    });

    sdk.start();

    assertDefaultContextManagerRegistered();
    assertDefaultPropagatorRegistered();

    assert.strictEqual(
      (trace.getTracerProvider() as ProxyTracerProvider).getDelegate(),
      delegate,
      'tracer provider should not have changed'
    );

    const meterProvider = metrics.getMeterProvider() as MeterProvider;
    assert.ok(meterProvider);

    const meter = meterProvider.getMeter('NodeSDKViews', '1.0.0');
    const counter = meter.createCounter('test_counter', {
      description: 'a test description',
    });
    counter.add(10);

    await waitForNumberOfMetrics(exporter, 1);
    const exportedMetrics = exporter.getMetrics();
    const [firstExportedMetric] = exportedMetrics;
    assert.ok(firstExportedMetric, 'should have one exported metric');
    const [firstScopeMetric] = firstExportedMetric.scopeMetrics;
    assert.ok(firstScopeMetric, 'should have one scope metric');
    assert.ok(
      firstScopeMetric.scope.name === 'NodeSDKViews',
      'scope should match created view'
    );
    assert.ok(
      firstScopeMetric.metrics.length > 0,
      'should have at least one metrics entry'
    );
    const [firstMetricRecord] = firstScopeMetric.metrics;
    assert.ok(
      firstMetricRecord.descriptor.name === 'test-view',
      'should have renamed counter metric'
    );

    await sdk.shutdown();
    delete env.OTEL_TRACES_EXPORTER;
  });

  describe('detectResources', async () => {
    beforeEach(() => {
      process.env.OTEL_RESOURCE_ATTRIBUTES =
        'service.instance.id=627cc493,service.name=my-service,service.namespace=default,service.version=0.0.1';
    });

    afterEach(() => {
      delete process.env.OTEL_RESOURCE_ATTRIBUTES;
    });

    describe('with a custom resource', () => {
      it('returns a merged resource', async () => {
        const sdk = new NodeSDK({
          autoDetectResources: true,
          resourceDetectors: [
            processDetector,
            {
              detect(): DetectedResource {
                return {
                  attributes: { customAttr: 'someValue' },
                };
              },
            },
            envDetector,
            hostDetector,
          ],
        });
        sdk.start();
        const resource = sdk['_resource'];
        await resource.waitForAsyncAttributes?.();

        assert.strictEqual(resource.attributes['customAttr'], 'someValue');

        assertServiceResource(resource, {
          instanceId: '627cc493',
          name: 'my-service',
          namespace: 'default',
          version: '0.0.1',
        });
        await sdk.shutdown();
      });
    });

    describe('default resource detectors', () => {
      it('default detectors populate values properly', async () => {
        const sdk = new NodeSDK();
        sdk.start();
        const resource = sdk['_resource'];
        await resource.waitForAsyncAttributes?.();

        assertServiceResource(resource, {
          instanceId: '627cc493',
          name: 'my-service',
          namespace: 'default',
          version: '0.0.1',
        });

        assert.notEqual(resource.attributes[ATTR_PROCESS_PID], undefined);
        assert.notEqual(resource.attributes[ATTR_HOST_NAME], undefined);
      });
    });

    describe('with a buggy detector', () => {
      it('returns a merged resource', async () => {
        const sdk = new NodeSDK({
          autoDetectResources: true,
          resourceDetectors: [
            processDetector,
            {
              detect() {
                throw new Error('Buggy detector');
              },
            },
            envDetector,
            hostDetector,
          ],
        });

        sdk.start();
        const resource = sdk['_resource'];
        await resource.waitForAsyncAttributes?.();

        assertServiceResource(resource, {
          instanceId: '627cc493',
          name: 'my-service',
          namespace: 'default',
          version: '0.0.1',
        });
        await sdk.shutdown();
      });
    });

    describe('with a diag logger', () => {
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

      describe('with unknown OTEL_NODE_RESOURCE_DETECTORS value', () => {
        before(() => {
          process.env.OTEL_NODE_RESOURCE_DETECTORS = 'env,os,no-such-detector';
        });

        after(() => {
          delete process.env.OTEL_NODE_RESOURCE_DETECTORS;
        });

        // 1. If not auto-detecting resources, then NodeSDK should not
        //    complain about `OTEL_NODE_RESOURCE_DETECTORS` values.
        // 2. If given resourceDetectors, then NodeSDK should not complain
        //    about `OTEL_NODE_RESOURCE_DETECTORS` values.
        //
        // Practically, these tests help ensure that there is no spurious
        // diag error message when using OTEL_NODE_RESOURCE_DETECTORS with
        // @opentelemetry/auto-instrumentations-node, which supports more values
        // than this package (e.g. 'gcp').
        it('does not diag.warn when not using the envvar', async () => {
          const diagMocks = {
            error: Sinon.fake(),
            warn: Sinon.fake(),
            info: Sinon.fake(),
            debug: Sinon.fake(),
            verbose: Sinon.fake(),
          };
          diag.setLogger(diagMocks, DiagLogLevel.DEBUG);

          const sdk1 = new NodeSDK({
            autoDetectResources: false,
          });
          sdk1.start();
          await sdk1.shutdown();

          const sdk2 = new NodeSDK({
            resourceDetectors: [envDetector],
          });
          sdk2.start();
          await sdk2.shutdown();

          assert.ok(
            !callArgsMatches(diagMocks.error, /no-such-detector/),
            'diag.error() messages do not mention "no-such-detector"'
          );
        });
      });

      describe('with a faulty environment variable', () => {
        beforeEach(() => {
          process.env.OTEL_RESOURCE_ATTRIBUTES = 'bad=\\attribute';
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

          sdk.start();

          assert.ok(
            callArgsContains(
              mockedLoggerMethod,
              'EnvDetector failed: Attribute value should be a ASCII string with a length not exceed 255 characters.'
            )
          );
          await sdk.shutdown();
        });
      });
    });
  });

  describe('configureServiceName', async () => {
    it('should configure service name via config', async () => {
      const sdk = new NodeSDK({
        serviceName: 'config-set-name',
      });

      sdk.start();
      const resource = sdk['_resource'];

      assertServiceResource(resource, {
        name: 'config-set-name',
      });
      await sdk.shutdown();
    });

    it('should configure service name via OTEL_SERVICE_NAME env var', async () => {
      process.env.OTEL_SERVICE_NAME = 'env-set-name';
      const sdk = new NodeSDK();

      sdk.start();
      const resource = sdk['_resource'];
      await resource.waitForAsyncAttributes?.();

      assertServiceResource(resource, {
        name: 'env-set-name',
      });
      delete process.env.OTEL_SERVICE_NAME;
      await sdk.shutdown();
    });

    it('should favor config set service name over OTEL_SERVICE_NAME env set service name', async () => {
      process.env.OTEL_SERVICE_NAME = 'env-set-name';
      const sdk = new NodeSDK({
        serviceName: 'config-set-name',
      });

      sdk.start();
      const resource = sdk['_resource'];
      await resource.waitForAsyncAttributes?.();

      assertServiceResource(resource, {
        name: 'config-set-name',
      });
      delete process.env.OTEL_SERVICE_NAME;
      await sdk.shutdown();
    });

    it('should configure service name via OTEL_RESOURCE_ATTRIBUTES env var', async () => {
      process.env.OTEL_RESOURCE_ATTRIBUTES =
        'service.name=resource-env-set-name,service.instance.id=my-instance-id';
      const sdk = new NodeSDK();

      sdk.start();
      const resource = sdk['_resource'];
      await resource.waitForAsyncAttributes?.();

      assertServiceResource(resource, {
        name: 'resource-env-set-name',
        instanceId: 'my-instance-id',
      });
      delete process.env.OTEL_RESOURCE_ATTRIBUTES;
      await sdk.shutdown();
    });

    it('should favor config set service name over OTEL_RESOURCE_ATTRIBUTES env set service name', async () => {
      process.env.OTEL_RESOURCE_ATTRIBUTES =
        'service.name=resource-env-set-name,service.instance.id=my-instance-id';
      const sdk = new NodeSDK({
        serviceName: 'config-set-name',
      });

      sdk.start();
      const resource = sdk['_resource'];
      await resource.waitForAsyncAttributes?.();

      assertServiceResource(resource, {
        name: 'config-set-name',
        instanceId: 'my-instance-id',
      });
      delete process.env.OTEL_RESOURCE_ATTRIBUTES;
      await sdk.shutdown();
    });
  });

  describe('configureServiceInstanceId', async () => {
    it('should configure service instance id via OTEL_RESOURCE_ATTRIBUTES env var', async () => {
      process.env.OTEL_RESOURCE_ATTRIBUTES =
        'service.instance.id=627cc493,service.name=my-service,service.namespace';
      const sdk = new NodeSDK();

      sdk.start();
      const resource = sdk['_resource'];
      await resource.waitForAsyncAttributes?.();

      assertServiceResource(resource, {
        name: 'my-service',
        instanceId: '627cc493',
      });
      delete process.env.OTEL_RESOURCE_ATTRIBUTES;
      await sdk.shutdown();
    });

    it('should configure service instance id via OTEL_NODE_RESOURCE_DETECTORS env var', async () => {
      process.env.OTEL_NODE_RESOURCE_DETECTORS = 'env,host,os,serviceinstance';
      const sdk = new NodeSDK();

      sdk.start();
      const resource = sdk['_resource'];
      await resource.waitForAsyncAttributes?.();

      assertServiceInstanceIdIsUUID(resource);
      delete process.env.OTEL_NODE_RESOURCE_DETECTORS;
      await sdk.shutdown();
    });

    it('should configure service instance id with random UUID', async () => {
      const sdk = new NodeSDK({
        autoDetectResources: true,
        resourceDetectors: [
          processDetector,
          envDetector,
          hostDetector,
          serviceInstanceIdDetector,
        ],
      });

      sdk.start();
      const resource = sdk['_resource'];
      await resource.waitForAsyncAttributes?.();

      assertServiceInstanceIdIsUUID(resource);
      await sdk.shutdown();
    });
  });

  describe('A disabled SDK should be no-op', () => {
    beforeEach(() => {
      env.OTEL_SDK_DISABLED = 'true';
    });

    afterEach(() => {
      delete env.OTEL_SDK_DISABLED;
    });

    it('should not register a trace provider', async () => {
      const sdk = new NodeSDK({});
      sdk.start();

      assert.strictEqual(
        (trace.getTracerProvider() as ProxyTracerProvider).getDelegate(),
        delegate,
        'sdk.start() should not change the global tracer provider'
      );

      await sdk.shutdown();
    });

    it('should not register a meter provider if a reader is provided', async () => {
      const exporter = new ConsoleMetricExporter();
      const metricReader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: 100,
        exportTimeoutMillis: 100,
      });

      const sdk = new NodeSDK({
        metricReader: metricReader,
        autoDetectResources: false,
      });
      sdk.start();

      assert.ok(!(metrics.getMeterProvider() instanceof MeterProvider));

      await sdk.shutdown();
    });

    describe('detectResources should be no-op', async () => {
      beforeEach(() => {
        process.env.OTEL_RESOURCE_ATTRIBUTES =
          'service.instance.id=627cc493,service.name=my-service,service.namespace=default,service.version=0.0.1';
      });

      afterEach(() => {
        delete process.env.OTEL_RESOURCE_ATTRIBUTES;
      });

      it('detectResources will not read resources from env or manually', async () => {
        const sdk = new NodeSDK({
          autoDetectResources: true,
          resourceDetectors: [
            processDetector,
            {
              detect(): DetectedResource {
                return {
                  attributes: { customAttr: 'someValue' },
                };
              },
            },
            envDetector,
            hostDetector,
          ],
        });
        sdk.start();
        const resource = sdk['_resource'];
        await resource.waitForAsyncAttributes?.();

        assert.deepStrictEqual(resource, defaultResource());
        await sdk.shutdown();
      });
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
      const spanProcessor = new SimpleSpanProcessor(new ConsoleSpanExporter());
      const sdk = new NodeSDK({
        idGenerator,
        spanProcessor,
      });
      sdk.start();

      const span = trace.getTracer('test').startSpan('testName');
      span.end();

      assert.strictEqual(span.spanContext().spanId, 'constant-test-span-id');
      assert.strictEqual(span.spanContext().traceId, 'constant-test-trace-id');
      await sdk.shutdown();
    });
  });

  describe('configuring logger provider from env', () => {
    let stubLogger: Sinon.SinonStub;

    beforeEach(() => {
      stubLogger = Sinon.stub(diag, 'info');
    });

    afterEach(() => {
      stubLogger.reset();
      delete env.OTEL_LOGS_EXPORTER;
      delete env.OTEL_EXPORTER_OTLP_LOGS_PROTOCOL;
      delete env.OTEL_EXPORTER_OTLP_PROTOCOL;
    });

    it('should not register the provider if OTEL_LOGS_EXPORTER contains none', async () => {
      const logsAPIStub = Sinon.spy(logs, 'setGlobalLoggerProvider');
      env.OTEL_LOGS_EXPORTER = 'console,none';
      const sdk = new NodeSDK();
      sdk.start();
      assert.strictEqual(
        stubLogger.args[0][0],
        'OTEL_LOGS_EXPORTER contains "none". Logger provider will not be initialized.'
      );

      Sinon.assert.notCalled(logsAPIStub);
      await sdk.shutdown();
    });

    it('should use otlp with http/protobuf by default', async () => {
      const sdk = new NodeSDK();
      sdk.start();
      const loggerProvider = logs.getLoggerProvider();
      const sharedState = (loggerProvider as any)['_sharedState'];
      assert.ok(
        sharedState.registeredLogRecordProcessors[0]._exporter instanceof
          OTLPProtoLogExporter
      );
      await sdk.shutdown();
    });

    it('should set up all allowed exporters', async () => {
      env.OTEL_LOGS_EXPORTER = 'console,otlp';
      const sdk = new NodeSDK();

      sdk.start();

      const loggerProvider = logs.getLoggerProvider();
      const sharedState = (loggerProvider as any)['_sharedState'];
      assert.ok(sharedState.registeredLogRecordProcessors.length === 2);
      assert.ok(
        sharedState.registeredLogRecordProcessors[0]._exporter instanceof
          ConsoleLogRecordExporter
      );
      assert.ok(
        sharedState.registeredLogRecordProcessors[0] instanceof
          SimpleLogRecordProcessor
      );
      // defaults to http/protobuf
      assert.ok(
        sharedState.registeredLogRecordProcessors[1]._exporter instanceof
          OTLPProtoLogExporter
      );
      assert.ok(
        sharedState.registeredLogRecordProcessors[1] instanceof
          BatchLogRecordProcessor
      );
      await sdk.shutdown();
    });

    it('should use OTEL_EXPORTER_OTLP_LOGS_PROTOCOL for otlp protocol', async () => {
      env.OTEL_LOGS_EXPORTER = 'otlp';
      env.OTEL_EXPORTER_OTLP_LOGS_PROTOCOL = 'grpc';
      const sdk = new NodeSDK();

      sdk.start();

      const loggerProvider = logs.getLoggerProvider();
      const sharedState = (loggerProvider as any)['_sharedState'];
      assert.ok(sharedState.registeredLogRecordProcessors.length === 1);
      assert.ok(
        sharedState.registeredLogRecordProcessors[0]._exporter instanceof
          OTLPGrpcLogExporter
      );
      await sdk.shutdown();
    });

    it('should use OTLPHttpLogExporter when http/json is set', async () => {
      env.OTEL_LOGS_EXPORTER = 'otlp';
      env.OTEL_EXPORTER_OTLP_LOGS_PROTOCOL = 'http/json';
      const sdk = new NodeSDK();

      sdk.start();

      const loggerProvider = logs.getLoggerProvider();
      const sharedState = (loggerProvider as any)['_sharedState'];
      assert.ok(sharedState.registeredLogRecordProcessors.length === 1);
      assert.ok(
        sharedState.registeredLogRecordProcessors[0]._exporter instanceof
          OTLPHttpLogExporter
      );
      await sdk.shutdown();
    });

    it('should fall back to OTEL_EXPORTER_OTLP_PROTOCOL', async () => {
      env.OTEL_LOGS_EXPORTER = 'otlp';
      env.OTEL_EXPORTER_OTLP_PROTOCOL = 'grpc';
      const sdk = new NodeSDK();

      sdk.start();

      const loggerProvider = logs.getLoggerProvider();
      const sharedState = (loggerProvider as any)['_sharedState'];
      assert.ok(sharedState.registeredLogRecordProcessors.length === 1);
      assert.ok(
        sharedState.registeredLogRecordProcessors[0]._exporter instanceof
          OTLPGrpcLogExporter
      );
      await sdk.shutdown();
    });

    it('should fall back to http/protobuf if invalid protocol is set', async () => {
      env.OTEL_LOGS_EXPORTER = 'otlp';
      env.OTEL_EXPORTER_OTLP_LOGS_PROTOCOL = 'grpc2';
      const sdk = new NodeSDK();

      sdk.start();

      const loggerProvider = logs.getLoggerProvider();
      const sharedState = (loggerProvider as any)['_sharedState'];
      assert.ok(sharedState.registeredLogRecordProcessors.length === 1);
      assert.ok(
        sharedState.registeredLogRecordProcessors[0]._exporter instanceof
          OTLPProtoLogExporter
      );
      await sdk.shutdown();
    });
  });

  describe('configuring metric provider from env', () => {
    let stubLogger: Sinon.SinonStub;

    beforeEach(() => {
      stubLogger = Sinon.stub(diag, 'info');
    });

    afterEach(() => {
      stubLogger.reset();
      delete env.OTEL_METRICS_EXPORTER;
      delete env.OTEL_EXPORTER_OTLP_METRICS_PROTOCOL;
      delete env.OTEL_EXPORTER_METRICS_PROTOCOL;
    });

    it('should not register the provider if OTEL_METRICS_EXPORTER is not set', async () => {
      const sdk = new NodeSDK();
      sdk.start();
      assert.ok(!(metrics.getMeterProvider() instanceof MeterProvider));
      await sdk.shutdown();
    });

    it('should not register the provider if OTEL_METRICS_EXPORTER contains none', async () => {
      env.OTEL_METRICS_EXPORTER = 'console,none';
      const sdk = new NodeSDK();
      sdk.start();
      assert.ok(!(metrics.getMeterProvider() instanceof MeterProvider));
      assert.strictEqual(
        stubLogger.args[0][0],
        'OTEL_METRICS_EXPORTER contains "none". Metric provider will not be initialized.'
      );
      await sdk.shutdown();
    });

    it('should use console with default interval and timeout', async () => {
      env.OTEL_METRICS_EXPORTER = 'console';
      const sdk = new NodeSDK();
      sdk.start();
      const meterProvider = metrics.getMeterProvider();
      const sharedState = (meterProvider as any)['_sharedState'];
      assert.ok(
        sharedState.metricCollectors[0]._metricReader._exporter instanceof
          ConsoleMetricExporter
      );
      assert.strictEqual(
        sharedState.metricCollectors[0]._metricReader._exportInterval,
        60000
      );
      assert.strictEqual(
        sharedState.metricCollectors[0]._metricReader._exportTimeout,
        30000
      );
      await sdk.shutdown();
    });

    it('should use otlp with gRPC and default interval and timeout', async () => {
      env.OTEL_METRICS_EXPORTER = 'otlp';
      env.OTEL_EXPORTER_OTLP_METRICS_PROTOCOL = 'grpc';
      const sdk = new NodeSDK();
      sdk.start();
      const meterProvider = metrics.getMeterProvider();
      const sharedState = (meterProvider as any)['_sharedState'];
      assert.ok(
        sharedState.metricCollectors[0]._metricReader._exporter instanceof
          OTLPGrpcMetricExporter
      );
      assert.strictEqual(
        sharedState.metricCollectors[0]._metricReader._exportInterval,
        60000
      );
      assert.strictEqual(
        sharedState.metricCollectors[0]._metricReader._exportTimeout,
        30000
      );
      await sdk.shutdown();
    });

    it('should use otlp with http/protobuf and default interval and timeout', async () => {
      env.OTEL_METRICS_EXPORTER = 'otlp';
      env.OTEL_EXPORTER_OTLP_METRICS_PROTOCOL = 'http/protobuf';
      const sdk = new NodeSDK();
      sdk.start();
      const meterProvider = metrics.getMeterProvider();
      const sharedState = (meterProvider as any)['_sharedState'];
      assert.ok(
        sharedState.metricCollectors[0]._metricReader._exporter instanceof
          OTLPProtoMetricExporter
      );
      assert.strictEqual(
        sharedState.metricCollectors[0]._metricReader._exportInterval,
        60000
      );
      assert.strictEqual(
        sharedState.metricCollectors[0]._metricReader._exportTimeout,
        30000
      );
      await sdk.shutdown();
    });

    it('should use otlp with http/json and default interval and timeout', async () => {
      env.OTEL_METRICS_EXPORTER = 'otlp';
      env.OTEL_EXPORTER_OTLP_METRICS_PROTOCOL = 'http/json';
      const sdk = new NodeSDK();
      sdk.start();
      const meterProvider = metrics.getMeterProvider();
      const sharedState = (meterProvider as any)['_sharedState'];
      assert.ok(
        sharedState.metricCollectors[0]._metricReader._exporter instanceof
          OTLPHttpMetricExporter
      );
      assert.strictEqual(
        sharedState.metricCollectors[0]._metricReader._exportInterval,
        60000
      );
      assert.strictEqual(
        sharedState.metricCollectors[0]._metricReader._exportTimeout,
        30000
      );
      await sdk.shutdown();
    });

    it('should fall back to OTEL_EXPORTER_OTLP_PROTOCOL', async () => {
      env.OTEL_METRICS_EXPORTER = 'otlp';
      env.OTEL_EXPORTER_OTLP_METRICS_PROTOCOL = 'grpc';
      const sdk = new NodeSDK();
      sdk.start();
      const meterProvider = metrics.getMeterProvider();
      const sharedState = (meterProvider as any)['_sharedState'];
      assert.ok(
        sharedState.metricCollectors[0]._metricReader._exporter instanceof
          OTLPGrpcMetricExporter
      );
      assert.strictEqual(
        sharedState.metricCollectors[0]._metricReader._exportInterval,
        60000
      );
      assert.strictEqual(
        sharedState.metricCollectors[0]._metricReader._exportTimeout,
        30000
      );
      await sdk.shutdown();
    });

    it('should fall back to http/protobuf if invalid protocol is set', async () => {
      env.OTEL_METRICS_EXPORTER = 'otlp';
      env.OTEL_EXPORTER_OTLP_METRICS_PROTOCOL = 'grpcx';
      const sdk = new NodeSDK();
      sdk.start();
      const meterProvider = metrics.getMeterProvider();
      const sharedState = (meterProvider as any)['_sharedState'];
      assert.ok(
        sharedState.metricCollectors[0]._metricReader._exporter instanceof
          OTLPProtoMetricExporter
      );
      assert.strictEqual(
        sharedState.metricCollectors[0]._metricReader._exportInterval,
        60000
      );
      assert.strictEqual(
        sharedState.metricCollectors[0]._metricReader._exportTimeout,
        30000
      );
      await sdk.shutdown();
    });

    it('should fall back to http/protobuf if protocol is not  set', async () => {
      env.OTEL_METRICS_EXPORTER = 'otlp';
      delete env.OTEL_EXPORTER_OTLP_METRICS_PROTOCOL;
      const sdk = new NodeSDK();
      sdk.start();
      const meterProvider = metrics.getMeterProvider();
      const sharedState = (meterProvider as any)['_sharedState'];
      assert.ok(
        sharedState.metricCollectors[0]._metricReader._exporter instanceof
          OTLPProtoMetricExporter
      );
      assert.strictEqual(
        sharedState.metricCollectors[0]._metricReader._exportInterval,
        60000
      );
      assert.strictEqual(
        sharedState.metricCollectors[0]._metricReader._exportTimeout,
        30000
      );
      await sdk.shutdown();
    });

    it('should use otlp with http/protobuf and and use user defined flushing settings', async () => {
      env.OTEL_METRICS_EXPORTER = 'otlp';
      env.OTEL_EXPORTER_OTLP_METRICS_PROTOCOL = 'http/protobuf';
      env.OTEL_METRIC_EXPORT_INTERVAL = '200';
      env.OTEL_METRIC_EXPORT_TIMEOUT = '150';
      delete env.OTEL_EXPORTER_OTLP_METRICS_PROTOCOL;
      const sdk = new NodeSDK();
      sdk.start();
      const meterProvider = metrics.getMeterProvider();
      const sharedState = (meterProvider as any)['_sharedState'];
      assert.ok(
        sharedState.metricCollectors[0]._metricReader._exporter instanceof
          OTLPProtoMetricExporter
      );
      assert.strictEqual(
        sharedState.metricCollectors[0]._metricReader._exportInterval,
        200
      );
      assert.strictEqual(
        sharedState.metricCollectors[0]._metricReader._exportTimeout,
        150
      );
      await sdk.shutdown();
      delete env.OTEL_METRIC_EXPORT_INTERVAL;
      delete env.OTEL_METRIC_EXPORT_TIMEOUT;
    });

    it('should use prometheus if that is set ', async () => {
      env.OTEL_METRICS_EXPORTER = 'prometheus';
      delete env.OTEL_EXPORTER_OTLP_METRICS_PROTOCOL;
      const sdk = new NodeSDK();
      sdk.start();
      const meterProvider = metrics.getMeterProvider();
      const sharedState = (meterProvider as any)['_sharedState'];
      assert.ok(
        sharedState.metricCollectors[0]._metricReader instanceof
          PrometheusMetricExporter
      );
      await sdk.shutdown();
    });
  });

  describe('setup exporter from env', () => {
    let stubLoggerError: Sinon.SinonStub;

    const getSdkSpanProcessors = (sdk: NodeSDK) => {
      const tracerProvider = sdk['_tracerProvider'];

      assert.ok(tracerProvider instanceof NodeTracerProvider);

      const activeSpanProcessor = tracerProvider['_activeSpanProcessor'];

      assert.ok(activeSpanProcessor.constructor.name === 'MultiSpanProcessor');

      return (activeSpanProcessor as any)['_spanProcessors'] as SpanProcessor[];
    };

    beforeEach(() => {
      stubLoggerError = Sinon.stub(diag, 'warn');
    });
    afterEach(() => {
      stubLoggerError.restore();
    });

    it('should use default exporter when nor env neither SDK config is given', async () => {
      const sdk = new NodeSDK();
      sdk.start();
      const listOfProcessors = getSdkSpanProcessors(sdk);

      assert.ok(listOfProcessors.length === 1);
      assert.ok(listOfProcessors[0] instanceof BatchSpanProcessor);
      assert.ok(
        listOfProcessors[0]['_exporter'] instanceof OTLPProtoTraceExporter
      );
      await sdk.shutdown();
    });

    it('should ignore default env exporter when user provides exporter in sdk config', async () => {
      const traceExporter = new ConsoleSpanExporter();
      const sdk = new NodeSDK({
        traceExporter,
      });
      sdk.start();
      const listOfProcessors = getSdkSpanProcessors(sdk);

      assert.ok(listOfProcessors.length === 1);
      assert.ok(listOfProcessors[0] instanceof BatchSpanProcessor);
      assert.ok(
        listOfProcessors[0]['_exporter'] instanceof ConsoleSpanExporter
      );
      await sdk.shutdown();
    });

    it('should ignore default env exporter when user provides span processor in sdk config', async () => {
      const traceExporter = new ConsoleSpanExporter();
      const spanProcessor = new SimpleSpanProcessor(traceExporter);
      const sdk = new NodeSDK({
        spanProcessor,
      });
      sdk.start();
      const listOfProcessors = getSdkSpanProcessors(sdk);

      assert.ok(listOfProcessors.length === 1);
      assert.ok(listOfProcessors[0] instanceof SimpleSpanProcessor);
      assert.ok(
        listOfProcessors[0]['_exporter'] instanceof ConsoleSpanExporter
      );
      await sdk.shutdown();
    });

    it('should ignore exporter form env if another is provided in sdk config', async () => {
      env.OTEL_TRACES_EXPORTER = 'console';
      const traceExporter = new OTLPTraceExporter();
      const sdk = new NodeSDK({
        traceExporter,
      });
      sdk.start();
      const listOfProcessors = getSdkSpanProcessors(sdk);

      assert.ok(listOfProcessors.length === 1);
      assert.ok(listOfProcessors[0] instanceof BatchSpanProcessor);
      assert.ok(listOfProcessors[0]['_exporter'] instanceof OTLPTraceExporter);
      delete env.OTEL_TRACES_EXPORTER;
      await sdk.shutdown();
    });

    it('should only create one span processor when configured using env vars and config', async () => {
      env.OTEL_TRACES_EXPORTER = 'console';
      const sdk = new NodeSDK({
        sampler: new AlwaysOffSampler(),
      });
      sdk.start();
      const listOfProcessors = getSdkSpanProcessors(sdk);

      assert.ok(
        sdk['_tracerProvider']!['_config']?.sampler instanceof AlwaysOffSampler
      );
      assert.strictEqual(listOfProcessors.length, 1);
      assert.ok(listOfProcessors[0] instanceof SimpleSpanProcessor);
      assert.ok(
        listOfProcessors[0]['_exporter'] instanceof ConsoleSpanExporter
      );
      delete env.OTEL_TRACES_EXPORTER;
      await sdk.shutdown();
    });

    it('should use otlp exporter and defined exporter protocol env value', async () => {
      env.OTEL_TRACES_EXPORTER = 'otlp';
      env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = 'grpc';
      const sdk = new NodeSDK();
      sdk.start();
      const listOfProcessors = getSdkSpanProcessors(sdk);

      assert.ok(listOfProcessors.length === 1);
      assert.ok(listOfProcessors[0] instanceof BatchSpanProcessor);
      assert.ok(
        listOfProcessors[0]['_exporter'] instanceof OTLPGrpcTraceExporter
      );
      delete env.OTEL_TRACES_EXPORTER;
      delete env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL;
      await sdk.shutdown();
    });

    it('sohuld use exporter and processor from env, signal specific env for protocol takes precedence', async () => {
      env.OTEL_TRACES_EXPORTER = 'otlp';
      env.OTEL_EXPORTER_OTLP_PROTOCOL = 'http/protobuf';
      env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = 'grpc';
      const sdk = new NodeSDK();
      sdk.start();
      const listOfProcessors = getSdkSpanProcessors(sdk);

      assert.ok(listOfProcessors.length === 1);
      assert.ok(listOfProcessors[0] instanceof BatchSpanProcessor);
      assert.ok(
        listOfProcessors[0]['_exporter'] instanceof OTLPGrpcTraceExporter
      );
      delete env.OTEL_TRACES_EXPORTER;
      delete env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL;
      await sdk.shutdown();
    });

    it('should use empty span processor when user sets env exporter to none', async () => {
      env.OTEL_TRACES_EXPORTER = 'none';
      const sdk = new NodeSDK();
      sdk.start();

      // should warn
      assert.strictEqual(
        stubLoggerError.args[0][0],
        'OTEL_TRACES_EXPORTER contains "none". SDK will not be initialized.'
      );

      assert.strictEqual(
        (trace.getTracerProvider() as ProxyTracerProvider).getDelegate(),
        delegate,
        'tracer provider should not have changed'
      );

      delete env.OTEL_TRACES_EXPORTER;
      await sdk.shutdown();
    });

    it('should use default otlp exporter when empty value is provided for exporter via env', async () => {
      env.OTEL_TRACES_EXPORTER = '';
      const sdk = new NodeSDK();
      sdk.start();

      const listOfProcessors = getSdkSpanProcessors(sdk);

      assert.ok(listOfProcessors.length === 1);
      assert.ok(listOfProcessors[0] instanceof BatchSpanProcessor);
      assert.ok(
        listOfProcessors[0]['_exporter'] instanceof OTLPProtoTraceExporter
      );
      env.OTEL_TRACES_EXPORTER = '';
      await sdk.shutdown();
    });

    it('should use only default exporter when none value is provided with other exporters', async () => {
      env.OTEL_TRACES_EXPORTER = 'otlp,zipkin,none';
      const sdk = new NodeSDK();
      sdk.start();

      // also it should warn
      assert.strictEqual(
        stubLoggerError.args[0][0],
        'OTEL_TRACES_EXPORTER contains "none" along with other exporters. Using default otlp exporter.'
      );

      const listOfProcessors = getSdkSpanProcessors(sdk);

      assert.ok(listOfProcessors.length === 1);
      assert.ok(listOfProcessors[0] instanceof BatchSpanProcessor);
      assert.ok(
        listOfProcessors[0]['_exporter'] instanceof OTLPProtoTraceExporter
      );

      delete env.OTEL_TRACES_EXPORTER;
      await sdk.shutdown();
    });

    it('should warn that provided exporter value is unrecognized and not able to be set up', async () => {
      env.OTEL_TRACES_EXPORTER = 'invalid';
      const sdk = new NodeSDK();
      sdk.start();

      assert.strictEqual(
        stubLoggerError.args[0][0],
        'Unrecognized OTEL_TRACES_EXPORTER value: invalid.'
      );

      assert.strictEqual(
        stubLoggerError.args[1][0],
        'Unable to set up trace exporter(s) due to invalid exporter and/or protocol values.'
      );

      delete env.OTEL_TRACES_EXPORTER;
      await sdk.shutdown();
    });

    it('should be able to setup zipkin exporter', async () => {
      env.OTEL_TRACES_EXPORTER = 'zipkin';
      env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = 'grpc';
      const sdk = new NodeSDK();
      sdk.start();

      const listOfProcessors = getSdkSpanProcessors(sdk);

      assert.ok(listOfProcessors.length === 1);
      assert.ok(listOfProcessors[0] instanceof BatchSpanProcessor);
      assert.ok(listOfProcessors[0]['_exporter'] instanceof ZipkinExporter);

      delete env.OTEL_TRACES_EXPORTER;
      delete env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL;
      await sdk.shutdown();
    });

    it('should be able to setup zipkin and otlp exporters', async () => {
      env.OTEL_TRACES_EXPORTER = 'zipkin, otlp';
      env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = 'grpc';
      const sdk = new NodeSDK();
      sdk.start();

      const listOfProcessors = getSdkSpanProcessors(sdk);

      assert.ok(listOfProcessors.length === 2);
      assert.ok(listOfProcessors[0] instanceof BatchSpanProcessor);
      assert.ok(listOfProcessors[0]['_exporter'] instanceof ZipkinExporter);
      assert.ok(listOfProcessors[1] instanceof BatchSpanProcessor);
      assert.ok(
        listOfProcessors[1]['_exporter'] instanceof OTLPGrpcTraceExporter
      );

      delete env.OTEL_TRACES_EXPORTER;
      delete env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL;
      await sdk.shutdown();
    });

    it('should be able to setup jaeger exporter', async () => {
      env.OTEL_TRACES_EXPORTER = 'jaeger';
      env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = 'grpc';
      const sdk = new NodeSDK();
      sdk.start();

      const listOfProcessors = getSdkSpanProcessors(sdk);

      assert.ok(listOfProcessors.length === 1);
      assert.ok(listOfProcessors[0] instanceof BatchSpanProcessor);
      assert.ok(listOfProcessors[0]['_exporter'] instanceof JaegerExporter);

      delete env.OTEL_TRACES_EXPORTER;
      delete env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL;
      await sdk.shutdown();
    });

    it('should be able to setup jaeger and otlp exporters', async () => {
      env.OTEL_TRACES_EXPORTER = 'otlp, jaeger';
      env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = 'grpc';
      const sdk = new NodeSDK();
      sdk.start();

      const listOfProcessors = getSdkSpanProcessors(sdk);

      assert.ok(listOfProcessors.length === 2);
      assert.ok(listOfProcessors[0] instanceof BatchSpanProcessor);
      assert.ok(
        listOfProcessors[0]['_exporter'] instanceof OTLPGrpcTraceExporter
      );
      assert.ok(listOfProcessors[1] instanceof BatchSpanProcessor);
      assert.ok(listOfProcessors[1]['_exporter'] instanceof JaegerExporter);

      delete env.OTEL_TRACES_EXPORTER;
      delete env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL;
      await sdk.shutdown();
    });

    it('should be able to setup zipkin, jaeger and otlp exporters', async () => {
      env.OTEL_TRACES_EXPORTER = 'zipkin, otlp, jaeger';
      env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = 'grpc';
      const sdk = new NodeSDK();
      sdk.start();

      const listOfProcessors = getSdkSpanProcessors(sdk);

      assert.ok(listOfProcessors.length === 3);
      assert.ok(listOfProcessors[0] instanceof BatchSpanProcessor);
      assert.ok(listOfProcessors[0]['_exporter'] instanceof ZipkinExporter);
      assert.ok(listOfProcessors[1] instanceof BatchSpanProcessor);
      assert.ok(
        listOfProcessors[1]['_exporter'] instanceof OTLPGrpcTraceExporter
      );
      assert.ok(listOfProcessors[2] instanceof BatchSpanProcessor);
      assert.ok(listOfProcessors[2]['_exporter'] instanceof JaegerExporter);

      delete env.OTEL_TRACES_EXPORTER;
      delete env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL;
      await sdk.shutdown();
    });

    it('should be able to use console and otlp exporters', async () => {
      env.OTEL_TRACES_EXPORTER = 'console, otlp';
      const sdk = new NodeSDK();
      sdk.start();

      const listOfProcessors = getSdkSpanProcessors(sdk);

      assert.ok(listOfProcessors.length === 2);
      assert.ok(listOfProcessors[0] instanceof SimpleSpanProcessor);
      assert.ok(
        listOfProcessors[0]['_exporter'] instanceof ConsoleSpanExporter
      );
      assert.ok(listOfProcessors[1] instanceof BatchSpanProcessor);
      assert.ok(
        listOfProcessors[1]['_exporter'] instanceof OTLPProtoTraceExporter
      );
      delete env.OTEL_TRACES_EXPORTER;
      await sdk.shutdown();
    });

    it('should be able to use console exporter but not http/json exporter', async () => {
      env.OTEL_TRACES_EXPORTER = 'console, http/json';
      const sdk = new NodeSDK();
      sdk.start();

      const listOfProcessors = getSdkSpanProcessors(sdk);

      assert.ok(listOfProcessors.length === 1);
      assert.ok(listOfProcessors[0] instanceof SimpleSpanProcessor);
      assert.ok(
        listOfProcessors[0]['_exporter'] instanceof ConsoleSpanExporter
      );
      delete env.OTEL_TRACES_EXPORTER;
      await sdk.shutdown();
    });

    it('should ignore the protocol from env when use the console exporter', async () => {
      env.OTEL_TRACES_EXPORTER = 'console';
      env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = 'grpc';
      const sdk = new NodeSDK();
      sdk.start();

      const listOfProcessors = getSdkSpanProcessors(sdk);

      assert.ok(listOfProcessors.length === 1);
      assert.ok(listOfProcessors[0] instanceof SimpleSpanProcessor);
      assert.ok(
        listOfProcessors[0]['_exporter'] instanceof ConsoleSpanExporter
      );
      delete env.OTEL_TRACES_EXPORTER;
      delete env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL;
      await sdk.shutdown();
    });
  });
});
