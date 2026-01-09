import { EdgeRuntime } from 'edge-runtime';
import esbuild from 'esbuild';
import assert from 'node:assert';
import { describe, it } from 'node:test';

async function bundleAndRun(code) {
  const result = await esbuild.build({
    stdin: {
      contents: code,
      resolveDir: process.cwd(),
      loader: 'js',
    },
    bundle: true,
    format: 'esm',
    write: false,
    logLevel: 'silent',
  });

  const bundledCode = result.outputFiles[0].text;
  const runtime = new EdgeRuntime();
  await runtime.evaluate(bundledCode);
  return runtime.evaluate('globalThis.__TEST_RESULT__');
}

describe('Vercel Edge Runtime', () => {
  it('should run @opentelemetry/resources', async () => {
    const result = await bundleAndRun(`
      import { defaultResource } from '@opentelemetry/resources';
      const resource = defaultResource();
      if (!resource || !resource.attributes) {
        throw new Error('Resource not created');
      }
      globalThis.__TEST_RESULT__ = { success: true };
    `);
    assert.strictEqual(result.success, true);
  });

  it('should run @opentelemetry/api', async () => {
    const result = await bundleAndRun(`
      import { trace, context, SpanStatusCode } from '@opentelemetry/api';
      const tracer = trace.getTracer('test-tracer');
      if (!tracer) {
        throw new Error('Tracer not created');
      }
      globalThis.__TEST_RESULT__ = {
        success: true,
        hasContext: typeof context.active === 'function',
        hasSpanStatusCode: typeof SpanStatusCode.OK === 'number'
      };
    `);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.hasContext, true);
    assert.strictEqual(result.hasSpanStatusCode, true);
  });

  it('should run @opentelemetry/sdk-trace-base', async () => {
    const result = await bundleAndRun(`
      import { BasicTracerProvider, InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
      const exporter = new InMemorySpanExporter();
      const processor = new SimpleSpanProcessor(exporter);
      const provider = new BasicTracerProvider({
        spanProcessors: [processor]
      });
      const tracer = provider.getTracer('test');
      const span = tracer.startSpan('test-span');
      span.end();
      globalThis.__TEST_RESULT__ = { success: true, spanCount: exporter.getFinishedSpans().length };
    `);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.spanCount, 1);
  });

  it('should run @opentelemetry/sdk-trace-web', async () => {
    const result = await bundleAndRun(`
      import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
      const provider = new WebTracerProvider();
      const tracer = provider.getTracer('web-test');
      if (!tracer) {
        throw new Error('WebTracerProvider failed');
      }
      globalThis.__TEST_RESULT__ = { success: true };
    `);
    assert.strictEqual(result.success, true);
  });

  it('should run @opentelemetry/core', async () => {
    const result = await bundleAndRun(`
      import { hrTime, hrTimeDuration, isTimeInputHrTime } from '@opentelemetry/core';
      const time = hrTime();
      if (!Array.isArray(time) || time.length !== 2) {
        throw new Error('hrTime failed');
      }
      globalThis.__TEST_RESULT__ = { success: true, isHrTime: isTimeInputHrTime(time) };
    `);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.isHrTime, true);
  });

  it('should run @opentelemetry/semantic-conventions', async () => {
    const result = await bundleAndRun(`
      import { ATTR_SERVICE_NAME, ATTR_HTTP_REQUEST_METHOD } from '@opentelemetry/semantic-conventions';
      if (!ATTR_SERVICE_NAME || !ATTR_HTTP_REQUEST_METHOD) {
        throw new Error('Semantic conventions not loaded');
      }
      globalThis.__TEST_RESULT__ = {
        success: true,
        serviceName: ATTR_SERVICE_NAME,
        httpMethod: ATTR_HTTP_REQUEST_METHOD
      };
    `);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.serviceName, 'service.name');
    assert.strictEqual(result.httpMethod, 'http.request.method');
  });

  it('should run @opentelemetry/propagator-b3', async () => {
    const result = await bundleAndRun(`
      import { B3Propagator, B3InjectEncoding } from '@opentelemetry/propagator-b3';
      const propagator = new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER });
      if (!propagator) {
        throw new Error('B3Propagator not created');
      }
      globalThis.__TEST_RESULT__ = { success: true };
    `);
    assert.strictEqual(result.success, true);
  });

});
