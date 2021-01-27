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

describe('DiagConsoleLogger', () => {
  const origConsole = console;
  const origDebug = console.debug;
  const origInfo = console.info;
  const origWarn = console.warn;
  const origError = console.error;
  const origTrace = console.trace;
  const origLog = console.log;
  let traceCalledArgs: unknown;
  let debugCalledArgs: unknown;
  let infoCalledArgs: unknown;
  let warnCalledArgs: unknown;
  let errorCalledArgs: unknown;
  let logCalledArgs: unknown;

  beforeEach(() => {
    // mock
    console.debug = (...args: unknown[]) => {
      debugCalledArgs = args;
    };
    console.info = (...args: unknown[]) => {
      infoCalledArgs = args;
    };
    console.warn = (...args: unknown[]) => {
      warnCalledArgs = args;
    };
    console.error = (...args: unknown[]) => {
      errorCalledArgs = args;
    };
    console.log = (...args: unknown[]) => {
      logCalledArgs = args;
    };
    console.trace = (...args: unknown[]) => {
      traceCalledArgs = args;
    };
  });

  afterEach(() => {
    // restore
    debugCalledArgs = null;
    infoCalledArgs = null;
    warnCalledArgs = null;
    errorCalledArgs = null;
    logCalledArgs = null;
    traceCalledArgs = null;
    // eslint-disable-next-line no-global-assign
    console = origConsole;
    console.debug = origDebug;
    console.info = origInfo;
    console.warn = origWarn;
    console.error = origError;
    console.log = origLog;
    console.trace = origTrace;
  });

  describe('constructor', () => {
    it('should log with each call', () => {
      const consoleLogger = new DiagConsoleLogger();
      consoleLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['terminal called %s', 'param1']);
      consoleLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['critical called %s', 'param1']);
      consoleLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['error called %s', 'param1']);
      consoleLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, ['warn called %s', 'param1']);
      consoleLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, ['info called %s', 'param1']);
      consoleLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, ['debug called %s', 'param1']);
      consoleLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, ['trace called %s', 'param1']);
      consoleLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, [
        'forcedInfo called %s',
        'param1',
      ]);
    });

    it("should log even of console doesn't support debug", () => {
      (console as any).debug = undefined;
      const consoleLogger = new DiagConsoleLogger();
      consoleLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['terminal called %s', 'param1']);
      consoleLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['critical called %s', 'param1']);
      consoleLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['error called %s', 'param1']);
      consoleLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, ['warn called %s', 'param1']);
      consoleLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, ['info called %s', 'param1']);
      consoleLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, null);
      assert.deepStrictEqual(logCalledArgs, ['debug called %s', 'param1']);
      consoleLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, ['trace called %s', 'param1']);
      consoleLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, [
        'forcedInfo called %s',
        'param1',
      ]);
    });

    it('should log even if console removes debug after initialization', () => {
      const consoleLogger = new DiagConsoleLogger();
      (console as any).debug = undefined;
      consoleLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['terminal called %s', 'param1']);
      consoleLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['critical called %s', 'param1']);
      consoleLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['error called %s', 'param1']);
      consoleLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, ['warn called %s', 'param1']);
      consoleLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, ['info called %s', 'param1']);
      consoleLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, null);
      assert.deepStrictEqual(logCalledArgs, ['debug called %s', 'param1']);
      consoleLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, ['trace called %s', 'param1']);
      consoleLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, [
        'forcedInfo called %s',
        'param1',
      ]);
    });

    it("should log even of console doesn't support trace", () => {
      (console as any).trace = undefined;
      const consoleLogger = new DiagConsoleLogger();
      consoleLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['terminal called %s', 'param1']);
      consoleLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['critical called %s', 'param1']);
      consoleLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['error called %s', 'param1']);
      consoleLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, ['warn called %s', 'param1']);
      consoleLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, ['info called %s', 'param1']);
      consoleLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, ['debug called %s', 'param1']);
      consoleLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, null);
      assert.deepStrictEqual(logCalledArgs, ['trace called %s', 'param1']);
      consoleLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, [
        'forcedInfo called %s',
        'param1',
      ]);
    });

    it('should log even if console removes trace after initialization', () => {
      const consoleLogger = new DiagConsoleLogger();
      (console as any).trace = undefined;
      consoleLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['terminal called %s', 'param1']);
      consoleLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['critical called %s', 'param1']);
      consoleLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['error called %s', 'param1']);
      consoleLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, ['warn called %s', 'param1']);
      consoleLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, ['info called %s', 'param1']);
      consoleLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, ['debug called %s', 'param1']);
      consoleLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, null);
      assert.deepStrictEqual(logCalledArgs, ['trace called %s', 'param1']);
      consoleLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, [
        'forcedInfo called %s',
        'param1',
      ]);
    });

    it('should log even if console removes trace and log after initialization', () => {
      const consoleLogger = new DiagConsoleLogger();
      (console as any).trace = undefined;
      consoleLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['terminal called %s', 'param1']);
      consoleLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['critical called %s', 'param1']);
      consoleLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['error called %s', 'param1']);
      consoleLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, ['warn called %s', 'param1']);
      consoleLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, ['info called %s', 'param1']);
      consoleLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, ['debug called %s', 'param1']);
      consoleLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, null);
      assert.deepStrictEqual(logCalledArgs, ['trace called %s', 'param1']);
      consoleLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, [
        'forcedInfo called %s',
        'param1',
      ]);
    });

    it('should not throw even when console is not supported', () => {
      (console as any) = undefined;
      const consoleLogger = new DiagConsoleLogger();
      consoleLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, null);
      consoleLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, null);
      consoleLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, null);
      consoleLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, null);
      consoleLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, null);
      consoleLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, null);
      consoleLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, null);
      assert.deepStrictEqual(logCalledArgs, null);
      consoleLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, null);
    });

    it('should not throw even when console is disabled after construction', () => {
      const consoleLogger = new DiagConsoleLogger();
      (console as any) = undefined;
      consoleLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, null);
      consoleLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, null);
      consoleLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, null);
      consoleLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, null);
      consoleLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, null);
      consoleLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, null);
      consoleLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, null);
      assert.deepStrictEqual(logCalledArgs, null);
      consoleLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, null);
    });

    it('should not throw even when console is invalid after construction', () => {
      const invalidConsole = {
        debug: 1,
        warn: 2,
        error: 3,
        trace: 4,
        info: 5,
        log: 6,
      };

      const consoleLogger = new DiagConsoleLogger();
      (console as any) = invalidConsole;
      consoleLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, null);
      consoleLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, null);
      consoleLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, null);
      consoleLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, null);
      consoleLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, null);
      consoleLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, null);
      consoleLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, null);
      assert.deepStrictEqual(logCalledArgs, null);
      consoleLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, null);
    });

    it('should not throw even when console is invalid before construction', () => {
      const invalidConsole = {
        debug: 1,
        warn: 2,
        error: 3,
        trace: 4,
        info: 5,
        log: 6,
      };

      (console as any) = invalidConsole;
      const consoleLogger = new DiagConsoleLogger();
      consoleLogger.terminal('terminal called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, null);
      consoleLogger.critical('critical called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, null);
      consoleLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, null);
      consoleLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, null);
      consoleLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, null);
      consoleLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, null);
      consoleLogger.trace('trace called %s', 'param1');
      assert.deepStrictEqual(traceCalledArgs, null);
      assert.deepStrictEqual(logCalledArgs, null);
      consoleLogger.forcedInfo('forcedInfo called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, null);
    });
  });
});
