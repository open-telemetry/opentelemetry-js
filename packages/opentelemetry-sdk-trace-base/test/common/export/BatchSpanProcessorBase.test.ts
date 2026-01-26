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
      await Promise.resolve(); // yield to allow export to schedule
      assert.strictEqual(exporter.getFinishedSpans().length, 5);
      await processor.shutdown();
      assert.strictEqual(exporter.getFinishedSpans().length, 0);
    });

    it('should export when scheduledDelayMillis is exceeded', async function () {
      // arrange
      const clock = sinon.useFakeTimers();
      const processor = new BatchSpanProcessor(exporter, defaultBufferConfig);
      const span = createSampledSpan(name);

      // act
      for (let i = 1; i < defaultBufferConfig.maxExportBatchSize; i++) {
        processor.onStart(span, ROOT_CONTEXT);
        processor.onEnd(span);
        assert.strictEqual(exporter.getFinishedSpans().length, 0);
      }
      await clock.tickAsync(defaultBufferConfig.scheduledDelayMillis + 1000);

      // assert
      assert.strictEqual(exporter.getFinishedSpans().length, 4);
    });

    it('should force flush on demand', async function () {
      const processor = new BatchSpanProcessor(exporter, defaultBufferConfig);
      const span = createSampledSpan(name);
      for (let i = 1; i < defaultBufferConfig.maxExportBatchSize; i++) {
        processor.onStart(span, ROOT_CONTEXT);
        processor.onEnd(span);
      }
      assert.strictEqual(exporter.getFinishedSpans().length, 0);
      await processor.forceFlush();
      assert.strictEqual(exporter.getFinishedSpans().length, 4);
    });

    it('should not export empty span lists', done => {
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

      setTimeout(() => {
        assert.strictEqual(exporter.getFinishedSpans().length, 0);
        // after the timeout, export should not have been called
        // because no spans are ended
        sinon.assert.notCalled(spy);
        done();
      }, defaultBufferConfig.scheduledDelayMillis + 1000);

      // no spans have been finished
      assert.strictEqual(exporter.getFinishedSpans().length, 0);
      clock.tick(defaultBufferConfig.scheduledDelayMillis + 1000);

      clock.restore();
    });

    it('should export each sampled span exactly once with buffer size reached multiple times', async function () {
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
      await clock.tickAsync(defaultBufferConfig.scheduledDelayMillis + 10);
      await clock.tickAsync(defaultBufferConfig.scheduledDelayMillis + 10);
      await clock.tickAsync(defaultBufferConfig.scheduledDelayMillis + 10);

      diag.info('finished spans count', exporter.getFinishedSpans().length);
      assert.strictEqual(exporter.getFinishedSpans().length, totalSpans + 1);

      await processor.shutdown();
      assert.strictEqual(exporter.getFinishedSpans().length, 0);
    });
  });

  describe('force flush', () => {
    describe('no waiting spans', () => {
      it('should call an async callback when flushing is complete', done => {
        const processor = new BatchSpanProcessor(exporter);
        processor.forceFlush().then(() => {
          done();
        });
      });

      it('should call an async callback when shutdown is complete', done => {
        const processor = new BatchSpanProcessor(exporter);
        processor.shutdown().then(() => {
          done();
        });
      });
    });

    describe('spans waiting to flush', () => {
      let processor: BatchSpanProcessor;

      beforeEach(() => {
        processor = new BatchSpanProcessor(exporter, defaultBufferConfig);
      });

      it('should call an async callback when flushing is complete', done => {
        const span = createSampledSpan('test');
        processor.onStart(span, ROOT_CONTEXT);
        processor.onEnd(span);
        processor.forceFlush().then(() => {
          assert.strictEqual(exporter.getFinishedSpans().length, 1);
          done();
        });
      });

      it('should call an async callback when shutdown is complete', done => {
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

        processor.shutdown().then(() => {
          assert.strictEqual(exportedSpans, 1);
          done();
        });
      });

      it('should call globalErrorHandler when exporting fails', async function () {
        // arrange
        const clock = sinon.useFakeTimers();
        const expectedError = new Error('Exporter failed');
        sinon.stub(exporter, 'export').callsFake((_, callback) => {
          setTimeout(() => {
            callback({ code: ExportResultCode.FAILED, error: expectedError });
          }, 0);
        });
        const errorHandlerSpy = sinon.spy();
        setGlobalErrorHandler(errorHandlerSpy);

        // act
        for (let i = 0; i < defaultBufferConfig.maxExportBatchSize; i++) {
          const span = createSampledSpan('test');
          processor.onStart(span, ROOT_CONTEXT);
          processor.onEnd(span);
        }
        await clock.tickAsync(defaultBufferConfig.scheduledDelayMillis + 1000);

        // assert
        sinon.assert.calledOnce(errorHandlerSpy);
        sinon.assert.calledOnceWithExactly(errorHandlerSpy, expectedError);
        // reset global error handler
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

      it('should prevent instrumentation prior to export', done => {
        const testTracingExporter = new TestTracingSpanExporter();
        const processor = new BatchSpanProcessor(testTracingExporter);

        const span = createSampledSpan('test');
        processor.onStart(span, ROOT_CONTEXT);
        processor.onEnd(span);

        processor.forceFlush().then(() => {
          const exporterCreatedSpans =
            testTracingExporter.getExporterCreatedSpans();
          assert.equal(exporterCreatedSpans.length, 0);

          done();
        });
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
      it('should count and report dropped spans', done => {
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

        processor.forceFlush().then(() => {
          processor.onStart(span, ROOT_CONTEXT);
          processor.onEnd(span);

          assert.equal(processor['_finishedSpans'].length, 1);
          assert.equal(processor['_droppedSpansCount'], 0);

          sinon.assert.calledOnceWithExactly(
            warnStub,
            'Dropped 1 spans because maxQueueSize reached'
          );

          done();
        });
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
      await new Promise(resolve => setTimeout(resolve, 0));
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
