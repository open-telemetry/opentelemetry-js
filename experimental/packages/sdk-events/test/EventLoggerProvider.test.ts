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
import { EventLogger, EventLoggerProvider } from '../src';
import { TestLogger, TestLoggerProvider } from './utils';
import { logs } from '@opentelemetry/api-logs';
import sinon = require('sinon');

describe('EventLoggerProvider', () => {
  describe('getLogger', () => {
    beforeEach(() => {
      // clear global LoggerProvider
      logs.disable();
    });

    it('returns an instance of EventLogger', () => {
      const provider = new EventLoggerProvider();
      const logger = provider.getEventLogger('logger name');
      assert.ok(logger instanceof EventLogger);
    });

    it('uses logger from EventLoggerProviderConfig', () => {
      const globalLoggerProvider = new TestLoggerProvider(new TestLogger());
      logs.setGlobalLoggerProvider(globalLoggerProvider);
      const globalLoggerProviderSpy = sinon.spy(
        globalLoggerProvider,
        'getLogger'
      );

      const loggerProvider = new TestLoggerProvider(new TestLogger());
      const loggerProviderSpy = sinon.spy(loggerProvider, 'getLogger');

      const provider = new EventLoggerProvider({
        loggerProvider: loggerProvider,
      });

      const eventLogger = provider.getEventLogger('logger name');
      assert.ok(eventLogger instanceof EventLogger);
      loggerProviderSpy.calledOnceWithExactly('logger name');
      assert.ok(!globalLoggerProviderSpy.called);
    });

    it('uses delegate logger from global LoggerProvider as a fall back', () => {
      const globalLoggerProvider = new TestLoggerProvider(new TestLogger());
      logs.setGlobalLoggerProvider(globalLoggerProvider);
      const globalLoggerProviderSpy = sinon.spy(
        globalLoggerProvider,
        'getLogger'
      );

      const provider = new EventLoggerProvider();

      const eventLogger = provider.getEventLogger('logger name');
      assert.ok(eventLogger instanceof EventLogger);
      globalLoggerProviderSpy.calledOnceWithExactly('logger name');
    });
  });
});
