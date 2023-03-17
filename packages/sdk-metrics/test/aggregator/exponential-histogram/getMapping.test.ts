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
import { ExponentMapping } from '../../../src/aggregator/exponential-histogram/mapping/ExponentMapping';
import { LogarithmMapping } from '../../../src/aggregator/exponential-histogram/mapping/LogarithmMapping';
import { getMapping } from '../../../src/aggregator/exponential-histogram/mapping/getMapping';
import * as assert from 'assert';

const MIN_SCALE = -10;
const MAX_SCALE = 20;

describe('getMapping', () => {
  it('returns correct mapping for all scales', () => {
    for (let scale = MIN_SCALE; scale <= MAX_SCALE; scale++) {
      const mapping = getMapping(scale);
      if (scale > 0) {
        assert.ok(mapping instanceof LogarithmMapping);
      } else {
        assert.ok(mapping instanceof ExponentMapping);
      }
      assert.strictEqual(mapping.scale, scale);
    }
  });

  it('throws for invalid scales', () => {
    assert.throws(() => {
      getMapping(MIN_SCALE - 1);
    });
    assert.throws(() => {
      getMapping(MAX_SCALE + 1);
    });
  });
});
