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
  ATTR_URL_PATH,
  ATTR_URL_QUERY,
  METRIC_HTTP_CLIENT_REQUEST_DURATION,
  METRIC_HTTP_SERVER_REQUEST_DURATION,
} from '@opentelemetry/semantic-conventions';
import * as assert from 'assert';
import * as diagch from 'diagnostics_channel';
import * as http from 'http';
import * as net from 'net';
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

  it('passes the Host authority in reconstructed options for origin-form requests', async () => {
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
      assert.strictEqual(hookOptions.host, `${hostname}:${serverPort}`);
      assert.strictEqual(hookOptions.hostname, undefined);
      assert.strictEqual(hookOptions.port, serverPort);
    } finally {
      instrumentation.setConfig({ useDiagnosticsChannel: true });
    }
  });

  it('uses an overridden Host header as the request authority', async () => {
    await metricReader.collectAndExport();
    metricsMemoryExporter.reset();

    const result = await httpRequest.get({
      hostname,
      port: serverPort,
      path: '/host-override',
      headers: { Host: 'example.test' },
    });

    assert.strictEqual(result.statusCode, 200);
    const clientSpan = memoryExporter
      .getFinishedSpans()
      .find(span => span.kind === SpanKind.CLIENT);
    assert.ok(clientSpan);
    assert.strictEqual(
      clientSpan.attributes[ATTR_SERVER_ADDRESS],
      'example.test'
    );
    assert.strictEqual(clientSpan.attributes[ATTR_SERVER_PORT], 80);
    assert.strictEqual(
      clientSpan.attributes[ATTR_URL_FULL],
      'http://example.test/host-override'
    );

    await metricReader.collectAndExport();
    const metrics =
      metricsMemoryExporter.getMetrics()[0].scopeMetrics[0].metrics;
    const clientDuration = metrics.find(
      metric => metric.descriptor.name === METRIC_HTTP_CLIENT_REQUEST_DURATION
    );
    assert.ok(clientDuration);
    assert.strictEqual(clientDuration.dataPoints.length, 1);
    assert.strictEqual(
      clientDuration.dataPoints[0].attributes[ATTR_SERVER_ADDRESS],
      'example.test'
    );
    assert.strictEqual(
      clientDuration.dataPoints[0].attributes[ATTR_SERVER_PORT],
      80
    );
  });

  it('uses the final Host header set after request creation', async () => {
    await new Promise<void>((resolve, reject) => {
      const request = http.request(
        {
          hostname,
          port: serverPort,
          path: '/late-host-override',
        },
        response => {
          response.resume();
          response.on('end', resolve);
        }
      );
      request.on('error', reject);
      request.setHeader('Host', 'example.test:8080');
      request.end();
    });

    const clientSpan = memoryExporter
      .getFinishedSpans()
      .find(span => span.kind === SpanKind.CLIENT);
    assert.ok(clientSpan);
    assert.strictEqual(
      clientSpan.attributes[ATTR_SERVER_ADDRESS],
      'example.test'
    );
    assert.strictEqual(clientSpan.attributes[ATTR_SERVER_PORT], 8080);
    assert.strictEqual(
      clientSpan.attributes[ATTR_URL_FULL],
      'http://example.test:8080/late-host-override'
    );

    await metricReader.collectAndExport();
    const clientDuration = metricsMemoryExporter
      .getMetrics()[0]
      .scopeMetrics[0].metrics.find(
        metric => metric.descriptor.name === METRIC_HTTP_CLIENT_REQUEST_DURATION
      );
    assert.ok(clientDuration);
    assert.strictEqual(
      clientDuration.dataPoints[0].attributes[ATTR_SERVER_ADDRESS],
      'example.test'
    );
    assert.strictEqual(
      clientDuration.dataPoints[0].attributes[ATTR_SERVER_PORT],
      8080
    );
  });

  it('retains the request destination when the Host header is removed', async () => {
    await new Promise<void>((resolve, reject) => {
      const request = http.request(
        {
          hostname,
          port: serverPort,
          path: '/removed-host',
        },
        response => {
          response.resume();
          response.on('end', resolve);
        }
      );
      request.on('error', reject);
      request.removeHeader('Host');
      request.end();
    });

    const clientSpan = memoryExporter
      .getFinishedSpans()
      .find(span => span.kind === SpanKind.CLIENT);
    assert.ok(clientSpan);
    assert.strictEqual(clientSpan.attributes[ATTR_SERVER_ADDRESS], hostname);
    assert.strictEqual(clientSpan.attributes[ATTR_SERVER_PORT], serverPort);
    assert.strictEqual(
      clientSpan.attributes[ATTR_URL_FULL],
      `http://${hostname}:${serverPort}/removed-host`
    );
  });

  it('prefers the logical destination port over the socket peer port', async () => {
    const logicalHostname = 'origin.example';
    const logicalPort = 8080;
    const agent = new http.Agent();
    agent.createConnection = () =>
      net.createConnection({ host: hostname, port: serverPort });

    try {
      await new Promise<void>((resolve, reject) => {
        const request = http.request(
          {
            hostname: logicalHostname,
            port: logicalPort,
            path: '/removed-host-via-agent',
            agent,
          },
          response => {
            response.resume();
            response.on('end', resolve);
          }
        );
        request.on('error', reject);
        request.removeHeader('Host');
        request.end();
      });
    } finally {
      agent.destroy();
    }

    const clientSpan = memoryExporter
      .getFinishedSpans()
      .find(span => span.kind === SpanKind.CLIENT);
    assert.ok(clientSpan);
    assert.strictEqual(
      clientSpan.attributes[ATTR_SERVER_ADDRESS],
      logicalHostname
    );
    assert.strictEqual(clientSpan.attributes[ATTR_SERVER_PORT], logicalPort);
    assert.strictEqual(
      clientSpan.attributes[ATTR_URL_FULL],
      `http://${logicalHostname}:${logicalPort}/removed-host-via-agent`
    );
  });

  it('does not retain an initial Host override after it is removed', async () => {
    await new Promise<void>((resolve, reject) => {
      const request = http.request(
        {
          hostname,
          port: serverPort,
          path: '/removed-host-override',
          headers: { Host: 'initial.example:8080' },
        },
        response => {
          response.resume();
          response.on('end', resolve);
        }
      );
      request.on('error', reject);
      request.removeHeader('Host');
      request.end();
    });

    const clientSpan = memoryExporter
      .getFinishedSpans()
      .find(span => span.kind === SpanKind.CLIENT);
    assert.ok(clientSpan);
    assert.strictEqual(clientSpan.attributes[ATTR_SERVER_ADDRESS], hostname);
    assert.strictEqual(clientSpan.attributes[ATTR_SERVER_PORT], 80);
    assert.strictEqual(
      clientSpan.attributes[ATTR_URL_FULL],
      `http://${hostname}/removed-host-override`
    );
  });

  it('finalizes the Host authority before an early response ends the span', async () => {
    await new Promise<void>((resolve, reject) => {
      const request = http.request(
        {
          hostname,
          port: serverPort,
          path: '/early-response',
          method: 'POST',
        },
        response => {
          response.resume();
          response.on('end', () => {
            request.end();
            resolve();
          });
        }
      );
      request.on('error', reject);
      request.setHeader('Host', 'example.test:8080');
      request.flushHeaders();
    });

    const clientSpan = memoryExporter
      .getFinishedSpans()
      .find(span => span.kind === SpanKind.CLIENT);
    assert.ok(clientSpan);
    assert.strictEqual(
      clientSpan.attributes[ATTR_SERVER_ADDRESS],
      'example.test'
    );
    assert.strictEqual(clientSpan.attributes[ATTR_SERVER_PORT], 8080);
  });

  it('finalizes the Host authority when the request errors before finish', async () => {
    const unavailablePort = await new Promise<number>((resolve, reject) => {
      const unavailableServer = http.createServer();
      unavailableServer.on('error', reject);
      unavailableServer.listen(0, hostname, () => {
        const address = unavailableServer.address();
        assert.ok(address && typeof address !== 'string');
        unavailableServer.close(error => {
          if (error) {
            reject(error);
          } else {
            resolve(address.port);
          }
        });
      });
    });

    await new Promise<void>(resolve => {
      const request = http.request({ hostname, port: unavailablePort });
      request.setHeader('Host', 'example.test:8080');
      request.on('error', () => resolve());
      request.end();
    });

    const clientSpan = memoryExporter
      .getFinishedSpans()
      .find(span => span.kind === SpanKind.CLIENT);
    assert.ok(clientSpan);
    assert.strictEqual(
      clientSpan.attributes[ATTR_SERVER_ADDRESS],
      'example.test'
    );
    assert.strictEqual(clientSpan.attributes[ATTR_SERVER_PORT], 8080);
  });

  it('normalizes optional whitespace around the Host authority', async () => {
    await httpRequest.get({
      hostname,
      port: serverPort,
      path: '/host-whitespace',
      headers: { Host: ' example.test:8080 ' },
    });

    const clientSpan = memoryExporter
      .getFinishedSpans()
      .find(span => span.kind === SpanKind.CLIENT);
    assert.ok(clientSpan);
    assert.strictEqual(
      clientSpan.attributes[ATTR_SERVER_ADDRESS],
      'example.test'
    );
    assert.strictEqual(clientSpan.attributes[ATTR_SERVER_PORT], 8080);
    assert.strictEqual(
      clientSpan.attributes[ATTR_URL_FULL],
      'http://example.test:8080/host-whitespace'
    );
  });

  it('uses a bracketed IPv6 Host authority', async () => {
    await httpRequest.get({
      hostname,
      port: serverPort,
      path: '/ipv6-host',
      headers: { Host: '[2001:db8::1]:8080' },
    });

    const clientSpan = memoryExporter
      .getFinishedSpans()
      .find(span => span.kind === SpanKind.CLIENT);
    assert.ok(clientSpan);
    assert.strictEqual(
      clientSpan.attributes[ATTR_SERVER_ADDRESS],
      '2001:db8::1'
    );
    assert.strictEqual(clientSpan.attributes[ATTR_SERVER_PORT], 8080);
    assert.strictEqual(
      clientSpan.attributes[ATTR_URL_FULL],
      'http://[2001:db8::1]:8080/ipv6-host'
    );
  });

  it('uses an IPvFuture Host authority', async () => {
    await httpRequest.get({
      hostname,
      port: serverPort,
      path: '/ipvfuture-host?query=value',
      headers: { Host: '[v1.fe80]:8080' },
    });

    const clientSpan = memoryExporter
      .getFinishedSpans()
      .find(span => span.kind === SpanKind.CLIENT);
    assert.ok(clientSpan);
    assert.strictEqual(clientSpan.attributes[ATTR_SERVER_ADDRESS], 'v1.fe80');
    assert.strictEqual(clientSpan.attributes[ATTR_SERVER_PORT], 8080);
    assert.strictEqual(
      clientSpan.attributes[ATTR_URL_FULL],
      'http://[v1.fe80]:8080/ipvfuture-host?query=value'
    );
    const serverSpan = memoryExporter
      .getFinishedSpans()
      .find(span => span.kind === SpanKind.SERVER);
    assert.ok(serverSpan);
    assert.strictEqual(serverSpan.attributes[ATTR_SERVER_ADDRESS], 'v1.fe80');
    assert.strictEqual(serverSpan.attributes[ATTR_SERVER_PORT], 8080);
    assert.strictEqual(serverSpan.attributes[ATTR_URL_PATH], '/ipvfuture-host');
    assert.strictEqual(serverSpan.attributes[ATTR_URL_QUERY], 'query=value');
  });

  it('does not interpret userinfo in a malformed Host header', async () => {
    await httpRequest.get({
      hostname,
      port: serverPort,
      path: '/malformed-host',
      headers: { Host: 'user:secret@example.test' },
    });

    const clientSpan = memoryExporter
      .getFinishedSpans()
      .find(span => span.kind === SpanKind.CLIENT);
    assert.ok(clientSpan);
    assert.strictEqual(clientSpan.attributes[ATTR_SERVER_ADDRESS], hostname);
    assert.strictEqual(clientSpan.attributes[ATTR_SERVER_PORT], 80);
    assert.strictEqual(
      clientSpan.attributes[ATTR_URL_FULL],
      `http://${hostname}/malformed-host`
    );
  });

  it('retains the query redaction policy used when the span starts', async () => {
    instrumentation.setConfig({
      useDiagnosticsChannel: true,
      redactedQueryParams: ['secret'],
    });

    try {
      await new Promise<void>((resolve, reject) => {
        const request = http.request(
          {
            hostname,
            port: serverPort,
            path: '/redaction?secret=value',
          },
          response => {
            response.resume();
            response.on('end', resolve);
          }
        );
        request.on('error', reject);
        instrumentation.setConfig({
          useDiagnosticsChannel: true,
          redactedQueryParams: [],
        });
        request.end();
      });

      const clientSpan = memoryExporter
        .getFinishedSpans()
        .find(span => span.kind === SpanKind.CLIENT);
      assert.ok(clientSpan);
      assert.strictEqual(
        clientSpan.attributes[ATTR_URL_FULL],
        `http://${hostname}:${serverPort}/redaction?secret=REDACTED`
      );
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
      'http://[v1.fe80]:8080/proxied-ipvfuture',
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
    assert.strictEqual(clientSpans.length, 4);
    for (const clientSpan of clientSpans.slice(0, 3)) {
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
      'http://origin.example:80/proxied-default-port'
    );
    assert.strictEqual(
      clientSpans[2].attributes[ATTR_URL_FULL],
      'http://origin.example/proxied-mixed-case-scheme'
    );
    assert.strictEqual(
      clientSpans[3].attributes[ATTR_SERVER_ADDRESS],
      'v1.fe80'
    );
    assert.strictEqual(clientSpans[3].attributes[ATTR_SERVER_PORT], 8080);
    assert.strictEqual(
      clientSpans[3].attributes[ATTR_URL_FULL],
      'http://[v1.fe80]:8080/proxied-ipvfuture'
    );

    await metricReader.collectAndExport();
    const metrics =
      metricsMemoryExporter.getMetrics()[0].scopeMetrics[0].metrics;
    const clientDuration = metrics.find(
      metric => metric.descriptor.name === METRIC_HTTP_CLIENT_REQUEST_DURATION
    );
    assert.ok(clientDuration);
    assert.strictEqual(clientDuration.dataPoints.length, 2);
    const originPoint = clientDuration.dataPoints.find(
      dataPoint =>
        dataPoint.attributes[ATTR_SERVER_ADDRESS] === 'origin.example'
    );
    const ipvFuturePoint = clientDuration.dataPoints.find(
      dataPoint => dataPoint.attributes[ATTR_SERVER_ADDRESS] === 'v1.fe80'
    );
    assert.ok(originPoint);
    assert.strictEqual(originPoint.attributes[ATTR_SERVER_PORT], 80);
    assert.strictEqual((originPoint.value as any).count, 3);
    assert.ok(ipvFuturePoint);
    assert.strictEqual(ipvFuturePoint.attributes[ATTR_SERVER_PORT], 8080);
    assert.strictEqual((ipvFuturePoint.value as any).count, 1);
    metricsMemoryExporter.reset();
  });

  it('treats an empty port in an absolute-form target as the default port', async () => {
    const result = await httpRequest.get({
      hostname,
      port: serverPort,
      path: 'http://origin.example:/proxied-empty-port',
    });
    assert.strictEqual(result.statusCode, 200);

    const clientSpan = memoryExporter
      .getFinishedSpans()
      .find(span => span.kind === SpanKind.CLIENT);
    assert.ok(clientSpan);
    assert.strictEqual(
      clientSpan.attributes[ATTR_SERVER_ADDRESS],
      'origin.example'
    );
    assert.strictEqual(clientSpan.attributes[ATTR_SERVER_PORT], 80);
    assert.strictEqual(
      clientSpan.attributes[ATTR_URL_FULL],
      'http://origin.example/proxied-empty-port'
    );

    await metricReader.collectAndExport();
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
