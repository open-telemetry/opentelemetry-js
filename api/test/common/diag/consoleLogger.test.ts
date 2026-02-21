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

/* eslint-disable no-console */

import * as assert from 'assert';
import {
  DiagConsoleLogger,
  _originalConsoleMethods,
} from '../../../src/diag/consoleLogger';

export const diagLoggerFunctions = [
  'verbose',
  'debug',
  'info',
  'warn',
  'error',
] as const;

const savedMethodKeys = [
  'debug',
  'info',
  'warn',
  'error',
  'log',
  'trace',
] as const;

const consoleFuncs = [
  'debug',
  'info',
  'warn',
  'error',
  'log',
  'trace',
] as const;

const expectedConsoleMap: { [n: string]: keyof Console } = {
  error: 'error',
  warn: 'warn',
  info: 'info',
  debug: 'debug',
  verbose: 'trace',
};

describe('DiagConsoleLogger', function () {
  const origConsole = console;
  const origSavedMethods: any = {};
  const origConsoleMethods: any = {};
  const calledArgs: any = {};

  // Save the real values at suite setup
  savedMethodKeys.forEach(key => {
    origSavedMethods[key] = _originalConsoleMethods[key];
    origConsoleMethods[key] = console[key];
    calledArgs[key] = null;
  });

  let canMockConsole = true;

  try {
    // eslint-disable-next-line no-global-assign
    console = origConsole;
  } catch (ex) {
    // Not supported on CI pipeline (works locally)
    canMockConsole = false;
  }

  beforeEach(() => {
    // Replace saved originals with tracking functions
    savedMethodKeys.forEach(key => {
      (_originalConsoleMethods as any)[key] = (...args: unknown[]) => {
        calledArgs[key] = args;
      };
    });
  });

  afterEach(() => {
    // Restore saved originals
    savedMethodKeys.forEach(key => {
      (_originalConsoleMethods as any)[key] = origSavedMethods[key];
      calledArgs[key] = null;
    });

    // Restore console
    if (canMockConsole) {
      try {
        // eslint-disable-next-line no-global-assign
        console = origConsole;
      } catch (ex) {
        // Not supported on CI pipeline
        canMockConsole = false;
      }
    }

    consoleFuncs.forEach(fName => {
      console[fName] = origConsoleMethods[fName];
    });
  });

  describe('constructor', function () {
    diagLoggerFunctions.forEach(fName => {
      it(`console logger should provide ${fName} function`, function () {
        const consoleLogger: any = new DiagConsoleLogger();
        consoleLogger[fName](`${fName} called %s`, 'param1');
        assert.ok(
          typeof consoleLogger[fName] === 'function',
          `Must have a ${fName} function`
        );
      });

      it(`should log ${expectedConsoleMap[fName]} message with ${fName} call only`, function () {
        const consoleLogger: any = new DiagConsoleLogger();
        consoleLogger[fName](`${fName} called %s`, 'param1');

        // Make sure only gets logged once
        let matches = 0;
        savedMethodKeys.forEach(cName => {
          if (cName !== expectedConsoleMap[fName]) {
            assert.deepStrictEqual(calledArgs[cName], null);
          } else {
            assert.deepStrictEqual(calledArgs[expectedConsoleMap[fName]], [
              `${fName} called %s`,
              'param1',
            ]);
            matches++;
          }
        });

        assert.deepStrictEqual(calledArgs.log, null);
        assert.strictEqual(matches, 1, 'should log at least once');
      });

      savedMethodKeys.forEach(cName => {
        it(`should log ${fName} message even when saved original doesn't have ${cName} before construction`, function () {
          _originalConsoleMethods[cName] = undefined;
          const consoleLogger: any = new DiagConsoleLogger();
          consoleLogger[fName](`${fName} called %s`, 'param1');
          if (cName !== expectedConsoleMap[fName]) {
            assert.deepStrictEqual(calledArgs[cName], null);
          } else {
            assert.deepStrictEqual(calledArgs.log, [
              `${fName} called %s`,
              'param1',
            ]);
          }
        });

        it(`should log ${fName} message even when saved original doesn't have ${cName} after construction`, function () {
          const consoleLogger: any = new DiagConsoleLogger();
          _originalConsoleMethods[cName] = undefined;
          consoleLogger[fName](`${fName} called %s`, 'param1');
          if (cName !== expectedConsoleMap[fName]) {
            assert.deepStrictEqual(calledArgs[cName], null);
          } else {
            assert.deepStrictEqual(calledArgs.log, [
              `${fName} called %s`,
              'param1',
            ]);
          }
        });
      });
    });

    diagLoggerFunctions.forEach(fName => {
      it(`should fall back to live console when saved originals are empty for ${fName}`, function () {
        // Clear all saved originals
        savedMethodKeys.forEach(key => {
          _originalConsoleMethods[key] = undefined;
        });
        // Set up live console tracking
        const liveCalledArgs: any = {};
        consoleFuncs.forEach(fn => {
          liveCalledArgs[fn] = null;
          console[fn] = (...args: unknown[]) => {
            liveCalledArgs[fn] = args;
          };
        });

        const consoleLogger: any = new DiagConsoleLogger();
        consoleLogger[fName](`${fName} called %s`, 'param1');

        const expectedConsoleFn = expectedConsoleMap[fName];
        assert.deepStrictEqual(liveCalledArgs[expectedConsoleFn], [
          `${fName} called %s`,
          'param1',
        ]);
      });
    });

    if (canMockConsole) {
      diagLoggerFunctions.forEach(fName => {
        it(`should not throw even when both saved originals and console are not supported for ${fName} call`, function () {
          savedMethodKeys.forEach(key => {
            _originalConsoleMethods[key] = undefined;
          });
          // eslint-disable-next-line no-global-assign
          (console as any) = undefined;
          const consoleLogger: any = new DiagConsoleLogger();
          consoleLogger[fName](`${fName} called %s`, 'param1');
        });

        it(`should not throw even when both saved originals and console are disabled after construction for ${fName} call`, function () {
          const consoleLogger: any = new DiagConsoleLogger();
          savedMethodKeys.forEach(key => {
            _originalConsoleMethods[key] = undefined;
          });
          // eslint-disable-next-line no-global-assign
          (console as any) = undefined;
          consoleLogger[fName](`${fName} called %s`, 'param1');
        });

        it(`should not throw even when saved originals are empty and console is invalid after construction for ${fName} call`, function () {
          const invalidConsole = {
            debug: 1,
            warn: 2,
            error: 3,
            trace: 4,
            info: 5,
            log: 6,
          };

          const consoleLogger = new DiagConsoleLogger();
          savedMethodKeys.forEach(key => {
            _originalConsoleMethods[key] = undefined;
          });
          // eslint-disable-next-line no-global-assign
          (console as any) = invalidConsole;
          consoleLogger[fName](`${fName} called %s`, 'param1');
        });

        it(`should not throw even when saved originals are empty and console is invalid before construction for ${fName} call`, function () {
          const invalidConsole = {
            debug: 1,
            warn: 2,
            error: 3,
            trace: 4,
            info: 5,
            log: 6,
          };

          savedMethodKeys.forEach(key => {
            _originalConsoleMethods[key] = undefined;
          });
          // eslint-disable-next-line no-global-assign
          (console as any) = invalidConsole;
          const consoleLogger = new DiagConsoleLogger();
          consoleLogger[fName](`${fName} called %s`, 'param1');
        });
      });
    }
  });
});
