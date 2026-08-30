/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Span } from '@opentelemetry/api';
import { context, propagation, SpanKind, trace } from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { isWrapped } from '@opentelemetry/instrumentation';
import {
  AggregationTemporality,
  InMemoryMetricExporter,
  MeterProvider,
} from '@opentelemetry/sdk-metrics';
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
  TracerProvider,
} from '@opentelemetry/sdk-trace';
import {
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_SERVER_ADDRESS,
  ATTR_SERVER_PORT,
  ATTR_URL_FULL,
  METRIC_HTTP_CLIENT_REQUEST_DURATION,
  METRIC_HTTP_SERVER_REQUEST_DURATION,
} from '@opentelemetry/semantic-conventions';
import * as assert from 'assert';
import * as diagch from 'diagnostics_channel';
import * as http from 'http';
import { isHttpDiagnosticsChannelSupported } from '../../src/diagnostics-channel';
import { HttpInstrumentation } from '../../src/http';
import { httpRequest } from '../utils/httpRequest';
import { TestMetricReader } from '../utils/TestMetricReader';

describe('isHttpDiagnosticsChannelSupported', () => {
  it('accepts versions that publish the channels', () => {
    assert.strictEqual(isHttpDiagnosticsChannelSupported('22.12.0'), true);
    assert.strictEqual(isHttpDiagnosticsChannelSupported('22.22.0'), true);
    assert.strictEqual(isHttpDiagnosticsChannelSupported('23.2.0'), true);
    assert.strictEqual(isHttpDiagnosticsChannelSupported('24.0.0'), true);
    assert.strictEqual(isHttpDiagnosticsChannelSupported('25.1.0'), true);
  });

  it('rejects versions that do not publish the channels', () => {
    assert.strictEqual(isHttpDiagnosticsChannelSupported('18.19.0'), false);
    assert.strictEqual(isHttpDiagnosticsChannelSupported('20.6.0'), false);
    assert.strictEqual(isHttpDiagnosticsChannelSupported('21.7.0'), false);
    assert.strictEqual(isHttpDiagnosticsChannelSupported('22.11.0'), false);
    assert.strictEqual(isHttpDiagnosticsChannelSupported('23.0.0'), false);
    assert.strictEqual(isHttpDiagnosticsChannelSupported('23.1.0'), false);
  });

  it('rejects values that are not valid versions', () => {
    assert.strictEqual(
      isHttpDiagnosticsChannelSupported('not-a-version'),
      false
    );
    assert.strictEqual(isHttpDiagnosticsChannelSupported('25'), false);
    assert.strictEqual(isHttpDiagnosticsChannelSupported('25.1'), false);
  });
});

const runIfSupported = isHttpDiagnosticsChannelSupported()
  ? describe
  : describe.skip;

