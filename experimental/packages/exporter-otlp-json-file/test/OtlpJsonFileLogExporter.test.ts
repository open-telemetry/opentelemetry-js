/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import { Writable } from 'stream';
import { ROOT_CONTEXT, SeverityNumber, trace } from '@opentelemetry/api';
import { ExportResultCode } from '@opentelemetry/core';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  InMemoryLogRecordExporter,
  LoggerProvider,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import { JsonLogsSerializer } from '@opentelemetry/otlp-transformer';
import { OtlpJsonFileLogExporter } from '../src/OtlpJsonFileLogExporter';

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

describe('OtlpJsonFileLogExporter', () => {
  it('exports log records as valid OTLP JSON Lines to custom stream', done => {
    const memoryStream = new MemoryWritable();
    const exporter = new OtlpJsonFileLogExporter({ out: memoryStream });

    const resource = resourceFromAttributes({
      'service.name': 'logs-test-service',
      'host.name': 'worker-1',
    });

    const inMemoryExporter = new InMemoryLogRecordExporter();
    const processor = new SimpleLogRecordProcessor({
      exporter: inMemoryExporter,
    });
    const provider = new LoggerProvider({
      resource,
      processors: [processor],
    });

    const ctx = trace.setSpanContext(ROOT_CONTEXT, {
      traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
      spanId: '00f067aa0ba902b7',
      traceFlags: 1,
    });

    const logger = provider.getLogger('test-logger', '2.0.0');
    logger.emit({
      severityNumber: SeverityNumber.INFO,
      severityText: 'INFO',
      body: 'Processing order #1234',
      attributes: {
        'order.id': 1234,
        'order.status': 'completed',
      },
      context: ctx,
    });

    const finishedLogs = inMemoryExporter.getFinishedLogRecords();
    assert.strictEqual(finishedLogs.length, 1);

    exporter.export(finishedLogs, result => {
      assert.strictEqual(result.code, ExportResultCode.SUCCESS);
      assert.strictEqual(memoryStream.lines.length, 1);
      assert.ok(memoryStream.content.endsWith('\n'));

      const json = JSON.parse(memoryStream.lines[0]);
      assert.ok(json.resourceLogs, 'Must contain resourceLogs');
      assert.strictEqual(json.resourceLogs.length, 1);

      const rl = json.resourceLogs[0];
      const serviceAttr = rl.resource.attributes.find(
        (a: any) => a.key === 'service.name'
      );
      assert.strictEqual(serviceAttr?.value?.stringValue, 'logs-test-service');

      assert.strictEqual(rl.scopeLogs.length, 1);
      const sl = rl.scopeLogs[0];
      assert.strictEqual(sl.scope?.name, 'test-logger');
      assert.strictEqual(sl.scope?.version, '2.0.0');

      assert.strictEqual(sl.logRecords.length, 1);
      const logRecord = sl.logRecords[0];
      assert.strictEqual(logRecord.severityNumber, SeverityNumber.INFO);
      assert.strictEqual(logRecord.severityText, 'INFO');
      assert.strictEqual(logRecord.body?.stringValue, 'Processing order #1234');
      assert.strictEqual(logRecord.traceId, '4bf92f3577b34da6a3ce929d0e0e4736');
      assert.strictEqual(logRecord.spanId, '00f067aa0ba902b7');

      const orderAttr = logRecord.attributes.find(
        (a: any) => a.key === 'order.status'
      );
      assert.strictEqual(orderAttr?.value?.stringValue, 'completed');

      done();
    });
  });

  it('exports multiple consecutive log batches as distinct JSON lines', done => {
    const memoryStream = new MemoryWritable();
    const exporter = new OtlpJsonFileLogExporter({ out: memoryStream });

    const inMemoryExporter = new InMemoryLogRecordExporter();
    const processor = new SimpleLogRecordProcessor({
      exporter: inMemoryExporter,
    });
    const provider = new LoggerProvider({
      processors: [processor],
    });
    const logger = provider.getLogger('test-logger');

    logger.emit({ body: 'log-message-1' });
    const finished1 = inMemoryExporter.getFinishedLogRecords();

    exporter.export(finished1, res1 => {
      assert.strictEqual(res1.code, ExportResultCode.SUCCESS);

      inMemoryExporter.reset();
      logger.emit({ body: 'log-message-2' });
      const finished2 = inMemoryExporter.getFinishedLogRecords();

      exporter.export(finished2, res2 => {
        assert.strictEqual(res2.code, ExportResultCode.SUCCESS);
        assert.strictEqual(memoryStream.lines.length, 2);

        const json1 = JSON.parse(memoryStream.lines[0]);
        const json2 = JSON.parse(memoryStream.lines[1]);

        assert.strictEqual(
          json1.resourceLogs[0].scopeLogs[0].logRecords[0].body.stringValue,
          'log-message-1'
        );
        assert.strictEqual(
          json2.resourceLogs[0].scopeLogs[0].logRecords[0].body.stringValue,
          'log-message-2'
        );
        done();
      });
    });
  });

  it('handles empty logs array gracefully without writing', done => {
    const memoryStream = new MemoryWritable();
    const exporter = new OtlpJsonFileLogExporter({ out: memoryStream });

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

    const inMemoryExporter = new InMemoryLogRecordExporter();
    const processor = new SimpleLogRecordProcessor({
      exporter: inMemoryExporter,
    });
    const provider = new LoggerProvider({
      processors: [processor],
    });
    const logger = provider.getLogger('stdout-logger');
    logger.emit({ body: 'stdout log' });

    const exporter = new OtlpJsonFileLogExporter();
    exporter.export(inMemoryExporter.getFinishedLogRecords(), result => {
      stdoutWriteStub.restore();
      assert.strictEqual(result.code, ExportResultCode.SUCCESS);
      assert.strictEqual(stdoutWriteStub.calledOnce, true);

      const written = stdoutWriteStub.firstCall.args[0] as Buffer;
      const text = written.toString('utf-8');
      assert.ok(text.endsWith('\n'));
      const parsed = JSON.parse(text);
      assert.ok(parsed.resourceLogs);
      done();
    });
  });

  it('delegates shutdown and forceFlush to internal writer', async () => {
    const memoryStream = new MemoryWritable();
    const exporter = new OtlpJsonFileLogExporter({ out: memoryStream });

    await exporter.forceFlush();
    await exporter.shutdown();

    await new Promise<void>(resolve => {
      const inMemoryExporter = new InMemoryLogRecordExporter();
      const processor = new SimpleLogRecordProcessor({
        exporter: inMemoryExporter,
      });
      const provider = new LoggerProvider({
        processors: [processor],
      });
      const logger = provider.getLogger('after-shutdown');
      logger.emit({ body: 'msg' });

      exporter.export(inMemoryExporter.getFinishedLogRecords(), result => {
        assert.strictEqual(result.code, ExportResultCode.FAILED);
        assert.strictEqual(result.error?.message, 'Exporter has been shutdown');
        resolve();
      });
    });
  });

  it('returns FAILED when JsonLogsSerializer throws an error', done => {
    const memoryStream = new MemoryWritable();
    const exporter = new OtlpJsonFileLogExporter({ out: memoryStream });
    const serializeStub = sinon
      .stub(JsonLogsSerializer, 'serializeRequest')
      .throws(new Error('Log serialization failed'));

    const inMemoryExporter = new InMemoryLogRecordExporter();
    const processor = new SimpleLogRecordProcessor({
      exporter: inMemoryExporter,
    });
    const provider = new LoggerProvider({
      processors: [processor],
    });
    const logger = provider.getLogger('test-logger');
    logger.emit({ body: 'msg' });

    exporter.export(inMemoryExporter.getFinishedLogRecords(), result => {
      serializeStub.restore();
      assert.strictEqual(result.code, ExportResultCode.FAILED);
      assert.strictEqual(result.error?.message, 'Log serialization failed');
      done();
    });
  });

  it('returns FAILED when JsonLogsSerializer returns empty result', done => {
    const memoryStream = new MemoryWritable();
    const exporter = new OtlpJsonFileLogExporter({ out: memoryStream });
    const serializeStub = sinon
      .stub(JsonLogsSerializer, 'serializeRequest')
      .returns(undefined as any);

    const inMemoryExporter = new InMemoryLogRecordExporter();
    const processor = new SimpleLogRecordProcessor({
      exporter: inMemoryExporter,
    });
    const provider = new LoggerProvider({
      processors: [processor],
    });
    const logger = provider.getLogger('test-logger');
    logger.emit({ body: 'msg' });

    exporter.export(inMemoryExporter.getFinishedLogRecords(), result => {
      serializeStub.restore();
      assert.strictEqual(result.code, ExportResultCode.FAILED);
      assert.strictEqual(result.error?.message, 'Nothing to send');
      done();
    });
  });
});
