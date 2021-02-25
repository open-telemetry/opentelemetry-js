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
import { DiagConsoleLogger } from '../../src/diag/consoleLogger';

export const diagLoggerFunctions = [
  'verbose',
  'debug',
  'info',
  'warn',
  'error',
] as const;

const consoleFuncs: Array<keyof Console> = [
  'debug',
  'info',
  'warn',
  'error',
  'log',
  'trace',
];

const expectedConsoleMap: { [n: string]: keyof Console } = {
  error: 'error',
  warn: 'warn',
  info: 'info',
  debug: 'debug',
  verbose: 'trace',
};

describe('DiagConsoleLogger', () => {
  const origConsole = console;
  const orig: any = {};
  const calledArgs: any = {};

  // Save original functions
  consoleFuncs.forEach(fName => {
    orig[fName] = console[fName];
    calledArgs[fName] = null;
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
    // mock Console
    consoleFuncs.forEach(fName => {
      console[fName] = (...args: unknown[]) => {
        calledArgs[fName] = args;
      };
    });
  });

  afterEach(() => {
    // restore
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
      calledArgs[fName] = null;
      console[fName] = orig[fName];
    });
  });

  describe('constructor', () => {
    diagLoggerFunctions.forEach(fName => {
      it(`console logger should provide ${fName} function`, () => {
        const consoleLogger: any = new DiagConsoleLogger();
        consoleLogger[fName](`${fName} called %s`, 'param1');
        assert.ok(
          typeof consoleLogger[fName] === 'function',
          `Must have a ${fName} function`
        );
      });

      it(`should log ${expectedConsoleMap[fName]} message with ${fName} call only`, () => {
        const consoleLogger: any = new DiagConsoleLogger();
        consoleLogger[fName](`${fName} called %s`, 'param1');

        // Make sure only gets logged once
        let matches = 0;
        consoleFuncs.forEach(cName => {
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

      consoleFuncs.forEach(cName => {
        it(`should log ${fName} message even when console doesn't support ${cName} call before construction`, () => {
          console[cName] = undefined;
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

        it(`should log ${fName} message even when console doesn't support ${cName} call after construction`, () => {
          const consoleLogger: any = new DiagConsoleLogger();
          console[cName] = undefined;
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

    if (canMockConsole) {
      diagLoggerFunctions.forEach(fName => {
        const cName = expectedConsoleMap[fName];
        it(`should not throw even when console is not supported for ${fName} call`, () => {
          // eslint-disable-next-line no-global-assign
          (console as any) = undefined;
          const consoleLogger: any = new DiagConsoleLogger();
          consoleLogger[fName](`${fName} called %s`, 'param1');
          assert.deepStrictEqual(calledArgs[cName], null);
          assert.deepStrictEqual(calledArgs.log, null);
        });

        it(`should not throw even when console is disabled after construction for ${fName} call`, () => {
          const consoleLogger: any = new DiagConsoleLogger();
          // eslint-disable-next-line no-global-assign
          (console as any) = undefined;
          consoleLogger[fName](`${fName} called %s`, 'param1');
          assert.deepStrictEqual(calledArgs[expectedConsoleMap[fName]], null);
          assert.deepStrictEqual(calledArgs.log, null);
        });

        it(`should not throw even when console is invalid after construction for ${fName} call`, () => {
          const invalidConsole = {
            debug: 1,
            warn: 2,
            error: 3,
            trace: 4,
            info: 5,
            log: 6,
          };

          const consoleLogger = new DiagConsoleLogger();
          // eslint-disable-next-line no-global-assign
          (console as any) = invalidConsole;
          consoleLogger[fName](`${fName} called %s`, 'param1');
          assert.deepStrictEqual(calledArgs[expectedConsoleMap[fName]], null);
          assert.deepStrictEqual(calledArgs.log, null);
        });

        it(`should not throw even when console is invalid before construction for ${fName} call`, () => {
          const invalidConsole = {
            debug: 1,
            warn: 2,
            error: 3,
            trace: 4,
            info: 5,
            log: 6,
          };

          // eslint-disable-next-line no-global-assign
          (console as any) = invalidConsole;
          const consoleLogger = new DiagConsoleLogger();
          consoleLogger[fName](`${fName} called %s`, 'param1');
          assert.deepStrictEqual(calledArgs[expectedConsoleMap[fName]], null);
          assert.deepStrictEqual(calledArgs.log, null);
        });
      });
    }
  });
});
