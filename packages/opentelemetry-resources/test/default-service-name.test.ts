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

import * as assert from 'assert';
import { defaultServiceName } from '../src/default-service-name';

const isNode = typeof process === 'object' && typeof process.argv0 === 'string';

describe('defaultServiceName', () => {
  it('returns unknown_service prefix', () => {
    const serviceName = defaultServiceName();
    assert.ok(serviceName.startsWith('unknown_service'));
  });

  if (isNode) {
    it('includes process.argv0 in Node.js', () => {
      const serviceName = defaultServiceName();
      assert.ok(serviceName.startsWith('unknown_service:'));
      assert.ok(serviceName.length > 'unknown_service:'.length);
    });
  } else {
    it('returns plain unknown_service in browser', () => {
      const serviceName = defaultServiceName();
      assert.strictEqual(serviceName, 'unknown_service');
    });
  }

  it('returns consistent value on multiple calls', () => {
    const serviceName1 = defaultServiceName();
    const serviceName2 = defaultServiceName();
    assert.strictEqual(serviceName1, serviceName2);
  });
});
