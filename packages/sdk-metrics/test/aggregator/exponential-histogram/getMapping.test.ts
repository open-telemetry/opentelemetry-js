/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
