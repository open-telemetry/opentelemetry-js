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
import { Logger } from '../../src';
import {
  DiagLogger,
  diagLoggerAdapter,
  noopDiagLogger,
} from '../../src/diag/logger';
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

  let legacyLogger: Logger;

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

    legacyLogger = {
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
    };
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
    it('should log with default level', () => {
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

    it('should log with default level', () => {
      const testLogger = diagLogLevelFilter(
        DiagLogLevel.ALL,
        diagLoggerAdapter(dummyLogger)
      );

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

    it('should log with default level', () => {
      const testLogger = diagLogLevelFilter(
        DiagLogLevel.TRACE,
        diagLoggerAdapter(dummyLogger)
      );

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
      const testLogger = diagLogLevelFilter(
        DiagLogLevel.DEBUG,
        diagLoggerAdapter(dummyLogger)
      );

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
      const testLogger = diagLogLevelFilter(
        DiagLogLevel.INFO,
        diagLoggerAdapter(dummyLogger)
      );

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
      const testLogger = diagLogLevelFilter(
        DiagLogLevel.WARN,
        diagLoggerAdapter(dummyLogger)
      );

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
      const testLogger = diagLogLevelFilter(
        DiagLogLevel.ERROR,
        diagLoggerAdapter(dummyLogger)
      );

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
      const testLogger = diagLogLevelFilter(
        DiagLogLevel.CRITICAL,
        diagLoggerAdapter(dummyLogger)
      );

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
      const testLogger = diagLogLevelFilter(
        DiagLogLevel.TERMINAL,
        diagLoggerAdapter(dummyLogger)
      );

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
      const testLogger = diagLogLevelFilter(
        DiagLogLevel.NONE,
        diagLoggerAdapter(dummyLogger)
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
      assert.deepStrictEqual(forcedInfoCalledArgs, [
        'forcedInfo called %s',
        'param1',
      ]);
    });

    it('legacyLogger should log with default level', () => {
      const testLogger = diagLogLevelFilter(
        DiagLogLevel.ALL,
        diagLoggerAdapter(legacyLogger)
      );

      testLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(terminalCalledArgs, null);
      assert.deepStrictEqual(errorCalledArgs, ['terminal called %s', 'param1']);
      testLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(criticalCalledArgs, null);
      assert.deepStrictEqual(errorCalledArgs, ['critical called %s', 'param1']);
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
      assert.deepStrictEqual(debugCalledArgs, ['trace called %s', 'param1']);
      testLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(forcedInfoCalledArgs, null);
      assert.deepStrictEqual(infoCalledArgs, [
        'forcedInfo called %s',
        'param1',
      ]);
    });

    it('legacyLogger should log with default level', () => {
      const testLogger = diagLogLevelFilter(
        DiagLogLevel.TRACE,
        diagLoggerAdapter(legacyLogger)
      );

      testLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(terminalCalledArgs, null);
      assert.deepStrictEqual(errorCalledArgs, ['terminal called %s', 'param1']);
      testLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(criticalCalledArgs, null);
      assert.deepStrictEqual(errorCalledArgs, ['critical called %s', 'param1']);
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
      assert.deepStrictEqual(debugCalledArgs, ['trace called %s', 'param1']);
      testLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(forcedInfoCalledArgs, null);
      assert.deepStrictEqual(infoCalledArgs, [
        'forcedInfo called %s',
        'param1',
      ]);
    });

    it('legacyLogger should log with debug', () => {
      const testLogger = diagLogLevelFilter(
        DiagLogLevel.DEBUG,
        diagLoggerAdapter(legacyLogger)
      );

      testLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(terminalCalledArgs, null);
      assert.deepStrictEqual(errorCalledArgs, ['terminal called %s', 'param1']);
      testLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(criticalCalledArgs, null);
      assert.deepStrictEqual(errorCalledArgs, ['critical called %s', 'param1']);
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
      assert.deepStrictEqual(infoCalledArgs, [
        'forcedInfo called %s',
        'param1',
      ]);
    });

    it('legacyLogger should log with info', () => {
      const testLogger = diagLogLevelFilter(
        DiagLogLevel.INFO,
        diagLoggerAdapter(legacyLogger)
      );

      testLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(terminalCalledArgs, null);
      assert.deepStrictEqual(errorCalledArgs, ['terminal called %s', 'param1']);
      testLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(criticalCalledArgs, null);
      assert.deepStrictEqual(errorCalledArgs, ['critical called %s', 'param1']);
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
      assert.deepStrictEqual(infoCalledArgs, [
        'forcedInfo called %s',
        'param1',
      ]);
    });

    it('legacyLogger should log with warning', () => {
      const testLogger = diagLogLevelFilter(
        DiagLogLevel.WARN,
        diagLoggerAdapter(legacyLogger)
      );

      testLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(terminalCalledArgs, null);
      assert.deepStrictEqual(errorCalledArgs, ['terminal called %s', 'param1']);
      testLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(criticalCalledArgs, null);
      assert.deepStrictEqual(errorCalledArgs, ['critical called %s', 'param1']);
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
      assert.deepStrictEqual(infoCalledArgs, [
        'forcedInfo called %s',
        'param1',
      ]);
    });

    it('legacyLogger should log with error', () => {
      const testLogger = diagLogLevelFilter(
        DiagLogLevel.ERROR,
        diagLoggerAdapter(legacyLogger)
      );

      testLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(terminalCalledArgs, null);
      assert.deepStrictEqual(errorCalledArgs, ['terminal called %s', 'param1']);
      testLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(criticalCalledArgs, null);
      assert.deepStrictEqual(errorCalledArgs, ['critical called %s', 'param1']);
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
      assert.deepStrictEqual(infoCalledArgs, [
        'forcedInfo called %s',
        'param1',
      ]);
    });

    it('legacyLogger should log with critical', () => {
      const testLogger = diagLogLevelFilter(
        DiagLogLevel.CRITICAL,
        diagLoggerAdapter(legacyLogger)
      );

      testLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(terminalCalledArgs, null);
      assert.deepStrictEqual(errorCalledArgs, ['terminal called %s', 'param1']);
      testLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(criticalCalledArgs, null);
      assert.deepStrictEqual(errorCalledArgs, ['critical called %s', 'param1']);
      testLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['critical called %s', 'param1']);
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
      assert.deepStrictEqual(infoCalledArgs, [
        'forcedInfo called %s',
        'param1',
      ]);
    });

    it('legacyLogger should log with terminal', () => {
      const testLogger = diagLogLevelFilter(
        DiagLogLevel.TERMINAL,
        diagLoggerAdapter(legacyLogger)
      );

      testLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(terminalCalledArgs, null);
      assert.deepStrictEqual(errorCalledArgs, ['terminal called %s', 'param1']);
      testLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(criticalCalledArgs, null);
      testLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['terminal called %s', 'param1']);
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
      assert.deepStrictEqual(infoCalledArgs, [
        'forcedInfo called %s',
        'param1',
      ]);
    });

    it('legacyLogger should log with none', () => {
      const testLogger = diagLogLevelFilter(
        DiagLogLevel.NONE,
        diagLoggerAdapter(legacyLogger)
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
      assert.deepStrictEqual(infoCalledArgs, [
        'forcedInfo called %s',
        'param1',
      ]);
    });

    it("validate adapter with null doesn't throw", () => {
      const testLogger = diagLoggerAdapter(null);
      assert.strictEqual(testLogger, null);
    });

    it("validate adapter with undefined doesn't throw", () => {
      const testLogger = diagLoggerAdapter(undefined);
      assert.strictEqual(testLogger, null);
    });

    it("validate adapter with null doesn't throw", () => {
      const testLogger = diagLogLevelFilter(
        DiagLogLevel.ALL,
        diagLoggerAdapter(null)
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
      assert.deepStrictEqual(infoCalledArgs, null);
    });

    it("validate with null doesn't throw", () => {
      const testLogger = diagLogLevelFilter(DiagLogLevel.ALL, null);

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
      assert.deepStrictEqual(infoCalledArgs, null);
    });
    it("validate adapter with undefined doesn't throw", () => {
      const testLogger = diagLogLevelFilter(
        DiagLogLevel.ALL,
        diagLoggerAdapter(undefined)
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
      assert.deepStrictEqual(infoCalledArgs, null);
    });

    it("validate with undefined doesn't throw", () => {
      const testLogger = diagLogLevelFilter(DiagLogLevel.ALL, undefined);

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
      assert.deepStrictEqual(infoCalledArgs, null);
    });

    it('should not throw even when legacy logger is invalid', () => {
      const invalidConsole = {
        debug: 1,
        warn: 2,
        error: 3,
        trace: 4,
        info: 5,
        log: 6,
      };

      const testLogger = diagLogLevelFilter(
        DiagLogLevel.ALL,
        diagLoggerAdapter(invalidConsole as any)
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
      assert.deepStrictEqual(infoCalledArgs, null);
    });

    it('should not throw even when DiagLogger is invalid', () => {
      const invalidConsole = {
        debug: 1,
        warn: 2,
        error: 3,
        trace: 4,
        info: 5,
        log: 6,
      };

      const testLogger = diagLogLevelFilter(
        DiagLogLevel.ALL,
        invalidConsole as any
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
      assert.deepStrictEqual(infoCalledArgs, null);
    });

    it('A Noop logger should implement all functions and not throw when called', () => {
      const testLogger = noopDiagLogger();

      assert.ok(typeof testLogger.terminal, 'function');
      testLogger.terminal('terminal called %s', 'param1');
      assert.ok(typeof testLogger.critical, 'function');
      testLogger.critical('critical called %s', 'param1');
      assert.ok(typeof testLogger.error, 'function');
      testLogger.error('error called %s', 'param1');
      assert.ok(typeof testLogger.warn, 'function');
      testLogger.warn('warn called %s', 'param1');
      assert.ok(typeof testLogger.info, 'function');
      testLogger.info('info called %s', 'param1');
      assert.ok(typeof testLogger.debug, 'function');
      testLogger.debug('debug called %s', 'param1');
      assert.ok(typeof testLogger.trace, 'function');
      testLogger.trace('trace called %s', 'param1');
      assert.ok(typeof testLogger.forcedInfo, 'function');
      testLogger.forcedInfo('forcedInfo called %s', 'param1');
    });
  });
});
