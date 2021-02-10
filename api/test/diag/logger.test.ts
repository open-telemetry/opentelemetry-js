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
import { diag, DiagLogLevel } from '../../src';
import {
  DiagLogger,
  createNoopDiagLogger,
  diagLoggerFunctions,
} from '../../src/diag/logger';

describe('DiagLogger functions', () => {
  const calledArgs: any = {
    terminal: null,
    critical: null,
    error: null,
    warn: null,
    info: null,
    debug: null,
    verbose: null,
    startupInfo: null,
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
        diag.setLogger(dummyLogger);
        diag.setLogLevel(DiagLogLevel.ALL);
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
});
