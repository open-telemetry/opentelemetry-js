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

import { Logger, LogRecord, NoopLogRecordProcessor } from '../../src';
import { loadDefaultConfig } from '../../src/config';
import { MultiLogRecordProcessor } from '../../src/MultiLogRecordProcessor';

const setup = () => {
  const { forceFlushTimeoutMillis, logRecordLimits } = loadDefaultConfig();
  const logger = new Logger({
    activeProcessor: new MultiLogRecordProcessor(
      [new NoopLogRecordProcessor()],
      forceFlushTimeoutMillis
    ),
    resource: Resource.default(),
    logRecordLimits,
    instrumentationScope: {
      name: 'test name',
      version: 'test version',
      schemaUrl: 'test schema url',
    },
  });
  return { logger };
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
      const { logger } = setup();
      const callSpy = sinon.spy(LogRecord.prototype, 'emit');
      logger.emit({
        body: 'test log body',
      });
      assert.ok(callSpy.called);
    });
  });
});
