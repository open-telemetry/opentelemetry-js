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
import { stringToLogLevel } from '../../../src';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { diag, DiagLogLevel } from '@opentelemetry/api';

describe('stringToLogLevel', function () {
  afterEach(function () {
    sinon.restore();
  });

  it('should map valid string to log level', function () {
    assert.strictEqual(stringToLogLevel('ALL'), DiagLogLevel.ALL);
    assert.strictEqual(stringToLogLevel('VERBOSE'), DiagLogLevel.VERBOSE);
    assert.strictEqual(stringToLogLevel('DEBUG'), DiagLogLevel.DEBUG);
    assert.strictEqual(stringToLogLevel('INFO'), DiagLogLevel.INFO);
    assert.strictEqual(stringToLogLevel('WARN'), DiagLogLevel.WARN);
    assert.strictEqual(stringToLogLevel('ERROR'), DiagLogLevel.ERROR);
    assert.strictEqual(stringToLogLevel('NONE'), DiagLogLevel.NONE);
  });

  it('should ignore casing when resolving', function () {
    assert.strictEqual(stringToLogLevel('error'), DiagLogLevel.ERROR);
    assert.strictEqual(stringToLogLevel('eRRoR'), DiagLogLevel.ERROR);
  });

  it('should return undefined on undefined input', function () {
    assert.strictEqual(stringToLogLevel(undefined), undefined);
  });

  it('should return undefined on null input', function () {
    assert.strictEqual(stringToLogLevel(undefined), undefined);
  });

  it('should fall back to INFO and warn on input that cannot be mapped', function () {
    const warnStub = sinon.stub(diag, 'warn');
    assert.strictEqual(stringToLogLevel('does not exist'), DiagLogLevel.INFO);
    sinon.assert.calledOnceWithMatch(warnStub, 'Unknown');
  });
});
