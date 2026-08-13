/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { startNodeSdk } from '../src/start';
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
import { logs } from '@opentelemetry/api-logs';
import {
  SimpleLogRecordProcessor,
  ConsoleLogRecordExporter,
  BatchLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import { OTLPLogExporter as OTLPProtoLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import { OTLPLogExporter as OTLPHttpLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPLogExporter as OTLPGrpcLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { OTLPMetricExporter as OTLPGrpcMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPMetricExporter as OTLPProtoMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPMetricExporter as OTLPHttpMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter as OTLPHttpTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPTraceExporter as OTLPProtoTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPTraceExporter as OTLPGrpcTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { setupContextManager } from '../src/utils';
import { NOOP_SDK } from '../src/start';
import {
  ConsoleMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import type { SpanProcessor } from '@opentelemetry/sdk-trace';
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  TracerProvider,
} from '@opentelemetry/sdk-trace';

// XXX only
describe.only('startNodeSdk', function () {
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
    it('should return NOOP_SDK when disabled is true', async () => {
      process.env.OTEL_SDK_DISABLED = 'true';
      const sdk = startNodeSdk();

      assert.strictEqual(sdk, NOOP_SDK);

      await sdk.shutdown();
    });

    it('should not register more than the minimal SDK components', async () => {
      // need to set these to none, since the default value is 'otlp'
      process.env.OTEL_TRACES_EXPORTER = 'none';
      process.env.OTEL_LOGS_EXPORTER = 'none';
      process.env.OTEL_METRICS_EXPORTER = 'none';
      const sdk = startNodeSdk();

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
      const sdk = startNodeSdk();

      assert.strictEqual(spy.callCount, 1);
      assert.ok(spy.args[0][0] instanceof DiagConsoleLogger);
      assert.deepStrictEqual(spy.args[0][1], {
        logLevel: DiagLogLevel.ERROR,
      });

      await sdk.shutdown();
    });

    it('should register a diag logger at INFO level by default (even when OTEL_LOG_LEVEL is not set)', async () => {
      delete process.env.OTEL_LOG_LEVEL;

      const spy = Sinon.spy(diag, 'setLogger');
      const sdk = startNodeSdk();

      assert.strictEqual(spy.callCount, 1);
      assert.ok(spy.args[0][0] instanceof DiagConsoleLogger);
      assert.deepStrictEqual(spy.args[0][1], {
        logLevel: DiagLogLevel.INFO,
      });

      await sdk.shutdown();
    });

    it('should register propagators as defined in OTEL_PROPAGATORS', async () => {
      process.env.OTEL_PROPAGATORS = 'b3';
      const sdk = startNodeSdk({});

      assert.deepStrictEqual(propagation.fields(), ['b3']);

      await sdk.shutdown();
    });

    it('should not register propagators OTEL_PROPAGATORS contains "none"', async () => {
      process.env.OTEL_PROPAGATORS = 'none';
      const sdk = startNodeSdk({});

      assert.deepStrictEqual(propagation.fields(), []);

      await sdk.shutdown();
    });

    it('should not register propagators OTEL_PROPAGATORS contains "none" alongside valid propagator', async () => {
      process.env.OTEL_PROPAGATORS = 'b3, none';
      const sdk = startNodeSdk({});

      assert.deepStrictEqual(propagation.fields(), []);

      await sdk.shutdown();
    });
  });

  it('should return NOOP_SDK when OTEL_CONFIG_FILE is invalid', async () => {
    const diagError = Sinon.spy(diag, 'error');
    process.env.OTEL_CONFIG_FILE = 'test/fixtures/invalid.yaml';
    const sdk = startNodeSdk({});

    assert.strictEqual(sdk, NOOP_SDK);
    assert.strictEqual(diagError.callCount, 1);
    assert.ok(
      diagError.args[0][0].includes(
        'Could not load OpenTelemetry configuration, SDK will not be setup: test/fixtures/invalid.yaml: Unsupported file_format: "bogus"'
      )
    );

    await sdk.shutdown();
  });

  it('should return NOOP_SDK when OTEL_CONFIG_FILE does not exist', async () => {
    const diagError = Sinon.spy(diag, 'error');
    process.env.OTEL_CONFIG_FILE = 'test/fixtures/no-such-file.yaml';
    const sdk = startNodeSdk({});

    assert.strictEqual(sdk, NOOP_SDK);
    assert.strictEqual(diagError.callCount, 1);
    assert.ok(
      diagError.args[0][0].includes(
        'Could not load OpenTelemetry configuration, SDK will not be setup: ENOENT'
      )
    );

    await sdk.shutdown();
  });

  it('should diag.error and return NOOP_SDK when components in OTEL_CONFIG_FILE cannot be created', async () => {
    const diagError = Sinon.spy(diag, 'error');
    process.env.OTEL_CONFIG_FILE =
      'test/fixtures/unknown-log-record-processor.yaml';
    const sdk = startNodeSdk({});

    assert.strictEqual(sdk, NOOP_SDK);
    assert.strictEqual(diagError.callCount, 1);
    assert.strictEqual(
      diagError.args[0][0],
      'Could not create OpenTelemetry SDK from configuration, SDK will not be setup: unknown LogRecordProcessor name: "my_custom_processor"'
    );

    await sdk.shutdown();
  });

  it('should register a logger provider if multiple log record processors are provided', async () => {
    process.env.TEST_DIR = __dirname;
    process.env.OTEL_CONFIG_FILE = 'test/fixtures/logger.yaml';
    const sdk = startNodeSdk({});

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

    process.env.TEST_DIR = __dirname;
    process.env.OTEL_CONFIG_FILE = 'test/fixtures/meter.yaml';
    const sdk = startNodeSdk({});

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

  it('should register a tracer provider for fixtures/tracer.yaml', async () => {
    process.env.TEST_DIR = __dirname;
    process.env.OTEL_CONFIG_FILE = 'test/fixtures/tracer.yaml';
    const sdk = startNodeSdk({});

    assert.strictEqual(setGlobalTracerProviderSpy.callCount, 1);
    assert.ok(
      setGlobalTracerProviderSpy.lastCall.args[0] instanceof TracerProvider
    );

    const tracerProvider = trace.getTracerProvider();
    const spanProcessors = (tracerProvider as any)._delegate
      ._activeSpanProcessor._spanProcessors as SpanProcessor[];
    assert.strictEqual(spanProcessors.length, 4);

    assert.ok(spanProcessors[0] instanceof BatchSpanProcessor);
    assert.ok(
      (spanProcessors[0] as any)['_exporter'] instanceof OTLPProtoTraceExporter
    );

    assert.ok(spanProcessors[1] instanceof BatchSpanProcessor);
    assert.ok(
      (spanProcessors[1] as any)['_exporter'] instanceof OTLPHttpTraceExporter
    );

    assert.ok(spanProcessors[2] instanceof BatchSpanProcessor);
    assert.ok(
      (spanProcessors[2] as any)['_exporter'] instanceof OTLPGrpcTraceExporter
    );

    assert.ok(spanProcessors[3] instanceof SimpleSpanProcessor);
    assert.ok(
      (spanProcessors[3] as any)['_exporter'] instanceof ConsoleSpanExporter
    );

    await sdk.shutdown();
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
      const sdk = startNodeSdk({});
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
      const sdk = startNodeSdk({});

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
      const sdk = startNodeSdk({});

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
      const sdk = startNodeSdk({});

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
      const sdk = startNodeSdk({});

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
      const sdk = startNodeSdk({});

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
      const sdk = startNodeSdk({});

      assertDefaultContextManagerRegistered();
      assert.ok(metrics.getMeterProvider() instanceof MeterProvider);

      await sdk.shutdown();
    });

    it('should register a meter provider if a list of exporters is provided', async () => {
      process.env.OTEL_METRICS_EXPORTER = 'console,otlp';
      const sdk = startNodeSdk({});

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
      const sdk = startNodeSdk({});

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
      const tracerProvider = trace.getTracerProvider();
      return (tracerProvider as any)._delegate._activeSpanProcessor
        ._spanProcessors as SpanProcessor[];
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
      const sdk = startNodeSdk();
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
      const sdk = startNodeSdk({});
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
      const sdk = startNodeSdk({});
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
      const sdk = startNodeSdk({});

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
      const sdk = startNodeSdk({});

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
      const sdk = startNodeSdk({});

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
      const sdk = startNodeSdk({});

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
      const sdk = startNodeSdk({});

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
    it('null context manager', async () => {
      setupContextManager(null);
      assert.equal(
        context['_getContextManager']().constructor.name,
        'NoopContextManager'
      );
    });
  });
});

function assertDefaultContextManagerRegistered() {
  assert.ok(
    context['_getContextManager']().constructor.name ===
      AsyncLocalStorageContextManager.name
  );
}
