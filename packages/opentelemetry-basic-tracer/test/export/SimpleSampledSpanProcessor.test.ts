/**
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
import { SimpleSampledSpanProcessor } from '../../src/export/SimpleSampledSpanProcessor';
import { NoopTracer, NoopLogger } from '@opentelemetry/core';
import { Span } from '../../src';
import { SpanExporter } from '../../src/export/SpanExporter';
import { ReadableSpan } from '../../src/export/ReadableSpan';
import { SpanContext, SpanKind, TraceOptions } from '@opentelemetry/types';

class TestExporter implements SpanExporter {
  spansDataList: ReadableSpan[] = [];
  export(spans: ReadableSpan[]): void {
    this.spansDataList.push(...spans);
  }

  shutdown(): void {
    this.spansDataList = [];
  }
}

describe('SimpleSampledSpanProcessor', () => {
  const tracer = new NoopTracer();
  const logger = new NoopLogger();
  const exporter = new TestExporter();

  describe('constructor', () => {
    it('should create a SimpleSampledSpanProcessor instance', () => {
      const processor = new SimpleSampledSpanProcessor([exporter]);
      assert.ok(processor instanceof SimpleSampledSpanProcessor);
    });
  });

  describe('.onStart/.onEnd', () => {
    it('should handle span started and ended', () => {
      const processor = new SimpleSampledSpanProcessor([exporter]);
      const spanContext: SpanContext = {
        traceId: 'a3cda95b652f4a1592b449d5929fda1b',
        spanId: '5e0c63257de34c92',
        traceOptions: TraceOptions.SAMPLED,
      };
      const span = new Span(
        tracer,
        logger,
        'span-name',
        spanContext,
        SpanKind.CLIENT,
        processor
      );
      assert.strictEqual(exporter.spansDataList.length, 0);
      span.end();
      assert.strictEqual(exporter.spansDataList.length, 1);
    });
  });
});
