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
import { NonRecordingEvent } from '../../src/NonRecordingEvent';
import { NonRecordingLogRecord } from '../../src/NonRecordingLogRecord';
import { NoopLogger } from '../../src/NoopLogger';
import { NoopLoggerProvider } from '../../src/NoopLoggerProvider';

describe('NoopLogger', () => {
  it('constructor should not crash', () => {
    const logger = new NoopLoggerProvider().getLogger('test-noop');
    assert(logger instanceof NoopLogger);
  });

  it('calling emit should not crash', () => {
    const logger = new NoopLoggerProvider().getLogger('test-noop');
    const logRecord = new NonRecordingLogRecord();
    logger.emit(logRecord);
  });

  it('calling emitEvent should not crash', () => {
    const logger = new NoopLoggerProvider().getLogger('test-noop');
    logger.emitEvent('test-event');
  });

  it('calling createLogRecord should not crash', () => {
    const logger = new NoopLoggerProvider().getLogger('test-noop');
    const logRecord = logger.createLogRecord();
    assert(logRecord instanceof NonRecordingLogRecord);
  });

  it('calling createEvent should not crash', () => {
    const logger = new NoopLoggerProvider().getLogger('test-noop');
    const event = logger.createEvent('test-event', 'test-domain');
    assert(event instanceof NonRecordingEvent);
  });
});
