/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as Sinon from 'sinon';
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
  Span,
  SpanProcessor,
} from '../../src';
import {
  setGlobalErrorHandler,
  loggingErrorHandler,
} from '@opentelemetry/core';
import { MultiSpanProcessor } from '../../src/MultiSpanProcessor';

class TestProcessor implements SpanProcessor {
  static events: string[] = [];
  name: string;
  spans: Span[] = [];

  constructor(name: string) {
    this.name = name;
  }

  onStart(span: Span): void {
    TestProcessor.events.push(this.name + ':start');
  }

  onEnd(span: Span): void {
    TestProcessor.events.push(this.name + ':end');
    this.spans.push(span);
  }

  shutdown(): Promise<void> {
    TestProcessor.events = [];
    return Promise.resolve();
  }

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }
}

class ExtendedTestProcessor extends TestProcessor {
  onEnding(span: Span): void {
    TestProcessor.events.push(this.name + ':ending');
  }
}

describe('MultiSpanProcessor', () => {
  let removeEvent: (() => void) | undefined;
  afterEach(() => {
    if (removeEvent) {
      removeEvent();
      removeEvent = undefined;
    }
  });

  it('should handle one span processor', () => {
    const processor1 = new TestProcessor('sp1');
    const tracerProvider = new BasicTracerProvider({
      spanProcessors: [processor1],
    });
    const tracer = tracerProvider.getTracer('default');
    const span = tracer.startSpan('one');
    assert.deepStrictEqual(TestProcessor.events, ['sp1:start']);
    span.end();
    assert.deepStrictEqual(TestProcessor.events, ['sp1:start', 'sp1:end']);
    tracerProvider['_activeSpanProcessor'].shutdown();
  });

  it('should handle one span processor with on ending', () => {
    TestProcessor.events = [];
    const processor1 = new ExtendedTestProcessor('sp1');
    const tracerProvider = new BasicTracerProvider({
      spanProcessors: [processor1],
    });
    const tracer = tracerProvider.getTracer('default');
    const span = tracer.startSpan('one');
    assert.deepStrictEqual(TestProcessor.events, ['sp1:start']);
    span.end();
    assert.deepStrictEqual(TestProcessor.events, [
      'sp1:start',
      'sp1:ending',
      'sp1:end',
    ]);
    tracerProvider['_activeSpanProcessor'].shutdown();
  });

  it('should handle two span processor', async () => {
    TestProcessor.events = [];
    const processor1 = new TestProcessor('p1');
    const processor2 = new ExtendedTestProcessor('p2');
    const tracerProvider = new BasicTracerProvider({
      spanProcessors: [processor1, processor2],
    });
    const tracer = tracerProvider.getTracer('default');
    const span = tracer.startSpan('one');
    assert.strictEqual(processor1.spans.length, 0);
    assert.strictEqual(processor2.spans.length, processor2.spans.length);
    assert.deepStrictEqual(TestProcessor.events, ['p1:start', 'p2:start']);

    span.end();
    assert.strictEqual(processor1.spans.length, 1);
    assert.strictEqual(processor1.spans.length, processor2.spans.length);
    assert.deepStrictEqual(TestProcessor.events, [
      'p1:start',
      'p2:start',
      'p2:ending',
      'p1:end',
      'p2:end',
    ]);

    await tracerProvider.shutdown();
    // TestProcessor.shutdown() clears the static events array
    assert.deepStrictEqual(TestProcessor.events.length, 0);
  });

  it('should export spans on manual shutdown from two span processor', async () => {
    TestProcessor.events = [];
    const processor1 = new TestProcessor('p1');
    const processor2 = new ExtendedTestProcessor('p2');
    const tracerProvider = new BasicTracerProvider({
      spanProcessors: [processor1, processor2],
    });
    const tracer = tracerProvider.getTracer('default');
    const span = tracer.startSpan('one');
    assert.strictEqual(processor1.spans.length, 0);
    assert.strictEqual(processor1.spans.length, processor2.spans.length);

    span.end();
    assert.strictEqual(processor1.spans.length, 1);
    assert.strictEqual(processor1.spans.length, processor2.spans.length);

    await tracerProvider.shutdown();
    // Verify shutdown was called (events are cleared by TestProcessor.shutdown())
    assert.deepStrictEqual(TestProcessor.events.length, 0);
  });

  it('should force span processors to flush', () => {
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
    multiSpanProcessor.forceFlush();
    assert.ok(flushed);
  });

  it('should wait for all span processors to finish flushing', async () => {
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
    await multiSpanProcessor.forceFlush();
    Sinon.assert.calledOnce(spy1);
    Sinon.assert.calledOnce(spy2);
    assert.strictEqual(flushed, 2);
  });

  it('should call globalErrorHandler in forceFlush', async () => {
    const expectedError = new Error('whoops');
    TestProcessor.events = [];
    const testProcessor = new TestProcessor('p1');
    const forceFlush = Sinon.stub(testProcessor, 'forceFlush');
    forceFlush.rejects(expectedError);

    const multiSpanProcessor = new MultiSpanProcessor([testProcessor]);
    const errorHandlerSpy = Sinon.spy();

    setGlobalErrorHandler(errorHandlerSpy);

    await multiSpanProcessor.forceFlush();

    forceFlush.restore();
    const [[error]] = errorHandlerSpy.args;

    assert.strictEqual(error, expectedError);
    assert.strictEqual(errorHandlerSpy.callCount, 1);

    //reset global error handler
    setGlobalErrorHandler(loggingErrorHandler());
  });
});
