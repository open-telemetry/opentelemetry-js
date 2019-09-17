/*!
 * Copyright 2019, OpenTelemetry Authors
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
import { MultiSpanProcessor } from '../src/MultiSpanProcessor';
import { SpanProcessor, Span, BasicTracer } from '../src';

class TestProcessor implements SpanProcessor {
  spans: Span[] = [];
  onStart(span: Span): void {}
  onEnd(span: Span): void {
    this.spans.push(span);
  }
  shutdown(): void {
    this.spans = [];
  }
}

describe('MultiSpanProcessor', () => {
  const tracer = new BasicTracer();
  const span = tracer.startSpan('one');

  it('should handle empty span processor', () => {
    const multiSpanProcessor = new MultiSpanProcessor([]);
    multiSpanProcessor.onStart(span);
    multiSpanProcessor.onEnd(span);
    multiSpanProcessor.shutdown();
  });

  it('should handle one span processor', () => {
    const processor1 = new TestProcessor();
    const multiSpanProcessor = new MultiSpanProcessor([processor1]);
    multiSpanProcessor.onStart(span);
    assert.strictEqual(processor1.spans.length, 0);
    multiSpanProcessor.onEnd(span);
    assert.strictEqual(processor1.spans.length, 1);
  });

  it('should handle two span processor', () => {
    const processor1 = new TestProcessor();
    const processor2 = new TestProcessor();
    const multiSpanProcessor = new MultiSpanProcessor([processor1, processor2]);
    multiSpanProcessor.onStart(span);
    assert.strictEqual(processor1.spans.length, 0);
    assert.strictEqual(processor1.spans.length, processor2.spans.length);
    multiSpanProcessor.onEnd(span);
    assert.strictEqual(processor1.spans.length, 1);
    assert.strictEqual(processor1.spans.length, processor2.spans.length);

    multiSpanProcessor.shutdown();
    assert.strictEqual(processor1.spans.length, 0);
    assert.strictEqual(processor1.spans.length, processor2.spans.length);
  });
});
