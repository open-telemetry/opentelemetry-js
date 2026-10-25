/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import { Writable } from 'stream';
import { ExportResultCode } from '@opentelemetry/core';
import { OtlpJsonFileWriter } from '../src/OtlpJsonFileWriter';

class MemoryWritable extends Writable {
  public content = '';
  public chunks: Buffer[] = [];
  public writeCount = 0;
  public simulateBackpressure = false;
  public shouldError = false;
  public shouldThrow = false;

  override _write(
    chunk: Buffer,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void
  ): void {
    this.writeCount++;
    this.chunks.push(chunk);
    this.content += chunk.toString('utf-8');

    if (this.shouldThrow) {
      throw new Error('Synchronous write exception');
    }

    if (this.shouldError) {
      callback(new Error('Simulated stream write error'));
      return;
    }

    if (this.simulateBackpressure) {
      process.nextTick(() => callback());
      return;
    }

    callback();
  }
}

describe('OtlpJsonFileWriter', () => {
  it('writes to process.stdout by default', done => {
    const stdoutWriteStub = sinon
      .stub(process.stdout, 'write')
      .callsFake((chunk: any, cb?: any) => {
        if (typeof cb === 'function') {
          cb();
        }
        return true;
      });

    const writer = new OtlpJsonFileWriter();
    const data = Buffer.from('{"test":"default_stdout"}');

    writer.write(data, result => {
      stdoutWriteStub.restore();
      assert.strictEqual(result.code, ExportResultCode.SUCCESS);
      assert.strictEqual(stdoutWriteStub.calledOnce, true);
      const writtenBuffer = stdoutWriteStub.firstCall.args[0] as Buffer;
      assert.strictEqual(
        writtenBuffer.toString('utf-8'),
        '{"test":"default_stdout"}\n'
      );
      done();
    });
  });

  it('writes to a custom Writable stream with trailing newline', done => {
    const memoryStream = new MemoryWritable();
    const writer = new OtlpJsonFileWriter({ out: memoryStream });
    const data = Buffer.from('{"hello":"world"}');

    writer.write(data, result => {
      assert.strictEqual(result.code, ExportResultCode.SUCCESS);
      assert.strictEqual(memoryStream.content, '{"hello":"world"}\n');
      assert.strictEqual(memoryStream.writeCount, 1);
      done();
    });
  });

  it('handles multiple consecutive writes in order', done => {
    const memoryStream = new MemoryWritable();
    const writer = new OtlpJsonFileWriter({ out: memoryStream });

    writer.write(Buffer.from('{"line":1}'), res1 => {
      assert.strictEqual(res1.code, ExportResultCode.SUCCESS);
      writer.write(Buffer.from('{"line":2}'), res2 => {
        assert.strictEqual(res2.code, ExportResultCode.SUCCESS);
        assert.strictEqual(memoryStream.content, '{"line":1}\n{"line":2}\n');
        done();
      });
    });
  });

  it('handles backpressure and asynchronous completion correctly', done => {
    const memoryStream = new MemoryWritable();
    memoryStream.simulateBackpressure = true;
    const writer = new OtlpJsonFileWriter({ out: memoryStream });

    let callbackInvoked = false;
    writer.write(Buffer.from('{"async":true}'), result => {
      callbackInvoked = true;
      assert.strictEqual(result.code, ExportResultCode.SUCCESS);
      assert.strictEqual(memoryStream.content, '{"async":true}\n');
      done();
    });

    // Verify it completes asynchronously
    assert.strictEqual(callbackInvoked, false);
  });

  it('propagates stream write errors to callback', done => {
    const memoryStream = new MemoryWritable();
    memoryStream.shouldError = true;
    const writer = new OtlpJsonFileWriter({ out: memoryStream });

    writer.write(Buffer.from('{"fail":true}'), result => {
      assert.strictEqual(result.code, ExportResultCode.FAILED);
      assert.ok(result.error);
      assert.strictEqual(result.error?.message, 'Simulated stream write error');
      done();
    });
  });

  it('handles synchronous write exceptions safely', done => {
    const memoryStream = new MemoryWritable();
    memoryStream.shouldThrow = true;
    const writer = new OtlpJsonFileWriter({ out: memoryStream });

    writer.write(Buffer.from('{"throw":true}'), result => {
      assert.strictEqual(result.code, ExportResultCode.FAILED);
      assert.ok(result.error);
      assert.strictEqual(result.error?.message, 'Synchronous write exception');
      done();
    });
  });

  it('fails write immediately when stream is destroyed or not writable', done => {
    const memoryStream = new MemoryWritable();
    memoryStream.destroy();
    const writer = new OtlpJsonFileWriter({ out: memoryStream });

    writer.write(Buffer.from('{"test":1}'), result => {
      assert.strictEqual(result.code, ExportResultCode.FAILED);
      assert.ok(result.error?.message.includes('not writable'));
      done();
    });
  });

  it('fails write when writer is already shut down', async () => {
    const memoryStream = new MemoryWritable();
    const writer = new OtlpJsonFileWriter({ out: memoryStream });

    await writer.shutdown();

    await new Promise<void>(resolve => {
      writer.write(Buffer.from('{"test":1}'), result => {
        assert.strictEqual(result.code, ExportResultCode.FAILED);
        assert.strictEqual(result.error?.message, 'Exporter has been shutdown');
        resolve();
      });
    });
  });

  it('forceFlush waits for pending writes to finish', async () => {
    const memoryStream = new MemoryWritable();
    memoryStream.simulateBackpressure = true;
    const writer = new OtlpJsonFileWriter({ out: memoryStream });

    let writeCompleted = false;
    writer.write(Buffer.from('{"flush":1}'), () => {
      writeCompleted = true;
    });

    assert.strictEqual(writeCompleted, false);
    await writer.forceFlush();
    assert.strictEqual(writeCompleted, true);
    assert.strictEqual(memoryStream.content, '{"flush":1}\n');
  });

  it('shutdown waits for pending writes and does not close caller stream', async () => {
    const memoryStream = new MemoryWritable();
    memoryStream.simulateBackpressure = true;
    const writer = new OtlpJsonFileWriter({ out: memoryStream });

    let writeCompleted = false;
    writer.write(Buffer.from('{"shutdown":1}'), () => {
      writeCompleted = true;
    });

    assert.strictEqual(writeCompleted, false);
    await writer.shutdown();
    assert.strictEqual(writeCompleted, true);
    assert.strictEqual(memoryStream.destroyed, false);
    assert.strictEqual(memoryStream.writable, true);
  });

  it('invokes export callback exactly once even if stream errors and triggers callback', done => {
    let writeCb: ((err?: Error | null) => void) | undefined;
    const stream = new Writable({
      write(_chunk, _encoding, callback) {
        writeCb = callback;
      },
    });
    const writer = new OtlpJsonFileWriter({ out: stream });
    let invocationCount = 0;

    writer.write(Buffer.from('{"test":1}'), _result => {
      invocationCount++;
    });

    stream.emit('error', new Error('Stream error'));
    if (writeCb) {
      writeCb(new Error('Write error'));
    }

    assert.strictEqual(invocationCount, 1);
    done();
  });
});
