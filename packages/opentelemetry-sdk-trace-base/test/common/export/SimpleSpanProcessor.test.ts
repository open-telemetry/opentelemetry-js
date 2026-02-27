/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  context,
  ROOT_CONTEXT,
  SpanContext,
  SpanKind,
  TraceFlags,
} from '@opentelemetry/api';
import {
  ExportResultCode,
  loggingErrorHandler,
  setGlobalErrorHandler,
} from '@opentelemetry/core';
import * as assert from 'assert';
import * as sinon from 'sinon';
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '../../../src';
import { SpanImpl } from '../../../src/Span';
import { TestStackContextManager } from './TestStackContextManager';
import { TestTracingSpanExporter } from './TestTracingSpanExporter';
import { TestExporterWithDelay } from './TestExporterWithDelay';
import { Tracer } from '../../../src/Tracer';
import { resourceFromAttributes } from '@opentelemetry/resources';

describe('SimpleSpanProcessor', () => {
  let provider: BasicTracerProvider;
  let exporter: InMemorySpanExporter;

  beforeEach(() => {
    provider = new BasicTracerProvider();
    exporter = new InMemorySpanExporter();
  });

  describe('constructor', () => {
    it('should create a SimpleSpanProcessor instance', () => {
      const processor = new SimpleSpanProcessor(exporter);
      assert.ok(processor instanceof SimpleSpanProcessor);
    });
  });

  describe('.onStart/.onEnd/.shutdown', () => {
    it('should handle span started and ended when SAMPLED', async () => {
      const processor = new SimpleSpanProcessor(exporter);
      const spanContext: SpanContext = {
        traceId: 'a3cda95b652f4a1592b449d5929fda1b',
        spanId: '5e0c63257de34c92',
        traceFlags: TraceFlags.SAMPLED,
      };
      const tracer = provider.getTracer('default') as Tracer;
      const span = new SpanImpl({
        scope: tracer.instrumentationScope,
        resource: tracer['_resource'],
        context: ROOT_CONTEXT,
        spanContext,
        name: 'span-name',
        kind: SpanKind.CLIENT,
        spanLimits: tracer.getSpanLimits(),
        spanProcessor: tracer['_spanProcessor'],
      });
      processor.onStart(span, ROOT_CONTEXT);
      assert.strictEqual(exporter.getFinishedSpans().length, 0);

      processor.onEnd(span);
      assert.strictEqual(exporter.getFinishedSpans().length, 1);

      await processor.shutdown();
      assert.strictEqual(exporter.getFinishedSpans().length, 0);
    });

    it('should handle span started and ended when UNSAMPLED', async () => {
      const processor = new SimpleSpanProcessor(exporter);
      const spanContext: SpanContext = {
        traceId: 'a3cda95b652f4a1592b449d5929fda1b',
        spanId: '5e0c63257de34c92',
        traceFlags: TraceFlags.NONE,
      };
      const tracer = provider.getTracer('default') as Tracer;
      const span = new SpanImpl({
        scope: tracer.instrumentationScope,
        resource: tracer['_resource'],
        context: ROOT_CONTEXT,
        spanContext,
        name: 'span-name',
        kind: SpanKind.CLIENT,
        spanLimits: tracer.getSpanLimits(),
        spanProcessor: tracer['_spanProcessor'],
      });
      processor.onStart(span, ROOT_CONTEXT);
      assert.strictEqual(exporter.getFinishedSpans().length, 0);

      processor.onEnd(span);
      assert.strictEqual(exporter.getFinishedSpans().length, 0);

      await processor.shutdown();
      assert.strictEqual(exporter.getFinishedSpans().length, 0);
    });

    it('should call globalErrorHandler when exporting fails', async () => {
      const expectedError = new Error('Exporter failed');
      const processor = new SimpleSpanProcessor(exporter);
      const spanContext: SpanContext = {
        traceId: 'a3cda95b652f4a1592b449d5929fda1b',
        spanId: '5e0c63257de34c92',
        traceFlags: TraceFlags.SAMPLED,
      };
      const tracer = provider.getTracer('default') as Tracer;
      const span = new SpanImpl({
        scope: tracer.instrumentationScope,
        resource: tracer['_resource'],
        context: ROOT_CONTEXT,
        spanContext,
        name: 'span-name',
        kind: SpanKind.CLIENT,
        spanLimits: tracer.getSpanLimits(),
        spanProcessor: tracer['_spanProcessor'],
      });
      processor.onStart(span, ROOT_CONTEXT);

      sinon.stub(exporter, 'export').callsFake((_, callback) => {
        setTimeout(() => {
          callback({ code: ExportResultCode.FAILED, error: expectedError });
        }, 0);
      });

      const errorHandlerSpy = sinon.spy();

      setGlobalErrorHandler(errorHandlerSpy);

      processor.onEnd(span);

      await new Promise<void>(resolve => {
        setTimeout(() => {
          resolve();
        }, 0);
      });

      assert.strictEqual(errorHandlerSpy.callCount, 1);

      const [[error]] = errorHandlerSpy.args;

      assert.deepStrictEqual(error, expectedError);

      //reset global error handler
      setGlobalErrorHandler(loggingErrorHandler());
    });
  });

  describe('force flush', () => {
    it('should call forceflush on exporter', () => {
      const spyflush = sinon.spy(exporter, 'forceFlush');
      const processor = new SimpleSpanProcessor(exporter);
      processor.forceFlush().then(() => {
        assert.ok(spyflush.calledOnce);
      });
    });

    it('should await unresolved resources', async () => {
      const processor = new SimpleSpanProcessor(exporter);
      const providerWithAsyncResource = new BasicTracerProvider({
        resource: resourceFromAttributes({
          async: new Promise<string>(resolve =>
            setTimeout(() => resolve('fromasync'), 1)
          ),
        }),
      });
      const spanContext: SpanContext = {
        traceId: 'a3cda95b652f4a1592b449d5929fda1b',
        spanId: '5e0c63257de34c92',
        traceFlags: TraceFlags.SAMPLED,
      };

      const tracer = providerWithAsyncResource.getTracer('default') as Tracer;
      const span = new SpanImpl({
        scope: tracer.instrumentationScope,
        resource: tracer['_resource'],
        context: ROOT_CONTEXT,
        spanContext,
        name: 'span-name',
        kind: SpanKind.CLIENT,
        spanLimits: tracer.getSpanLimits(),
        spanProcessor: tracer['_spanProcessor'],
      });
      processor.onStart(span, ROOT_CONTEXT);
      assert.strictEqual(exporter.getFinishedSpans().length, 0);

      processor.onEnd(span);
      assert.strictEqual(exporter.getFinishedSpans().length, 0);

      await processor.forceFlush();

      const exportedSpans = exporter.getFinishedSpans();

      assert.strictEqual(exportedSpans.length, 1);
      assert.strictEqual(
        exportedSpans[0].resource.attributes['async'],
        'fromasync'
      );
    });

    it('should await doExport() and delete from _pendingExports', async () => {
      const testExporterWithDelay = new TestExporterWithDelay();
      const processor = new SimpleSpanProcessor(testExporterWithDelay);
      const spanContext: SpanContext = {
        traceId: 'a3cda95b652f4a1592b449d5929fda1b',
        spanId: '5e0c63257de34c92',
        traceFlags: TraceFlags.SAMPLED,
      };
      const tracer = provider.getTracer('default') as Tracer;
      const span = new SpanImpl({
        scope: tracer.instrumentationScope,
        resource: tracer['_resource'],
        context: ROOT_CONTEXT,
        spanContext,
        name: 'span-name',
        kind: SpanKind.CLIENT,
        spanLimits: tracer.getSpanLimits(),
        spanProcessor: tracer['_spanProcessor'],
      });
      processor.onStart(span, ROOT_CONTEXT);
      processor.onEnd(span);

      assert.strictEqual(processor['_pendingExports'].size, 1);

      await processor.forceFlush();

      assert.strictEqual(processor['_pendingExports'].size, 0);

      const exportedSpans = testExporterWithDelay.getFinishedSpans();

      assert.strictEqual(exportedSpans.length, 1);
    });

    it('should await doExport() and delete from _pendingExports with async resource', async () => {
      const testExporterWithDelay = new TestExporterWithDelay();
      const processor = new SimpleSpanProcessor(testExporterWithDelay);

      const providerWithAsyncResource = new BasicTracerProvider({
        resource: resourceFromAttributes({
          async: new Promise<string>(resolve =>
            setTimeout(() => resolve('fromasync'), 1)
          ),
        }),
      });
      const spanContext: SpanContext = {
        traceId: 'a3cda95b652f4a1592b449d5929fda1b',
        spanId: '5e0c63257de34c92',
        traceFlags: TraceFlags.SAMPLED,
      };
      const tracer = providerWithAsyncResource.getTracer('default') as Tracer;
      const span = new SpanImpl({
        scope: tracer.instrumentationScope,
        resource: tracer['_resource'],
        context: ROOT_CONTEXT,
        spanContext,
        name: 'span-name',
        kind: SpanKind.CLIENT,
        spanLimits: tracer.getSpanLimits(),
        spanProcessor: tracer['_spanProcessor'],
      });
      processor.onStart(span, ROOT_CONTEXT);
      processor.onEnd(span);

      assert.strictEqual(processor['_pendingExports'].size, 1);

      await processor.forceFlush();

      assert.strictEqual(processor['_pendingExports'].size, 0);

      const exportedSpans = testExporterWithDelay.getFinishedSpans();

      assert.strictEqual(exportedSpans.length, 1);
    });

    describe('when flushing complete', () => {
      it('should call an async callback', async () => {
        const processor = new SimpleSpanProcessor(exporter);
        await processor.forceFlush();
      });
    });

    describe('when shutdown is complete', () => {
      it('should call an async callback', async () => {
        const processor = new SimpleSpanProcessor(exporter);
        await processor.shutdown();
      });
    });
  });

  describe('onEnd', () => {
    beforeEach(() => {
      const contextManager = new TestStackContextManager().enable();
      context.setGlobalContextManager(contextManager);
    });

    afterEach(() => {
      context.disable();
    });

    it('should prevent instrumentation prior to export', () => {
      const testTracingExporter = new TestTracingSpanExporter();
      const processor = new SimpleSpanProcessor(testTracingExporter);

      const spanContext: SpanContext = {
        traceId: 'a3cda95b652f4a1592b449d5929fda1b',
        spanId: '5e0c63257de34c92',
        traceFlags: TraceFlags.SAMPLED,
      };
      const tracer = provider.getTracer('default') as Tracer;
      const span = new SpanImpl({
        scope: tracer.instrumentationScope,
        resource: tracer['_resource'],
        context: ROOT_CONTEXT,
        spanContext,
        name: 'span-name',
        kind: SpanKind.CLIENT,
        spanLimits: tracer.getSpanLimits(),
        spanProcessor: tracer['_spanProcessor'],
      });

      processor.onStart(span, ROOT_CONTEXT);
      processor.onEnd(span);

      const exporterCreatedSpans =
        testTracingExporter.getExporterCreatedSpans();
      assert.equal(exporterCreatedSpans.length, 0);
    });
  });
});
