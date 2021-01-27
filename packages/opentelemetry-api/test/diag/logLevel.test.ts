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
import { DiagLogger } from '../../src/diag/logger';
import { DiagLogLevel, diagLogLevelFilter } from '../../src/diag/logLevel';

describe('LogLevelFilter DiagLogger', () => {
  let terminalCalledArgs: unknown;
  let criticalCalledArgs: unknown;
  let errorCalledArgs: unknown;
  let warnCalledArgs: unknown;
  let infoCalledArgs: unknown;
  let debugCalledArgs: unknown;
  let traceCalledArgs: unknown;
  let forcedInfoCalledArgs: unknown;

  let dummyLogger: DiagLogger;

  /** Simulated Legacy logger */
  let incompleteLogger: DiagLogger;

  beforeEach(() => {
    // mock
    dummyLogger = {
      terminal: (...args: unknown[]) => {
        terminalCalledArgs = args;
      },
      critical: (...args: unknown[]) => {
        criticalCalledArgs = args;
      },
      error: (...args: unknown[]) => {
        errorCalledArgs = args;
      },
      warn: (...args: unknown[]) => {
        warnCalledArgs = args;
      },
      info: (...args: unknown[]) => {
        infoCalledArgs = args;
      },
      debug: (...args: unknown[]) => {
        debugCalledArgs = args;
      },
      trace: (...args: unknown[]) => {
        traceCalledArgs = args;
      },
      forcedInfo: (...args: unknown[]) => {
        forcedInfoCalledArgs = args;
      },
    };

    incompleteLogger = {
      error: (...args: unknown[]) => {
        errorCalledArgs = args;
      },
      warn: (...args: unknown[]) => {
        warnCalledArgs = args;
      },
      info: (...args: unknown[]) => {
        infoCalledArgs = args;
      },
      debug: (...args: unknown[]) => {
        debugCalledArgs = args;
      },
    } as DiagLogger;
  });

  afterEach(() => {
    // restore
    terminalCalledArgs = null;
    criticalCalledArgs = null;
    errorCalledArgs = null;
    warnCalledArgs = null;
    infoCalledArgs = null;
    debugCalledArgs = null;
    traceCalledArgs = null;
    forcedInfoCalledArgs = null;
  });

  describe('constructor', () => {
    it('should log all calls', () => {
      const testLogger = dummyLogger;
      testLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(terminalCalledArgs, [
        'terminal called %s',
        'param1',
      ]);
      testLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(criticalCalledArgs, [
        'critical called %s',
        'param1',
      ]);
      testLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['error called %s', 'param1']);
      testLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, ['warn called %s', 'param1']);
      testLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, ['info called %s', 'param1']);
      testLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, ['debug called %s', 'param1']);
      testLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, ['trace called %s', 'param1']);
      testLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(forcedInfoCalledArgs, [
        'forcedInfo called %s',
        'param1',
      ]);
    });

    it('should log with ALL level', () => {
      const testLogger = diagLogLevelFilter(DiagLogLevel.ALL, dummyLogger);

      testLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(terminalCalledArgs, [
        'terminal called %s',
        'param1',
      ]);
      testLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(criticalCalledArgs, [
        'critical called %s',
        'param1',
      ]);
      testLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['error called %s', 'param1']);
      testLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, ['warn called %s', 'param1']);
      testLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, ['info called %s', 'param1']);
      testLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, ['debug called %s', 'param1']);
      testLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, ['trace called %s', 'param1']);
      testLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(forcedInfoCalledArgs, [
        'forcedInfo called %s',
        'param1',
      ]);
    });

    it('should log with level greater than ALL', () => {
      const testLogger = diagLogLevelFilter(32768, dummyLogger);

      testLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(terminalCalledArgs, [
        'terminal called %s',
        'param1',
      ]);
      testLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(criticalCalledArgs, [
        'critical called %s',
        'param1',
      ]);
      testLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['error called %s', 'param1']);
      testLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, ['warn called %s', 'param1']);
      testLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, ['info called %s', 'param1']);
      testLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, ['debug called %s', 'param1']);
      testLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, ['trace called %s', 'param1']);
      testLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(forcedInfoCalledArgs, [
        'forcedInfo called %s',
        'param1',
      ]);
    });

    it('should log with TRACE level', () => {
      const testLogger = diagLogLevelFilter(DiagLogLevel.TRACE, dummyLogger);

      testLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(terminalCalledArgs, [
        'terminal called %s',
        'param1',
      ]);
      testLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(criticalCalledArgs, [
        'critical called %s',
        'param1',
      ]);
      testLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['error called %s', 'param1']);
      testLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, ['warn called %s', 'param1']);
      testLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, ['info called %s', 'param1']);
      testLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, ['debug called %s', 'param1']);
      testLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, ['trace called %s', 'param1']);
      testLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(forcedInfoCalledArgs, [
        'forcedInfo called %s',
        'param1',
      ]);
    });

    it('should log with debug', () => {
      const testLogger = diagLogLevelFilter(DiagLogLevel.DEBUG, dummyLogger);

      testLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(terminalCalledArgs, [
        'terminal called %s',
        'param1',
      ]);
      testLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(criticalCalledArgs, [
        'critical called %s',
        'param1',
      ]);
      testLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['error called %s', 'param1']);
      testLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, ['warn called %s', 'param1']);
      testLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, ['info called %s', 'param1']);
      testLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, ['debug called %s', 'param1']);
      testLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, null);
      testLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(forcedInfoCalledArgs, [
        'forcedInfo called %s',
        'param1',
      ]);
    });

    it('should log with info', () => {
      const testLogger = diagLogLevelFilter(DiagLogLevel.INFO, dummyLogger);

      testLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(terminalCalledArgs, [
        'terminal called %s',
        'param1',
      ]);
      testLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(criticalCalledArgs, [
        'critical called %s',
        'param1',
      ]);
      testLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['error called %s', 'param1']);
      testLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, ['warn called %s', 'param1']);
      testLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, ['info called %s', 'param1']);
      testLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, null);
      testLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, null);
      testLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(forcedInfoCalledArgs, [
        'forcedInfo called %s',
        'param1',
      ]);
    });

    it('should log with warning', () => {
      const testLogger = diagLogLevelFilter(DiagLogLevel.WARN, dummyLogger);

      testLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(terminalCalledArgs, [
        'terminal called %s',
        'param1',
      ]);
      testLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(criticalCalledArgs, [
        'critical called %s',
        'param1',
      ]);
      testLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['error called %s', 'param1']);
      testLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, ['warn called %s', 'param1']);
      testLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, null);
      testLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, null);
      testLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, null);
      testLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(forcedInfoCalledArgs, [
        'forcedInfo called %s',
        'param1',
      ]);
    });

    it('should log with error', () => {
      const testLogger = diagLogLevelFilter(DiagLogLevel.ERROR, dummyLogger);

      testLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(terminalCalledArgs, [
        'terminal called %s',
        'param1',
      ]);
      testLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(criticalCalledArgs, [
        'critical called %s',
        'param1',
      ]);
      testLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['error called %s', 'param1']);
      testLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, null);
      testLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, null);
      testLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, null);
      testLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, null);
      testLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(forcedInfoCalledArgs, [
        'forcedInfo called %s',
        'param1',
      ]);
    });

    it('should log with critical', () => {
      const testLogger = diagLogLevelFilter(DiagLogLevel.CRITICAL, dummyLogger);

      testLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(terminalCalledArgs, [
        'terminal called %s',
        'param1',
      ]);
      testLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(criticalCalledArgs, [
        'critical called %s',
        'param1',
      ]);
      testLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, null);
      testLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, null);
      testLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, null);
      testLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, null);
      testLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, null);
      testLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(forcedInfoCalledArgs, [
        'forcedInfo called %s',
        'param1',
      ]);
    });

    it('should log with terminal', () => {
      const testLogger = diagLogLevelFilter(DiagLogLevel.TERMINAL, dummyLogger);

      testLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(terminalCalledArgs, [
        'terminal called %s',
        'param1',
      ]);
      testLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(criticalCalledArgs, null);
      testLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, null);
      testLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, null);
      testLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, null);
      testLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, null);
      testLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, null);
      testLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(forcedInfoCalledArgs, [
        'forcedInfo called %s',
        'param1',
      ]);
    });

    it('should log with none', () => {
      const testLogger = diagLogLevelFilter(DiagLogLevel.NONE, dummyLogger);

      testLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(terminalCalledArgs, null);
      testLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(criticalCalledArgs, null);
      testLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, null);
      testLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, null);
      testLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, null);
      testLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, null);
      testLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, null);
      testLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(forcedInfoCalledArgs, [
        'forcedInfo called %s',
        'param1',
      ]);
    });

    it('should log with value less than NONE', () => {
      const testLogger = diagLogLevelFilter(-1000, dummyLogger);

      testLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(terminalCalledArgs, null);
      testLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(criticalCalledArgs, null);
      testLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, null);
      testLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, null);
      testLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, null);
      testLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, null);
      testLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, null);
      testLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(forcedInfoCalledArgs, [
        'forcedInfo called %s',
        'param1',
      ]);
    });
    it('legacyLogger should log with ALL level', () => {
      const testLogger = diagLogLevelFilter(DiagLogLevel.ALL, incompleteLogger);

      testLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(terminalCalledArgs, null);
      testLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(criticalCalledArgs, null);
      testLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['error called %s', 'param1']);
      testLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, ['warn called %s', 'param1']);
      testLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, ['info called %s', 'param1']);
      testLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, ['debug called %s', 'param1']);
      testLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, null);
      testLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(forcedInfoCalledArgs, null);
    });

    it('legacyLogger should log with TRACE level', () => {
      const testLogger = diagLogLevelFilter(
        DiagLogLevel.TRACE,
        incompleteLogger
      );

      testLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(terminalCalledArgs, null);
      testLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(criticalCalledArgs, null);
      testLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['error called %s', 'param1']);
      testLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, ['warn called %s', 'param1']);
      testLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, ['info called %s', 'param1']);
      testLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, ['debug called %s', 'param1']);
      testLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, null);
      testLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(forcedInfoCalledArgs, null);
    });

    it('legacyLogger should log with debug', () => {
      const testLogger = diagLogLevelFilter(
        DiagLogLevel.DEBUG,
        incompleteLogger
      );

      testLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(terminalCalledArgs, null);
      testLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(criticalCalledArgs, null);
      testLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['error called %s', 'param1']);
      testLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, ['warn called %s', 'param1']);
      testLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, ['info called %s', 'param1']);
      testLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, ['debug called %s', 'param1']);
      testLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, null);
      testLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(forcedInfoCalledArgs, null);
    });

    it('legacyLogger should log with info', () => {
      const testLogger = diagLogLevelFilter(
        DiagLogLevel.INFO,
        incompleteLogger
      );

      testLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(terminalCalledArgs, null);
      testLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(criticalCalledArgs, null);
      testLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['error called %s', 'param1']);
      testLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, ['warn called %s', 'param1']);
      testLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, ['info called %s', 'param1']);
      testLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, null);
      testLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, null);
      testLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(forcedInfoCalledArgs, null);
    });

    it('legacyLogger should log with warning', () => {
      const testLogger = diagLogLevelFilter(
        DiagLogLevel.WARN,
        incompleteLogger
      );

      testLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(terminalCalledArgs, null);
      testLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(criticalCalledArgs, null);
      testLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['error called %s', 'param1']);
      testLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, ['warn called %s', 'param1']);
      testLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, null);
      testLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, null);
      testLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, null);
      testLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(forcedInfoCalledArgs, null);
    });

    it('legacyLogger should log with error', () => {
      const testLogger = diagLogLevelFilter(
        DiagLogLevel.ERROR,
        incompleteLogger
      );

      testLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(terminalCalledArgs, null);
      testLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(criticalCalledArgs, null);
      testLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['error called %s', 'param1']);
      testLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, null);
      testLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, null);
      testLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, null);
      testLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, null);
      testLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(forcedInfoCalledArgs, null);
    });

    it('legacyLogger should log with critical', () => {
      const testLogger = diagLogLevelFilter(
        DiagLogLevel.CRITICAL,
        incompleteLogger
      );

      testLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(terminalCalledArgs, null);
      testLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(criticalCalledArgs, null);
      testLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, null);
      testLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, null);
      testLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, null);
      testLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, null);
      testLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, null);
      testLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(forcedInfoCalledArgs, null);
    });

    it('legacyLogger should log with terminal', () => {
      const testLogger = diagLogLevelFilter(
        DiagLogLevel.TERMINAL,
        incompleteLogger
      );

      testLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(terminalCalledArgs, null);
      testLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(criticalCalledArgs, null);
      testLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, null);
      testLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, null);
      testLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, null);
      testLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, null);
      testLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, null);
      testLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(forcedInfoCalledArgs, null);
    });

    it('legacyLogger should log with none', () => {
      const testLogger = diagLogLevelFilter(
        DiagLogLevel.NONE,
        incompleteLogger
      );

      testLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(terminalCalledArgs, null);
      testLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(criticalCalledArgs, null);
      testLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, null);
      testLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, null);
      testLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, null);
      testLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, null);
      testLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, null);
      testLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(forcedInfoCalledArgs, null);
    });
  });
});
