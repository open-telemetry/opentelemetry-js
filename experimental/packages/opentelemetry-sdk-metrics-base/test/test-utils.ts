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

/**
 * Changes to this file should be applied to opentelemetry-core/test/test-utils.ts too.
 */

import * as assert from 'assert';

interface ErrorLikeConstructor {
  new(): Error;
}

/**
 * Node.js v8.x and browser compatible `assert.rejects`.
 */
export async function assertRejects(actual: any, expected: RegExp | ErrorLikeConstructor) {
  let rejected;
  try {
    if (typeof actual === 'function') {
      await actual();
    } else {
      await actual;
    }
  } catch (err) {
    rejected = true;
    assert.throws(() => {
      throw err;
    }, expected);
  }
  assert(rejected, 'Promise not rejected');
}
