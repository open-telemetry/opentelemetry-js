/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import { envVariableSubstitution } from '../src/utils';

describe('config utils', function () {
  afterEach(function () {
    sinon.restore();
  });

  describe('envVariableSubstitution()', function () {
    afterEach(function () {
      delete process.env.TEST1;
      delete process.env.TEST2;
      delete process.env.TEST_LONG_NAME;
      delete process.env.TEST_ENDPOINT;
    });

    it('should return correct values for envVariableSubstitution', function () {
      process.env.TEST1 = 't1';
      process.env.TEST2 = 't2';
      process.env.TEST_LONG_NAME = '100';
      process.env.TEST_ENDPOINT = 'http://test.com:4318/v1/traces';
      assert.deepStrictEqual(envVariableSubstitution(null), undefined);
      assert.deepStrictEqual(envVariableSubstitution(' '), ' ');
      assert.deepStrictEqual(envVariableSubstitution('${TEST1}'), 't1');
      assert.deepStrictEqual(
        envVariableSubstitution('${TEST1},${TEST2}'),
        't1,t2'
      );
      assert.deepStrictEqual(
        envVariableSubstitution('${TEST_LONG_NAME}'),
        '100'
      );
      assert.deepStrictEqual(envVariableSubstitution('${TEST3}'), '');
      assert.deepStrictEqual(
        envVariableSubstitution('${TEST3:-backup}'),
        'backup'
      );
      assert.deepStrictEqual(
        envVariableSubstitution(
          '${TEST_ENDPOINT:-http://localhost:4318/v1/traces}'
        ),
        'http://test.com:4318/v1/traces'
      );
      assert.deepStrictEqual(
        envVariableSubstitution(
          '${TEST_NON_EXISTING:-http://localhost:4318/v1/traces}'
        ),
        'http://localhost:4318/v1/traces'
      );

      // ${env:VAR} and ${env:VAR:-default} forms (spec ABNF)
      assert.deepStrictEqual(envVariableSubstitution('${env:TEST1}'), 't1');
      assert.deepStrictEqual(
        envVariableSubstitution('${env:TEST3:-fallback}'),
        'fallback'
      );
      assert.deepStrictEqual(
        envVariableSubstitution('${env:TEST1} and ${env:TEST2}'),
        't1 and t2'
      );

      // $$ is a literal $ escape
      assert.deepStrictEqual(envVariableSubstitution('$$'), '$');
      assert.deepStrictEqual(envVariableSubstitution('$${TEST1}'), '${TEST1}');
    });
  });
});
