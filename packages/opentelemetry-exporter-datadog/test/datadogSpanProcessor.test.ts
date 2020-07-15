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

import { TraceFlags } from '@opentelemetry/api';
import {
  InMemorySpanExporter,
  BasicTracerProvider,
  Span,
} from '@opentelemetry/tracing';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { DatadogSpanProcessor, DATADOG_ALWAYS_SAMPLER } from '../src';

function createSampledSpan(spanName: string, parent?: boolean): Span {
  const tracer = new BasicTracerProvider({
    sampler: DATADOG_ALWAYS_SAMPLER,
  }).getTracer('default');
  const span = parent
    ? tracer.startSpan(spanName, {
        parent: {
          traceId: 'd4cda95b652f4a1592b449d5929fda1b',
          spanId: '6e0c63257de34c92',
          traceFlags: TraceFlags.SAMPLED,
        },
      })
    : tracer.startSpan(spanName);

  span.end();

  return span as Span;
}

describe('DatadogSpanProcessor', () => {
  const name = 'span-name';
  const defaultProcessorConfig = {
    maxQueueSize: 10,
    maxTraceSize: 3,
    bufferTimeout: 3000,
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
    it('should create a DatadogSpanProcessor instance', () => {
      const processor = new DatadogSpanProcessor(exporter);
      assert.ok(processor instanceof DatadogSpanProcessor);
      processor.shutdown();
    });

    it('should create a DatadogSpanProcessor instance with config', () => {
      const processor = new DatadogSpanProcessor(
        exporter,
        defaultProcessorConfig
      );
      assert.ok(processor instanceof DatadogSpanProcessor);
      assert.strictEqual(processor['_maxQueueSize'], 10);
      assert.strictEqual(processor['_maxTraceSize'], 3);
      processor.shutdown();
    });

    it('should create a DatadogSpanProcessor instance with empty config', () => {
      const processor = new DatadogSpanProcessor(exporter, {});
      assert.ok(processor instanceof DatadogSpanProcessor);
      processor.shutdown();
    });
  });

  describe('.onStart/.onEnd/.shutdown', () => {
    it('should do nothing after processor is shutdown', () => {
      const processor = new DatadogSpanProcessor(
        exporter,
        defaultProcessorConfig
      );
      const spy: sinon.SinonSpy = sinon.spy(exporter, 'export') as any;
      const span = createSampledSpan(`${name}_0`);

      processor.onStart(span);
      processor.onEnd(span);
      assert.strictEqual(processor['_traces'].size, 1);

      processor.forceFlush();
      assert.strictEqual(exporter.getFinishedSpans().length, 1);

      processor.onStart(span);
      processor.onEnd(span);
      assert.strictEqual(processor['_traces'].size, 1);

      assert.strictEqual(spy.args.length, 1);
      processor.shutdown();
      assert.strictEqual(spy.args.length, 2);
      assert.strictEqual(exporter.getFinishedSpans().length, 0);

      processor.onStart(span);
      processor.onEnd(span);
      assert.strictEqual(spy.args.length, 2);
      assert.strictEqual(processor['_traces'].size, 0);
      assert.strictEqual(exporter.getFinishedSpans().length, 0);
    });

    it('should reach but not exceed the max buffer size', () => {
      const processor = new DatadogSpanProcessor(
        exporter,
        defaultProcessorConfig
      );
      const maxQueueSize = defaultProcessorConfig.maxQueueSize;
      const aboveMaxQueueSize = maxQueueSize + 1;
      for (let i = 0; i < aboveMaxQueueSize; i++) {
        const span = createSampledSpan(`${name}_${i}`);
        processor.onStart(span);
        assert.strictEqual(exporter.getFinishedSpans().length, 0);

        processor.onEnd(span);
        assert.strictEqual(exporter.getFinishedSpans().length, 0);
      }

      //export all traces
      processor.forceFlush();
      assert.strictEqual(exporter.getFinishedSpans().length, maxQueueSize);

      processor.shutdown();
      assert.strictEqual(exporter.getFinishedSpans().length, 0);
    });

    it('should reach but not exceed the max trace size', () => {
      const processor = new DatadogSpanProcessor(
        exporter,
        defaultProcessorConfig
      );
      const maxTraceSize = defaultProcessorConfig.maxTraceSize;
      const aboveMaxTraceSize = maxTraceSize + 1;

      for (let i = 0; i < aboveMaxTraceSize; i++) {
        const span = createSampledSpan(`${name}_${i}`, true);
        processor.onStart(span);
        assert.strictEqual(exporter.getFinishedSpans().length, 0);

        processor.onEnd(span);
        assert.strictEqual(exporter.getFinishedSpans().length, 0);
      }

      //export all traces
      processor.forceFlush();
      assert.strictEqual(exporter.getFinishedSpans().length, maxTraceSize);

      processor.shutdown();
      assert.strictEqual(exporter.getFinishedSpans().length, 0);
    });

    it('should force flush on demand', () => {
      const processor = new DatadogSpanProcessor(
        exporter,
        defaultProcessorConfig
      );
      for (let i = 0; i < defaultProcessorConfig.maxQueueSize; i++) {
        const span = createSampledSpan(`${name}_${i}`);
        processor.onStart(span);
        processor.onEnd(span);
      }
      assert.strictEqual(exporter.getFinishedSpans().length, 0);
      processor.forceFlush();
      assert.strictEqual(
        exporter.getFinishedSpans().length,
        defaultProcessorConfig.maxQueueSize
      );
    });

    it('should not export empty span lists', done => {
      const spy = sinon.spy(exporter, 'export');
      const clock = sinon.useFakeTimers();

      const tracer = new BasicTracerProvider({
        sampler: DATADOG_ALWAYS_SAMPLER,
      }).getTracer('default');
      const processor = new DatadogSpanProcessor(
        exporter,
        defaultProcessorConfig
      );

      // start but do not end spans
      for (let i = 0; i < defaultProcessorConfig.maxQueueSize; i++) {
        const span = tracer.startSpan('spanName');
        processor.onStart(span as Span);
      }

      setTimeout(() => {
        assert.strictEqual(exporter.getFinishedSpans().length, 0);
        // after the timeout, export should not have been called
        // because no spans are ended
        sinon.assert.notCalled(spy);
        done();
      }, defaultProcessorConfig.bufferTimeout + 2000);

      // no spans have been finished
      assert.strictEqual(exporter.getFinishedSpans().length, 0);
      clock.tick(defaultProcessorConfig.bufferTimeout + 2000);

      clock.restore();
    });
  });
});
