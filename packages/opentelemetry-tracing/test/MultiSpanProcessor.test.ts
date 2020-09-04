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
  shutdown(): Promise<void> {
    this.spans = [];
    return Promise.resolve();
  }
  forceFlush(): Promise<void> {
    return Promise.resolve();
  }
}

describe('MultiSpanProcessor', () => {
  let removeEvent: Function | undefined;
  afterEach(() => {
    if (removeEvent) {
      removeEvent();
      removeEvent = undefined;
    }
  });

  it('should handle empty span processor', async () => {
    const multiSpanProcessor = new MultiSpanProcessor([]);

    const tracerProvider = new BasicTracerProvider();
    tracerProvider.addSpanProcessor(multiSpanProcessor);
    const tracer = tracerProvider.getTracer('default');
    const span = tracer.startSpan('one');
    span.end();
    await multiSpanProcessor.shutdown();
  });

  it('should handle one span processor', async () => {
    const processor1 = new TestProcessor();
    const multiSpanProcessor = new MultiSpanProcessor([processor1]);

    const tracerProvider = new BasicTracerProvider();
    tracerProvider.addSpanProcessor(multiSpanProcessor);
    const tracer = tracerProvider.getTracer('default');
    const span = tracer.startSpan('one');
    assert.strictEqual(processor1.spans.length, 0);
    span.end();
    await new Promise(resolve => setTimeout(resolve));
    assert.strictEqual(processor1.spans.length, 1);
    await multiSpanProcessor.shutdown();
  });

  it('should handle two span processor', async () => {
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
    await new Promise(resolve => setTimeout(resolve));
    assert.strictEqual(processor1.spans.length, 1);
    assert.strictEqual(processor2.spans.length, 1);

    await multiSpanProcessor.shutdown();
    assert.strictEqual(processor1.spans.length, 0);
    assert.strictEqual(processor2.spans.length, 0);
  });

  it('should export spans on graceful shutdown from two span processors', done => {
    const processor1 = new TestProcessor();
    const processor2 = new TestProcessor();
    const multiSpanProcessor = new MultiSpanProcessor([processor1, processor2]);

    const tracerProvider = new BasicTracerProvider();
    tracerProvider.addSpanProcessor(multiSpanProcessor);
    const tracer = tracerProvider.getTracer('default');
    const span = tracer.startSpan('one');
    assert.strictEqual(processor1.spans.length, 0);
    assert.strictEqual(processor2.spans.length, 0);

    span.end();
    setTimeout(() => {
      assert.strictEqual(processor1.spans.length, 1);
      assert.strictEqual(processor2.spans.length, 1);

      removeEvent = notifyOnGlobalShutdown(() => {
        assert.strictEqual(processor1.spans.length, 0);
        assert.strictEqual(processor2.spans.length, 0);
        done();
      });
      _invokeGlobalShutdown();
    });
  });

  it('should export spans on manual shutdown from two span processor', async () => {
    const processor1 = new TestProcessor();
    const processor2 = new TestProcessor();

    const tracerProvider = new BasicTracerProvider();

    tracerProvider.addSpanProcessor(processor1);
    tracerProvider.addSpanProcessor(processor2);

    const tracer = tracerProvider.getTracer('default');
    tracer.startSpan('one');

    await tracerProvider.shutdown();
    assert.strictEqual(processor1.spans.length, 0);
    assert.strictEqual(processor1.spans.length, processor2.spans.length);
  });

  it('should force span processors to flush', async () => {
    let flushed = false;
    const processor: SpanProcessor = {
      forceFlush: () => {
        flushed = true;
        return Promise.resolve();
      },
      onStart: span => {},
      onEnd: span => {},
      shutdown: () => {
        return Promise.resolve();
      },
    };
    const multiSpanProcessor = new MultiSpanProcessor([processor]);
    await multiSpanProcessor.forceFlush();
    assert.ok(flushed);
  });

  it('should wait for all span processors to finish flushing', done => {
    let flushed = 0;
    const processor1 = new SimpleSpanProcessor(new InMemorySpanExporter());
    const processor2 = new SimpleSpanProcessor(new InMemorySpanExporter());

    const spy1 = Sinon.stub(processor1, 'forceFlush').callsFake(() => {
      flushed++;
      return Promise.resolve();
    });
    const spy2 = Sinon.stub(processor2, 'forceFlush').callsFake(() => {
      flushed++;
      return Promise.resolve();
    });

    const multiSpanProcessor = new MultiSpanProcessor([processor1, processor2]);
    multiSpanProcessor.forceFlush().then(() => {
      Sinon.assert.calledOnce(spy1);
      Sinon.assert.calledOnce(spy2);
      assert.strictEqual(flushed, 2);
      done();
    });
  });
});
