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

import { isWrapped } from '@opentelemetry/instrumentation';

import * as assert from 'assert';
import { FetchInstrumentation } from '../src';

describe('fetch', () => {
  describe('enabling/disabling', () => {
    let fetchInstrumentation: FetchInstrumentation | undefined;

    afterEach(() => {
      fetchInstrumentation?.disable();
      fetchInstrumentation = undefined;
    });

    it('should wrap global fetch when instantiated', () => {
      assert.ok(!isWrapped(window.fetch));
      fetchInstrumentation = new FetchInstrumentation();
      assert.ok(isWrapped(window.fetch));
    });

    it('should not wrap global fetch when instantiated with `enabled: false`', () => {
      assert.ok(!isWrapped(window.fetch));
      fetchInstrumentation = new FetchInstrumentation({ enabled: false });
      assert.ok(!isWrapped(window.fetch));
      fetchInstrumentation.enable();
      assert.ok(isWrapped(window.fetch));
    });

    it('should unwrap global fetch when disabled', () => {
      fetchInstrumentation = new FetchInstrumentation();
      assert.ok(isWrapped(window.fetch));
      fetchInstrumentation.disable();
      assert.ok(!isWrapped(window.fetch));

      // Avoids ERROR in the logs when calling `disable()` again during cleanup
      fetchInstrumentation = undefined;
    });
  });
});
