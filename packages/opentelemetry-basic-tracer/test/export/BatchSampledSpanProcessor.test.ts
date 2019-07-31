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
import { BatchSampledSpanProcessor } from '../../src/export/BatchSampledSpanProcessor';
import { NoopSpanExporter } from '../../src/export/NoopSpanExporter';
import { NoopTracer, NoopLogger } from '@opentelemetry/core';
import { Span } from '../../src';
import { SpanContext, SpanKind, TraceOptions } from '@opentelemetry/types';

const exporter = new NoopSpanExporter();
const DEFAULT_BUFFER_SIZE = 10;
const DEFAULT_BUFFER_TIMEOUT = 2000; // time in milliseconds
const defaultBufferConfig = {
  bufferSize: DEFAULT_BUFFER_SIZE,
  bufferTimeout: DEFAULT_BUFFER_TIMEOUT,
  logger: new NoopLogger(),
};

describe('BatchSampledSpanProcessor', () => {
  const tracer = new NoopTracer();
  const logger = new NoopLogger();
  const spanContext: SpanContext = {
    traceId: 'a3cda95b652f4a1592b449d5929fda1b',
    spanId: '5e0c63257de34c92',
    traceOptions: TraceOptions.SAMPLED,
  };

  describe('constructor', () => {
    it('should create a BatchSampledSpanProcessor instance', () => {
      const processor = new BatchSampledSpanProcessor(
        [exporter],
        defaultBufferConfig
      );
      assert.ok(processor instanceof BatchSampledSpanProcessor);
    });
  });

  describe('.onStart/.onEnd', () => {
    it('should handle span started and ended', () => {
      const processor = new BatchSampledSpanProcessor(
        [exporter],
        defaultBufferConfig
      );
      const span = new Span(
        tracer,
        logger,
        'span-name',
        spanContext,
        SpanKind.CLIENT,
        processor
      );
      assert.strictEqual(processor['_spansDataList'].length, 0);
      span.end();
      assert.strictEqual(processor['_spansDataList'].length, 1);
    });

    it('should force flush when bufferSize exceeded', () => {
      const processor = new BatchSampledSpanProcessor([exporter], {
        bufferSize: 10,
      });
      for (let j = 0; j < 10; j++) {
        processor.onEnd(
          new Span(
            tracer,
            logger,
            'span-' + j,
            spanContext,
            SpanKind.CLIENT,
            processor
          )
        );
      }
      assert.strictEqual(processor['_spansDataList'].length, 10);
      processor.onEnd(
        new Span(
          tracer,
          logger,
          'overflow-span',
          spanContext,
          SpanKind.CLIENT,
          processor
        )
      );
      assert.strictEqual(processor['_spansDataList'].length, 0);
    });

    // it('should force flush when timeout exceeded', done => {
    //   const processor = new BatchSampledSpanProcessor(
    //     [exporter],
    //     defaultBufferConfig
    //   );
    //   for (let j = 0; j < 5; j++) {
    //     processor.onEnd(new Span(tracer, 'span-' + j, spanContext, SpanKind.CLIENT, processor));
    //     assert.strictEqual(processor['_spansDataList'].length, j + 1);
    //   }

    //   setTimeout(() => {
    //     assert.strictEqual(processor['_spansDataList'].length, 5);
    //     done();
    //   }, DEFAULT_BUFFER_TIMEOUT * 2);
    // }).timeout(7000);
  });
});
