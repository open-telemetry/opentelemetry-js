/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import { Writable } from 'stream';
import { SpanStatusCode } from '@opentelemetry/api';
import { ExportResultCode } from '@opentelemetry/core';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  SimpleSpanProcessor,
  TracerProvider,
  InMemorySpanExporter,
} from '@opentelemetry/sdk-trace';
import { JsonTraceSerializer } from '@opentelemetry/otlp-transformer';
import { OtlpJsonFileSpanExporter } from '../src/OtlpJsonFileSpanExporter';

class MemoryWritable extends Writable {
  public content = '';
  public lines: string[] = [];

  override _write(
    chunk: Buffer,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void
  ): void {
    const text = chunk.toString('utf-8');
    this.content += text;
    const parts = text.split('\n');
    for (const part of parts) {
      if (part.trim().length > 0) {
        this.lines.push(part);
      }
    }
    callback();
  }
}

describe('OtlpJsonFileSpanExporter', () => {
  it('exports readable spans as valid OTLP JSON Lines to custom stream', done => {
    const memoryStream = new MemoryWritable();
    const exporter = new OtlpJsonFileSpanExporter({ out: memoryStream });

    const resource = resourceFromAttributes({
      'service.name': 'test-service',
      'service.version': '1.2.3',
    });

    const inMemoryExporter = new InMemorySpanExporter();
    const provider = new TracerProvider({
      resource,
      spanProcessors: [new SimpleSpanProcessor({ exporter: inMemoryExporter })],
    });

    const tracer = provider.getTracer('test-tracer', '0.1.0');
    const span = tracer.startSpan('operation-a');
    span.setAttribute('test.key', 'test.value');
    span.addEvent('test-event', { 'event.attr': 42 });
    span.setStatus({ code: SpanStatusCode.OK, message: 'All good' });
    span.end();

    const finishedSpans = inMemoryExporter.getFinishedSpans();
    assert.strictEqual(finishedSpans.length, 1);

    exporter.export(finishedSpans, result => {
      assert.strictEqual(result.code, ExportResultCode.SUCCESS);
      assert.strictEqual(memoryStream.lines.length, 1);
      assert.ok(memoryStream.content.endsWith('\n'));

      const json = JSON.parse(memoryStream.lines[0]);
      assert.ok(json.resourceSpans, 'Must contain resourceSpans');
      assert.strictEqual(json.resourceSpans.length, 1);

      const rs = json.resourceSpans[0];
      assert.ok(rs.resource?.attributes);
      const serviceNameAttr = rs.resource.attributes.find(
        (a: any) => a.key === 'service.name'
      );
      assert.strictEqual(serviceNameAttr?.value?.stringValue, 'test-service');

      assert.strictEqual(rs.scopeSpans.length, 1);
      const ss = rs.scopeSpans[0];
      assert.strictEqual(ss.scope?.name, 'test-tracer');
      assert.strictEqual(ss.scope?.version, '0.1.0');

      assert.strictEqual(ss.spans.length, 1);
      const otlpSpan = ss.spans[0];
      assert.strictEqual(otlpSpan.name, 'operation-a');
      assert.strictEqual(
        otlpSpan.traceId,
        finishedSpans[0].spanContext().traceId
      );
      assert.strictEqual(
        otlpSpan.spanId,
        finishedSpans[0].spanContext().spanId
      );
      assert.strictEqual(otlpSpan.status?.code, SpanStatusCode.OK);

      const spanAttr = otlpSpan.attributes?.find(
        (a: any) => a.key === 'test.key'
      );
      assert.strictEqual(spanAttr?.value?.stringValue, 'test.value');

      assert.strictEqual(otlpSpan.events?.length, 1);
      assert.strictEqual(otlpSpan.events[0].name, 'test-event');

      done();
    });
  });

  it('exports multiple consecutive batches as distinct JSON lines', done => {
    const memoryStream = new MemoryWritable();
    const exporter = new OtlpJsonFileSpanExporter({ out: memoryStream });

    const inMemoryExporter = new InMemorySpanExporter();
    const provider = new TracerProvider({
      spanProcessors: [new SimpleSpanProcessor({ exporter: inMemoryExporter })],
    });
    const tracer = provider.getTracer('test-tracer');

    const span1 = tracer.startSpan('span-1');
    span1.end();
    const finished1 = inMemoryExporter.getFinishedSpans();

    exporter.export(finished1, res1 => {
      assert.strictEqual(res1.code, ExportResultCode.SUCCESS);

      inMemoryExporter.reset();
      const span2 = tracer.startSpan('span-2');
      span2.end();
      const finished2 = inMemoryExporter.getFinishedSpans();

      exporter.export(finished2, res2 => {
        assert.strictEqual(res2.code, ExportResultCode.SUCCESS);
        assert.strictEqual(memoryStream.lines.length, 2);

        const json1 = JSON.parse(memoryStream.lines[0]);
        const json2 = JSON.parse(memoryStream.lines[1]);

        assert.strictEqual(
          json1.resourceSpans[0].scopeSpans[0].spans[0].name,
          'span-1'
        );
        assert.strictEqual(
          json2.resourceSpans[0].scopeSpans[0].spans[0].name,
          'span-2'
        );
        done();
      });
    });
  });

  it('handles empty spans array gracefully without writing', done => {
    const memoryStream = new MemoryWritable();
    const exporter = new OtlpJsonFileSpanExporter({ out: memoryStream });

    exporter.export([], result => {
      assert.strictEqual(result.code, ExportResultCode.SUCCESS);
      assert.strictEqual(memoryStream.content, '');
      assert.strictEqual(memoryStream.lines.length, 0);
      done();
    });
  });

  it('writes to process.stdout by default', done => {
    const stdoutWriteStub = sinon
      .stub(process.stdout, 'write')
      .callsFake((chunk: any, cb?: any) => {
        if (typeof cb === 'function') {
          cb();
        }
        return true;
      });

    const inMemoryExporter = new InMemorySpanExporter();
    const provider = new TracerProvider({
      spanProcessors: [new SimpleSpanProcessor({ exporter: inMemoryExporter })],
    });
    const tracer = provider.getTracer('stdout-tracer');
    const span = tracer.startSpan('stdout-span');
    span.end();

    const exporter = new OtlpJsonFileSpanExporter();
    exporter.export(inMemoryExporter.getFinishedSpans(), result => {
      stdoutWriteStub.restore();
      assert.strictEqual(result.code, ExportResultCode.SUCCESS);
      assert.strictEqual(stdoutWriteStub.calledOnce, true);

      const written = stdoutWriteStub.firstCall.args[0] as Buffer;
      const text = written.toString('utf-8');
      assert.ok(text.endsWith('\n'));
      const parsed = JSON.parse(text);
      assert.ok(parsed.resourceSpans);
      done();
    });
  });

  it('delegates shutdown and forceFlush to internal writer', async () => {
    const memoryStream = new MemoryWritable();
    const exporter = new OtlpJsonFileSpanExporter({ out: memoryStream });

    await exporter.forceFlush();
    await exporter.shutdown();

    // After shutdown, export fails
    await new Promise<void>(resolve => {
      const inMemoryExporter = new InMemorySpanExporter();
      const provider = new TracerProvider({
        spanProcessors: [
          new SimpleSpanProcessor({ exporter: inMemoryExporter }),
        ],
      });
      const tracer = provider.getTracer('after-shutdown');
      const span = tracer.startSpan('span');
      span.end();

      exporter.export(inMemoryExporter.getFinishedSpans(), result => {
        assert.strictEqual(result.code, ExportResultCode.FAILED);
        assert.strictEqual(result.error?.message, 'Exporter has been shutdown');
        resolve();
      });
    });
  });

  it('returns FAILED when JsonTraceSerializer throws an error', done => {
    const memoryStream = new MemoryWritable();
    const exporter = new OtlpJsonFileSpanExporter({ out: memoryStream });
    const serializeStub = sinon
      .stub(JsonTraceSerializer, 'serializeRequest')
      .throws(new Error('Serialization failed'));

    const inMemoryExporter = new InMemorySpanExporter();
    const provider = new TracerProvider({
      spanProcessors: [new SimpleSpanProcessor({ exporter: inMemoryExporter })],
    });
    const tracer = provider.getTracer('test-tracer');
    const span = tracer.startSpan('span');
    span.end();

    exporter.export(inMemoryExporter.getFinishedSpans(), result => {
      serializeStub.restore();
      assert.strictEqual(result.code, ExportResultCode.FAILED);
      assert.strictEqual(result.error?.message, 'Serialization failed');
      done();
    });
  });

  it('returns FAILED when JsonTraceSerializer returns empty result', done => {
    const memoryStream = new MemoryWritable();
    const exporter = new OtlpJsonFileSpanExporter({ out: memoryStream });
    const serializeStub = sinon
      .stub(JsonTraceSerializer, 'serializeRequest')
      .returns(undefined as any);

    const inMemoryExporter = new InMemorySpanExporter();
    const provider = new TracerProvider({
      spanProcessors: [new SimpleSpanProcessor({ exporter: inMemoryExporter })],
    });
    const tracer = provider.getTracer('test-tracer');
    const span = tracer.startSpan('span');
    span.end();

    exporter.export(inMemoryExporter.getFinishedSpans(), result => {
      serializeStub.restore();
      assert.strictEqual(result.code, ExportResultCode.FAILED);
      assert.strictEqual(result.error?.message, 'Nothing to send');
      done();
    });
  });
});
