/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
  BasicTracerProvider,
} from '../../../src';
import { context, trace } from '@opentelemetry/api';
import { ExportResult, ExportResultCode } from '@opentelemetry/core';

describe('InMemorySpanExporter', () => {
  let memoryExporter: InMemorySpanExporter;
  let provider: BasicTracerProvider;

  beforeEach(() => {
    memoryExporter = new InMemorySpanExporter();
    provider = new BasicTracerProvider({
      spanProcessors: [new SimpleSpanProcessor(memoryExporter)],
    });
  });

  it('should get finished spans', () => {
    const root = provider.getTracer('default').startSpan('root');
    const child = provider
      .getTracer('default')
      .startSpan('child', {}, trace.setSpan(context.active(), root));
    const grandChild = provider
      .getTracer('default')
      .startSpan('grand-child', {}, trace.setSpan(context.active(), child));

    assert.strictEqual(memoryExporter.getFinishedSpans().length, 0);
    grandChild.end();
    assert.strictEqual(memoryExporter.getFinishedSpans().length, 1);
    child.end();
    assert.strictEqual(memoryExporter.getFinishedSpans().length, 2);
    root.end();
    assert.strictEqual(memoryExporter.getFinishedSpans().length, 3);

    const [span1, span2, span3] = memoryExporter.getFinishedSpans();
    assert.strictEqual(span1.name, 'grand-child');
    assert.strictEqual(span2.name, 'child');
    assert.strictEqual(span3.name, 'root');
    assert.strictEqual(
      span1.spanContext().traceId,
      span2.spanContext().traceId
    );
    assert.strictEqual(
      span2.spanContext().traceId,
      span3.spanContext().traceId
    );
    assert.strictEqual(
      span1.parentSpanContext?.spanId,
      span2.spanContext().spanId
    );
    assert.strictEqual(
      span2.parentSpanContext?.spanId,
      span3.spanContext().spanId
    );
  });

  it('should shutdown the exporter', () => {
    const root = provider.getTracer('default').startSpan('root');

    provider
      .getTracer('default')
      .startSpan('child', {}, trace.setSpan(context.active(), root))
      .end();
    root.end();
    assert.strictEqual(memoryExporter.getFinishedSpans().length, 2);
    memoryExporter.shutdown();
    assert.strictEqual(memoryExporter.getFinishedSpans().length, 0);

    // after shutdown no new spans are accepted
    provider
      .getTracer('default')
      .startSpan('child1', {}, trace.setSpan(context.active(), root))
      .end();
    assert.strictEqual(memoryExporter.getFinishedSpans().length, 0);
  });

  describe('force flush', () => {
    it('forceFlush should flush spans and return', async () => {
      memoryExporter = new InMemorySpanExporter();
      await memoryExporter.forceFlush();
    });
  });

  it('should reset spans when reset is called', () => {
    const root = provider.getTracer('default').startSpan('root');

    provider
      .getTracer('default')
      .startSpan('child', {}, trace.setSpan(context.active(), root))
      .end();
    root.end();
    assert.strictEqual(memoryExporter.getFinishedSpans().length, 2);

    memoryExporter.reset();

    assert.strictEqual(memoryExporter.getFinishedSpans().length, 0);
  });

  it('should return the success result', () => {
    const exporter = new InMemorySpanExporter();
    exporter.export([], (result: ExportResult) => {
      assert.strictEqual(result.code, ExportResultCode.SUCCESS);
    });
  });

  it('should return the FailedNotRetryable result after shutdown', () => {
    const exporter = new InMemorySpanExporter();
    exporter.shutdown();

    // after shutdown export should fail
    exporter.export([], (result: ExportResult) => {
      assert.strictEqual(result.code, ExportResultCode.FAILED);
    });
  });
});
