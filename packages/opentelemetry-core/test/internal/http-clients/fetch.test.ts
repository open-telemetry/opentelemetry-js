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
import * as sinon from 'sinon';
import {
  HttpClientError,
  RetriableError,
} from '../../../src/internal/http-client';
import {
  fetchRequest,
  isFetchRequestAvailable,
} from '../../../src/internal/http-clients/fetch';

describe('isFetchRequestAvailable', () => {
  const origFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = origFetch;
  });

  it('should return false if globalThis.fetch is not a function', () => {
    globalThis.fetch = 'foo' as any;

    assert.ok(!isFetchRequestAvailable());
  });

  it('should return true if globalThis.fetch is a function', () => {
    globalThis.fetch = function () {} as any;

    assert.ok(isFetchRequestAvailable());
  });
});

describe('fetchRequest', () => {
  let test = it;
  if (typeof fetch === 'undefined') {
    test = it.skip as any;
  }

  afterEach(() => {
    sinon.restore();
  });

  test('should resolve with export status', async () => {
    const stub = sinon.stub(globalThis, 'fetch');
    const future = Promise.resolve(
      new Response('', {
        status: 200,
      })
    );
    stub.returns(future);

    await fetchRequest('https://example.com', 'payload');
  });

  test('should reject with retriable error if status is 429', async () => {
    const stub = sinon.stub(globalThis, 'fetch');
    const future = Promise.resolve(
      new Response('', {
        status: 429,
      })
    );
    stub.returns(future);

    try {
      await fetchRequest('https://example.com', 'payload');
      assert.fail('unreachable');
    } catch (e) {
      assert.ok(e instanceof RetriableError);
      assert.strictEqual(e.retryAfterMillis, -1);
    }
  });

  test('should reject with retriable error if status is 429 and has a retry-after header', async () => {
    const stub = sinon.stub(globalThis, 'fetch');
    const future = Promise.resolve(
      new Response('', {
        status: 429,
        headers: {
          'retry-after': '1000',
        },
      })
    );
    stub.returns(future);

    try {
      await fetchRequest('https://example.com', 'payload');
      assert.fail('unreachable');
    } catch (e) {
      assert.ok(e instanceof RetriableError);
      assert.strictEqual(e.retryAfterMillis, 1000_000);
    }
  });

  test('should reject with HttpClientError if response is not retriable', async () => {
    const stub = sinon.stub(globalThis, 'fetch');
    const future = Promise.resolve(
      new Response('', {
        status: 400,
      })
    );
    stub.returns(future);

    try {
      await fetchRequest('https://example.com', 'payload');
      assert.fail('unreachable');
    } catch (e) {
      assert.ok(e instanceof HttpClientError);
      assert.strictEqual(e.statusCode, 400);
    }
  });
});
