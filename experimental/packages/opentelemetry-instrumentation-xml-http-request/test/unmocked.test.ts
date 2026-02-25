/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import { Span } from '@opentelemetry/api';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ReadableSpan, SpanProcessor } from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { XMLHttpRequestInstrumentation } from '../src';
import * as assert from 'assert';

class TestSpanProcessor implements SpanProcessor {
  spans: ReadableSpan[] = [];

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }
  onStart(span: Span): void {}
  shutdown(): Promise<void> {
    return Promise.resolve();
  }

  onEnd(span: ReadableSpan): void {
    this.spans.push(span);
  }
}

describe('unmocked xhr', () => {
  let testSpans: TestSpanProcessor;
  let provider: WebTracerProvider;
  beforeEach(() => {
    testSpans = new TestSpanProcessor();
    provider = new WebTracerProvider({
      spanProcessors: [testSpans],
    });
    registerInstrumentations({
      instrumentations: [
        new XMLHttpRequestInstrumentation({
          semconvStabilityOptIn: 'http',
        }),
      ],
      tracerProvider: provider,
    });
  });
  afterEach(() => {
    // nop
  });

  it('should find resource with a relative url', done => {
    const xhr = new XMLHttpRequest();
    let path = location.pathname;
    path = path.substring(path.lastIndexOf('/') + 1);
    xhr.open('GET', path);
    xhr.addEventListener('loadend', () => {
      setTimeout(() => {
        assert.strictEqual(testSpans.spans.length, 1);
        const span = testSpans.spans[0];
        // Ensure the PerformanceTiming resource was found and used.
        // `fetchStart` is one of its events.
        const fetchStartEvent = span?.events.filter(
          e => e.name === 'fetchStart'
        )[0];
        assert.ok(fetchStartEvent);
        done();
      }, 500);
    });
    xhr.send();
  });
});
