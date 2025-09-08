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
import { createBoundedQueueExportPromiseHandler } from '../../src/bounded-queue-export-promise-handler';
import * as assert from 'assert';

describe('BoundedQueueExportPromiseHandler', function () {
  it('respects concurrencyLimit', function () {
    const promiseHandler = createBoundedQueueExportPromiseHandler({
      concurrencyLimit: 3,
    });
    promiseHandler.pushPromise(Promise.resolve());
    promiseHandler.pushPromise(Promise.resolve());
    promiseHandler.pushPromise(Promise.resolve());
    assert.ok(promiseHandler.hasReachedLimit());
    assert.throws(() => promiseHandler.pushPromise(Promise.resolve()));
  });

  it('removes from queue when promise resolves without calling awaitAll', function (done) {
    const promiseHandler = createBoundedQueueExportPromiseHandler({
      concurrencyLimit: 3,
    });
    promiseHandler.pushPromise(Promise.resolve());
    promiseHandler.pushPromise(Promise.resolve());
    promiseHandler.pushPromise(Promise.resolve());
    assert.ok(promiseHandler.hasReachedLimit());

    queueMicrotask(() => {
      try {
        assert.strictEqual(
          promiseHandler.hasReachedLimit(),
          false,
          'expected that once promises resolve, the queue becomes available again'
        );
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('removes from queue when promise rejects without calling awaitAll', function (done) {
    const promiseHandler = createBoundedQueueExportPromiseHandler({
      concurrencyLimit: 3,
    });
    promiseHandler.pushPromise(Promise.reject());
    promiseHandler.pushPromise(Promise.reject());
    promiseHandler.pushPromise(Promise.reject());
    assert.ok(promiseHandler.hasReachedLimit());

    queueMicrotask(() => {
      try {
        assert.strictEqual(
          promiseHandler.hasReachedLimit(),
          false,
          'expected that once promises resolve, the queue becomes available again'
        );
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('removes from queue when promise resolves when calling awaitAll', async function () {
    const promiseHandler = createBoundedQueueExportPromiseHandler({
      concurrencyLimit: 3,
    });
    promiseHandler.pushPromise(Promise.resolve());
    promiseHandler.pushPromise(Promise.resolve());
    promiseHandler.pushPromise(Promise.resolve());
    assert.ok(promiseHandler.hasReachedLimit());

    await promiseHandler.awaitAll();

    assert.strictEqual(
      promiseHandler.hasReachedLimit(),
      false,
      'expected that once awaitAll() resolves, the queue becomes available again'
    );
  });

  it('does reject in when calling awaitAll when an in the queue rejects', async function () {
    const promiseHandler = createBoundedQueueExportPromiseHandler({
      concurrencyLimit: 3,
    });
    promiseHandler.pushPromise(
      new Promise(resolve => queueMicrotask(() => resolve()))
    );
    promiseHandler.pushPromise(
      new Promise(resolve => queueMicrotask(() => resolve()))
    );
    promiseHandler.pushPromise(
      new Promise((_, reject) => queueMicrotask(() => reject()))
    );
    assert.ok(promiseHandler.hasReachedLimit());

    await assert.rejects(() => promiseHandler.awaitAll());

    assert.strictEqual(
      promiseHandler.hasReachedLimit(),
      false,
      'expected that once awaitAll() rejects, the queue becomes available again'
    );
  });
});
