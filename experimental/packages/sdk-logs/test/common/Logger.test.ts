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
import * as sinon from 'sinon';

import { LogRecord, Logger, LoggerConfig, LoggerProvider } from '../../src';
import { loadDefaultConfig } from '../../src/config';
import { context } from '@opentelemetry/api';

const setup = (loggerConfig: LoggerConfig = {}) => {
  const logger = new Logger(
    {
      name: 'test name',
      version: 'test version',
      schemaUrl: 'test schema url',
    },
    loggerConfig,
    new LoggerProvider()
  );
  return { logger };
};

describe('Logger', () => {
  describe('constructor', () => {
    it('should create an instance', () => {
      const { logger } = setup();
      assert.ok(logger instanceof Logger);
    });

    it('should a default value with config.includeTraceContext', () => {
      const { logger } = setup();
      assert.ok(
        logger['_loggerConfig'].includeTraceContext ===
          loadDefaultConfig().includeTraceContext
      );
    });
  });

  describe('emit', () => {
    it('should emit a logRecord instance', () => {
      const { logger } = setup();
      const callSpy = sinon.spy(logger.getActiveLogRecordProcessor(), 'onEmit');
      logger.emit({
        body: 'test log body',
      });
      assert.ok(callSpy.called);
    });

    it('should make log record instance readonly after emit it', () => {
      const { logger } = setup();
      const makeOnlySpy = sinon.spy(LogRecord.prototype, 'makeReadonly');
      logger.emit({
        body: 'test log body',
      });
      assert.ok(makeOnlySpy.called);
    });

    it('should emit with current Context when includeTraceContext is true', () => {
      const { logger } = setup({ includeTraceContext: true });
      const callSpy = sinon.spy(logger.getActiveLogRecordProcessor(), 'onEmit');
      logger.emit({
        body: 'test log body',
      });
      assert.ok(callSpy.calledWith(sinon.match.any, context.active()));
    });

    it('should emit with empty Context when includeTraceContext is false', () => {
      const { logger } = setup({ includeTraceContext: false });
      const callSpy = sinon.spy(logger.getActiveLogRecordProcessor(), 'onEmit');
      logger.emit({
        body: 'test log body',
      });
      assert.ok(callSpy.calledWith(sinon.match.any, undefined));
    });
  });
});
