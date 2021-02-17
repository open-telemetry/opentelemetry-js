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
import { diag } from '../../src';
import {
  createNoopDiagLogger,
  DiagLogger,
  diagLoggerFunctions,
} from '../../src/diag/logger';
import {
  DiagLogLevel,
  createLogLevelDiagLogger,
} from '../../src/diag/logLevel';

// Matches the previous Logger definition
const incompleteLoggerFuncs: Array<keyof DiagLogger> = [
  'debug',
  'info',
  'warn',
  'error',
];

describe('LogLevelFilter DiagLogger', () => {
  const calledArgs: any = {
    error: null,
    warn: null,
    info: null,
    debug: null,
    verbose: null,
  };

  let dummyLogger: DiagLogger;

  /** Simulated Legacy logger */
  let incompleteLogger: DiagLogger;

  beforeEach(() => {
    // Set no logger so that sinon doesn't complain about TypeError: Attempted to wrap xxxx which is already wrapped
    diag.setLogger();
    diag.setLogLevel(DiagLogLevel.INFO);

    // mock
    dummyLogger = {} as DiagLogger;
    diagLoggerFunctions.forEach(fName => {
      dummyLogger[fName] = (...args: unknown[]) => {
        calledArgs[fName] = args;
      };
    });

    incompleteLogger = {} as DiagLogger;
    incompleteLoggerFuncs.forEach(fName => {
      incompleteLogger[fName] = (...args: unknown[]) => {
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

  const levelMap: Array<{
    message: string;
    level: DiagLogLevel;
    ignoreFuncs: Array<keyof DiagLogger>;
  }> = [
    { message: 'ALL', level: DiagLogLevel.ALL, ignoreFuncs: [] },
    { message: 'greater than ALL', level: 32768, ignoreFuncs: [] },
    { message: 'VERBOSE', level: DiagLogLevel.VERBOSE, ignoreFuncs: [] },
    { message: 'DEBUG', level: DiagLogLevel.DEBUG, ignoreFuncs: ['verbose'] },
    {
      message: 'INFO',
      level: DiagLogLevel.INFO,
      ignoreFuncs: ['verbose', 'debug'],
    },
    {
      message: 'WARN',
      level: DiagLogLevel.WARN,
      ignoreFuncs: ['verbose', 'debug', 'info'],
    },
    {
      message: 'ERROR',
      level: DiagLogLevel.ERROR,
      ignoreFuncs: ['verbose', 'debug', 'info', 'warn'],
    },
    {
      message: 'between ERROR and NONE',
      level: 1,
      ignoreFuncs: ['verbose', 'debug', 'info', 'warn', 'error'],
    },
    {
      message: 'NONE',
      level: DiagLogLevel.NONE,
      ignoreFuncs: ['verbose', 'debug', 'info', 'warn', 'error'],
    },
    {
      message: 'less than NONE',
      level: -1000,
      ignoreFuncs: ['verbose', 'debug', 'info', 'warn', 'error'],
    },
  ];

  levelMap.forEach(map => {
    describe(`with ${map.message} log level`, () => {
      diagLoggerFunctions.forEach(fName => {
        describe(`calling ${fName} message`, () => {
          it('should log', () => {
            const testLogger = createLogLevelDiagLogger(map.level, dummyLogger);
            testLogger[fName](`${fName} called %s`, 'param1');
            diagLoggerFunctions.forEach(lName => {
              if (fName === lName && map.ignoreFuncs.indexOf(lName) === -1) {
                assert.deepStrictEqual(calledArgs[lName], [
                  `${fName} called %s`,
                  'param1',
                ]);
              } else {
                assert.strictEqual(calledArgs[lName], null);
              }
            });
          });

          it('should be noop for null with explicit noop Logger log', () => {
            const testLogger = createLogLevelDiagLogger(
              map.level,
              createNoopDiagLogger()
            );
            testLogger[fName](`${fName} called %s`, 'param1');
            diagLoggerFunctions.forEach(lName => {
              assert.strictEqual(calledArgs[lName], null);
            });
          });

          it('should be noop and not throw for null and no default Logger log', () => {
            const testLogger = createLogLevelDiagLogger(map.level, null);
            testLogger[fName](`${fName} called %s`, 'param1');
            diagLoggerFunctions.forEach(lName => {
              assert.strictEqual(calledArgs[lName], null);
            });
          });

          it('should be noop and not throw for undefined and no default Logger log', () => {
            const testLogger = createLogLevelDiagLogger(map.level, undefined);
            testLogger[fName](`${fName} called %s`, 'param1');
            diagLoggerFunctions.forEach(lName => {
              assert.strictEqual(calledArgs[lName], null);
            });
          });

          it('should use default logger for undefined and log', () => {
            diag.setLogger(dummyLogger);
            diag.setLogLevel(DiagLogLevel.ALL);
            const testLogger = createLogLevelDiagLogger(map.level, undefined);
            testLogger[fName](`${fName} called %s`, 'param1');
            diagLoggerFunctions.forEach(lName => {
              if (fName === lName && map.ignoreFuncs.indexOf(lName) === -1) {
                assert.deepStrictEqual(calledArgs[lName], [
                  `${fName} called %s`,
                  'param1',
                ]);
              } else {
                assert.strictEqual(calledArgs[lName], null);
              }
            });
          });

          it('should use default logger for null and log', () => {
            diag.setLogger(dummyLogger);
            diag.setLogLevel(DiagLogLevel.ALL);
            const testLogger = createLogLevelDiagLogger(map.level, null);
            testLogger[fName](`${fName} called %s`, 'param1');
            diagLoggerFunctions.forEach(lName => {
              if (fName === lName && map.ignoreFuncs.indexOf(lName) === -1) {
                assert.deepStrictEqual(calledArgs[lName], [
                  `${fName} called %s`,
                  'param1',
                ]);
              } else {
                assert.strictEqual(calledArgs[lName], null);
              }
            });
          });

          levelMap.forEach(masterLevelMap => {
            describe(`when diag logger is set to ${masterLevelMap.message}`, () => {
              it('diag setLogLevel is not ignored and using default logger', () => {
                diag.setLogger(dummyLogger);
                diag.setLogLevel(masterLevelMap.level);

                const testLogger = createLogLevelDiagLogger(map.level);
                testLogger[fName](`${fName} called %s`, 'param1');
                diagLoggerFunctions.forEach(lName => {
                  if (
                    fName === lName &&
                    map.ignoreFuncs.indexOf(lName) === -1 &&
                    masterLevelMap.ignoreFuncs.indexOf(lName) === -1
                  ) {
                    assert.deepStrictEqual(calledArgs[lName], [
                      `${fName} called %s`,
                      'param1',
                    ]);
                  } else {
                    assert.strictEqual(calledArgs[lName], null);
                  }
                });
              });

              it('diag setLogLevel is ignored when using a specific logger', () => {
                diag.setLogger(dummyLogger);
                diag.setLogLevel(masterLevelMap.level);

                const testLogger = createLogLevelDiagLogger(
                  map.level,
                  diag.getLogger()
                );
                testLogger[fName](`${fName} called %s`, 'param1');
                diagLoggerFunctions.forEach(lName => {
                  if (
                    fName === lName &&
                    map.ignoreFuncs.indexOf(lName) === -1
                  ) {
                    assert.deepStrictEqual(calledArgs[lName], [
                      `${fName} called %s`,
                      'param1',
                    ]);
                  } else {
                    assert.strictEqual(calledArgs[lName], null);
                  }
                });
              });
            });
          });

          it('diag setLogLevel and logger should log', () => {
            diag.setLogger(dummyLogger);
            diag.setLogLevel(map.level);
            diag[fName](`${fName} called %s`, 'param1');
            diagLoggerFunctions.forEach(lName => {
              if (fName === lName && map.ignoreFuncs.indexOf(lName) === -1) {
                assert.deepStrictEqual(calledArgs[lName], [
                  `${fName} called %s`,
                  'param1',
                ]);
              } else {
                assert.strictEqual(calledArgs[lName], null);
              }
            });
          });

          it('should not throw with an invalid DiagLogger', () => {
            const invalidLogger = {
              debug: 1,
              warn: 2,
              error: 3,
              trace: 4,
              info: 5,
              log: 6,
            };

            const testLogger = createLogLevelDiagLogger(
              map.level,
              invalidLogger as any
            );

            testLogger[fName](`${fName} called %s`, 'param1');
            diagLoggerFunctions.forEach(lName => {
              assert.strictEqual(calledArgs[lName], null);
            });
          });
        });
      });
    });
  });
});
