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
import { XMLHttpRequestPlugin } from '../src';
import { ReadableSpan, SpanProcessor } from '@opentelemetry/tracing';
import { WebTracerProvider } from '@opentelemetry/web';
import assert = require('assert');
import { HttpAttribute } from '@opentelemetry/semantic-conventions';

class TestSpanProcessor implements SpanProcessor {
  spans: ReadableSpan[] = [];

  forceFlush(callback: () => void): void {}
  onStart(span: ReadableSpan): void {}
  shutdown(callback: () => void): void {}

  onEnd(span: ReadableSpan): void {
    this.spans.push(span);
  }
}

describe('unmocked xhr', () => {
  let testSpans: TestSpanProcessor;
  let provider: WebTracerProvider;
  beforeEach(() => {
    provider = new WebTracerProvider({
      plugins: [new XMLHttpRequestPlugin()],
    });
    testSpans = new TestSpanProcessor();
    provider.addSpanProcessor(testSpans);
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
        // content length comes from the PerformanceTiming resource; this ensures that our
        // matching logic found the right one
        assert.ok(
          (span.attributes[HttpAttribute.HTTP_RESPONSE_CONTENT_LENGTH] as any) >
            0
        );
        done();
      }, 500);
    });
    xhr.send();
  });
});
