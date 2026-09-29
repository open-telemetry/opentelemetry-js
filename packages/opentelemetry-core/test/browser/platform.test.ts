/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as assert from 'assert';
import { SDK_INFO } from '../../src';

// src reaches #platform through package.json#imports, so this fails if the
// default branch stops resolving to the browser implementation.
describe('#platform (browser)', () => {
  it('resolves to the browser implementation', () => {
    assert.strictEqual(SDK_INFO['process.runtime.name'], 'browser');
  });
});
