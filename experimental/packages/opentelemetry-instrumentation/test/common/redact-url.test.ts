/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { REDACTED_QUERY_PARAMS, STR_REDACTED, redactUrl } from '../../src';

describe('redactUrl', function () {
  it('should redact every default sensitive query key', function () {
    for (const key of REDACTED_QUERY_PARAMS) {
      assert.strictEqual(
        redactUrl(`https://example.com/p?${key}=secret&keep=1`),
        `https://example.com/p?${key}=${STR_REDACTED}&keep=1`,
        key
      );
    }
  });

  it('should keep other query values, their encoding, and the fragment', function () {
    assert.strictEqual(
      redactUrl('https://example.com/p?q=a+b&sig=secret&x=%7B1%7D&q=2#frag'),
      `https://example.com/p?q=a+b&sig=${STR_REDACTED}&x=%7B1%7D&q=2#frag`
    );
  });

  it('should match keys case-sensitively', function () {
    const url = 'https://example.com/p?SIG=1&signature=2&x-amz-signature=3';
    assert.strictEqual(redactUrl(url), url);
  });

  it('should redact a percent-encoded key and every repeat of a key', function () {
    assert.strictEqual(
      redactUrl('https://example.com/p?X%2DAmz%2DSignature=a&sig=b&sig=c&sig'),
      'https://example.com/p?X%2DAmz%2DSignature=REDACTED&sig=REDACTED' +
        '&sig=REDACTED&sig=REDACTED'
    );
  });

  it('should keep malformed percent-encoding intact', function () {
    assert.strictEqual(
      redactUrl('https://example.com/?%E0%A4%A=1&sig=2'),
      'https://example.com/?%E0%A4%A=1&sig=REDACTED'
    );
  });

  it('should return a URL without a query unchanged', function () {
    const urls = [
      'https://example.com',
      'https://example.com/p',
      'https://example.com/p?',
      'https://example.com/a%20b/?q=a+b&x=%7B1%7D&empty#frag',
    ];
    for (const url of urls) {
      assert.strictEqual(redactUrl(url), url);
    }
  });

  it('should redact username and password', function () {
    assert.strictEqual(
      redactUrl('https://user:pass@example.com/p?a=1'),
      'https://REDACTED:REDACTED@example.com/p?a=1'
    );
  });

  it('should redact a username without a password', function () {
    assert.strictEqual(
      redactUrl('https://user@example.com/'),
      'https://REDACTED:REDACTED@example.com/'
    );
  });

  it('should redact credentials and sensitive query values together', function () {
    assert.strictEqual(
      redactUrl('https://user:pass@example.com/p?sig=1&ok=2'),
      'https://REDACTED:REDACTED@example.com/p?sig=REDACTED&ok=2'
    );
  });

  it('should return invalid and relative URLs unchanged', function () {
    const urls = [
      '',
      'not a url?sig=b',
      '/path?sig=secret&ok=1',
      'path?sig=secret',
      '//user:pass@example.com/p?sig=1',
    ];
    for (const url of urls) {
      assert.strictEqual(redactUrl(url), url);
    }
  });
});
