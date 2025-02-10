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
import { hexToBase64 } from '../../src/platform';

describe('hexToBase64', () => {
  it('convert hex to base64', () => {
    const id1 = '7deb739e02e44ef2';
    const id2 = '12abc034d567e89ff26e608c8cf42c80';
    const id3 = id2.toUpperCase();
    assert.strictEqual(hexToBase64(id1), 'fetzngLkTvI=');
    assert.strictEqual(hexToBase64(id2), 'EqvANNVn6J/ybmCMjPQsgA==');
    assert.strictEqual(hexToBase64(id3), 'EqvANNVn6J/ybmCMjPQsgA==');
    // Don't use the preallocated path
    assert.strictEqual(
      hexToBase64(id2.repeat(2)),
      'EqvANNVn6J/ybmCMjPQsgBKrwDTVZ+if8m5gjIz0LIA='
    );
  });
});
