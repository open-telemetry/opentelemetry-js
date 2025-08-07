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

import { LoggerProvider, NoopLogRecordProcessor } from '../../src';
import { LogRecordImpl } from '../../src/LogRecordImpl';
import { ROOT_CONTEXT, TraceFlags, context, trace } from '@opentelemetry/api';
import { LogRecord as ApiLogRecord } from '@opentelemetry/api-logs';
import { Logger } from '../../src/Logger';

const setup = () => {
  const logProcessor = new NoopLogRecordProcessor();
  const loggerProvider = new LoggerProvider({ processors: [logProcessor] });
  const logger = loggerProvider.getLogger('test name', 'test version', {
    schemaUrl: 'test schema url',
  }) as Logger;
  return { logger, logProcessor };
};

describe('Logger', () => {
  describe('constructor', () => {
    it('should create an instance', () => {
      const { logger } = setup();
      assert.ok(logger instanceof Logger);
    });
  });

  describe('emit', () => {
    it('should emit a logRecord instance', () => {
      const { logger, logProcessor } = setup();
      const callSpy = sinon.spy(logProcessor, 'onEmit');
      logger.emit({
        body: 'test log body',
      });
      assert.ok(callSpy.called);
    });

    it('should make log record instance readonly after emit it', () => {
      const { logger } = setup();
      const makeOnlySpy = sinon.spy(LogRecordImpl.prototype, '_makeReadonly');
      logger.emit({
        body: 'test log body',
      });
      assert.ok(makeOnlySpy.called);
    });

    it('should emit with current Context', () => {
      const { logger, logProcessor } = setup();
      const callSpy = sinon.spy(logProcessor, 'onEmit');
      logger.emit({
        body: 'test log body',
      });
      assert.ok(callSpy.calledWith(sinon.match.any, context.active()));
    });

    it('should emit with Context specified in LogRecord', () => {
      const { logger, logProcessor } = setup();
      const spanContext = {
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        spanId: '6e0c63257de34c92',
        traceFlags: TraceFlags.SAMPLED,
      };
      const activeContext = trace.setSpanContext(ROOT_CONTEXT, spanContext);
      const logRecordData: ApiLogRecord = {
        context: activeContext,
      };

      const callSpy = sinon.spy(logProcessor, 'onEmit');
      logger.emit(logRecordData);
      assert.ok(callSpy.calledWith(sinon.match.any, activeContext));
    });
  });
});
