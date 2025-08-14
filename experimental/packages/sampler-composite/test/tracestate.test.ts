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
import { serializeTraceState, parseOtelTraceState } from '../src/tracestate';
import { TraceState } from '@opentelemetry/core';

describe('OtelTraceState', () => {
  [
    { input: 'a', output: 'a' },
    { input: '#', output: '#' },
    { input: 'rv:1234567890abcd', output: 'rv:1234567890abcd' },
    { input: 'rv:01020304050607', output: 'rv:01020304050607' },
    { input: 'rv:1234567890abcde', output: '' },
    { input: 'th:1234567890abcd', output: 'th:1234567890abcd' },
    { input: 'th:1234567890abcd', output: 'th:1234567890abcd' },
    { input: 'th:10000000000000', output: 'th:1' },
    { input: 'th:1234500000000', output: 'th:12345' },
    { input: 'th:0', output: 'th:0' },
    { input: 'th:100000000000000', output: '' },
    { input: 'th:1234567890abcde', output: '' },
    {
      input: `a:${''.padEnd(214, 'X')};rv:1234567890abcd;th:1234567890abcd;x:3`,
      output: `th:1234567890abcd;rv:1234567890abcd;a:${''.padEnd(214, 'X')};x:3`,
      testId: 'long',
    },
    { input: 'th:x', output: '' },
    { input: 'th:100000000000000', output: '' },
    { input: 'th:10000000000000', output: 'th:1' },
    { input: 'th:1000000000000', output: 'th:1' },
    { input: 'th:100000000000', output: 'th:1' },
    { input: 'th:10000000000', output: 'th:1' },
    { input: 'th:1000000000', output: 'th:1' },
    { input: 'th:100000000', output: 'th:1' },
    { input: 'th:10000000', output: 'th:1' },
    { input: 'th:1000000', output: 'th:1' },
    { input: 'th:100000', output: 'th:1' },
    { input: 'th:10000', output: 'th:1' },
    { input: 'th:1000', output: 'th:1' },
    { input: 'th:100', output: 'th:1' },
    { input: 'th:10', output: 'th:1' },
    { input: 'th:1', output: 'th:1' },
    { input: 'th:10000000000001', output: 'th:10000000000001' },
    { input: 'th:10000000000010', output: 'th:1000000000001' },
    { input: 'rv:x', output: '' },
    { input: 'rv:100000000000000', output: '' },
    { input: 'rv:10000000000000', output: 'rv:10000000000000' },
    { input: 'rv:1000000000000', output: '' },
  ].forEach(({ input, output, testId }) => {
    it(`should round trip ${testId || `from ${input} to ${output}`}`, () => {
      const result = serializeTraceState(
        parseOtelTraceState(new TraceState().set('ot', input))
      );
      assert.strictEqual(result, output);
    });
  });
});
