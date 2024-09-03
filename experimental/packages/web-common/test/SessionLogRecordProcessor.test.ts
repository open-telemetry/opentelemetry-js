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
import { SessionLogRecordProcessor } from '../src/SessionLogRecordProcessor';
import {
  InMemoryLogRecordExporter,
  LoggerProvider,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs';

describe('SessionLogRecordProcessor', () => {
  it('adds session.id attribute', () => {
    const expectedAttributes = {
      'session.id': '12345678',
    };

    const sessionProvider = {
      getSessionId: () => {
        return '12345678';
      },
    };

    const exporter = new InMemoryLogRecordExporter();
    const processor = new SessionLogRecordProcessor(sessionProvider);
    const provider = new LoggerProvider();
    provider.addLogRecordProcessor(processor);
    provider.addLogRecordProcessor(new SimpleLogRecordProcessor(exporter));

    const logger = provider.getLogger('session-testing');
    logger.emit({ body: 'test-body' });

    const logRecord = exporter.getFinishedLogRecords()[0];
    assert.deepEqual(logRecord.attributes, expectedAttributes);
  });

  it('does not add session.id attribute when there is no session', () => {
    const sessionProvider = {
      getSessionId: () => {
        return null;
      },
    };

    const exporter = new InMemoryLogRecordExporter();
    const processor = new SessionLogRecordProcessor(sessionProvider);
    const provider = new LoggerProvider();
    provider.addLogRecordProcessor(processor);
    provider.addLogRecordProcessor(new SimpleLogRecordProcessor(exporter));

    const logger = provider.getLogger('session-testing');
    logger.emit({ body: 'test-body' });

    const logRecord = exporter.getFinishedLogRecords()[0];
    assert.deepEqual(logRecord.attributes, {});
  });

  it('forceFlush is a no-op and does not throw error', async () => {
    const processor = new SessionLogRecordProcessor({
      getSessionId: () => {
        return null;
      },
    });

    await processor
      .forceFlush()
      .then(() => assert.ok(true))
      .catch(() =>
        assert.fail('forceFlush threw an error when it should not have')
      );
  });

  it('shutdown is a no-op and does not throw error', async () => {
    const processor = new SessionLogRecordProcessor({
      getSessionId: () => {
        return null;
      },
    });

    await processor
      .shutdown()
      .then(() => assert.ok(true))
      .catch(() =>
        assert.fail('shutdown threw an error when it should not have')
      );
  });
});
