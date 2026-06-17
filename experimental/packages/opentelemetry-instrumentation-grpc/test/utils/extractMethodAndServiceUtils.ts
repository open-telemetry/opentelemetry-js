/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
