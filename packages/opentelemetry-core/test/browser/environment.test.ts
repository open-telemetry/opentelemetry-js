/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as assert from 'assert';
import { getBooleanFromEnv } from '../../src';

describe('getBooleanFromEnv (browser)', () => {
  it('returns false, matching the Node.js unset path', () => {
    assert.strictEqual(getBooleanFromEnv('ANY'), false);
  });
});
