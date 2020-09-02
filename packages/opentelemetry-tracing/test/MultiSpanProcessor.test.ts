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

import * as assert from 'assert';
import * as Sinon from 'sinon';
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
  ReadableSpan,
  SpanProcessor,
} from '../src';
import {
  notifyOnGlobalShutdown,
  _invokeGlobalShutdown,
} from '@opentelemetry/core';
import { MultiSpanProcessor } from '../src/MultiSpanProcessor';

class TestProcessor implements SpanProcessor {
  spans: ReadableSpan[] = [];
  onStart(span: ReadableSpan): void {}
  onEnd(span: ReadableSpan): void {
    this.spans.push(span);
  }
  shutdown(cb: () => void): void {
    this.spans = [];
    setTimeout(cb);
  }
  forceFlush(): void {}
}

describe('MultiSpanProcessor', () => {
  let removeEvent: Function | undefined;
  afterEach(() => {
    if (removeEvent) {
      removeEvent();
      removeEvent = undefined;
    }
  });

  it('should handle empty span processor', () => {
    const multiSpanProcessor = new MultiSpanProcessor([]);

    const tracerProvider = new BasicTracerProvider();
    tracerProvider.addSpanProcessor(multiSpanProcessor);
    const tracer = tracerProvider.getTracer('default');
    const span = tracer.startSpan('one');
    span.end();
    multiSpanProcessor.shutdown();
  });

  it('should handle one span processor', done => {
    const processor1 = new TestProcessor();
    const multiSpanProcessor = new MultiSpanProcessor([processor1]);

    const tracerProvider = new BasicTracerProvider();
    tracerProvider.addSpanProcessor(multiSpanProcessor);
    const tracer = tracerProvider.getTracer('default');
    const span = tracer.startSpan('one');
    assert.strictEqual(processor1.spans.length, 0);
    span.end();
    setTimeout(() => {
      assert.strictEqual(processor1.spans.length, 1);
      multiSpanProcessor.shutdown();
      done();
    }, 10);
  });

  it('should handle two span processor', done => {
    const processor1 = new TestProcessor();
    const processor2 = new TestProcessor();
    const multiSpanProcessor = new MultiSpanProcessor([processor1, processor2]);

    const tracerProvider = new BasicTracerProvider();
    tracerProvider.addSpanProcessor(multiSpanProcessor);
    const tracer = tracerProvider.getTracer('default');
    const span = tracer.startSpan('one');
    setTimeout(() => {
      assert.strictEqual(processor1.spans.length, 0);
      assert.strictEqual(processor1.spans.length, processor2.spans.length);

      span.end();
      setTimeout(() => {
        assert.strictEqual(processor1.spans.length, 1);
        assert.strictEqual(processor1.spans.length, processor2.spans.length);

        multiSpanProcessor.shutdown();
        assert.strictEqual(processor1.spans.length, 0);
        assert.strictEqual(processor1.spans.length, processor2.spans.length);
        done();
      }, 10);
    }, 10);
  });

  it('should export spans on graceful shutdown from two span processor', done => {
    const processor1 = new TestProcessor();
    const processor2 = new TestProcessor();
    const multiSpanProcessor = new MultiSpanProcessor([processor1, processor2]);

    const tracerProvider = new BasicTracerProvider();
    tracerProvider.addSpanProcessor(multiSpanProcessor);
    const tracer = tracerProvider.getTracer('default');
    const span = tracer.startSpan('one');
    assert.strictEqual(processor1.spans.length, 0);
    assert.strictEqual(processor1.spans.length, processor2.spans.length);

    span.end();
    setTimeout(() => {
      assert.strictEqual(processor1.spans.length, 1);
      assert.strictEqual(processor1.spans.length, processor2.spans.length);

      notifyOnGlobalShutdown(() => {
        assert.strictEqual(processor1.spans.length, 0);
        assert.strictEqual(processor1.spans.length, processor2.spans.length);
        done();
      });
      _invokeGlobalShutdown();
    }, 10);
  });

  it('should export spans on manual shutdown from two span processor', done => {
    const processor1 = new TestProcessor();
    const processor2 = new TestProcessor();

    const tracerProvider = new BasicTracerProvider();

    tracerProvider.addSpanProcessor(processor1);
    tracerProvider.addSpanProcessor(processor2);

    const tracer = tracerProvider.getTracer('default');
    const span = tracer.startSpan('one');
    setTimeout(() => {
      assert.strictEqual(processor1.spans.length, 0);
      assert.strictEqual(processor1.spans.length, processor2.spans.length);

      span.end();
      setTimeout(() => {
        assert.strictEqual(processor1.spans.length, 1);
        assert.strictEqual(processor1.spans.length, processor2.spans.length);

        tracerProvider.shutdown(() => {
          assert.strictEqual(processor1.spans.length, 0);
          assert.strictEqual(processor1.spans.length, processor2.spans.length);
          done();
        });
      }, 10);
    }, 10);
  });

  it('should force span processors to flush', () => {
    let flushed = false;
    const processor: SpanProcessor = {
      forceFlush: () => {
        flushed = true;
      },
      onStart: span => {},
      onEnd: span => {},
      shutdown: () => {},
    };
    const multiSpanProcessor = new MultiSpanProcessor([processor]);
    multiSpanProcessor.forceFlush();
    assert.ok(flushed);
  });

  it('should wait for all span processors to finish flushing', done => {
    let flushed = 0;
    const processor1 = new SimpleSpanProcessor(new InMemorySpanExporter());
    const processor2 = new SimpleSpanProcessor(new InMemorySpanExporter());

    const spy1 = Sinon.stub(processor1, 'forceFlush').callsFake(cb => {
      flushed++;
      cb!();
    });
    const spy2 = Sinon.stub(processor2, 'forceFlush').callsFake(cb => {
      flushed++;
      cb!();
    });

    const multiSpanProcessor = new MultiSpanProcessor([processor1, processor2]);
    multiSpanProcessor.forceFlush(() => {
      Sinon.assert.calledOnce(spy1);
      Sinon.assert.calledOnce(spy2);
      assert.strictEqual(flushed, 2);
      done();
    });
  });
});
