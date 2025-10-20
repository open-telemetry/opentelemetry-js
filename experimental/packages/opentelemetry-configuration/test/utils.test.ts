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
import {
  envVariableSubstitution,
  getBooleanFromConfigFile,
  getBooleanListFromConfigFile,
  getNumberFromConfigFile,
  getNumberListFromConfigFile,
  getStringFromConfigFile,
  getStringListFromConfigFile,
} from '../src/utils';

describe('config utils', function () {
  afterEach(function () {
    sinon.restore();
  });

  it('should return correct values for getBooleanFromConfigFile', function () {
    assert.strictEqual(getBooleanFromConfigFile(null), undefined);
    assert.strictEqual(getBooleanFromConfigFile('  '), undefined);
    assert.strictEqual(getBooleanFromConfigFile(true), true);
    assert.strictEqual(getBooleanFromConfigFile('true'), true);
    assert.strictEqual(getBooleanFromConfigFile(false), false);
    assert.strictEqual(getBooleanFromConfigFile('false'), false);

    const warnStub = sinon.stub(diag, 'warn');
    assert.strictEqual(getBooleanFromConfigFile('non-boolean'), undefined);
    sinon.assert.calledOnceWithMatch(
      warnStub,
      `Unknown value 'non-boolean', expected 'true' or 'false'`
    );
  });

  it('should return correct values for getBooleanListFromConfigFile', function () {
    assert.deepStrictEqual(getBooleanListFromConfigFile(null), undefined);
    assert.deepStrictEqual(getBooleanListFromConfigFile('  '), undefined);
    assert.deepStrictEqual(getBooleanListFromConfigFile(' , '), []);
    assert.deepStrictEqual(getBooleanListFromConfigFile(true), [true]);
    assert.deepStrictEqual(getBooleanListFromConfigFile('true'), [true]);
    assert.deepStrictEqual(getBooleanListFromConfigFile(false), [false]);
    assert.deepStrictEqual(getBooleanListFromConfigFile('false'), [false]);
    assert.deepStrictEqual(
      getBooleanListFromConfigFile('true,false,false,true'),
      [true, false, false, true]
    );
    assert.deepStrictEqual(
      getBooleanListFromConfigFile('true,false,,,true,false'),
      [true, false, true, false]
    );

    const warnStub = sinon.stub(diag, 'warn');
    assert.deepStrictEqual(getBooleanListFromConfigFile('non-boolean'), []);
    sinon.assert.calledOnceWithMatch(
      warnStub,
      `Unknown value 'non-boolean', expected 'true' or 'false'`
    );
    assert.deepStrictEqual(getBooleanListFromConfigFile('non-boolean,false'), [
      false,
    ]);
  });

  it('should return correct values for getNumberFromConfigFile', function () {
    assert.strictEqual(getNumberFromConfigFile(null), undefined);
    assert.strictEqual(getNumberFromConfigFile(' '), undefined);
    assert.strictEqual(getNumberFromConfigFile(1), 1);
    assert.strictEqual(getNumberFromConfigFile(0), 0);
    assert.strictEqual(getNumberFromConfigFile(100), 100);

    const warnStub = sinon.stub(diag, 'warn');
    assert.strictEqual(getNumberFromConfigFile('non-number'), undefined);
    sinon.assert.calledOnceWithMatch(
      warnStub,
      `Unknown value 'non-number', expected a number`
    );
  });

  it('should return correct values for getNumberListFromConfigFile', function () {
    assert.deepStrictEqual(getNumberListFromConfigFile(null), undefined);
    assert.deepStrictEqual(getNumberListFromConfigFile('  '), undefined);
    assert.deepStrictEqual(getNumberListFromConfigFile(' , '), []);
    assert.deepStrictEqual(getNumberListFromConfigFile(5), [5]);
    assert.deepStrictEqual(getNumberListFromConfigFile('7'), [7]);
    assert.deepStrictEqual(
      getNumberListFromConfigFile('1,2,3,4'),
      [1, 2, 3, 4]
    );
    assert.deepStrictEqual(
      getNumberListFromConfigFile('5,6,,,7,8'),
      [5, 6, 7, 8]
    );

    const warnStub = sinon.stub(diag, 'warn');
    assert.deepStrictEqual(getNumberListFromConfigFile('non-number'), []);
    sinon.assert.calledOnceWithMatch(
      warnStub,
      `Unknown value 'non-number', expected a number`
    );
    assert.deepStrictEqual(getNumberListFromConfigFile('non-number,10'), [10]);
  });

  it('should return correct values for getStringFromConfigFile', function () {
    assert.strictEqual(getStringFromConfigFile(null), undefined);
    assert.strictEqual(getStringFromConfigFile(' '), undefined);
    assert.strictEqual(getStringFromConfigFile(undefined), undefined);
    assert.strictEqual(getStringFromConfigFile(1), '1');
    assert.strictEqual(getStringFromConfigFile('string-value'), 'string-value');
  });

  it('should return correct values for getStringListFromConfigFile', function () {
    assert.deepStrictEqual(getStringListFromConfigFile(null), undefined);
    assert.deepStrictEqual(getStringListFromConfigFile('  '), undefined);
    assert.deepStrictEqual(getStringListFromConfigFile(' , '), []);
    assert.deepStrictEqual(getStringListFromConfigFile(1), ['1']);
    assert.deepStrictEqual(getStringListFromConfigFile('string-value'), [
      'string-value',
    ]);
    assert.deepStrictEqual(getStringListFromConfigFile('v1,v2,v3,v4'), [
      'v1',
      'v2',
      'v3',
      'v4',
    ]);
    assert.deepStrictEqual(getStringListFromConfigFile('v5,v6,,,v7,v8'), [
      'v5',
      'v6',
      'v7',
      'v8',
    ]);
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
    });
  });
});
