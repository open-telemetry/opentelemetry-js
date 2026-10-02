/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as assert from 'assert';
import { getBooleanFromEnv } from '../../src/platform/browser';

describe('environment (browser)', () => {
  it('getBooleanFromEnv returns false, as Node.js does for an unset variable', () => {
    assert.strictEqual(getBooleanFromEnv('OTEL_SDK_DISABLED'), false);
  });
});
