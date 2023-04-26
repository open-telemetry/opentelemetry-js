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

import type { LogRecordProcessor, ReadableLogRecord } from '../../src';
import {
  LoggerProvider,
  InMemoryLogRecordExporter,
  SimpleLogRecordProcessor,
} from './../../src';
import { loadDefaultConfig } from '../../src/config';
import { MultiLogRecordProcessor } from './../../src/MultiLogRecordProcessor';
import { assertRejects } from '../test-utils';

class TestProcessor implements LogRecordProcessor {
  logRecords: ReadableLogRecord[] = [];
  onEmit(logRecord: ReadableLogRecord): void {
    this.logRecords.push(logRecord);
  }
  shutdown(): Promise<void> {
    this.logRecords = [];
    return Promise.resolve();
  }
  forceFlush(): Promise<void> {
    return Promise.resolve();
  }
}

const setup = (processors: LogRecordProcessor[] = []) => {
  const { forceFlushTimeoutMillis } = loadDefaultConfig();
  const multiProcessor = new MultiLogRecordProcessor(
    processors,
    forceFlushTimeoutMillis
  );
  return { multiProcessor, forceFlushTimeoutMillis };
};

describe('MultiLogRecordProcessor', () => {
  describe('constructor', () => {
    it('should create an instance', () => {
      assert.ok(setup().multiProcessor instanceof MultiLogRecordProcessor);
    });
  });

  describe('onEmit', () => {
    it('should handle empty log record processor', () => {
      const { multiProcessor } = setup();
      const provider = new LoggerProvider();
      provider.addLogRecordProcessor(multiProcessor);
      const logger = provider.getLogger('default');
      logger.emit({ body: 'one' });
      multiProcessor.shutdown();
    });

    it('should handle one log record processor', () => {
      const processor1 = new TestProcessor();
      const { multiProcessor } = setup([processor1]);
      const provider = new LoggerProvider();
      provider.addLogRecordProcessor(multiProcessor);
      const logger = provider.getLogger('default');
      assert.strictEqual(processor1.logRecords.length, 0);

      logger.emit({ body: 'one' });
      assert.strictEqual(processor1.logRecords.length, 1);
      multiProcessor.shutdown();
    });

    it('should handle two log record processor', async () => {
      const processor1 = new TestProcessor();
      const processor2 = new TestProcessor();
      const { multiProcessor } = setup([processor1, processor2]);
      const provider = new LoggerProvider();
      provider.addLogRecordProcessor(multiProcessor);
      const logger = provider.getLogger('default');

      assert.strictEqual(processor1.logRecords.length, 0);
      assert.strictEqual(
        processor1.logRecords.length,
        processor2.logRecords.length
      );

      logger.emit({ body: 'one' });
      assert.strictEqual(processor1.logRecords.length, 1);
      assert.strictEqual(
        processor1.logRecords.length,
        processor2.logRecords.length
      );

      await multiProcessor.shutdown();
      assert.strictEqual(processor1.logRecords.length, 0);
      assert.strictEqual(
        processor1.logRecords.length,
        processor2.logRecords.length
      );
    });
  });

  describe('forceFlush', () => {
    it('should force log record processors to flush', () => {
      let flushed = false;
      const processor: LogRecordProcessor = {
        forceFlush: () => {
          flushed = true;
          return Promise.resolve();
        },
        onEmit: () => {},
        shutdown: () => {
          return Promise.resolve();
        },
      };
      const { multiProcessor } = setup([processor]);
      multiProcessor.forceFlush();
      assert.ok(flushed);
    });

    it('should wait for all log record processors to finish flushing', done => {
      let flushed = 0;
      const processor1 = new SimpleLogRecordProcessor(
        new InMemoryLogRecordExporter()
      );
      const processor2 = new SimpleLogRecordProcessor(
        new InMemoryLogRecordExporter()
      );

      const spy1 = sinon.stub(processor1, 'forceFlush').callsFake(() => {
        flushed++;
        return Promise.resolve();
      });
      const spy2 = sinon.stub(processor2, 'forceFlush').callsFake(() => {
        flushed++;
        return Promise.resolve();
      });

      const { multiProcessor } = setup([processor1, processor2]);
      multiProcessor.forceFlush().then(() => {
        sinon.assert.calledOnce(spy1);
        sinon.assert.calledOnce(spy2);
        assert.strictEqual(flushed, 2);
        done();
      });
    });

    it('should throw error if either time out', async () => {
      const processor: LogRecordProcessor = {
        forceFlush: () =>
          new Promise<void>(resolve => {
            setTimeout(() => {
              resolve();
            }, forceFlushTimeoutMillis + 1000);
          }),
        onEmit: () => {},
        shutdown: () => {
          return Promise.resolve();
        },
      };

      const clock = sinon.useFakeTimers();
      const { multiProcessor, forceFlushTimeoutMillis } = setup([
        processor,
        new TestProcessor(),
      ]);
      const res = multiProcessor.forceFlush();
      clock.tick(forceFlushTimeoutMillis + 1000);
      clock.restore();
      await assertRejects(res, /Operation timed out/);
    });
  });

  describe('shutdown', () => {
    it('should export log records on manual shutdown from two log record processor', async () => {
      const processor1 = new TestProcessor();
      const processor2 = new TestProcessor();
      const { multiProcessor } = setup([processor1, processor2]);
      const provider = new LoggerProvider();
      provider.addLogRecordProcessor(multiProcessor);
      const logger = provider.getLogger('default');

      assert.strictEqual(processor1.logRecords.length, 0);
      assert.strictEqual(
        processor1.logRecords.length,
        processor2.logRecords.length
      );

      logger.emit({ body: 'one' });
      assert.strictEqual(processor1.logRecords.length, 1);
      assert.strictEqual(
        processor1.logRecords.length,
        processor2.logRecords.length
      );

      await provider.shutdown();
      assert.strictEqual(processor1.logRecords.length, 0);
      assert.strictEqual(
        processor1.logRecords.length,
        processor2.logRecords.length
      );
    });
  });
});
