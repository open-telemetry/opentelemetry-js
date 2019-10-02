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
import { BatchSpanProcessor } from '../../src/export/BatchSpanProcessor';
import { Span, BasicTracer } from '../../src';
import { InMemorySpanExporter } from '../../src/export/InMemorySpanExporter';
import { NoopScopeManager } from '@opentelemetry/scope-base';
import { NEVER_SAMPLER, ALWAYS_SAMPLER, NoopLogger } from '@opentelemetry/core';

function createSampledSpan(spanName: string): Span {
  const tracer = new BasicTracer({
    scopeManager: new NoopScopeManager(),
    sampler: ALWAYS_SAMPLER,
  });
  const span = tracer.startSpan(spanName);
  span.end();
  return span as Span;
}

function createUnSampledSpan(spanName: string): Span {
  const tracer = new BasicTracer({
    scopeManager: new NoopScopeManager(),
    sampler: NEVER_SAMPLER,
    logger: new NoopLogger(),
  });
  const span = tracer.startSpan(spanName, { isRecordingEvents: false });
  span.end();
  return span as Span;
}

describe('BatchSpanProcessor', () => {
  const name = 'span-name';
  const defaultBufferConfig = {
    bufferSize: 5,
    bufferTimeout: 2000,
  };
  let exporter: InMemorySpanExporter;
  beforeEach(() => {
    exporter = new InMemorySpanExporter();
  });
  afterEach(() => {
    exporter.reset();
  });

  describe('constructor', () => {
    it('should create a BatchSpanProcessor instance', () => {
      const processor = new BatchSpanProcessor(exporter);
      assert.ok(processor instanceof BatchSpanProcessor);
    });

    it('should create a BatchSpanProcessor instance with config', () => {
      const processor = new BatchSpanProcessor(exporter, defaultBufferConfig);
      assert.ok(processor instanceof BatchSpanProcessor);
    });

    it('should create a BatchSpanProcessor instance with empty config', () => {
      const processor = new BatchSpanProcessor(exporter, {});
      assert.ok(processor instanceof BatchSpanProcessor);
    });
  });

  describe('.onStart/.onEnd/.shutdown', () => {
    it('should export the sampled spans with buffer size reached', () => {
      const processor = new BatchSpanProcessor(exporter, defaultBufferConfig);
      for (let i = 0; i < defaultBufferConfig.bufferSize; i++) {
        const span = createSampledSpan(`${name}_${i}`);
        processor.onStart(span);
        assert.strictEqual(exporter.getFinishedSpans().length, 0);

        processor.onEnd(span);
        assert.strictEqual(exporter.getFinishedSpans().length, 0);
      }
      // Now we should start seeing the spans in exporter
      const span = createSampledSpan(`${name}_6`);
      processor.onEnd(span);
      assert.strictEqual(exporter.getFinishedSpans().length, 6);

      processor.shutdown();
      assert.strictEqual(exporter.getFinishedSpans().length, 0);
    });

    it('should not export the unsampled spans', () => {
      const processor = new BatchSpanProcessor(exporter, defaultBufferConfig);
      for (let i = 0; i < defaultBufferConfig.bufferSize * 2; i++) {
        const span = createUnSampledSpan(`${name}_${i}`);
        processor.onEnd(span);
        assert.strictEqual(exporter.getFinishedSpans().length, 0);
      }
    });

    it('should force flush when timeout exceeded', done => {
      const processor = new BatchSpanProcessor(exporter, defaultBufferConfig);
      for (let i = 0; i < defaultBufferConfig.bufferSize; i++) {
        const span = createSampledSpan(`${name}_${i}`);
        processor.onEnd(span);
        assert.strictEqual(exporter.getFinishedSpans().length, 0);
      }

      setTimeout(() => {
        assert.strictEqual(exporter.getFinishedSpans().length, 5);
        done();
      }, defaultBufferConfig.bufferTimeout + 1000);
    }).timeout(defaultBufferConfig.bufferTimeout * 2);
  });
});
