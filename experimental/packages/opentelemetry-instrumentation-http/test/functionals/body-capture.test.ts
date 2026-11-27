/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { BodyBuffer, createBodyBuffer } from '../../src/body-capture';

function bytes(value: string, encoding: BufferEncoding = 'utf8'): Uint8Array {
  return new Uint8Array(Buffer.from(value, encoding));
}

describe('BodyBuffer', () => {
  it('returns undefined when empty', () => {
    assert.strictEqual(
      new BodyBuffer(10, 'text/plain').toAttributeValue(),
      undefined
    );
  });

  it('truncates to max size', () => {
    const buffer = new BodyBuffer(5, 'text/plain');
    buffer.write(0, bytes('hello world'));
    assert.strictEqual(buffer.toAttributeValue(), 'hello');
  });

  it('does not duplicate a rewrite of the same position', () => {
    const buffer = new BodyBuffer(100, 'text/plain');
    buffer.write(0, bytes('hello'));
    buffer.write(0, bytes('hello'));
    buffer.write(5, bytes(' world'));
    assert.strictEqual(buffer.toAttributeValue(), 'hello world');
  });

  it('ignores a write after a gap', () => {
    const buffer = new BodyBuffer(100, 'text/plain');
    buffer.write(0, bytes('ab'));
    buffer.write(5, bytes('cd'));
    assert.strictEqual(buffer.toAttributeValue(), 'ab');
  });

  it('grows across many small writes', () => {
    const buffer = new BodyBuffer(1000, 'text/plain');
    for (let i = 0; i < 300; i++) {
      buffer.write(i, bytes('a'));
    }
    assert.strictEqual(buffer.toAttributeValue(), 'a'.repeat(300));
  });

  it('returns a value not changed by later writes', () => {
    const buffer = new BodyBuffer(100, 'application/octet-stream');
    buffer.write(0, new Uint8Array([1, 2]));
    const value = buffer.toAttributeValue();
    buffer.write(0, new Uint8Array([3, 4]));
    assert.deepStrictEqual(value, new Uint8Array([1, 2]));
  });

  it('returns strings for textual content types', () => {
    for (const contentType of [
      'text/plain',
      'TEXT/HTML',
      'application/json',
      'application/vnd.api+json',
      'application/xml',
      'image/svg+xml',
      'application/yaml',
      'application/vnd.foo+yaml',
      'application/x-www-form-urlencoded',
      'application/octet-stream; charset=utf-8',
    ]) {
      const buffer = new BodyBuffer(100, contentType);
      buffer.write(0, bytes('a=1'));
      assert.strictEqual(buffer.toAttributeValue(), 'a=1', contentType);
    }
  });

  it('returns bytes for non-textual content types', () => {
    for (const contentType of [
      'application/octet-stream',
      'image/png',
      'multipart/form-data; boundary=x',
      'application/jsonl',
    ]) {
      const buffer = new BodyBuffer(100, contentType);
      buffer.write(0, bytes('a=1'));
      assert.deepStrictEqual(
        buffer.toAttributeValue(),
        bytes('a=1'),
        contentType
      );
    }
  });

  it('returns bytes for a missing content type', () => {
    // An empty header value is treated like a missing one.
    for (const contentType of [undefined, '']) {
      const buffer = new BodyBuffer(100, contentType);
      buffer.write(0, bytes('hello'));
      assert.deepStrictEqual(buffer.toAttributeValue(), bytes('hello'));
    }
  });

  it('uses the charset parameter', () => {
    for (const contentType of [
      'text/plain; charset=iso-8859-1',
      'text/plain; CHARSET="iso-8859-1"',
      'text/plain;charset=iso-8859-1;format=flowed',
    ]) {
      const buffer = new BodyBuffer(100, contentType);
      buffer.write(0, bytes('héllo', 'latin1'));
      assert.strictEqual(buffer.toAttributeValue(), 'héllo', contentType);
    }
  });

  it('falls back to bytes for an unknown charset', () => {
    const buffer = new BodyBuffer(100, 'text/plain; charset=not-a-charset');
    buffer.write(0, bytes('hello'));
    assert.deepStrictEqual(buffer.toAttributeValue(), bytes('hello'));
  });

  it('falls back to bytes for invalid text', () => {
    const body = new Uint8Array([0x7b, 0xff, 0x7d]);
    const buffer = new BodyBuffer(100, 'application/json');
    buffer.write(0, body);
    assert.deepStrictEqual(buffer.toAttributeValue(), body);
  });

  it('keeps a leading byte order mark', () => {
    const buffer = new BodyBuffer(100, 'text/plain');
    buffer.write(0, new Uint8Array([0xef, 0xbb, 0xbf, 0x61]));
    assert.strictEqual(buffer.toAttributeValue(), '﻿a');
  });

  it('drops a partial character split by truncation', () => {
    // "é" is two bytes in UTF-8; the limit splits it.
    const buffer = new BodyBuffer(2, 'text/plain');
    buffer.write(0, bytes('aé'));
    assert.strictEqual(buffer.toAttributeValue(), 'a');
  });

  it('drops a partial character from a partial read', () => {
    const buffer = new BodyBuffer(100, 'text/plain');
    buffer.write(0, bytes('aé').subarray(0, 2));
    assert.strictEqual(buffer.toAttributeValue(), 'a');
  });

  it('respects a multibyte charset when truncating', () => {
    const buffer = new BodyBuffer(5, 'text/plain; charset=utf-16le');
    buffer.write(0, bytes('abc', 'utf16le'));
    assert.strictEqual(buffer.toAttributeValue(), 'ab');
  });

  it('returns undefined when only a partial character was captured', () => {
    // "€" is three bytes in UTF-8; the limit leaves only two of them.
    const utf8 = new BodyBuffer(2, 'text/plain');
    utf8.write(0, bytes('€€'));
    assert.strictEqual(utf8.toAttributeValue(), undefined);

    const utf16 = new BodyBuffer(10, 'text/plain; charset=utf-16le');
    utf16.write(0, bytes('a'));
    assert.strictEqual(utf16.toAttributeValue(), undefined);
  });
});

describe('createBodyBuffer', () => {
  it('creates a buffer', () => {
    assert.ok(
      createBodyBuffer(10, 'text/plain', undefined) instanceof BodyBuffer
    );
  });

  it('creates a buffer for identity encoding', () => {
    for (const encoding of ['', 'identity', ' Identity ']) {
      assert.ok(
        createBodyBuffer(10, 'text/plain', encoding) instanceof BodyBuffer,
        encoding
      );
    }
  });

  it('does not create a buffer for content-encoded bodies', () => {
    for (const encoding of ['gzip', 'br', 'deflate, gzip']) {
      assert.strictEqual(
        createBodyBuffer(10, 'text/plain', encoding),
        undefined,
        encoding
      );
    }
  });
});