runIfSupported('HttpInstrumentation diagnostics channel', () => {
  const serverPort = 22447;
  const hostname = 'localhost';
  const memoryExporter = new InMemorySpanExporter();
  const provider = new TracerProvider({
    spanProcessors: [new SimpleSpanProcessor({ exporter: memoryExporter })],
  });
  const metricsMemoryExporter = new InMemoryMetricExporter(
    AggregationTemporality.DELTA
  );
  const metricReader = new TestMetricReader(metricsMemoryExporter);
  const meterProvider = new MeterProvider({ readers: [metricReader] });
  const instrumentation = new HttpInstrumentation({
    useDiagnosticsChannel: true,
  });
  instrumentation.setTracerProvider(provider);
  instrumentation.setMeterProvider(meterProvider);
  instrumentation.disable();

  const contextManager = new AsyncLocalStorageContextManager().enable();
  let server: http.Server;
  let activeSpanInHandler: Span | undefined;

  before(done => {
    propagation.setGlobalPropagator(new W3CTraceContextPropagator());
    context.setGlobalContextManager(contextManager);
    server = http.createServer((req, res) => {
      activeSpanInHandler = trace.getSpan(context.active());
      res.end('ok');
    });
    server.listen(serverPort, done);
  });

  after(done => {
    context.disable();
    propagation.disable();
    server.close(done);
  });

  beforeEach(() => {
    instrumentation.enable();
    memoryExporter.reset();
    metricsMemoryExporter.reset();
    activeSpanInHandler = undefined;
  });

  afterEach(() => {
    instrumentation.disable();
  });

  it('does not patch the http module exports', () => {
    assert.strictEqual(isWrapped(http.request), false);
    assert.strictEqual(isWrapped(http.get), false);
    assert.strictEqual(isWrapped(http.Server.prototype.emit), false);
  });

  it('creates client and server spans for a request', async () => {
    const result = await httpRequest.get(
      `http://${hostname}:${serverPort}/test`
    );

    const spans = memoryExporter.getFinishedSpans();
    assert.strictEqual(spans.length, 2);
    const serverSpan = spans.find(span => span.kind === SpanKind.SERVER);
    const clientSpan = spans.find(span => span.kind === SpanKind.CLIENT);
    assert.ok(serverSpan);
    assert.ok(clientSpan);
    assert.strictEqual(clientSpan.name, 'GET');
    assert.strictEqual(serverSpan.name, 'GET');
    assert.strictEqual(clientSpan.attributes[ATTR_HTTP_REQUEST_METHOD], 'GET');
    // `request.host` has no port; it must be recovered from the Host header.
    assert.strictEqual(clientSpan.attributes[ATTR_SERVER_PORT], serverPort);
    assert.strictEqual(
      clientSpan.attributes[ATTR_HTTP_RESPONSE_STATUS_CODE],
      200
    );
    assert.strictEqual(
      serverSpan.attributes[ATTR_HTTP_RESPONSE_STATUS_CODE],
      200
    );
    assert.strictEqual(result.statusCode, 200);
  });

  it('preserves host in reconstructed options for origin-form requests', async () => {
    let hookOptions: http.RequestOptions | undefined;
    instrumentation.setConfig({
      useDiagnosticsChannel: true,
      startOutgoingSpanHook: options => {
        hookOptions = options;
        return {};
      },
    });

    try {
      await httpRequest.get(`http://${hostname}:${serverPort}/hook-options`);

      assert.ok(hookOptions);
      assert.strictEqual(hookOptions.host, hostname);
      assert.strictEqual(hookOptions.hostname, undefined);
    } finally {
      instrumentation.setConfig({ useDiagnosticsChannel: true });
    }
  });

  it('propagates context from client to server', async () => {
    const result = await httpRequest.get(
      `http://${hostname}:${serverPort}/test`
    );

    assert.ok(
      typeof result.req.getHeader('traceparent') === 'string',
      'traceparent header is injected on the client request'
    );

    const spans = memoryExporter.getFinishedSpans();
    const serverSpan = spans.find(span => span.kind === SpanKind.SERVER);
    const clientSpan = spans.find(span => span.kind === SpanKind.CLIENT);
    assert.ok(serverSpan && clientSpan);
    assert.strictEqual(
      serverSpan.parentSpanContext?.spanId,
      clientSpan.spanContext().spanId
    );
  });

  it('makes the server span active in the request handler', async () => {
    await httpRequest.get(`http://${hostname}:${serverPort}/test`);

    const spans = memoryExporter.getFinishedSpans();
    const serverSpan = spans.find(span => span.kind === SpanKind.SERVER);
    assert.ok(serverSpan);
    assert.strictEqual(
      activeSpanInHandler?.spanContext().spanId,
      serverSpan.spanContext().spanId
    );
  });

  it('respects ignoreOutgoingRequestHook', async () => {
    instrumentation.setConfig({
      useDiagnosticsChannel: true,
      ignoreOutgoingRequestHook: () => true,
    });
    await httpRequest.get(`http://${hostname}:${serverPort}/test`);

    const spans = memoryExporter.getFinishedSpans();
    assert.strictEqual(
      spans.find(span => span.kind === SpanKind.CLIENT),
      undefined
    );
    instrumentation.setConfig({ useDiagnosticsChannel: true });
  });

  it('still records a span for Expect: 100-continue requests, without injection', async () => {
    const result = await httpRequest.get({
      hostname,
      port: serverPort,
      path: '/expect',
      headers: { Expect: '100-continue' },
    });

    assert.strictEqual(result.statusCode, 200);
    const spans = memoryExporter.getFinishedSpans();
    const clientSpan = spans.find(span => span.kind === SpanKind.CLIENT);
    assert.ok(clientSpan);
    assert.strictEqual(
      clientSpan.attributes[ATTR_HTTP_RESPONSE_STATUS_CODE],
      200
    );
    assert.strictEqual(result.req.getHeader('traceparent'), undefined);
  });

  it('recovers the origin destination of requests rewritten for a proxy', async () => {
    await metricReader.collectAndExport();
    metricsMemoryExporter.reset();

    // Simulate the absolute-form request target sent to an HTTP proxy.
    for (const target of [
      'http://origin.example/proxied',
      'http://origin.example:80/proxied-default-port',
      'HTTP://origin.example/proxied-mixed-case-scheme',
    ]) {
      const result = await httpRequest.get({
        hostname,
        port: serverPort,
        path: target,
      });
      assert.strictEqual(result.statusCode, 200);
    }

    const clientSpans = memoryExporter
      .getFinishedSpans()
      .filter(span => span.kind === SpanKind.CLIENT);
    assert.strictEqual(clientSpans.length, 3);
    for (const clientSpan of clientSpans) {
      assert.strictEqual(
        clientSpan.attributes[ATTR_SERVER_ADDRESS],
        'origin.example'
      );
      assert.strictEqual(clientSpan.attributes[ATTR_SERVER_PORT], 80);
    }
    assert.strictEqual(
      clientSpans[0].attributes[ATTR_URL_FULL],
      'http://origin.example/proxied'
    );
    assert.strictEqual(
      clientSpans[1].attributes[ATTR_URL_FULL],
      'http://origin.example/proxied-default-port'
    );
    assert.strictEqual(
      clientSpans[2].attributes[ATTR_URL_FULL],
      'http://origin.example/proxied-mixed-case-scheme'
    );

    await metricReader.collectAndExport();
    const metrics =
      metricsMemoryExporter.getMetrics()[0].scopeMetrics[0].metrics;
    const clientDuration = metrics.find(
      metric => metric.descriptor.name === METRIC_HTTP_CLIENT_REQUEST_DURATION
    );
    assert.ok(clientDuration);
    assert.strictEqual(clientDuration.dataPoints.length, 1);
    for (const dataPoint of clientDuration.dataPoints) {
      assert.strictEqual(
        dataPoint.attributes[ATTR_SERVER_ADDRESS],
        'origin.example'
      );
      assert.strictEqual(dataPoint.attributes[ATTR_SERVER_PORT], 80);
      assert.strictEqual((dataPoint.value as any).count, 3);
    }
    metricsMemoryExporter.reset();
  });

  it('records client and server duration metrics', async () => {
    await httpRequest.get(`http://${hostname}:${serverPort}/test`);
    await metricReader.collectAndExport();

    const resourceMetrics = metricsMemoryExporter.getMetrics();
    const metrics = resourceMetrics[0].scopeMetrics[0].metrics;
    const serverDuration = metrics.find(
      metric => metric.descriptor.name === METRIC_HTTP_SERVER_REQUEST_DURATION
    );
    const clientDuration = metrics.find(
      metric => metric.descriptor.name === METRIC_HTTP_CLIENT_REQUEST_DURATION
    );
    assert.ok(serverDuration);
    assert.strictEqual(serverDuration.dataPoints.length, 1);
    assert.ok(clientDuration);
    assert.strictEqual(clientDuration.dataPoints.length, 1);
    assert.strictEqual(
      clientDuration.dataPoints[0].attributes[ATTR_SERVER_PORT],
      serverPort
    );
  });

  it('stops creating spans when disabled', async () => {
    instrumentation.disable();
    assert.strictEqual(isWrapped(server.emit), false);

    await httpRequest.get(`http://${hostname}:${serverPort}/test`);

    assert.strictEqual(memoryExporter.getFinishedSpans().length, 0);
  });
});

