/**
 * Copyright 2019, OpenTelemetry Authors
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
import * as logger from '../../src/common/ConsoleLogger';
import { LogLevel } from '../../src/common/types';

describe('ConsoleLogger', () => {
  const origDebug = console.debug;
  const origInfo = console.info;
  const origWarn = console.warn;
  const origError = console.error;
  let debugCalled = false;
  let infoCalled = false;
  let warnCalled = false;
  let errorCalled = false;

  beforeEach(() => {
    // mock
    console.debug = () => {
      debugCalled = true;
    };
    console.info = () => {
      infoCalled = true;
    };
    console.warn = () => {
      warnCalled = true;
    };
    console.error = () => {
      errorCalled = true;
    };
  });

  afterEach(() => {
    // restore
    debugCalled = false;
    infoCalled = false;
    warnCalled = false;
    errorCalled = false;
    console.debug = origDebug;
    console.info = origInfo;
    console.warn = origWarn;
    console.error = origError;
  });

  describe('constructor', () => {
    it('should log with default level', () => {
      const consoleLogger = logger.logger();
      consoleLogger.error('error called');
      assert.ok(errorCalled);
      consoleLogger.warn('warn called');
      assert.ok(warnCalled);
      consoleLogger.info('info called');
      assert.ok(infoCalled);
      consoleLogger.debug('debug called');
      assert.ok(debugCalled);
    });

    it('should log with debug', () => {
      const consoleLogger = logger.logger(LogLevel.DEBUG);
      consoleLogger.error('error called');
      assert.ok(errorCalled);
      consoleLogger.warn('warn called');
      assert.ok(warnCalled);
      consoleLogger.info('info called');
      assert.ok(infoCalled);
      consoleLogger.debug('debug called');
      assert.ok(debugCalled);
    });

    it('should log with info', () => {
      const consoleLogger = logger.logger(LogLevel.INFO);
      consoleLogger.error('error called');
      assert.ok(errorCalled);
      consoleLogger.warn('warn called');
      assert.ok(warnCalled);
      consoleLogger.info('info called');
      assert.ok(infoCalled);
      consoleLogger.debug('debug not called');
      assert.ok(!debugCalled);
    });

    it('should log with warn', () => {
      const consoleLogger = logger.logger(LogLevel.WARN);
      consoleLogger.error('error called');
      assert.ok(errorCalled);
      consoleLogger.warn('warn called');
      assert.ok(warnCalled);
      consoleLogger.info('info not called');
      assert.ok(!infoCalled);
      consoleLogger.debug('debug not called');
      assert.ok(!debugCalled);
    });

    it('should log with error', () => {
      const consoleLogger = logger.logger(LogLevel.ERROR);
      consoleLogger.error('error called');
      assert.ok(errorCalled);
      consoleLogger.warn('warn not called');
      assert.ok(!warnCalled);
      consoleLogger.info('info not called');
      assert.ok(!infoCalled);
      consoleLogger.debug('debug not called');
      assert.ok(!debugCalled);
    });
  });
});
