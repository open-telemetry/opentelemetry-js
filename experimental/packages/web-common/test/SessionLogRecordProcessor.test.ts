/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { SessionLogRecordProcessor } from '../src/SessionLogRecordProcessor';
import {
  InMemoryLogRecordExporter,
  LoggerProvider,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs';

describe('SessionLogRecordProcessor', function () {
  it('adds session.id attribute', function () {
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
    const provider = new LoggerProvider({
      processors: [processor, new SimpleLogRecordProcessor(exporter)],
    });

    const logger = provider.getLogger('session-testing');
    logger.emit({ body: 'test-body' });

    const logRecord = exporter.getFinishedLogRecords()[0];
    assert.deepEqual(logRecord.attributes, expectedAttributes);
  });

  it('does not add session.id attribute when there is no session', function () {
    const sessionProvider = {
      getSessionId: () => {
        return null;
      },
    };

    const exporter = new InMemoryLogRecordExporter();
    const processor = new SessionLogRecordProcessor(sessionProvider);
    const provider = new LoggerProvider({
      processors: [processor, new SimpleLogRecordProcessor(exporter)],
    });

    const logger = provider.getLogger('session-testing');
    logger.emit({ body: 'test-body' });

    const logRecord = exporter.getFinishedLogRecords()[0];
    assert.deepEqual(logRecord.attributes, {});
  });

  it('does not add session.id attribute when there is no provider', function () {
    const exporter = new InMemoryLogRecordExporter();
    const processor = new SessionLogRecordProcessor(null as any);
    const provider = new LoggerProvider({
      processors: [processor, new SimpleLogRecordProcessor(exporter)],
    });

    const logger = provider.getLogger('session-testing');
    logger.emit({ body: 'test-body' });

    const logRecord = exporter.getFinishedLogRecords()[0];
    assert.deepEqual(logRecord.attributes, {});
  });

  it('forceFlush is a no-op and does not throw error', async function () {
    const processor = new SessionLogRecordProcessor({
      getSessionId: () => {
        return null;
      },
    });
    await processor.forceFlush();
  });

  it('shutdown is a no-op and does not throw error', async function () {
    const processor = new SessionLogRecordProcessor({
      getSessionId: () => {
        return null;
      },
    });
    await processor.shutdown();
  });
});
