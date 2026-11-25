/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as assert from 'assert';
import { SDK_INFO } from '../../src';
import * as nodePlatform from '../../src/platform/node';

// Without the mocha otel hook, #platform falls back to a freshly built
// dist/platform/node, which reports the same values; only identity catches it.
describe('#platform (node)', () => {
  it('resolves to the node implementation in src', () => {
    assert.strictEqual(SDK_INFO, nodePlatform.SDK_INFO);
  });
});
