/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');

// Using `node16` or `nodenext` in `tsconfig.json#moduleResolution`
// requires the TypeScript to generate ESModule outputs. This is a breaking
// change for CJS users.
// So we have to use plain JavaScript to verify the `package.json#exports` here.

describe('@opentelemetry/api entries', () => {
  it('should import root entry', async () => {
    const mod = await import('@opentelemetry/api');
    assert.ok(mod.trace != null);
  });

  it('should require root entry', () => {
    const mod = require('@opentelemetry/api');
    assert.ok(mod.trace != null);
  });

  it('should import experimental entry', async () => {
    const mod = await import('@opentelemetry/api/experimental');
    assert.ok(mod.wrapTracer != null);
  });

  it('should require experimental entry', () => {
    const mod = require('@opentelemetry/api/experimental');
    assert.ok(mod.wrapTracer != null);
  });
});
