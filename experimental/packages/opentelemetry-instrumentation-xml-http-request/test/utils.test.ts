/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';

import { getXHRBodyLength, redactUrl } from '../src/utils';

describe('getXHRBodyLength', () => {
  it('should compute body length for Document payload', () => {
    // webworkers don't have DOMParser
    if (typeof DOMParser === 'undefined') {
      assert.ok(true);
      return;
    }
    const doc = new DOMParser().parseFromString(
      '<html><head><head/><body><p>hello world</p></body>',
      'text/html'
    );

    const length = getXHRBodyLength(doc);
    assert.ok(length !== undefined, 'body length is undefined');
    assert.ok(length, 'body length is 0');
  });
  it('should compute body length for Blob payload', () => {
    const blob = new Blob(['hello world'], {
      type: 'text/plain',
    });

    assert.strictEqual(getXHRBodyLength(blob), 11);
  });
  it('should compute body length for ArrayBuffer/ArrayBufferView payload', () => {
    const arrayBuffer = new Uint8Array([1, 2, 3]).buffer;

    assert.strictEqual(getXHRBodyLength(arrayBuffer), 3);
    assert.strictEqual(getXHRBodyLength(new ArrayBuffer(8)), 8);
    assert.strictEqual(getXHRBodyLength(new ArrayBuffer(8).slice(0, 2)), 2);
    assert.strictEqual(getXHRBodyLength(new ArrayBuffer(0)), 0);
  });
  it('should compute body length for FormData payload', () => {
    const formData = new FormData();
    formData.append('key1', 'true');
    formData.append('key2', 'hello world');

    assert.strictEqual(getXHRBodyLength(formData), 23);
    assert.strictEqual(getXHRBodyLength(new FormData()), 0);
  });
  it('should compute body length for FormData payload with a file', () => {
    const formData = new FormData();
    const f = new File(
      ['hello world hello world hello world'],
      'test_file.txt'
    );
    formData.append('file', f);

    // length should be:
    // 4 for the key of the file in the form data
    // 35 for the file contents
    assert.strictEqual(getXHRBodyLength(formData), 39);
  });
  it('should compute body length for URLSearchParams payload', () => {
    const search = new URLSearchParams({
      key1: 'true',
      key2: 'hello world',
    });

    assert.strictEqual(getXHRBodyLength(search), 26);
    assert.strictEqual(getXHRBodyLength(new URLSearchParams()), 0);
  });
  it('should compute body length for string payload', () => {
    const jsonString = JSON.stringify({
      key1: 'true',
      key2: 'hello world',
    });
    assert.strictEqual(getXHRBodyLength(jsonString), 36);
    assert.strictEqual(getXHRBodyLength('hello world'), 11);
    assert.strictEqual(getXHRBodyLength('π'), 2); // one character, 2 bytes
    assert.strictEqual(getXHRBodyLength('🔥🔪😭'), 12); // each emoji is 4 bytes
    assert.strictEqual(getXHRBodyLength('مرحبا بالعالم'), 25); // hello world in Arabic is 25 bytes
    assert.strictEqual(getXHRBodyLength(''), 0);
  });
});

describe('redactUrl', () => {
  it('should return a URL without sensitive parts unchanged', () => {
    const url = 'https://example.com/a%20b/?q=a+b&x=%7B1%7D&empty#frag';
    assert.strictEqual(redactUrl(url), url);
  });

  it('should redact the values of the default sensitive query keys', () => {
    assert.strictEqual(
      redactUrl(
        'https://bucket.s3.amazonaws.com/file?X-Amz-Credential=c' +
          '&X-Amz-Security-Token=t&X-Amz-Signature=s&AWSAccessKeyId=k' +
          '&Signature=v2&sig=sas&X-Goog-Signature=g'
      ),
      'https://bucket.s3.amazonaws.com/file?X-Amz-Credential=REDACTED' +
        '&X-Amz-Security-Token=REDACTED&X-Amz-Signature=REDACTED' +
        '&AWSAccessKeyId=REDACTED&Signature=REDACTED&sig=REDACTED' +
        '&X-Goog-Signature=REDACTED'
    );
  });

  it('should keep other query values, their encoding and the fragment', () => {
    assert.strictEqual(
      redactUrl('https://example.com/p?q=a+b&sig=secret&x=%7B1%7D&q=2#frag'),
      'https://example.com/p?q=a+b&sig=REDACTED&x=%7B1%7D&q=2#frag'
    );
  });

  it('should match keys case-sensitively', () => {
    const url = 'https://example.com/p?SIG=a&signature=b';
    assert.strictEqual(redactUrl(url), url);
  });

  it('should redact a percent-encoded key and every repeat of a key', () => {
    assert.strictEqual(
      redactUrl('https://example.com/p?X%2DAmz%2DSignature=a&sig=b&sig=c&sig'),
      'https://example.com/p?X%2DAmz%2DSignature=REDACTED&sig=REDACTED' +
        '&sig=REDACTED&sig=REDACTED'
    );
  });

  it('should redact credentials', () => {
    assert.strictEqual(
      redactUrl('https://user:pass@example.com/p?a=1'),
      'https://REDACTED:REDACTED@example.com/p?a=1'
    );
    assert.strictEqual(
      redactUrl('https://user@example.com/'),
      'https://REDACTED:REDACTED@example.com/'
    );
  });

  it('should return a string that is not a URL unchanged', () => {
    assert.strictEqual(redactUrl('not a url?sig=b'), 'not a url?sig=b');
  });
});
