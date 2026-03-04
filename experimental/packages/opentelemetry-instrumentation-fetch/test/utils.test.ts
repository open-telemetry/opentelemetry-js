/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';

import { getXHRBodyLength, getFetchBodyLength } from '../src/utils';

const ENCODER = new TextEncoder();
function textToReadableStream(msg: string) {
  return new ReadableStream({
    start: controller => {
      controller.enqueue(ENCODER.encode(msg));
      controller.close();
    },
    cancel: controller => {
      controller.close();
    },
  });
}

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

describe('getFetchBodyLength', () => {
  it('should read the body of the second param when the first param is string', async () => {
    const jsonString = JSON.stringify({
      key1: 'true',
      key2: 'hello world',
    });
    const length = await getFetchBodyLength('https://example.com', {
      body: jsonString,
    });
    assert.strictEqual(length, 36);
  });

  it('should handle undefined body', async () => {
    const length = await getFetchBodyLength('https://example.com', {});
    assert.strictEqual(length, undefined);
  });

  it('should handle unicode body', async () => {
    const length = await getFetchBodyLength('https://example.com', {
      body: 'π🔥🔪😭',
    });
    assert.strictEqual(length, 14); // pi is 2 bytes, each emoji is 4
  });

  it('should (non-destructively) read the body stream of the second param when the first param is string', async () => {
    const jsonString = JSON.stringify({
      key1: 'true',
      key2: 'hello world',
    });
    const requestParams = { body: textToReadableStream(jsonString) };
    const lengthPromise = getFetchBodyLength(
      'https://example.com',
      requestParams
    );

    // if we try to await lengthPromise here, we get a timeout

    let lengthResolved = false;
    lengthPromise.finally(() => (lengthResolved = true));

    // length doesn't get read yet
    assert.strictEqual(lengthResolved, false);

    // the body is still readable
    assert.strictEqual(requestParams.body.locked, false);

    // AND the body is still correct
    const { value } = await requestParams.body.getReader().read();
    const decoder = new TextDecoder();
    assert.strictEqual(decoder.decode(value), jsonString);

    // AND now length got read, and we got the correct length
    const length = await lengthPromise;
    assert.strictEqual(lengthResolved, true);
    assert.strictEqual(length, 36);
  });

  it('should (non-destructively) read the unicode body stream of the second param when the first param is string', async () => {
    const bodyString = 'π🔥🔪😭';
    const requestParams = { body: textToReadableStream(bodyString) };
    const lengthPromise = getFetchBodyLength(
      'https://example.com',
      requestParams
    );

    // if we try to await lengthPromise here, we get a timeout

    let lengthResolved = false;
    lengthPromise.finally(() => (lengthResolved = true));

    // length doesn't get read yet
    assert.strictEqual(lengthResolved, false);

    // the body is still readable
    assert.strictEqual(requestParams.body.locked, false);

    // AND the body is still correct
    const { value } = await requestParams.body.getReader().read();
    const decoder = new TextDecoder();
    assert.strictEqual(decoder.decode(value), bodyString);

    // AND now length got read, and we got the correct length
    const length = await lengthPromise;
    assert.strictEqual(lengthResolved, true);
    assert.strictEqual(length, 14);
  });

  it('should handle readablestream objects without a pipeThrough method', async () => {
    const jsonString = JSON.stringify({
      key1: 'true',
      key2: 'hello world',
    });
    const stream = textToReadableStream(jsonString);

    // @ts-expect-error intentionally remove the .tee() method to mimic older environments where this method isn't available
    stream.pipeThrough = undefined;

    const requestParams = { body: stream };
    const length = await getFetchBodyLength(
      'https://example.com',
      requestParams
    );

    // we got the correct length
    assert.strictEqual(length, undefined);

    // AND the body is still readable
    assert.strictEqual(requestParams.body.locked, false);

    // AND the body is still correct
    const { value } = await requestParams.body.getReader().read();
    const decoder = new TextDecoder();
    assert.strictEqual(decoder.decode(value), jsonString);
  });

  it('should read the body of the first param when receiving a request', async () => {
    const bodyContent = JSON.stringify({
      key1: 'true',
      key2: 'hello world',
    });
    const req = new Request('https://example.com', {
      method: 'POST',
      headers: {
        foo: 'bar',
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: bodyContent,
    });

    const length = await getFetchBodyLength(req);

    // we got the correct length
    assert.strictEqual(length, 36);

    // AND the body is still readable and correct
    const body = await req.text();
    assert.strictEqual(body, bodyContent);
  });

  it('should read the body of the first param when receiving a request with urlparams body', async () => {
    const body = new URLSearchParams();
    body.append('hello', 'world');

    const req = new Request('https://example.com', {
      method: 'POST',
      headers: {
        foo: 'bar',
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body,
    });

    const length = await getFetchBodyLength(req);

    // we got the correct length
    assert.strictEqual(length, 11);

    // AND the body is still readable and correct
    const requestBody = await req.text();
    assert.strictEqual(requestBody, 'hello=world');
  });
});
