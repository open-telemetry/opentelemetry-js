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
import * as sinon from 'sinon';
import { diag } from '@opentelemetry/api';
import { parseHeaders } from '../../src/util';

describe('utils', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('parseHeaders', () => {
    it('should ignore undefined headers', () => {
      // Need to stub/spy on the underlying logger as the "diag" instance is global
      const spyWarn = sinon.stub(diag, 'warn');
      const headers: Partial<Record<string, unknown>> = {
        foo1: undefined,
        foo2: 'bar',
        foo3: 1,
      };
      const result = parseHeaders(headers);
      assert.deepStrictEqual(result, {
        foo2: 'bar',
        foo3: '1',
      });
      const args = spyWarn.args[0];
      assert.strictEqual(
        args[0],
        'Header "foo1" has wrong value and will be ignored'
      );
    });

    it('should parse undefined', () => {
      const result = parseHeaders(undefined);
      assert.deepStrictEqual(result, {});
    });
  });
});
