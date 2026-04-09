/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { setupResource, startNodeSDK } from '../src/start';
import * as Sinon from 'sinon';
import {
  context,
  propagation,
  trace,
  diag,
  DiagLogLevel,
  metrics,
  DiagConsoleLogger,
} from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import {
  assertServiceInstanceIdIsUUID,
  assertServiceResource,
} from './util/resource-assertions';
import type { DetectedResource } from '@opentelemetry/resources';
import {
  envDetector,
  processDetector,
  hostDetector,
  serviceInstanceIdDetector,
} from '@opentelemetry/resources';
import { logs } from '@opentelemetry/api-logs';
import {
  SimpleLogRecordProcessor,
  ConsoleLogRecordExporter,
  BatchLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import type {
  ConfigFactory,
  ConfigurationModel,
  LogRecordExporterConfigModel,
} from '@opentelemetry/configuration';
import { createConfigFactory } from '@opentelemetry/configuration';
import { OTLPLogExporter as OTLPProtoLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import { OTLPLogExporter as OTLPHttpLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPLogExporter as OTLPGrpcLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { OTLPMetricExporter as OTLPGrpcMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPMetricExporter as OTLPProtoMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPMetricExporter as OTLPHttpMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter as OTLPHttpTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPTraceExporter as OTLPProtoTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPTraceExporter as OTLPGrpcTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';

import {
  ATTR_HOST_NAME,
  ATTR_PROCESS_PID,
  ATTR_SERVICE_INSTANCE_ID,
} from '../src/semconv';
import { ATTR_OS_TYPE } from '@opentelemetry/resources/src/semconv';
import {
  getAggregationType,
  getLogRecordExporter,
  getSpanLimitsFromConfiguration,
  setupContextManager,
} from '../src/utils';
import {
  ConsoleMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import type { SpanProcessor } from '@opentelemetry/sdk-trace-node';
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
  NodeTracerProvider,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-node';

describe('startNodeSDK', function () {
  let setGlobalLoggerProviderSpy: Sinon.SinonSpy;
  let setGlobalMeterProviderSpy: Sinon.SinonSpy;
  let setGlobalTracerProviderSpy: Sinon.SinonSpy;

  beforeEach(() => {
    diag.disable();
    context.disable();
    trace.disable();
    propagation.disable();
    metrics.disable();
    logs.disable();

    setGlobalLoggerProviderSpy = Sinon.spy(logs, 'setGlobalLoggerProvider');
    setGlobalMeterProviderSpy = Sinon.spy(metrics, 'setGlobalMeterProvider');
    setGlobalTracerProviderSpy = Sinon.spy(trace, 'setGlobalTracerProvider');
  });

  const _origEnvVariables = { ...process.env };

  afterEach(function () {
    for (const key of Object.keys(process.env)) {
      delete process.env[key];
    }
    for (const [key, value] of Object.entries(_origEnvVariables)) {
      process.env[key] = value;
    }

    // disable all registered SDK components
    context.disable();
    propagation.disable();

    Sinon.restore();
  });

  describe('Basic Registration', function () {
    it('should not register more than the minimal SDK components', async () => {
      // need to set these to none, since the default value is 'otlp'
      process.env.OTEL_TRACES_EXPORTER = 'none';
      process.env.OTEL_LOGS_EXPORTER = 'none';
      process.env.OTEL_METRICS_EXPORTER = 'none';
      const sdk = startNodeSDK({});

      // These are minimal OTel functionality and always registered.
      assertDefaultContextManagerRegistered();
      assert.deepStrictEqual(propagation.fields(), []);

      assert.ok(
        setGlobalLoggerProviderSpy.called === false,
        'logger provider should not have changed'
      );
      assert.ok(!(metrics.getMeterProvider() instanceof MeterProvider));
      assert.ok(
        setGlobalTracerProviderSpy.called === false,
        'tracer provider should not have changed'
      );

      await sdk.shutdown();
    });

    it('should register a diag logger with OTEL_LOG_LEVEL', async () => {
      process.env.OTEL_LOG_LEVEL = 'ERROR';

      const spy = Sinon.spy(diag, 'setLogger');
      const sdk = startNodeSDK({});

      assert.strictEqual(spy.callCount, 1);
      assert.ok(spy.args[0][0] instanceof DiagConsoleLogger);
      assert.deepStrictEqual(spy.args[0][1], {
        logLevel: DiagLogLevel.ERROR,
      });

      await sdk.shutdown();
    });

    it('should register a diag logger with INFO with OTEL_LOG_LEVEL unset', async () => {
      delete process.env.OTEL_LOG_LEVEL;

      const spy = Sinon.spy(diag, 'setLogger');
      const sdk = startNodeSDK({});

      assert.strictEqual(spy.callCount, 1);
      assert.ok(spy.args[0][0] instanceof DiagConsoleLogger);
      assert.deepStrictEqual(spy.args[0][1], {
        logLevel: DiagLogLevel.INFO,
      });
      await sdk.shutdown();
    });

    it('should register a propagator if only a propagator is provided', async () => {
      const expectedPropagator = new W3CTraceContextPropagator();
      const sdk = startNodeSDK({ textMapPropagator: expectedPropagator });

      const actualPropagator = propagation['_getGlobalPropagator']();
      assert.equal(actualPropagator, expectedPropagator);
      await sdk.shutdown();
    });

    it('should register propagators as defined in OTEL_PROPAGATORS', async () => {
      process.env.OTEL_PROPAGATORS = 'b3';
      const sdk = startNodeSDK({});

      assert.deepStrictEqual(propagation.fields(), ['b3']);

      await sdk.shutdown();
    });

    it('should not register propagators OTEL_PROPAGATORS contains "none"', async () => {
      process.env.OTEL_PROPAGATORS = 'none';
      const sdk = startNodeSDK({});

      assert.deepStrictEqual(propagation.fields(), []);

      await sdk.shutdown();
    });

    it('should not register propagators OTEL_PROPAGATORS contains "none" alongside valid propagator', async () => {
      process.env.OTEL_PROPAGATORS = 'b3, none';
      const sdk = startNodeSDK({});

      assert.deepStrictEqual(propagation.fields(), []);

      await sdk.shutdown();
    });

    it('should not register propagators OTEL_PROPAGATORS contains valid propagator but option is set to null', async () => {
      process.env.OTEL_PROPAGATORS = 'b3';
      const sdk = startNodeSDK({ textMapPropagator: null });

      assert.deepStrictEqual(propagation.fields(), []);

      await sdk.shutdown();
    });
  });

  it('should return NOOP_SDK when disabled is true', async () => {
    const info = Sinon.spy(diag, 'info');
    process.env.OTEL_SDK_DISABLED = 'true';
    const sdk = startNodeSDK({});

    Sinon.assert.calledWith(info, 'OpenTelemetry SDK is disabled');

    await sdk.shutdown();
  });

  it('should return NOOP_SDK when disabled is true', async () => {
    process.env.OTEL_CONFIG_FILE = 'test/fixtures/kitchen-sink.yaml';
    const sdk = startNodeSDK({});

    assertDefaultContextManagerRegistered();

    await sdk.shutdown();
  });

  it('should register a diag logger as info as default', async () => {
    const spy = Sinon.spy(diag, 'setLogger');
    const sdk = startNodeSDK({});

    assert.strictEqual(spy.callCount, 1);
    assert.ok(spy.args[0][0] instanceof DiagConsoleLogger);
    assert.deepStrictEqual(spy.args[0][1], {
      logLevel: DiagLogLevel.INFO,
    });

    await sdk.shutdown();
  });

  it('should register a logger provider if multiple log record processors are provided', async () => {
    process.env.OTEL_CONFIG_FILE = 'test/fixtures/logger.yaml';
    const sdk = startNodeSDK({});

    const loggerProvider = logs.getLoggerProvider();
    const sharedState = (loggerProvider as any)['_sharedState'];
    assert.ok(sharedState.registeredLogRecordProcessors.length === 3);
    assert.ok(
      sharedState.registeredLogRecordProcessors[0]._exporter instanceof
        OTLPProtoLogExporter
    );
    assert.ok(
      sharedState.registeredLogRecordProcessors[0] instanceof
        BatchLogRecordProcessor
    );
    assert.ok(
      sharedState.registeredLogRecordProcessors[1]._exporter instanceof
        OTLPGrpcLogExporter
    );
    assert.ok(
      sharedState.registeredLogRecordProcessors[1] instanceof
        BatchLogRecordProcessor
    );
    assert.ok(
      sharedState.registeredLogRecordProcessors[2]._exporter instanceof
        ConsoleLogRecordExporter
    );
    assert.ok(
      sharedState.registeredLogRecordProcessors[2] instanceof
        SimpleLogRecordProcessor
    );
    await sdk.shutdown();
  });

  it('should register a meter provider if multiple metric readers are provided', async () => {
    const stubLoggerWarn: Sinon.SinonStub = Sinon.stub(diag, 'warn');

    process.env.OTEL_CONFIG_FILE = 'test/fixtures/meter.yaml';
    const sdk = startNodeSDK({});

    // Periodic type 'otlp_file/development' is not supported yet
    assert.strictEqual(
      stubLoggerWarn.args[0][0],
      'Unsupported Metric Exporter.'
    );
    assert.strictEqual(
      stubLoggerWarn.args[1][0],
      'Unsupported Metric Exporter.'
    );

    const meterProvider = metrics.getMeterProvider() as MeterProvider;
    const sharedState = (meterProvider as any)['_sharedState'];
    assert.strictEqual(sharedState.metricCollectors.length, 4);

    assert.ok(
      sharedState.metricCollectors[0]._metricReader instanceof
        PeriodicExportingMetricReader
    );
    assert.ok(
      sharedState.metricCollectors[0]._metricReader._exporter instanceof
        OTLPProtoMetricExporter
    );

    assert.ok(
      sharedState.metricCollectors[1]._metricReader instanceof
        PeriodicExportingMetricReader
    );
    assert.ok(
      sharedState.metricCollectors[1]._metricReader._exporter instanceof
        OTLPHttpMetricExporter
    );

    assert.ok(
      sharedState.metricCollectors[2]._metricReader instanceof
        PeriodicExportingMetricReader
    );
    assert.ok(
      sharedState.metricCollectors[2]._metricReader._exporter instanceof
        OTLPGrpcMetricExporter
    );

    assert.ok(
      sharedState.metricCollectors[3]._metricReader instanceof
        PeriodicExportingMetricReader
    );
    assert.ok(
      sharedState.metricCollectors[3]._metricReader._exporter instanceof
        ConsoleMetricExporter
    );

    stubLoggerWarn.reset();
    await sdk.shutdown();
  });

  it('should register a tracer provider if an exporter is provided', async () => {
    const stubLoggerWarn: Sinon.SinonStub = Sinon.stub(diag, 'warn');
    process.env.OTEL_CONFIG_FILE = 'test/fixtures/tracer.yaml';
    const sdk = startNodeSDK({});

    // Periodic type 'otlp_file/development' is not supported yet
    assert.strictEqual(
      stubLoggerWarn.args[0][0],
      'Unsupported Exporter value. No Span Exporter registered'
    );
    assert.strictEqual(
      stubLoggerWarn.args[1][0],
      'Unsupported Exporter value. No Span Exporter registered'
    );

    assert.strictEqual(setGlobalTracerProviderSpy.callCount, 1);
    assert.ok(
      setGlobalTracerProviderSpy.lastCall.args[0] instanceof NodeTracerProvider
    );

    const tracerProvider = trace.getTracerProvider() as NodeTracerProvider;
    const delegateInfo = (tracerProvider as any)['_delegate'];
    assert.strictEqual(delegateInfo._config.spanProcessors.length, 5);

    assert.ok(
      delegateInfo._config.spanProcessors[0] instanceof BatchSpanProcessor
    );
    assert.ok(
      (delegateInfo._config.spanProcessors[0] as any)['_exporter'] instanceof
        OTLPProtoTraceExporter
    );

    assert.ok(
      delegateInfo._config.spanProcessors[1] instanceof BatchSpanProcessor
    );
    assert.ok(
      (delegateInfo._config.spanProcessors[1] as any)['_exporter'] instanceof
        OTLPHttpTraceExporter
    );

    assert.ok(
      delegateInfo._config.spanProcessors[2] instanceof BatchSpanProcessor
    );
    assert.ok(
      (delegateInfo._config.spanProcessors[2] as any)['_exporter'] instanceof
        OTLPProtoTraceExporter
    );

    assert.ok(
      delegateInfo._config.spanProcessors[3] instanceof BatchSpanProcessor
    );
    assert.ok(
      (delegateInfo._config.spanProcessors[3] as any)['_exporter'] instanceof
        OTLPGrpcTraceExporter
    );

    assert.ok(
      delegateInfo._config.spanProcessors[4] instanceof SimpleSpanProcessor
    );
    assert.ok(
      (delegateInfo._config.spanProcessors[4] as any)['_exporter'] instanceof
        ConsoleSpanExporter
    );

    stubLoggerWarn.reset();
    await sdk.shutdown();
  });

  describe('setupResources', async function () {
    beforeEach(() => {
      process.env.OTEL_RESOURCE_ATTRIBUTES =
        'service.instance.id=627cc493,service.name=my-service,service.namespace=default,service.version=0.0.1';
    });

    afterEach(() => {
      delete process.env.OTEL_RESOURCE_ATTRIBUTES;
    });

    // Local function to test if a mocked method is ever called with a specific argument or regex matching for an argument.
    // Needed because of race condition with parallel detectors.
    const callArgsMatches = (
      mockedFunction: Sinon.SinonSpy,
      regex: RegExp
    ): boolean => {
      return mockedFunction.getCalls().some(call => {
        return call.args.some(callArgs => regex.test(callArgs.toString()));
      });
    };

    it('returns a merged resource with custom resource', async () => {
      const configFactory: ConfigFactory = createConfigFactory();
      const config = configFactory.getConfigModel();
      const resource = setupResource(config, {
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
      await resource.waitForAsyncAttributes?.();

      assert.strictEqual(resource.attributes['customAttr'], 'someValue');
      assertServiceResource(resource, {
        instanceId: '627cc493',
        name: 'my-service',
        namespace: 'default',
        version: '0.0.1',
      });
    });

    it('default detectors populate values properly', async () => {
      const configFactory: ConfigFactory = createConfigFactory();
      const config = configFactory.getConfigModel();
      const resource = setupResource(config, {});
      await resource.waitForAsyncAttributes?.();

      assertServiceResource(resource, {
        instanceId: '627cc493',
        name: 'my-service',
        namespace: 'default',
        version: '0.0.1',
      });

      assert.equal(resource.attributes[ATTR_PROCESS_PID], undefined);
      assert.equal(resource.attributes[ATTR_HOST_NAME], undefined);
    });

    it('no resource detectors with OTEL_NODE_RESOURCE_DETECTORS as none', async () => {
      process.env.OTEL_NODE_RESOURCE_DETECTORS = 'none';
      const configFactory: ConfigFactory = createConfigFactory();
      const config = configFactory.getConfigModel();
      const resource = setupResource(config, {});
      await resource.waitForAsyncAttributes?.();

      assert.equal(resource.attributes[ATTR_PROCESS_PID], undefined);
      assert.equal(resource.attributes[ATTR_HOST_NAME], undefined);
    });

    it('have node resource detectors with OTEL_NODE_RESOURCE_DETECTORS as all', async () => {
      process.env.OTEL_NODE_RESOURCE_DETECTORS = 'all';
      const configFactory: ConfigFactory = createConfigFactory();
      const config = configFactory.getConfigModel();
      const resource = setupResource(config, {});
      await resource.waitForAsyncAttributes?.();

      assert.notEqual(resource.attributes[ATTR_PROCESS_PID], undefined);
      assert.notEqual(resource.attributes[ATTR_HOST_NAME], undefined);
      assert.notEqual(resource.attributes[ATTR_SERVICE_INSTANCE_ID], undefined);
      assert.notEqual(resource.attributes[ATTR_OS_TYPE], undefined);
    });

    it('should configure resources from config file', async () => {
      process.env.OTEL_CONFIG_FILE = 'test/fixtures/resources.yaml';
      const configFactory: ConfigFactory = createConfigFactory();
      const config = configFactory.getConfigModel();
      const resource = setupResource(config, {});
      await resource.waitForAsyncAttributes?.();

      assert.deepStrictEqual(
        resource.schemaUrl,
        'https://opentelemetry.io/schemas/1.16.0'
      );

      assert.deepStrictEqual(resource.attributes, {
        'service.name': 'config-name',
        'service.namespace': 'config-namespace',
        'service.version': '1.0.0',
        bool_array_key: [true, false],
        bool_key: true,
        double_array_key: [1.1, 2.2],
        double_key: 1.1,
        int_array_key: [1, 2],
        int_key: 1,
        string_array_key: ['value1', 'value2'],
        string_key: 'value',
      });
    });

    it('returns a merged resource with a buggy detector', async () => {
      const configFactory: ConfigFactory = createConfigFactory();
      const config = configFactory.getConfigModel();
      const resource = setupResource(config, {
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
      await resource.waitForAsyncAttributes?.();

      assertServiceResource(resource, {
        instanceId: '627cc493',
        name: 'my-service',
        namespace: 'default',
        version: '0.0.1',
      });
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
      process.env.OTEL_NODE_RESOURCE_DETECTORS = 'env,os,no-such-detector';
      const diagMocks = {
        error: Sinon.fake(),
        warn: Sinon.fake(),
        info: Sinon.fake(),
        debug: Sinon.fake(),
        verbose: Sinon.fake(),
      };
      diag.setLogger(diagMocks, DiagLogLevel.DEBUG);
      const sdk1 = startNodeSDK({});
      await sdk1.shutdown();

      const sdk2 = startNodeSDK({ resourceDetectors: [envDetector] });
      await sdk2.shutdown();

      assert.ok(
        !callArgsMatches(diagMocks.error, /no-such-detector/),
        'diag.error() messages do not mention "no-such-detector"'
      );
    });
  });

  describe('configureServiceName', async function () {
    it('should configure service name via OTEL_SERVICE_NAME env var', async () => {
      process.env.OTEL_SERVICE_NAME = 'env-set-name';
      process.env.OTEL_RESOURCE_ATTRIBUTES =
        'service.instance.id=my-instance-id';
      const configFactory: ConfigFactory = createConfigFactory();
      const config = configFactory.getConfigModel();
      const resource = setupResource(config, {});
      await resource.waitForAsyncAttributes?.();

      assertServiceResource(resource, {
        name: 'env-set-name',
        instanceId: 'my-instance-id',
      });
    });

    it('should configure service name via OTEL_RESOURCE_ATTRIBUTES env var', async () => {
      process.env.OTEL_RESOURCE_ATTRIBUTES =
        'service.name=resource-env-set-name,service.instance.id=my-instance-id';
      const configFactory: ConfigFactory = createConfigFactory();
      const config = configFactory.getConfigModel();
      const resource = setupResource(config, {});
      await resource.waitForAsyncAttributes?.();

      assertServiceResource(resource, {
        name: 'resource-env-set-name',
        instanceId: 'my-instance-id',
      });
    });
  });

  describe('configureServiceInstanceId', async function () {
    it('should configure service instance id via OTEL_RESOURCE_ATTRIBUTES env var', async () => {
      process.env.OTEL_RESOURCE_ATTRIBUTES =
        'service.instance.id=627cc493,service.name=my-service,service.namespace';
      const configFactory: ConfigFactory = createConfigFactory();
      const config = configFactory.getConfigModel();
      const resource = setupResource(config, {});
      await resource.waitForAsyncAttributes?.();

      assertServiceResource(resource, {
        name: 'my-service',
        instanceId: '627cc493',
      });
    });

    it('should configure service instance id via OTEL_NODE_RESOURCE_DETECTORS env var', async () => {
      process.env.OTEL_NODE_RESOURCE_DETECTORS = 'env,host,os,serviceinstance';
      const configFactory: ConfigFactory = createConfigFactory();
      const config = configFactory.getConfigModel();
      const resource = setupResource(config, {});
      await resource.waitForAsyncAttributes?.();

      assertServiceInstanceIdIsUUID(resource);
    });

    it('should configure service instance id with random UUID', async () => {
      const configFactory: ConfigFactory = createConfigFactory();
      const config = configFactory.getConfigModel();
      const resource = setupResource(config, {
        resourceDetectors: [
          processDetector,
          envDetector,
          hostDetector,
          serviceInstanceIdDetector,
        ],
      });
      await resource.waitForAsyncAttributes?.();

      assertServiceInstanceIdIsUUID(resource);
    });
  });

  describe('configuring logger provider from env', function () {
    let stubLogger: Sinon.SinonStub;

    beforeEach(() => {
      stubLogger = Sinon.stub(diag, 'info');
    });

    afterEach(() => {
      stubLogger.reset();
    });

    it('should not register the provider if OTEL_LOGS_EXPORTER contains none', async () => {
      process.env.OTEL_LOGS_EXPORTER = 'console,none';
      const sdk = startNodeSDK({});
      assert.strictEqual(
        stubLogger.args[0][0],
        'OTEL_LOGS_EXPORTER contains "none". Logger provider will not be initialized.'
      );

      assert.ok(
        setGlobalLoggerProviderSpy.callCount === 0,
        'logger provider should not have changed'
      );
      await sdk.shutdown();
    });

    it('should set up all allowed exporters', async () => {
      process.env.OTEL_LOGS_EXPORTER = 'console,otlp';
      const sdk = startNodeSDK({});

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
      process.env.OTEL_LOGS_EXPORTER = 'otlp';
      process.env.OTEL_EXPORTER_OTLP_LOGS_PROTOCOL = 'grpc';
      const sdk = startNodeSDK({});

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
      process.env.OTEL_LOGS_EXPORTER = 'otlp';
      process.env.OTEL_EXPORTER_OTLP_LOGS_PROTOCOL = 'http/json';
      const sdk = startNodeSDK({});

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
      process.env.OTEL_LOGS_EXPORTER = 'otlp';
      process.env.OTEL_EXPORTER_OTLP_PROTOCOL = 'grpc';
      const sdk = startNodeSDK({});

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
      process.env.OTEL_LOGS_EXPORTER = 'otlp';
      process.env.OTEL_EXPORTER_OTLP_LOGS_PROTOCOL = 'grpc2';
      const sdk = startNodeSDK({});

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

  describe('configuring meter provider from env', function () {
    it('should register a meter provider if a exporter is provided', async () => {
      process.env.OTEL_METRICS_EXPORTER = 'console';
      const sdk = startNodeSDK({});

      assertDefaultContextManagerRegistered();
      assert.ok(metrics.getMeterProvider() instanceof MeterProvider);

      await sdk.shutdown();
    });

    it('should register a meter provider if a list of exporters is provided', async () => {
      process.env.OTEL_METRICS_EXPORTER = 'console,otlp';
      const sdk = startNodeSDK({});

      assertDefaultContextManagerRegistered();

      const meterProvider = metrics.getMeterProvider() as MeterProvider;
      assert.ok(meterProvider instanceof MeterProvider);

      // Verify that both metric readers are registered
      const sharedState = (meterProvider as any)['_sharedState'];
      assert.strictEqual(sharedState.metricCollectors.length, 2);

      await sdk.shutdown();
    });

    it('should not register the provider if OTEL_METRICS_EXPORTER contains none', async () => {
      process.env.OTEL_METRICS_EXPORTER = 'console,none';
      const sdk = startNodeSDK({});

      assert.ok(
        setGlobalMeterProviderSpy.callCount === 0,
        'meter provider should not have changed'
      );
      await sdk.shutdown();
    });
  });

  describe('setup trace exporter from env', () => {
    let stubLoggerWarn: Sinon.SinonStub;
    let stubLoggerInfo: Sinon.SinonStub;

    const getSdkSpanProcessors = () => {
      const tracerProvider = trace.getTracerProvider() as NodeTracerProvider;
      const delegateInfo = (tracerProvider as any)['_delegate'];
      return delegateInfo?._config?.spanProcessors as SpanProcessor[];
    };

    beforeEach(() => {
      stubLoggerWarn = Sinon.stub(diag, 'warn');
      stubLoggerInfo = Sinon.stub(diag, 'info');
      delete process.env.OTEL_LOGS_EXPORTER;
      delete process.env.OTEL_METRICS_EXPORTER;
      delete process.env.OTEL_TRACES_EXPORTER;
    });

    afterEach(() => {
      delete process.env.OTEL_EXPORTER_OTLP_PROTOCOL;
      delete process.env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL;
      delete process.env.OTEL_TRACES_EXPORTER;
      stubLoggerWarn.restore();
      stubLoggerInfo.restore();
    });

    it('should only create one span processor when configured using env vars and config', async () => {
      process.env.OTEL_TRACES_EXPORTER = 'console';
      const sdk = startNodeSDK({});
      const listOfProcessors = getSdkSpanProcessors();

      assert.strictEqual(listOfProcessors.length, 1);
      assert.ok(listOfProcessors[0] instanceof SimpleSpanProcessor);
      assert.ok(
        listOfProcessors[0]['_exporter'] instanceof ConsoleSpanExporter
      );
      await sdk.shutdown();
    });

    it('should use otlp exporter and defined exporter protocol env value', async () => {
      process.env.OTEL_TRACES_EXPORTER = 'otlp';
      process.env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = 'grpc';
      const sdk = startNodeSDK({});
      const listOfProcessors = getSdkSpanProcessors();

      assert.ok(listOfProcessors.length === 1);
      assert.ok(listOfProcessors[0] instanceof BatchSpanProcessor);
      assert.ok(
        listOfProcessors[0]['_exporter'] instanceof OTLPGrpcTraceExporter
      );
      await sdk.shutdown();
    });

    it('should use exporter and processor from env, signal specific env for protocol takes precedence', async () => {
      process.env.OTEL_TRACES_EXPORTER = 'otlp';
      process.env.OTEL_EXPORTER_OTLP_PROTOCOL = 'http/protobuf';
      process.env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = 'grpc';
      const sdk = startNodeSDK({});
      const listOfProcessors = getSdkSpanProcessors();

      assert.ok(listOfProcessors.length === 1);
      assert.ok(listOfProcessors[0] instanceof BatchSpanProcessor);
      assert.ok(
        listOfProcessors[0]['_exporter'] instanceof OTLPGrpcTraceExporter
      );
      await sdk.shutdown();
    });

    it('should use empty span processor when user sets env exporter to none', async () => {
      process.env.OTEL_TRACES_EXPORTER = 'none';
      const sdk = startNodeSDK({});

      // also it should info
      assert.strictEqual(
        stubLoggerInfo.args[0][0],
        'OTEL_TRACES_EXPORTER contains "none". Tracer provider will not be initialized.'
      );

      assert.ok(
        setGlobalTracerProviderSpy.called === false,
        'tracer provider should not have changed'
      );

      await sdk.shutdown();
    });

    it('should use no exporter when none value is provided with other exporters', async () => {
      process.env.OTEL_TRACES_EXPORTER = 'otlp,zipkin,none';
      const sdk = startNodeSDK({});

      // also it should info
      assert.strictEqual(
        stubLoggerInfo.args[0][0],
        'OTEL_TRACES_EXPORTER contains "none". Tracer provider will not be initialized.'
      );

      assert.ok(
        setGlobalTracerProviderSpy.called === false,
        'tracer provider should not have changed'
      );

      await sdk.shutdown();
    });

    it('should be able to use console and otlp exporters', async () => {
      process.env.OTEL_TRACES_EXPORTER = 'console, otlp';
      const sdk = startNodeSDK({});

      const listOfProcessors = getSdkSpanProcessors();

      assert.ok(listOfProcessors.length === 2);
      assert.ok(listOfProcessors[0] instanceof SimpleSpanProcessor);
      assert.ok(
        listOfProcessors[0]['_exporter'] instanceof ConsoleSpanExporter
      );
      assert.ok(listOfProcessors[1] instanceof BatchSpanProcessor);
      assert.ok(
        listOfProcessors[1]['_exporter'] instanceof OTLPProtoTraceExporter
      );
      await sdk.shutdown();
    });

    it('should ignore the protocol from env when use the console exporter', async () => {
      process.env.OTEL_TRACES_EXPORTER = 'console';
      process.env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = 'grpc';
      const sdk = startNodeSDK({});

      const listOfProcessors = getSdkSpanProcessors();

      assert.ok(listOfProcessors.length === 1);
      assert.ok(listOfProcessors[0] instanceof SimpleSpanProcessor);
      assert.ok(
        listOfProcessors[0]['_exporter'] instanceof ConsoleSpanExporter
      );
      await sdk.shutdown();
    });

    it('should not register the same exporter twice', async () => {
      process.env.OTEL_TRACES_EXPORTER = 'console,otlp,console';
      const sdk = startNodeSDK({});

      const listOfProcessors = getSdkSpanProcessors();

      assert.ok(listOfProcessors.length === 2);
      assert.ok(listOfProcessors[0] instanceof SimpleSpanProcessor);
      assert.ok(
        listOfProcessors[0]['_exporter'] instanceof ConsoleSpanExporter
      );
      assert.ok(listOfProcessors[1] instanceof BatchSpanProcessor);
      assert.ok(
        listOfProcessors[1]['_exporter'] instanceof OTLPProtoTraceExporter
      );
      await sdk.shutdown();
    });
  });

  describe('tests to increase code coverage', function () {
    it('should return undefined for invalid log record exporter model', async () => {
      const exporter: LogRecordExporterConfigModel = {};
      assert.equal(getLogRecordExporter(exporter), undefined);
    });

    it('', async () => {
      setupContextManager(null);
      assert.equal(
        context['_getContextManager']().constructor.name,
        'NoopContextManager'
      );
    });

    it('return undefined with no config for tracer limits', async () => {
      assert.equal(
        getSpanLimitsFromConfiguration({} as ConfigurationModel),
        undefined
      );
    });

    it('return undefined for no aggregation type', async () => {
      assert.equal(getAggregationType({}), undefined);
    });
  });
});

function assertDefaultContextManagerRegistered() {
  assert.ok(
    context['_getContextManager']().constructor.name ===
      AsyncLocalStorageContextManager.name
  );
}