runIfSupported('useDiagnosticsChannel resolution', () => {
  const createdChannel = diagch.channel('http.client.request.created');
  const envKey = 'OTEL_INSTRUMENTATION_HTTP_USE_DIAGNOSTICS_CHANNEL';
  let envBefore: string | undefined;

  beforeEach(() => {
    envBefore = process.env[envKey];
  });

  afterEach(() => {
    if (envBefore === undefined) {
      delete process.env[envKey];
    } else {
      process.env[envKey] = envBefore;
    }
  });

  it('is enabled by the environment variables', () => {
    process.env[envKey] = 'true';
    const instr = new HttpInstrumentation({ enabled: false });
    assert.strictEqual(createdChannel.hasSubscribers, false);
    instr.enable();
    assert.strictEqual(createdChannel.hasSubscribers, true);
    instr.disable();
    assert.strictEqual(createdChannel.hasSubscribers, false);
  });

  it('an explicit useDiagnosticsChannel: false wins over the environment variable', () => {
    process.env[envKey] = 'true';
    const instr = new HttpInstrumentation({
      enabled: false,
      useDiagnosticsChannel: false,
    });
    instr.enable();
    assert.strictEqual(createdChannel.hasSubscribers, false);
    instr.disable();
  });

  it('an explicit useDiagnosticsChannel: true works without the environment variable', () => {
    delete process.env[envKey];
    const instr = new HttpInstrumentation({
      enabled: false,
      useDiagnosticsChannel: true,
    });
    instr.enable();
    assert.strictEqual(createdChannel.hasSubscribers, true);
    instr.disable();
    assert.strictEqual(createdChannel.hasSubscribers, false);
  });
});
