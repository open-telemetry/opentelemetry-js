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

import type { ReadableLogRecord } from '../../src';
import { loadDefaultConfig } from '../../src/config';
import { MultiLogRecordProcessor } from './../../src/MultiLogRecordProcessor';

const setup = () => {
  const { forceFlushTimeoutMillis } = loadDefaultConfig();
  const multiLogRecordProcessor = new MultiLogRecordProcessor(
    forceFlushTimeoutMillis
  );
  return { multiLogRecordProcessor, forceFlushTimeoutMillis };
};

describe('MultiLogRecordProcessor', () => {
  describe('constructor', () => {
    it('should contruct an instance', () => {
      assert.ok(
        setup().multiLogRecordProcessor instanceof MultiLogRecordProcessor
      );
    });
  });

  describe('addLogRecordProcessor', () => {
    it('should add logRecord processor', () => {
      const { multiLogRecordProcessor } = setup();
      // @ts-expect-error
      assert.ok(multiLogRecordProcessor._processors.length === 0);
      // @ts-expect-error
      const logRecordProcessor: LogRecordProcessor = {};
      multiLogRecordProcessor.addLogRecordProcessor(logRecordProcessor);
      // @ts-expect-error
      assert.ok(multiLogRecordProcessor._processors.length === 1);
    });
  });

  describe('forceFlush', () => {
    it('should force flush all logRecord processors', async () => {
      const { multiLogRecordProcessor } = setup();
      const forceFlushSpy = sinon.spy();
      // @ts-expect-error
      const logRecordProcessor: LogRecordProcessor = {
        forceFlush: forceFlushSpy,
      };
      multiLogRecordProcessor.addLogRecordProcessor(logRecordProcessor);
      multiLogRecordProcessor.addLogRecordProcessor(logRecordProcessor);
      await multiLogRecordProcessor.forceFlush();
      assert.strictEqual(forceFlushSpy.callCount, 2);
    });

    it('should throw error if either time out', async () => {
      const clock = sinon.useFakeTimers();
      const { multiLogRecordProcessor, forceFlushTimeoutMillis } = setup();
      // @ts-expect-error
      assert.ok(multiLogRecordProcessor._processors.length === 0);
      // @ts-expect-error
      const logRecordProcessorWithTimeout: LogRecordProcessor = {
        forceFlush: () =>
          new Promise<void>(resolve => {
            setTimeout(() => {
              resolve();
            }, forceFlushTimeoutMillis + 1000);
          }),
      };
      // @ts-expect-error
      const logRecordProcessor: LogRecordProcessor = {
        forceFlush: () => Promise.resolve(),
      };
      multiLogRecordProcessor.addLogRecordProcessor(
        logRecordProcessorWithTimeout
      );
      multiLogRecordProcessor.addLogRecordProcessor(logRecordProcessor);
      const res = multiLogRecordProcessor.forceFlush();
      clock.tick(forceFlushTimeoutMillis + 1000);
      clock.restore();
      await assert.rejects(res, /Operation timed out/);
    });
  });

  describe('onEmit', () => {
    it('should onEmit all logRecord processors', async () => {
      const { multiLogRecordProcessor } = setup();
      const onEmitSpy = sinon.spy();
      // @ts-expect-error
      const logRecordProcessor: LogRecordProcessor = {
        onEmit: onEmitSpy,
      };
      multiLogRecordProcessor.addLogRecordProcessor(logRecordProcessor);
      multiLogRecordProcessor.addLogRecordProcessor(logRecordProcessor);
      // @ts-expect-error
      const logRecord: ReadableLogRecord = {};
      multiLogRecordProcessor.onEmit(logRecord);
      assert.strictEqual(onEmitSpy.callCount, 2);
    });
  });

  describe('shutdown', () => {
    it('should shutdown all logRecord processors', async () => {
      const { multiLogRecordProcessor } = setup();
      const shutdownSpy = sinon.spy();
      // @ts-expect-error
      const logRecordProcessor: LogRecordProcessor = {
        shutdown: shutdownSpy,
      };
      multiLogRecordProcessor.addLogRecordProcessor(logRecordProcessor);
      multiLogRecordProcessor.addLogRecordProcessor(logRecordProcessor);
      multiLogRecordProcessor.shutdown();
      assert.strictEqual(shutdownSpy.callCount, 2);
    });
  });
});
