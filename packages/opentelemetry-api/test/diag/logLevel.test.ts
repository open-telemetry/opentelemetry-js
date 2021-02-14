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
import { Logger } from '../../src/common/Logger';
import {
  createNoopDiagLogger,
  DiagLogger,
  diagLoggerFunctions,
} from '../../src/diag/logger';
import {
  DiagLogLevel,
  createLogLevelDiagLogger,
} from '../../src/diag/logLevel';

const incompleteLoggerFuncs: Array<keyof Logger> = [
  'debug',
  'info',
  'warn',
  'error',
];

const expectedIncompleteMap: { [n: string]: keyof Console } = {
  terminal: 'error',
  critical: 'error',
  error: 'error',
  warn: 'warn',
  info: 'info',
  debug: 'debug',
  verbose: 'debug',
  startupInfo: 'info',
};

describe('LogLevelFilter DiagLogger', () => {
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

  /** Simulated Legacy logger */
  let incompleteLogger: DiagLogger;

  beforeEach(() => {
    // set no logger
    diag.setLogger(null as any);
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

  describe('constructor', () => {
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
        message: 'CRITICAL',
        level: DiagLogLevel.CRITICAL,
        ignoreFuncs: [
          'verbose',
          'debug',
          'info',
          'warn',
          'error',
          'startupInfo',
        ],
      },
      {
        message: 'TERMINAL',
        level: DiagLogLevel.TERMINAL,
        ignoreFuncs: [
          'verbose',
          'debug',
          'info',
          'warn',
          'error',
          'critical',
          'startupInfo',
        ],
      },
      {
        message: 'between TERMINAL and NONE',
        level: 1,
        ignoreFuncs: [
          'verbose',
          'debug',
          'info',
          'warn',
          'error',
          'critical',
          'terminal',
          'startupInfo',
        ],
      },
      {
        message: 'NONE',
        level: DiagLogLevel.NONE,
        ignoreFuncs: [
          'verbose',
          'debug',
          'info',
          'warn',
          'error',
          'critical',
          'terminal',
          'startupInfo',
        ],
      },
      {
        message: 'less than NONE',
        level: -1000,
        ignoreFuncs: [
          'verbose',
          'debug',
          'info',
          'warn',
          'error',
          'critical',
          'terminal',
          'startupInfo',
        ],
      },
    ];

    levelMap.forEach(map => {
      diagLoggerFunctions.forEach(fName => {
        it(`should log ${fName} message with ${map.message} level`, () => {
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

        it(`should be noop for null with explicit noop Logger log ${fName} message with ${map.message} level`, () => {
          const testLogger = createLogLevelDiagLogger(
            map.level,
            createNoopDiagLogger()
          );
          testLogger[fName](`${fName} called %s`, 'param1');
          diagLoggerFunctions.forEach(lName => {
            assert.strictEqual(calledArgs[lName], null);
          });
        });

        it(`should be noop and not throw for null and no default Logger log ${fName} message with ${map.message} level`, () => {
          const testLogger = createLogLevelDiagLogger(map.level, null);
          testLogger[fName](`${fName} called %s`, 'param1');
          diagLoggerFunctions.forEach(lName => {
            assert.strictEqual(calledArgs[lName], null);
          });
        });

        it(`should be noop and not throw for undefined and no default Logger log ${fName} message with ${map.message} level`, () => {
          const testLogger = createLogLevelDiagLogger(map.level, undefined);
          testLogger[fName](`${fName} called %s`, 'param1');
          diagLoggerFunctions.forEach(lName => {
            assert.strictEqual(calledArgs[lName], null);
          });
        });

        it(`should use default logger for undefined and log ${fName} message with ${map.message} level`, () => {
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

        it(`should use default logger for null and log ${fName} message with ${map.message} level`, () => {
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

        it(`incomplete (legacy) logger should log ${fName} message to ${expectedIncompleteMap[fName]} with ${map.message} level`, () => {
          const testLogger = createLogLevelDiagLogger(
            map.level,
            incompleteLogger
          );
          testLogger[fName](`${fName} called %s`, 'param1');
          diagLoggerFunctions.forEach(lName => {
            const expectedLog = expectedIncompleteMap[lName];
            if (fName === lName && map.ignoreFuncs.indexOf(lName) === -1) {
              assert.deepStrictEqual(calledArgs[expectedLog], [
                `${fName} called %s`,
                'param1',
              ]);
            }
          });
        });

        levelMap.forEach(masterLevelMap => {
          it(`diag setLogLevel is not ignored when set to ${masterLevelMap.message} and using default logger to log ${fName} message with ${map.message} level`, () => {
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

          it(`diag setLogLevel is ignored when set to ${masterLevelMap.message} when using a specific logger to log ${fName} message with ${map.message} level`, () => {
            diag.setLogger(dummyLogger);
            diag.setLogLevel(masterLevelMap.level);

            const testLogger = createLogLevelDiagLogger(
              map.level,
              diag.getLogger()
            );
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
        });

        it(`diag setLogLevel and logger should log ${fName} message with ${map.message} level`, () => {
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

        it(`should not throw with an invalid DiagLogger calling ${fName} with ${map.message} level`, () => {
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
