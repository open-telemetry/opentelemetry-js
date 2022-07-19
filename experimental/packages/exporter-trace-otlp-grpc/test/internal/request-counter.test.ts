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

import assert = require('assert');
import { RequestCounter } from '../../src/internal/request-counter';

describe('RequestCounter', () => {
  let counter: RequestCounter;

  beforeEach(() => {
    counter = new RequestCounter();
  });

  it('should start with 0 requests', () => {
    assert.strictEqual(counter.requests, 0);
  });

  it('should count a request', () => {
    counter.startRequest();
    assert.strictEqual(counter.requests, 1);
    counter.endRequest();
    assert.strictEqual(counter.requests, 0);
  });

  it('should fire event on last request end', done => {
    assert.strictEqual(counter.requests, 0);
    counter.startRequest();
    assert.strictEqual(counter.requests, 1);
    counter.onEndLastRequest(() => {
      assert.strictEqual(counter.requests, 0);
      done();
    });
    counter.startRequest();
    assert.strictEqual(counter.requests, 2);
    counter.endRequest();
    assert.strictEqual(counter.requests, 1);
    counter.endRequest();
  });

  it('should throw if more requests are ended than started', () => {
    counter.startRequest();
    counter.endRequest();
    assert.throws(counter.endRequest);
  });
});
