/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as assert from 'assert';
import { SDK_INFO } from '../../src';
import * as browserPlatform from '../../src/platform/browser';

// dist/platform/browser reports the same values, so only identity proves the
// karma otel rule resolved #platform to src.
describe('#platform (browser)', () => {
  it('resolves to the browser implementation in src', () => {
    assert.strictEqual(SDK_INFO, browserPlatform.SDK_INFO);
  });
});
