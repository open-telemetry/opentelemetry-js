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
import { Resource } from '@opentelemetry/resources';

import { Logger, LogRecord } from '../../src';
import { DEFAULT_EVENT_DOMAIN, loadDefaultConfig } from '../../src/config';
import { MultiLogRecordProcessor } from '../../src/MultiLogRecordProcessor';
import { EVENT_LOGS_ATTRIBUTES } from '../../src/Attributes';

const setup = (eventDomain?: string) => {
  const { forceFlushTimeoutMillis, logRecordLimits } = loadDefaultConfig();
  const logger = new Logger({
    eventDomain,
    // @ts-expect-error
    loggerSharedState: {
      activeProcessor: new MultiLogRecordProcessor(forceFlushTimeoutMillis),
      resource: Resource.default(),
      logRecordLimits,
    },
    instrumentationScope: {
      name: 'test name',
      version: 'test version',
      schemaUrl: 'test schema url',
    },
  });
  return { logger };
};

describe('Logger', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      const { logger } = setup();
      assert.ok(logger instanceof Logger);
    });
  });

  describe('emitLogRecord', () => {
    it('should emit log record', () => {
      const emitSpy = sinon.stub(LogRecord.prototype, 'emit');
      const { logger } = setup();
      logger.emitLogRecord({});
      assert.strictEqual(emitSpy.callCount, 1);
    });
  });

  describe('emitEvent', () => {
    it('should emit log record with event attributes', () => {
      const emitSpy = sinon.stub(LogRecord.prototype, 'emit');
      const setAttributesSpy = sinon.stub(LogRecord.prototype, 'setAttributes');

      const eventName = 'test event name';
      const eventDomain = 'test event domain';

      const { logger } = setup(eventDomain);
      logger.emitEvent({ name: eventName });

      const eventAttributes = {
        [EVENT_LOGS_ATTRIBUTES.name]: eventName,
        [EVENT_LOGS_ATTRIBUTES.domain]: eventDomain,
      };

      assert.strictEqual(emitSpy.callCount, 1);
      assert.deepEqual(setAttributesSpy.secondCall.args[0], eventAttributes);
    });

    it('should have default eventDomain if not pass', () => {
      sinon.stub(LogRecord.prototype, 'emit');
      const setAttributesSpy = sinon.stub(LogRecord.prototype, 'setAttributes');

      const eventName = 'test event name';
      const { logger } = setup();
      logger.emitEvent({ name: eventName });

      assert.strictEqual(
        setAttributesSpy.secondCall.args[0][EVENT_LOGS_ATTRIBUTES.domain],
        DEFAULT_EVENT_DOMAIN
      );
    });

    it('should use eventDomain if LogEvent has eventDomain', () => {
      sinon.stub(LogRecord.prototype, 'emit');
      const setAttributesSpy = sinon.stub(LogRecord.prototype, 'setAttributes');

      const eventName = 'test event name';
      const loggerEventDomain = 'test event domain in logger';
      const emitEventDomain = 'test event domain in emitEvent';

      const { logger } = setup(loggerEventDomain);
      logger.emitEvent({ name: eventName, domain: emitEventDomain });

      assert.strictEqual(
        setAttributesSpy.secondCall.args[0][EVENT_LOGS_ATTRIBUTES.domain],
        emitEventDomain
      );
    });
  });
});
