/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { diag, ROOT_CONTEXT } from '@opentelemetry/api';
import {
  ExportResult,
  ExportResultCode,
  loggingErrorHandler,
  setGlobalErrorHandler,
} from '@opentelemetry/core';
import * as assert from 'assert';
import * as sinon from 'sinon';
import {
  AlwaysOnSampler,
  BasicTracerProvider,
  BufferConfig,
  InMemorySpanExporter,
  ReadableSpan,
  Span,
  SpanExporter,
} from '../../../src';
import { context } from '@opentelemetry/api';
import { TestRecordOnlySampler } from './TestRecordOnlySampler';
import { TestTracingSpanExporter } from './TestTracingSpanExporter';
import { TestStackContextManager } from './TestStackContextManager';
import { BatchSpanProcessorBase } from '../../../src/export/BatchSpanProcessorBase';
import { resourceFromAttributes } from '@opentelemetry/resources';

function createSampledSpan(spanName: string): Span {
  const tracer = new BasicTracerProvider({
    sampler: new AlwaysOnSampler(),
  }).getTracer('default');
  const span = tracer.startSpan(spanName);
  span.end();
  return span as Span;
}

function createUnsampledSpan(spanName: string): Span {
  const tracer = new BasicTracerProvider({
    sampler: new TestRecordOnlySampler(),
  }).getTracer('default');
  const span = tracer.startSpan(spanName);
  span.end();
  return span as Span;
}

class BatchSpanProcessor extends BatchSpanProcessorBase<BufferConfig> {
  onInit() {}
  onShutdown() {}
}

