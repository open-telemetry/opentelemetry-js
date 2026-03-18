/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { validateKey, validateValue } from '../../../src/internal/validators';

describe('validators', () => {
  describe('validateKey', () => {
    const validKeysTestCases = [
      'abcdefghijklmnopqrstuvwxyz0123456789-_*/',
      'baz-',
      'baz_',
      'baz*',
      'baz*bar',
      'baz/',
      'tracestate',
      'fw529a3039@dt',
      '6cab5bb-29a@dt',
    ];
    validKeysTestCases.forEach(testCase =>
      it(`returns true when key contains valid chars ${testCase}`, () => {
        assert.ok(validateKey(testCase), `${testCase} should be valid`);
      })
    );

    const invalidKeysTestCases = [
      '1_key',
      'kEy_1',
      'k'.repeat(257),
      'key,',
      'TrAcEsTaTE',
      'TRACESTATE',
      '',
      '6num',
    ];
    invalidKeysTestCases.forEach(testCase =>
      it(`returns true when key contains invalid chars ${testCase}`, () => {
        assert.ok(!validateKey(testCase), `${testCase} should be invalid`);
      })
    );
  });

  describe('validateValue', () => {
    const validValuesTestCases = [
      'first second',
      'baz*',
      'baz$',
      'baz@',
      'first-second',
      'baz~bar',
      'test-v1:120',
      '-second',
      'first.second',
      'TrAcEsTaTE',
      'TRACESTATE',
    ];
    validValuesTestCases.forEach(testCase =>
      it(`returns true when value contains valid chars ${testCase}`, () => {
        assert.ok(validateValue(testCase));
      })
    );

    const invalidValuesTestCases = [
      'my_value=5',
      'first,second',
      'first ',
      'k'.repeat(257),
      ',baz',
      'baz,',
      'baz=',
      '',
    ];
    invalidValuesTestCases.forEach(testCase =>
      it(`returns true when value contains invalid chars ${testCase}`, () => {
        assert.ok(!validateValue(testCase));
      })
    );
  });
});
