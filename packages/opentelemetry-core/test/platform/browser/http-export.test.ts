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
import { fetchRequest } from '../../../src/internal/http-clients/fetch';
import { determineClient } from '../../../src/internal/http-export';
import { xhrRequest } from '../../../src/platform/browser/internal';

describe('http-export', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('determineClient', () => {
    it('should return fetchRequest', () => {
      const func = determineClient(['fetch', 'XMLHttpReuqest', 'sendBeacon']);
      assert.strictEqual(func, fetchRequest);
    });

    it('should return xhrRequest when fetch is not available', () => {
      sinon.replace(globalThis, 'fetch', undefined as any);

      const func = determineClient(['fetch', 'XMLHttpReuqest', 'sendBeacon']);
      assert.strictEqual(func, xhrRequest);
    });
  });
});
