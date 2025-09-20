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
  getBooleanFromConfigFile,
  getNumberFromConfigFile,
  getStringFromConfigFile,
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

  it('should return correct values for getStringFromConfigFile', function () {
    assert.strictEqual(getStringFromConfigFile(null), undefined);
    assert.strictEqual(getStringFromConfigFile(' '), undefined);
    assert.strictEqual(getStringFromConfigFile(undefined), undefined);
    assert.strictEqual(getStringFromConfigFile(1), '1');
    assert.strictEqual(getStringFromConfigFile('string-value'), 'string-value');
  });
});
