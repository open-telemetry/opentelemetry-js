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

import * as sinon from 'sinon';
import * as assert from 'assert';
import { xhrRequest } from '../../../src/platform/browser/internal';
import { assertRejects } from '../../test-utils';
import { RetriableError } from '../../../src/internal/http-client';

describe('xhrRequest', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should call XMLHttpRequest with json payload', async () => {
    const fakeServer = sinon.useFakeServer();
    fakeServer.respondWith('POST', 'https://example.com', [
      200,
      { 'Content-Type': 'application/json' },
      '{"ignored": "response-body"}',
    ]);

    const future = xhrRequest('https://example.com', '{"my": "payload"}', {
      contentType: 'application/json',
    });

    fakeServer.respond();

    await future;
  });

  it('should reject when request timeouts', async () => {
    const fakeServer = sinon.useFakeServer();
    fakeServer.respondWith('POST', 'https://example.com', [
      200,
      { 'Content-Type': 'application/json' },
      '{"ignored": "response-body"}',
    ]);

    const future = xhrRequest('https://example.com', '{"my": "payload"}', {
      contentType: 'application/json',
    });

    // Do not respond the requests.
    // fakeServer.respond();

    await assertRejects(future, /HttpClientError: Request Timeout/);
  });

  it('should reject when status is not 2xx', async () => {
    const fakeServer = sinon.useFakeServer();

    fakeServer.respondWith('POST', 'https://example.com', [
      400,
      { 'Content-Type': 'application/json' },
      '{"ignored": "response-body"}',
    ]);

    const future = xhrRequest('https://example.com', '{"my": "payload"}', {
      contentType: 'application/json',
    });

    fakeServer.respond();

    await assertRejects(
      future,
      /HttpClientError: Failed to export with XHR \(status: 400\)/
    );
  });

  it('should reject with RetriableError when status is retriable', async () => {
    const fakeServer = sinon.useFakeServer();
    sinon.useFakeTimers({
      now: Date.now(),
    });

    fakeServer.respondWith('POST', 'https://example.com', [
      429,
      { 'Content-Type': 'application/json', 'Retry-After': '1000' },
      '{"ignored": "response-body"}',
    ]);

    const future = xhrRequest('https://example.com', '{"my": "payload"}', {
      contentType: 'application/json',
    });

    fakeServer.respond();

    let error = false;
    try {
      await future;
    } catch (e) {
      error = true;
      assert.ok(e instanceof RetriableError);
      assert.strictEqual(e.retryAfterMillis, 1000 * 1000);
    }
    assert.ok(error);
  });
});