describe('BatchSpanProcessorBase', () => {
  const name = 'span-name';
  const defaultBufferConfig = {
    maxExportBatchSize: 5,
    scheduledDelayMillis: 2500,
  };
  let exporter: InMemorySpanExporter;

  beforeEach(() => {
    exporter = new InMemorySpanExporter();
  });

  afterEach(() => {
    exporter.reset();
    sinon.restore();
  });

  describe('constructor', () => {
    it('should create a BatchSpanProcessor instance', () => {
      const processor = new BatchSpanProcessor(exporter);
      assert.ok(processor instanceof BatchSpanProcessor);
      processor.shutdown();
    });

    it('should create a BatchSpanProcessor instance with config', () => {
      const processor = new BatchSpanProcessor(exporter, defaultBufferConfig);
      assert.ok(processor instanceof BatchSpanProcessor);
      processor.shutdown();
    });

    it('should create a BatchSpanProcessor instance with empty config', () => {
      const processor = new BatchSpanProcessor(exporter, {});
      assert.ok(processor instanceof BatchSpanProcessor);
      processor.shutdown();
    });
  });

  describe('.onStart/.onEnd/.shutdown', () => {
    it('should call onShutdown', async () => {
      const processor = new BatchSpanProcessor(exporter, defaultBufferConfig);
      const onShutdownSpy = sinon.stub(processor, 'onShutdown');
      assert.strictEqual(onShutdownSpy.callCount, 0);
      await processor.shutdown();
      assert.strictEqual(onShutdownSpy.callCount, 1);
    });

    it('should do nothing after processor is shutdown', async () => {
      const processor = new BatchSpanProcessor(exporter, defaultBufferConfig);
      const spy: sinon.SinonSpy = sinon.spy(exporter, 'export') as any;

      const span = createSampledSpan(`${name}_0`);

      processor.onStart(span, ROOT_CONTEXT);
      processor.onEnd(span);
      assert.strictEqual(processor['_finishedSpans'].length, 1);

      await processor.forceFlush();
      assert.strictEqual(exporter.getFinishedSpans().length, 1);

      processor.onStart(span, ROOT_CONTEXT);
      processor.onEnd(span);
      assert.strictEqual(processor['_finishedSpans'].length, 1);

      assert.strictEqual(spy.args.length, 1);
      await processor.shutdown();
      assert.strictEqual(spy.args.length, 2);
      assert.strictEqual(exporter.getFinishedSpans().length, 0);

      processor.onStart(span, ROOT_CONTEXT);
      processor.onEnd(span);
      assert.strictEqual(spy.args.length, 2);
      assert.strictEqual(processor['_finishedSpans'].length, 0);
      assert.strictEqual(exporter.getFinishedSpans().length, 0);
    });

    it('should not export unsampled spans', async () => {
      const processor = new BatchSpanProcessor(exporter, defaultBufferConfig);
      const spy: sinon.SinonSpy = sinon.spy(exporter, 'export') as any;

      const span = createUnsampledSpan(`${name}_0`);

      processor.onStart(span, ROOT_CONTEXT);
      processor.onEnd(span);

      await processor.forceFlush();
      assert.strictEqual(processor['_finishedSpans'].length, 0);
      assert.strictEqual(exporter.getFinishedSpans().length, 0);
      assert.strictEqual(spy.args.length, 0);
    });

    it('should export the sampled spans with buffer size reached', async () => {
      const processor = new BatchSpanProcessor(exporter, defaultBufferConfig);
      const span = createSampledSpan(name);
      for (let i = 1; i < defaultBufferConfig.maxExportBatchSize; i++) {
        processor.onStart(span, ROOT_CONTEXT);
        assert.strictEqual(exporter.getFinishedSpans().length, 0);

        processor.onEnd(span);
        assert.strictEqual(exporter.getFinishedSpans().length, 0);
      }
      processor.onStart(span, ROOT_CONTEXT);
      processor.onEnd(span);
      assert.strictEqual(exporter.getFinishedSpans().length, 5);
      await processor.shutdown();
      assert.strictEqual(exporter.getFinishedSpans().length, 0);
    });

    it('should force flush when timeout exceeded', async () => {
      const clock = sinon.useFakeTimers();
      const processor = new BatchSpanProcessor(exporter, defaultBufferConfig);
      const span = createSampledSpan(name);
      for (let i = 1; i < defaultBufferConfig.maxExportBatchSize; i++) {
        processor.onStart(span, ROOT_CONTEXT);
        processor.onEnd(span);
        assert.strictEqual(exporter.getFinishedSpans().length, 0);
      }

      clock.tick(defaultBufferConfig.scheduledDelayMillis + 1000);
      await clock.runAllAsync();

      assert.strictEqual(exporter.getFinishedSpans().length, 4);
      clock.restore();
    });

    it('should force flush on demand', () => {
      const processor = new BatchSpanProcessor(exporter, defaultBufferConfig);
      const span = createSampledSpan(name);
      for (let i = 1; i < defaultBufferConfig.maxExportBatchSize; i++) {
        processor.onStart(span, ROOT_CONTEXT);
        processor.onEnd(span);
      }
      assert.strictEqual(exporter.getFinishedSpans().length, 0);
      processor.forceFlush();
      assert.strictEqual(exporter.getFinishedSpans().length, 4);
    });

    it('should not export empty span lists', async () => {
      const spy = sinon.spy(exporter, 'export');
      const clock = sinon.useFakeTimers();

      const tracer = new BasicTracerProvider({
        sampler: new AlwaysOnSampler(),
      }).getTracer('default');
      const processor = new BatchSpanProcessor(exporter, defaultBufferConfig);

      // start but do not end spans
      for (let i = 0; i < defaultBufferConfig.maxExportBatchSize; i++) {
        const span = tracer.startSpan('spanName');
        processor.onStart(span as Span, ROOT_CONTEXT);
      }

      // no spans have been finished
      assert.strictEqual(exporter.getFinishedSpans().length, 0);
      clock.tick(defaultBufferConfig.scheduledDelayMillis + 1000);
      await clock.runAllAsync();

      assert.strictEqual(exporter.getFinishedSpans().length, 0);
      // after the timeout, export should not have been called
      // because no spans are ended
      sinon.assert.notCalled(spy);

      clock.restore();
    });

    it(
      'should export each sampled span exactly once with buffer size' +
        ' reached multiple times',
      async () => {
        const clock = sinon.useFakeTimers();
        const processor = new BatchSpanProcessor(exporter, defaultBufferConfig);
        const totalSpans = defaultBufferConfig.maxExportBatchSize * 2;
        for (let i = 0; i < totalSpans; i++) {
          const span = createSampledSpan(`${name}_${i}`);
          processor.onStart(span, ROOT_CONTEXT);
          processor.onEnd(span);
        }
        const span = createSampledSpan(`${name}_last`);
        processor.onStart(span, ROOT_CONTEXT);
        processor.onEnd(span);

        // Run all async work with fake timers
        await clock.runAllAsync();

        clock.restore();

        diag.info('finished spans count', exporter.getFinishedSpans().length);
        assert.strictEqual(exporter.getFinishedSpans().length, totalSpans + 1);

        await processor.shutdown();
        assert.strictEqual(exporter.getFinishedSpans().length, 0);
      }
    );
  });

  describe('force flush', () => {
    describe('no waiting spans', () => {
      it('should call an async callback when flushing is complete', async () => {
        const processor = new BatchSpanProcessor(exporter);
        await processor.forceFlush();
      });

      it('should call an async callback when shutdown is complete', async () => {
        const processor = new BatchSpanProcessor(exporter);
        await processor.shutdown();
      });
    });

    describe('spans waiting to flush', () => {
      let processor: BatchSpanProcessor;

      beforeEach(() => {
        processor = new BatchSpanProcessor(exporter, defaultBufferConfig);
      });

      it('should call an async callback when flushing is complete', async () => {
        const span = createSampledSpan('test');
        processor.onStart(span, ROOT_CONTEXT);
        processor.onEnd(span);
        await processor.forceFlush();
        assert.strictEqual(exporter.getFinishedSpans().length, 1);
      });

      it('should call an async callback when shutdown is complete', async () => {
        let exportedSpans = 0;
        sinon.stub(exporter, 'export').callsFake((spans, callback) => {
          setTimeout(() => {
            exportedSpans = exportedSpans + spans.length;
            callback({ code: ExportResultCode.SUCCESS });
          }, 0);
        });
        const span = createSampledSpan('test');
        processor.onStart(span, ROOT_CONTEXT);
        processor.onEnd(span);

        await processor.shutdown();
        assert.strictEqual(exportedSpans, 1);
      });

      it('should call globalErrorHandler when exporting fails', async () => {
        const clock = sinon.useFakeTimers();
        const expectedError = new Error('Exporter failed');
        sinon.stub(exporter, 'export').callsFake((_, callback) => {
          setTimeout(() => {
            callback({ code: ExportResultCode.FAILED, error: expectedError });
          }, 0);
        });

        const errorHandlerSpy = sinon.spy();

        setGlobalErrorHandler(errorHandlerSpy);

        for (let i = 0; i < defaultBufferConfig.maxExportBatchSize; i++) {
          const span = createSampledSpan('test');
          processor.onStart(span, ROOT_CONTEXT);
          processor.onEnd(span);
        }

        clock.tick(defaultBufferConfig.scheduledDelayMillis + 1000);
        await clock.runAllAsync();
        clock.restore();

        assert.strictEqual(errorHandlerSpy.callCount, 1);

        const [[error]] = errorHandlerSpy.args;

        assert.deepStrictEqual(error, expectedError);

        //reset global error handler
        setGlobalErrorHandler(loggingErrorHandler());
      });

      it('should still export when previously failed', async () => {
        // The scenario is made of several parts:
        // 1. The exporter tries to export some spans
        // 2. While it does so, more spans are processed
        // 3. The exporter fails
        // 4. Spans arriving during step 2 should be exported

        let firstCall = true;
        const fillingExportStub = sinon
          .stub(exporter, 'export')
          .callsFake((spans, cb) => {
            // The first time export is called, add some spans to the processor.
            // Any other time, call through. We don't simply restore the stub
            // so we can count the calls with `sinon.assert`
            if (!firstCall) {
              return fillingExportStub.wrappedMethod.call(exporter, spans, cb);
            }

            // Step 2: During export, add another span
            firstCall = false;
            processSpan();

            return fillingExportStub.wrappedMethod.call(exporter, spans, () => {
              // Step 3: Mock failure
              cb({
                code: ExportResultCode.FAILED,
              });
            });
          });

        const clock = sinon.useFakeTimers();

        // Step 1: Export a span
        processSpan();
        await clock.runAllAsync();

        clock.restore();
        fillingExportStub.restore();

        // Step 4: Make sure all spans were processed
        assert.equal(exporter['_finishedSpans'].length, 2);
        assert.equal(processor['_finishedSpans'].length, 0);
        sinon.assert.calledTwice(fillingExportStub);

        function processSpan() {
          const span = createSampledSpan('test');
          processor.onStart(span, ROOT_CONTEXT);
          processor.onEnd(span);
        }
      });

      it('should wait for pending resource on flush', async () => {
        const tracer = new BasicTracerProvider({
          resource: resourceFromAttributes({
            async: new Promise<string>(resolve =>
              setTimeout(() => resolve('fromasync'), 1)
            ),
          }),
        }).getTracer('default');

        const span = tracer.startSpan('test') as Span;
        span.end();

        processor.onStart(span, ROOT_CONTEXT);
        processor.onEnd(span);

        await processor.forceFlush();

        assert.strictEqual(exporter.getFinishedSpans().length, 1);
      });
    });

    describe('flushing spans with exporter triggering instrumentation', () => {
      beforeEach(() => {
        const contextManager = new TestStackContextManager().enable();
        context.setGlobalContextManager(contextManager);
      });

      afterEach(() => {
        context.disable();
      });

      it('should prevent instrumentation prior to export', async () => {
        const testTracingExporter = new TestTracingSpanExporter();
        const processor = new BatchSpanProcessor(testTracingExporter);

        const span = createSampledSpan('test');
        processor.onStart(span, ROOT_CONTEXT);
        processor.onEnd(span);

        await processor.forceFlush();
        const exporterCreatedSpans =
          testTracingExporter.getExporterCreatedSpans();
        assert.equal(exporterCreatedSpans.length, 0);
      });
    });
  });
  describe('maxQueueSize', () => {
    let processor: BatchSpanProcessor;

    describe('when there are more spans then "maxQueueSize"', () => {
      beforeEach(() => {
        processor = new BatchSpanProcessor(
          exporter,
          Object.assign({}, defaultBufferConfig, {
            maxQueueSize: 6,
          })
        );
      });
      it('should drop spans', () => {
        const span = createSampledSpan('test');
        for (let i = 0, j = 20; i < j; i++) {
          processor.onStart(span, ROOT_CONTEXT);
          processor.onEnd(span);
        }
        assert.equal(processor['_finishedSpans'].length, 6);
      });
      it('should count and report dropped spans', async () => {
        const debugStub = sinon.spy(diag, 'debug');
        const warnStub = sinon.spy(diag, 'warn');
        const span = createSampledSpan('test');
        for (let i = 0, j = 12; i < j; i++) {
          processor.onStart(span, ROOT_CONTEXT);
          processor.onEnd(span);
        }
        assert.equal(processor['_finishedSpans'].length, 6);
        assert.equal(processor['_droppedSpansCount'], 1);
        sinon.assert.calledOnce(debugStub);

        await processor.forceFlush();

        processor.onStart(span, ROOT_CONTEXT);
        processor.onEnd(span);

        assert.equal(processor['_finishedSpans'].length, 1);
        assert.equal(processor['_droppedSpansCount'], 0);

        sinon.assert.calledOnceWithExactly(
          warnStub,
          'Dropped 1 spans because maxQueueSize reached'
        );
      });
    });
  });

  describe('maxExportBatchSize', () => {
    let processor: BatchSpanProcessor;

    describe('when "maxExportBatchSize" is greater than "maxQueueSize"', () => {
      beforeEach(() => {
        processor = new BatchSpanProcessor(exporter, {
          maxExportBatchSize: 7,
          maxQueueSize: 6,
        });
      });
      it('should match maxQueueSize', () => {
        assert.equal(
          processor['_maxExportBatchSize'],
          processor['_maxQueueSize']
        );
      });
    });
  });

  describe('Concurrency', () => {
    it('should only send a single batch at a time', async () => {
      const callbacks: ((result: ExportResult) => void)[] = [];
      const spans: ReadableSpan[] = [];
      const exporter: SpanExporter = {
        export: async (
          exportedSpans: ReadableSpan[],
          resultCallback: (result: ExportResult) => void
        ) => {
          callbacks.push(resultCallback);
          spans.push(...exportedSpans);
        },
        shutdown: async () => {},
      };
      const processor = new BatchSpanProcessor(exporter, {
        maxExportBatchSize: 5,
        maxQueueSize: 6,
      });
      const totalSpans = 50;
      for (let i = 0; i < totalSpans; i++) {
        const span = createSampledSpan(`${name}_${i}`);
        processor.onStart(span, ROOT_CONTEXT);
        processor.onEnd(span);
      }
      assert.equal(callbacks.length, 1);
      assert.equal(spans.length, 5);
      callbacks[0]({ code: ExportResultCode.SUCCESS });
      await new Promise(resolve => setTimeout(resolve, 0));
      // After the first batch completes we will have dropped a number
      // of spans and the next batch will be smaller
      assert.equal(callbacks.length, 2);
      assert.equal(spans.length, 10);
      callbacks[1]({ code: ExportResultCode.SUCCESS });

      // We expect that all the other spans have been dropped
      await new Promise(resolve => setTimeout(resolve, 0));
      assert.equal(callbacks.length, 2);
      assert.equal(spans.length, 10);
    });
  });
});
