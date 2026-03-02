/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import { diag, DiagLogLevel } from '../../../src';
import { createNoopDiagLogger } from '../../../src/diag/internal/noopLogger';
import { DiagLogger } from '../../../src/diag/types';

export const diagLoggerFunctions = [
  'verbose',
  'debug',
  'info',
  'warn',
  'error',
] as const;
describe('DiagLogger functions', function () {
  const calledArgs: any = {
    error: null,
    warn: null,
    info: null,
    debug: null,
    verbose: null,
  };

  let dummyLogger: DiagLogger;

  const restoreCallHistory = () => {
    diagLoggerFunctions.forEach(fName => {
      calledArgs[fName] = null;
    });
  };

  beforeEach(() => {
    // mock
    dummyLogger = {} as DiagLogger;
    diagLoggerFunctions.forEach(fName => {
      dummyLogger[fName] = (...args: unknown[]) => {
        calledArgs[fName] = args;
      };
    });
  });

  afterEach(() => {
    restoreCallHistory();
    diag.disable();
  });

  describe('constructor', function () {
    diagLoggerFunctions.forEach(fName => {
      it(`should log with ${fName} message`, function () {
        const testLogger = dummyLogger;
        testLogger[fName](`${fName} called %s`, 'param1');
        diagLoggerFunctions.forEach(lName => {
          if (fName === lName) {
            assert.deepStrictEqual(calledArgs[fName], [
              `${fName} called %s`,
              'param1',
            ]);
          } else {
            assert.strictEqual(calledArgs[lName], null);
          }
        });
      });

      it(`diag should log with ${fName} message`, function () {
        diag.setLogger(dummyLogger, DiagLogLevel.ALL);
        restoreCallHistory();
        diag[fName](`${fName} called %s`, 'param1');
        diagLoggerFunctions.forEach(lName => {
          if (fName === lName) {
            assert.deepStrictEqual(calledArgs[fName], [
              `${fName} called %s`,
              'param1',
            ]);
          } else {
            assert.strictEqual(calledArgs[lName], null);
          }
        });
      });

      it(`NoopLogger should implement all functions and not throw when ${fName} called`, function () {
        const testLogger = createNoopDiagLogger();

        assert.ok(typeof testLogger[fName], 'function');
        testLogger[fName](`${fName} called %s`, 'param1');
      });
    });
  });

  describe('diag is used as the diag logger in setLogger', function () {
    it('should not throw', function () {
      diag.setLogger(diag);
    });

    it('should use the previously registered logger to log the error', function () {
      const error = sinon.stub();
      diag.setLogger({
        verbose: () => {},
        debug: () => {},
        info: () => {},
        warn: () => {},
        error,
      });

      sinon.assert.notCalled(error);

      diag.setLogger(diag);

      sinon.assert.calledOnce(error);
    });
  });
});
