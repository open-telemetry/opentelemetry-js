/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Exemplars Demo Application
 *
 * A simple HTTP server that generates traces and metrics with exemplars.
 * Metrics are exported via OTLP to an OpenTelemetry Collector, which
 * forwards traces to Jaeger and exposes metrics for Prometheus scraping.
 *
 * Usage:
 *   1. docker compose up -d
 *   2. npx tsx app.ts              (from this directory)
 *   3. curl localhost:8080/fast     (generate traffic)
 *   4. Open Grafana at localhost:3000 → "Exemplars Demo" dashboard
 *   5. Click an exemplar dot → opens the linked trace in Jaeger
 */

import { context, trace, SpanStatusCode } from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import {
  BatchSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import {
  MeterProvider,
  PeriodicExportingMetricReader,
  AlwaysSampleExemplarFilter,
} from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import * as http from 'http';

const COLLECTOR_URL = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';

// --- Resource ---
const resource = resourceFromAttributes({
  'service.name': 'exemplars-demo',
  'service.version': '1.0.0',
});

// --- Traces ---
const traceExporter = new OTLPTraceExporter({
  url: `${COLLECTOR_URL}/v1/traces`,
});
const tracerProvider = new NodeTracerProvider({
  resource,
  spanProcessors: [new BatchSpanProcessor(traceExporter)],
});
tracerProvider.register();
const tracer = trace.getTracer('exemplars-demo');

// --- Metrics (with exemplars!) ---
const metricExporter = new OTLPMetricExporter({
  url: `${COLLECTOR_URL}/v1/metrics`,
});
const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 5000,
});
const meterProvider = new MeterProvider({
  resource,
  readers: [metricReader],
  exemplarFilter: new AlwaysSampleExemplarFilter(),
});
const meter = meterProvider.getMeter('exemplars-demo');

// --- Instruments ---
const requestCounter = meter.createCounter('http_requests_total', {
  description: 'Total HTTP requests',
});
const requestDuration = meter.createHistogram('http_request_duration_seconds', {
  description: 'HTTP request duration in seconds',
  unit: 's',
});
const activeRequests = meter.createUpDownCounter('http_active_requests', {
  description: 'Currently active HTTP requests',
});

// --- Route handlers ---
type RouteHandler = (
  req: http.IncomingMessage,
  res: http.ServerResponse
) => Promise<void>;

const routes: Record<string, RouteHandler> = {
  '/fast': async (_req, res) => {
    const delay = 10 + Math.random() * 40; // 10-50ms
    await sleep(delay);
    res.writeHead(200);
    res.end(`OK (${delay.toFixed(0)}ms)\n`);
  },
  '/slow': async (_req, res) => {
    const delay = 200 + Math.random() * 800; // 200-1000ms
    await sleep(delay);
    res.writeHead(200);
    res.end(`OK (${delay.toFixed(0)}ms)\n`);
  },
  '/error': async (_req, res) => {
    const delay = 50 + Math.random() * 100;
    await sleep(delay);
    if (Math.random() < 0.7) {
      res.writeHead(500);
      res.end('Internal Server Error\n');
      throw new Error('simulated failure');
    }
    res.writeHead(200);
    res.end('OK\n');
  },
  '/random': async (_req, res) => {
    // Random mix of latencies for interesting histogram distributions
    const bucket = Math.random();
    let delay: number;
    if (bucket < 0.5) delay = 5 + Math.random() * 20;
    else if (bucket < 0.8) delay = 50 + Math.random() * 100;
    else if (bucket < 0.95) delay = 200 + Math.random() * 300;
    else delay = 500 + Math.random() * 1500;
    await sleep(delay);
    res.writeHead(200);
    res.end(`OK (${delay.toFixed(0)}ms)\n`);
  },
};

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --- HTTP Server ---
const server = http.createServer((req, res) => {
  const route = req.url || '/';
  const handler = routes[route];

  if (!handler) {
    res.writeHead(404);
    res.end('Not Found\n');
    return;
  }

  const span = tracer.startSpan(`${req.method} ${route}`, {
    attributes: {
      'http.method': req.method || 'GET',
      'http.route': route,
    },
  });

  const ctx = trace.setSpan(context.active(), span);
  const startTime = performance.now();

  activeRequests.add(1, {}, ctx);

  context.with(ctx, async () => {
    let status = 200;
    try {
      await handler(req, res);
      status = res.statusCode;
      span.setStatus({ code: SpanStatusCode.OK });
    } catch (err) {
      status = res.statusCode;
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: err instanceof Error ? err.message : 'unknown error',
      });
      if (err instanceof Error) {
        span.recordException(err);
      }
    } finally {
      const durationSec = (performance.now() - startTime) / 1000;

      // Record metrics within the active span context — exemplars will
      // capture this span's traceId and spanId automatically.
      requestCounter.add(
        1,
        { method: req.method || 'GET', route, status: String(status) },
        ctx
      );
      requestDuration.record(
        durationSec,
        { method: req.method || 'GET', route },
        ctx
      );
      activeRequests.add(-1, {}, ctx);

      span.end();
    }
  });
});

const PORT = parseInt(process.env.PORT || '8080', 10);
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                   Exemplars Demo App                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  App:        http://localhost:${PORT}                          ║
║  Grafana:    http://localhost:3001  (Exemplars Demo dashboard)║
║  Jaeger:     http://localhost:16686                           ║
║  Prometheus: http://localhost:9091                            ║
║                                                              ║
║  Endpoints:                                                  ║
║    GET /fast    - quick response (10-50ms)                   ║
║    GET /slow    - slow response (200-1000ms)                 ║
║    GET /error   - 70% chance of 500 error                    ║
║    GET /random  - mixed latency distribution                 ║
║                                                              ║
║  Generate traffic:                                           ║
║    while true; do curl -s localhost:8080/random > /dev/null;  ║
║      sleep 0.1; done                                         ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);
});

// --- Graceful shutdown ---
async function shutdown() {
  console.log('\nShutting down...');
  server.close();
  await meterProvider.shutdown();
  await tracerProvider.shutdown();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
