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
import sinon = require('sinon');
import { diag, DiagLogLevel } from '../../src';
import { createNoopDiagLogger } from '../../src/diag/internal/noopLogger';
import { DiagLogger } from '../../src/diag/types';

export const diagLoggerFunctions = [
  'verbose',
  'debug',
  'info',
  'warn',
  'error',
] as const;
describe('DiagLogger functions', () => {
  const calledArgs: any = {
    error: null,
    warn: null,
    info: null,
    debug: null,
    verbose: null,
  };

  let dummyLogger: DiagLogger;

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
    // restore
    diagLoggerFunctions.forEach(fName => {
      calledArgs[fName] = null;
    });
    diag.disable();
  });

  describe('constructor', () => {
    diagLoggerFunctions.forEach(fName => {
      it(`should log with ${fName} message`, () => {
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

      it(`diag should log with ${fName} message`, () => {
        diag.setLogger(dummyLogger, DiagLogLevel.ALL);
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

      it(`NoopLogger should implement all functions and not throw when ${fName} called`, () => {
        const testLogger = createNoopDiagLogger();

        assert.ok(typeof testLogger[fName], 'function');
        testLogger[fName](`${fName} called %s`, 'param1');
      });
    });
  });

  describe('diag is used as the diag logger in setLogger', () => {
    it('should not throw', () => {
      diag.setLogger(diag);
    });

    it('should use the previously registered logger to log the error', () => {
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
