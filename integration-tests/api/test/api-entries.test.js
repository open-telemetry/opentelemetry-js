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
