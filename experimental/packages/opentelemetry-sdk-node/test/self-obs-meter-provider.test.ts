/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as Sinon from 'sinon';
import {
  context,
  diag,
  logs,
  metrics,
  propagation,
  trace,
} from '@opentelemetry/api';
import {
  loggingErrorHandler,
  setGlobalErrorHandler,
} from '@opentelemetry/core';
import { OTLPLogExporter as OTLPGrpcLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { OTLPLogExporter as OTLPHttpLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPLogExporter as OTLPProtoLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import { OTLPMetricExporter as OTLPGrpcMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPMetricExporter as OTLPHttpMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPMetricExporter as OTLPProtoMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPTraceExporter as OTLPGrpcTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPTraceExporter as OTLPHttpTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPTraceExporter as OTLPProtoTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import {
  AggregationTemporality,
  InMemoryMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace';
import { NodeSDK } from '../src';
import { startNodeSdk } from '../src/start';

const originalEnv = { ...process.env };

interface StartedSdk {
  shutdown: () => Promise<void>;
}

type ExporterCtor = new (...args: any[]) => object;

interface ProtocolCase {
  name: string;
  protocol?: string;
  traceExporter: ExporterCtor;
  logExporter: ExporterCtor;
  metricExporter: ExporterCtor;
}

function spyOnSetSelfObsMeterProviderIfAbsent(exporter: ExporterCtor) {
  return Sinon.spy(
    exporter.prototype as {
      setSelfObsMeterProviderIfAbsent: (meterProvider: object) => void;
    },
    'setSelfObsMeterProviderIfAbsent'
  );
}

const PROTOCOLS: ProtocolCase[] = [
  {
    name: 'http/protobuf',
    protocol: 'http/protobuf',
    traceExporter: OTLPProtoTraceExporter,
    logExporter: OTLPProtoLogExporter,
    metricExporter: OTLPProtoMetricExporter,
  },
  {
    name: 'http/json',
    protocol: 'http/json',
    traceExporter: OTLPHttpTraceExporter,
    logExporter: OTLPHttpLogExporter,
    metricExporter: OTLPHttpMetricExporter,
  },
  {
    name: 'grpc',
    protocol: 'grpc',
    traceExporter: OTLPGrpcTraceExporter,
    logExporter: OTLPGrpcLogExporter,
    metricExporter: OTLPGrpcMetricExporter,
  },
  {
    name: 'default http/protobuf',
    traceExporter: OTLPProtoTraceExporter,
    logExporter: OTLPProtoLogExporter,
    metricExporter: OTLPProtoMetricExporter,
  },
];

function clearOtelEnv(): void {
  for (const key of Object.keys(process.env)) {
    if (key.startsWith('OTEL_')) {
      delete process.env[key];
    }
  }
}

function exporterSelfObsMetrics(exporter: object): {
  exported: unknown;
  inflight: unknown;
  duration: unknown;
  standardAttrs: Record<string, unknown>;
} {
  const delegate = (
    exporter as {
      _delegate?: { _metrics?: Record<string, unknown> };
    }
  )._delegate;
  const selfObsMetrics = delegate?._metrics;
  assert.ok(
    selfObsMetrics,
    'OTLP exporter is missing self-observability metrics'
  );
  return {
    exported: selfObsMetrics.exported,
    inflight: selfObsMetrics.inflight,
    duration: selfObsMetrics.duration,
    standardAttrs: selfObsMetrics.standardAttrs as Record<string, unknown>,
  };
}

function isNoopInstrument(instrument: unknown): boolean {
  return (
    typeof instrument === 'object' &&
    instrument != null &&
    (
      instrument as { constructor: { name: string } }
    ).constructor.name.startsWith('Noop')
  );
}

function assertExporterSelfObsWired(exporter: object, wired: boolean): void {
  const selfObsMetrics = exporterSelfObsMetrics(exporter);
  assert.strictEqual(isNoopInstrument(selfObsMetrics.exported), !wired);
  assert.strictEqual(isNoopInstrument(selfObsMetrics.inflight), !wired);
  assert.strictEqual(isNoopInstrument(selfObsMetrics.duration), !wired);
}

function meterScopeNames(meterProvider: MeterProvider): string[] {
  const states = (
    meterProvider as unknown as {
      _sharedState: {
        meterSharedStates: Map<
          string,
          { _instrumentationScope: { name: string } }
        >;
      };
    }
  )._sharedState.meterSharedStates;
  return [...states.values()].map(state => state._instrumentationScope.name);
}

function traceExporters(): object[] {
  const tracerProvider = trace.getTracerProvider() as {
    _delegate?: {
      _activeSpanProcessor: { _spanProcessors: Array<{ _exporter: object }> };
    };
    _activeSpanProcessor?: { _spanProcessors: Array<{ _exporter: object }> };
  };
  const processors =
    tracerProvider._activeSpanProcessor?._spanProcessors ??
    tracerProvider._delegate?._activeSpanProcessor._spanProcessors;
  assert.ok(processors, 'tracer provider has no span processors');
  return processors.map(processor => processor._exporter);
}

function traceProcessors(): Array<{
  _exporter: object;
  _metrics: { processedSpans: unknown };
}> {
  const tracerProvider = trace.getTracerProvider() as {
    _delegate?: {
      _activeSpanProcessor: {
        _spanProcessors: Array<{
          _exporter: object;
          _metrics: { processedSpans: unknown };
        }>;
      };
    };
    _activeSpanProcessor?: {
      _spanProcessors: Array<{
        _exporter: object;
        _metrics: { processedSpans: unknown };
      }>;
    };
  };
  const processors =
    tracerProvider._activeSpanProcessor?._spanProcessors ??
    tracerProvider._delegate?._activeSpanProcessor._spanProcessors;
  assert.ok(processors);
  return processors;
}

function logExporters(): object[] {
  const loggerProvider = logs.getLoggerProvider() as {
    _sharedState?: {
      registeredLogRecordProcessors: Array<{ _exporter: object }>;
    };
    _delegate?: {
      _sharedState: {
        registeredLogRecordProcessors: Array<{ _exporter: object }>;
      };
    };
  };
  const processors =
    loggerProvider._sharedState?.registeredLogRecordProcessors ??
    loggerProvider._delegate?._sharedState.registeredLogRecordProcessors;
  assert.ok(processors, 'logger provider has no log record processors');
  return processors.map(processor => processor._exporter);
}

function logProcessors(): Array<{
  _exporter: object;
  _metrics: { processedLogs: unknown };
}> {
  const loggerProvider = logs.getLoggerProvider() as {
    _sharedState?: {
      registeredLogRecordProcessors: Array<{
        _exporter: object;
        _metrics: { processedLogs: unknown };
      }>;
    };
    _delegate?: {
      _sharedState: {
        registeredLogRecordProcessors: Array<{
          _exporter: object;
          _metrics: { processedLogs: unknown };
        }>;
      };
    };
  };
  const processors =
    loggerProvider._sharedState?.registeredLogRecordProcessors ??
    loggerProvider._delegate?._sharedState.registeredLogRecordProcessors;
  assert.ok(processors);
  return processors;
}

function metricExporter(): object {
  const meterProvider = metrics.getMeterProvider() as MeterProvider;
  const sharedState = (
    meterProvider as unknown as {
      _sharedState: {
        metricCollectors: Array<{
          _metricReader: {
            _exporter: object;
            _selfObsMetrics: { collectionDuration: unknown };
          };
        }>;
      };
    }
  )._sharedState;
  return sharedState.metricCollectors[0]._metricReader._exporter;
}

function metricReaderSelfObs(): unknown {
  const meterProvider = metrics.getMeterProvider() as MeterProvider;
  const sharedState = (
    meterProvider as unknown as {
      _sharedState: {
        metricCollectors: Array<{
          _metricReader: { _selfObsMetrics: { collectionDuration: unknown } };
        }>;
      };
    }
  )._sharedState;
  return sharedState.metricCollectors[0]._metricReader._selfObsMetrics
    .collectionDuration;
}

function applyProtocol(protocol: string | undefined): void {
  if (protocol == null) {
    delete process.env.OTEL_EXPORTER_OTLP_PROTOCOL;
    return;
  }
  process.env.OTEL_EXPORTER_OTLP_PROTOCOL = protocol;
}

function refuseOtlpEndpoint(): void {
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://127.0.0.1:1';
  process.env.OTEL_EXPORTER_OTLP_TIMEOUT = '200';
  process.env.OTEL_METRIC_EXPORT_INTERVAL = '60000';
  process.env.OTEL_METRIC_EXPORT_TIMEOUT = '1000';
}

describe('OTEL_NODE_EXPERIMENTAL_SDK_METRICS OTLP self-observability', function () {
  this.timeout(10_000);

  beforeEach(() => {
    setGlobalErrorHandler(() => {});
    diag.disable();
    context.disable();
    trace.disable();
    propagation.disable();
    metrics.disable();
    logs.disable();
    clearOtelEnv();
  });

  afterEach(() => {
    setGlobalErrorHandler(loggingErrorHandler());
    Sinon.restore();
    context.disable();
    trace.disable();
    propagation.disable();
    metrics.disable();
    logs.disable();
    for (const key of Object.keys(process.env)) {
      delete process.env[key];
    }
    Object.assign(process.env, originalEnv);
  });

  const entryPoints: Array<{
    name: string;
    start: () => StartedSdk;
  }> = [
    {
      name: 'NodeSDK.start()',
      start: () => {
        const sdk = new NodeSDK({ autoDetectResources: false });
        sdk.start();
        return sdk;
      },
    },
    {
      name: 'startNodeSdk()',
      start: () => startNodeSdk({ resourceDetectors: [] }),
    },
  ];

  for (const entryPoint of entryPoints) {
    describe(entryPoint.name, function () {
      for (const protocol of PROTOCOLS) {
        it(`wires auto-created ${protocol.name} trace, log, and metric OTLP exporters`, async () => {
          process.env.OTEL_NODE_EXPERIMENTAL_SDK_METRICS = 'true';
          process.env.OTEL_TRACES_EXPORTER = 'otlp';
          process.env.OTEL_LOGS_EXPORTER = 'otlp';
          process.env.OTEL_METRICS_EXPORTER = 'otlp';
          applyProtocol(protocol.protocol);
          refuseOtlpEndpoint();

          const metricSpy = spyOnSetSelfObsMeterProviderIfAbsent(
            protocol.metricExporter
          );
          const sdk = entryPoint.start();

          const spanProcessors = traceProcessors();
          assert.strictEqual(spanProcessors.length, 1);
          assert.ok(
            spanProcessors[0]._exporter instanceof protocol.traceExporter
          );
          assert.strictEqual(
            isNoopInstrument(spanProcessors[0]._metrics.processedSpans),
            false
          );
          assertExporterSelfObsWired(spanProcessors[0]._exporter, true);

          const logRecordProcessors = logProcessors();
          assert.strictEqual(logRecordProcessors.length, 1);
          assert.ok(
            logRecordProcessors[0]._exporter instanceof protocol.logExporter
          );
          assert.strictEqual(
            isNoopInstrument(logRecordProcessors[0]._metrics.processedLogs),
            false
          );
          assertExporterSelfObsWired(logRecordProcessors[0]._exporter, true);

          const exporter = metricExporter();
          assert.ok(exporter instanceof protocol.metricExporter);
          assert.strictEqual(isNoopInstrument(metricReaderSelfObs()), false);
          assert.strictEqual(metricSpy.callCount, 1);
          assert.strictEqual(
            metricSpy.firstCall.args[0],
            metrics.getMeterProvider()
          );
          assertExporterSelfObsWired(exporter, true);
          const metricAttrs = exporterSelfObsMetrics(exporter).standardAttrs;
          assert.strictEqual(metricAttrs['server.address'], '127.0.0.1');
          assert.strictEqual(metricAttrs['server.port'], 1);

          const meterProvider = metrics.getMeterProvider() as MeterProvider;
          assert.ok(
            meterScopeNames(meterProvider).includes(
              '@opentelemetry/otlp-exporter'
            )
          );

          await sdk.shutdown();
        });

        it(`does not wire ${protocol.name} OTLP exporters when SDK metrics are disabled`, async () => {
          delete process.env.OTEL_NODE_EXPERIMENTAL_SDK_METRICS;
          process.env.OTEL_TRACES_EXPORTER = 'otlp';
          process.env.OTEL_LOGS_EXPORTER = 'otlp';
          process.env.OTEL_METRICS_EXPORTER = 'otlp';
          applyProtocol(protocol.protocol);
          refuseOtlpEndpoint();

          const metricSpy = spyOnSetSelfObsMeterProviderIfAbsent(
            protocol.metricExporter
          );
          const sdk = entryPoint.start();

          assertExporterSelfObsWired(traceExporters()[0], false);
          assertExporterSelfObsWired(logExporters()[0], false);
          assert.strictEqual(metricSpy.callCount, 0);
          assertExporterSelfObsWired(metricExporter(), false);
          assert.strictEqual(isNoopInstrument(metricReaderSelfObs()), true);

          const meterProvider = metrics.getMeterProvider() as MeterProvider;
          assert.ok(
            !meterScopeNames(meterProvider).includes(
              '@opentelemetry/otlp-exporter'
            )
          );

          await sdk.shutdown();
        });
      }

      it('preserves signal-specific OTEL_EXPORTER_OTLP_METRICS_ENDPOINT attributes on the auto-created metric exporter', async () => {
        process.env.OTEL_NODE_EXPERIMENTAL_SDK_METRICS = 'true';
        process.env.OTEL_TRACES_EXPORTER = 'none';
        process.env.OTEL_LOGS_EXPORTER = 'none';
        process.env.OTEL_METRICS_EXPORTER = 'otlp';
        process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT =
          'http://127.0.0.1:4318/v1/metrics';
        process.env.OTEL_EXPORTER_OTLP_METRICS_TIMEOUT = '200';
        process.env.OTEL_METRIC_EXPORT_INTERVAL = '60000';
        process.env.OTEL_METRIC_EXPORT_TIMEOUT = '1000';

        const sdk = entryPoint.start();
        const exporter = metricExporter();
        assertExporterSelfObsWired(exporter, true);
        const metricAttrs = exporterSelfObsMetrics(exporter).standardAttrs;
        assert.strictEqual(metricAttrs['server.address'], '127.0.0.1');
        assert.strictEqual(metricAttrs['server.port'], 4318);

        await sdk.shutdown();
      });

      it('leaves trace exporters unwired when no MeterProvider is created', async () => {
        process.env.OTEL_NODE_EXPERIMENTAL_SDK_METRICS = 'true';
        process.env.OTEL_TRACES_EXPORTER = 'otlp';
        process.env.OTEL_LOGS_EXPORTER = 'none';
        process.env.OTEL_METRICS_EXPORTER = 'none';
        process.env.OTEL_EXPORTER_OTLP_PROTOCOL = 'http/json';

        const sdk = entryPoint.start();

        assert.ok(traceExporters()[0] instanceof OTLPHttpTraceExporter);
        assertExporterSelfObsWired(traceExporters()[0], false);
        assert.ok(!(metrics.getMeterProvider() instanceof MeterProvider));

        await sdk.shutdown();
      });

      it('wires an invalid protocol fallback exporter', async () => {
        process.env.OTEL_NODE_EXPERIMENTAL_SDK_METRICS = 'true';
        process.env.OTEL_TRACES_EXPORTER = 'otlp';
        process.env.OTEL_LOGS_EXPORTER = 'otlp';
        process.env.OTEL_METRICS_EXPORTER = 'otlp';
        process.env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = 'not-a-protocol';
        process.env.OTEL_EXPORTER_OTLP_LOGS_PROTOCOL = 'not-a-protocol';
        process.env.OTEL_EXPORTER_OTLP_METRICS_PROTOCOL = 'not-a-protocol';
        refuseOtlpEndpoint();

        const sdk = entryPoint.start();

        assert.ok(traceExporters()[0] instanceof OTLPProtoTraceExporter);
        assertExporterSelfObsWired(traceExporters()[0], true);
        assert.ok(logExporters()[0] instanceof OTLPProtoLogExporter);
        assertExporterSelfObsWired(logExporters()[0], true);
        assert.ok(metricExporter() instanceof OTLPProtoMetricExporter);
        assertExporterSelfObsWired(metricExporter(), true);

        await sdk.shutdown();
      });
    });
  }

  describe('callers that supply their own exporters', function () {
    it('does not rewrite a NodeSDK traceExporter constructed by the caller', async () => {
      process.env.OTEL_NODE_EXPERIMENTAL_SDK_METRICS = 'true';
      process.env.OTEL_LOGS_EXPORTER = 'none';
      const traceExporter = new OTLPHttpTraceExporter();
      const sdk = new NodeSDK({
        autoDetectResources: false,
        traceExporter,
        metricReaders: [
          new PeriodicExportingMetricReader({
            exporter: new InMemoryMetricExporter(
              AggregationTemporality.CUMULATIVE
            ),
            exportIntervalMillis: 60_000,
            exportTimeoutMillis: 30_000,
          }),
        ],
      });
      sdk.start();

      assert.strictEqual(traceExporters()[0], traceExporter);
      assertExporterSelfObsWired(traceExporter, false);
      assert.ok(metrics.getMeterProvider() instanceof MeterProvider);

      await sdk.shutdown();
    });

    it('does not rewrite a startNodeSdk span processor supplied by the caller', async () => {
      process.env.OTEL_NODE_EXPERIMENTAL_SDK_METRICS = 'true';
      process.env.OTEL_LOGS_EXPORTER = 'none';
      process.env.OTEL_METRICS_EXPORTER = 'none';
      const traceExporter = new OTLPGrpcTraceExporter();
      const sdk = startNodeSdk({
        resourceDetectors: [],
        spanProcessors: [new BatchSpanProcessor({ exporter: traceExporter })],
        metricReaders: [
          new PeriodicExportingMetricReader({
            exporter: new InMemoryMetricExporter(
              AggregationTemporality.CUMULATIVE
            ),
            exportIntervalMillis: 60_000,
            exportTimeoutMillis: 30_000,
          }),
        ],
      });

      assert.strictEqual(traceExporters()[0], traceExporter);
      assertExporterSelfObsWired(traceExporter, false);

      await sdk.shutdown();
    });

    it('wires a caller-supplied OTLP metric exporter when SDK metrics are enabled', async () => {
      process.env.OTEL_NODE_EXPERIMENTAL_SDK_METRICS = 'true';
      process.env.OTEL_TRACES_EXPORTER = 'none';
      process.env.OTEL_LOGS_EXPORTER = 'none';
      const metricExp = new OTLPProtoMetricExporter({
        url: 'http://127.0.0.1:1/v1/metrics',
        timeoutMillis: 50,
      });
      const sdk = new NodeSDK({
        autoDetectResources: false,
        metricReaders: [
          new PeriodicExportingMetricReader({
            exporter: metricExp,
            exportIntervalMillis: 60_000,
            exportTimeoutMillis: 30_000,
          }),
        ],
      });
      sdk.start();

      assert.strictEqual(metricExporter(), metricExp);
      assertExporterSelfObsWired(metricExp, true);
      assert.strictEqual(
        meterScopeNames(metrics.getMeterProvider() as MeterProvider).includes(
          '@opentelemetry/otlp-exporter'
        ),
        true
      );

      await sdk.shutdown();
    });

    it('preserves a constructor selfObsMeterProvider on a caller-supplied OTLP metric exporter', async () => {
      process.env.OTEL_NODE_EXPERIMENTAL_SDK_METRICS = 'true';
      process.env.OTEL_TRACES_EXPORTER = 'none';
      process.env.OTEL_LOGS_EXPORTER = 'none';
      const customMeterProvider = new MeterProvider();
      const metricExp = new OTLPProtoMetricExporter({
        selfObsMeterProvider: customMeterProvider,
        url: 'http://127.0.0.1:1/v1/metrics',
        timeoutMillis: 50,
      });
      const setSpy = Sinon.spy(metricExp, 'setSelfObsMeterProvider');
      const sdk = new NodeSDK({
        autoDetectResources: false,
        metricReaders: [
          new PeriodicExportingMetricReader({
            exporter: metricExp,
            exportIntervalMillis: 60_000,
            exportTimeoutMillis: 30_000,
          }),
        ],
      });
      sdk.start();

      assert.strictEqual(metricExporter(), metricExp);
      assert.strictEqual(setSpy.callCount, 0);
      assertExporterSelfObsWired(metricExp, true);
      assert.strictEqual(
        meterScopeNames(customMeterProvider).includes(
          '@opentelemetry/otlp-exporter'
        ),
        true
      );
      assert.strictEqual(
        meterScopeNames(metrics.getMeterProvider() as MeterProvider).includes(
          '@opentelemetry/otlp-exporter'
        ),
        false
      );

      await sdk.shutdown();
      await customMeterProvider.shutdown();
    });

    it('preserves a prior setSelfObsMeterProvider call on a caller-supplied OTLP metric exporter', async () => {
      process.env.OTEL_NODE_EXPERIMENTAL_SDK_METRICS = 'true';
      process.env.OTEL_TRACES_EXPORTER = 'none';
      process.env.OTEL_LOGS_EXPORTER = 'none';
      const customMeterProvider = new MeterProvider();
      const metricExp = new OTLPProtoMetricExporter({
        url: 'http://127.0.0.1:1/v1/metrics',
        timeoutMillis: 50,
      });
      metricExp.setSelfObsMeterProvider(customMeterProvider);
      const setSpy = Sinon.spy(metricExp, 'setSelfObsMeterProvider');
      const sdk = new NodeSDK({
        autoDetectResources: false,
        metricReaders: [
          new PeriodicExportingMetricReader({
            exporter: metricExp,
            exportIntervalMillis: 60_000,
            exportTimeoutMillis: 30_000,
          }),
        ],
      });
      sdk.start();

      assert.strictEqual(metricExporter(), metricExp);
      assert.strictEqual(setSpy.callCount, 0);
      assertExporterSelfObsWired(metricExp, true);
      assert.strictEqual(
        meterScopeNames(customMeterProvider).includes(
          '@opentelemetry/otlp-exporter'
        ),
        true
      );
      assert.strictEqual(
        meterScopeNames(metrics.getMeterProvider() as MeterProvider).includes(
          '@opentelemetry/otlp-exporter'
        ),
        false
      );

      await sdk.shutdown();
      await customMeterProvider.shutdown();
    });
  });

  it('exports metric self-observability on the same MeterProvider without re-entering export', async function () {
    this.timeout(10_000);
    process.env.OTEL_NODE_EXPERIMENTAL_SDK_METRICS = 'true';
    process.env.OTEL_TRACES_EXPORTER = 'none';
    process.env.OTEL_LOGS_EXPORTER = 'none';
    process.env.OTEL_METRICS_EXPORTER = 'otlp';
    process.env.OTEL_EXPORTER_OTLP_METRICS_PROTOCOL = 'http/protobuf';
    process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT =
      'http://127.0.0.1:1/v1/metrics';
    process.env.OTEL_EXPORTER_OTLP_METRICS_TIMEOUT = '200';
    process.env.OTEL_METRIC_EXPORT_INTERVAL = '60000';
    process.env.OTEL_METRIC_EXPORT_TIMEOUT = '1000';

    const sdk = new NodeSDK({ autoDetectResources: false });
    sdk.start();
    assertExporterSelfObsWired(metricExporter(), true);

    metrics.getMeter('user').createCounter('user_counter').add(1);
    await sdk.shutdown();
  });
});
