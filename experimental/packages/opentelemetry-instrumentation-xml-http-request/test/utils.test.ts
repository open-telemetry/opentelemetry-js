/*
 * Copyright The OpenTelemetry Authors
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

import { getXHRBodyLength } from '../src/utils';

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
