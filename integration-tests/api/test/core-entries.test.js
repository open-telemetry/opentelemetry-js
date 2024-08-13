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

// TypeScript v4.4.4 doesn't support `node16` or `nodenext` in
// [Module Resolution](https://www.typescriptlang.org/tsconfig#moduleResolution)
// which is required for typescript to resolve the `package.json#exports`
// entries.
// Additionally, using `node16` or `nodenext` in `tsconfig.json#moduleResolution`
// requires the TypeScript to generate ESModule outputs. This is a breaking
// change for CJS users.
// So we have to use plain JavaScript to verity the `package.json#exports` here.

describe('@opentelemetry/core entries', () => {
  it('should import baggage utils under named const', async () => {
    const mod = await import('@opentelemetry/core');
    assert.ok(mod.baggageUtils.getKeyPairs != null);
  });

  it('should require baggage utils under named const', () => {
    const mod = require('@opentelemetry/core');
    assert.ok(mod.baggageUtils.getKeyPairs != null);
  });
});
