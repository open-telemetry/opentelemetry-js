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

import { _extractMethodAndService } from '../../src/utils';
import * as assert from 'assert';

const cases = [
  {
    value: 'readBooks/BookStorage.Book',
    result: { method: 'BookStorage.Book', service: 'readBooks' },
  },
  {
    value: 'readBooks//BookStorage.Book',
    result: { method: '/BookStorage.Book', service: 'readBooks' },
  },
  {
    value: 'readBooks/BookStorage/.Book',
    result: { method: 'BookStorage/.Book', service: 'readBooks' },
  },
  {
    value: '/readBooks/BookStorage/.Book/Book',
    result: { method: 'BookStorage/.Book/Book', service: 'readBooks' },
  },
];

describe('ExtractMethodAndService Util', () => {
  cases.forEach(({ value, result }) => {
    it(`Should resolve use case correctly for: ${value}`, () => {
      const { method, service } = _extractMethodAndService(value);

      assert.deepStrictEqual(
        { method, service },
        { method: result.method, service: result.service }
      );
    });
  });
});
