/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import { diagLogLevelFromString } from '../../../src';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { diag, DiagLogLevel } from '@opentelemetry/api';

describe('stringToLogLevel', function () {
  afterEach(function () {
    sinon.restore();
  });

  it('should map valid string to log level', function () {
    assert.strictEqual(diagLogLevelFromString('ALL'), DiagLogLevel.ALL);
    assert.strictEqual(diagLogLevelFromString('VERBOSE'), DiagLogLevel.VERBOSE);
    assert.strictEqual(diagLogLevelFromString('DEBUG'), DiagLogLevel.DEBUG);
    assert.strictEqual(diagLogLevelFromString('INFO'), DiagLogLevel.INFO);
    assert.strictEqual(diagLogLevelFromString('WARN'), DiagLogLevel.WARN);
    assert.strictEqual(diagLogLevelFromString('ERROR'), DiagLogLevel.ERROR);
    assert.strictEqual(diagLogLevelFromString('NONE'), DiagLogLevel.NONE);
  });

  it('should ignore casing when resolving', function () {
    assert.strictEqual(diagLogLevelFromString('error'), DiagLogLevel.ERROR);
    assert.strictEqual(diagLogLevelFromString('eRRoR'), DiagLogLevel.ERROR);
  });

  it('should return undefined on undefined input', function () {
    assert.strictEqual(diagLogLevelFromString(undefined), undefined);
  });

  it('should fall back to INFO and warn on input that cannot be mapped', function () {
    const warnStub = sinon.stub(diag, 'warn');
    assert.strictEqual(
      diagLogLevelFromString('does not exist'),
      DiagLogLevel.INFO
    );
    sinon.assert.calledOnceWithMatch(warnStub, 'Unknown');
  });
});
