/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { normalize } from '../../src/platform/browser';

describe('noop-normalize', function () {
  it('should not normalize input', function () {
    assert.strictEqual(normalize('/tmp/foo/../bar'), '/tmp/foo/../bar');
  });
});
