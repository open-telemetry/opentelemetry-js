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

import type { Attributes, AttributeValue } from '@opentelemetry/api';
import * as logsAPI from '@opentelemetry/api-logs';
import type { HrTime } from '@opentelemetry/api';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { Resource } from '@opentelemetry/resources';
import { hrTimeToMilliseconds, timeInputToHrTime } from '@opentelemetry/core';

import {
  LogRecordLimits,
  LogRecordProcessor,
  NoopLogRecordProcessor,
  LogRecord,
  LoggerProvider,
} from './../../src';
import { loadDefaultConfig } from '../../src/config';
import { MultiLogRecordProcessor } from '../../src/MultiLogRecordProcessor';
import { invalidAttributes, validAttributes } from './utils';

const performanceTimeOrigin: HrTime = [1, 1];

const setup = (limits?: LogRecordLimits, data?: logsAPI.LogRecord) => {
  const { forceFlushTimeoutMillis, logRecordLimits } = loadDefaultConfig();
  const config = {
    activeProcessor: new MultiLogRecordProcessor(
      [new NoopLogRecordProcessor()],
      forceFlushTimeoutMillis
    ),
    resource: Resource.default(),
    logRecordLimits: {
      attributeValueLengthLimit:
        limits?.attributeValueLengthLimit ??
        logRecordLimits.attributeValueLengthLimit,
      attributeCountLimit:
        limits?.attributeCountLimit ?? logRecordLimits.attributeCountLimit,
    },
    instrumentationScope: {
      name: 'test name',
      version: 'test version',
      schemaUrl: 'test schema url',
    },
  };
  const logRecord = new LogRecord(config, data || {});
  return { logRecord, config };
};

describe('LogRecord', () => {
  describe('constructor', () => {
    it('should create an instance', () => {
      const { logRecord } = setup();
      assert.ok(logRecord instanceof LogRecord);
    });

    it('should have a default timestamp', () => {
      const { logRecord } = setup();
      assert.ok(logRecord.time !== undefined);
      assert.ok(
        hrTimeToMilliseconds(logRecord.time) >
          hrTimeToMilliseconds(performanceTimeOrigin)
      );
    });

    it('should have a default timestamp', () => {
      const { logRecord } = setup();
      assert.ok(logRecord.time !== undefined);
      assert.ok(
        hrTimeToMilliseconds(logRecord.time) >
          hrTimeToMilliseconds(performanceTimeOrigin)
      );
    });

    it('should return ReadableLogRecord', () => {
      const logRecordData: logsAPI.LogRecord = {
        timestamp: new Date().getTime(),
        severityNumber: logsAPI.SeverityNumber.DEBUG,
        severityText: 'DEBUG',
        body: 'this is a body',
        attributes: {
          name: 'test name',
        },
        traceId: 'trance id',
        spanId: 'span id',
        traceFlags: 1,
      };
      const { logRecord, config } = setup(undefined, logRecordData);
      assert.deepStrictEqual(
        logRecord.time,
        timeInputToHrTime(logRecordData.timestamp!)
      );
      assert.strictEqual(
        logRecord.severityNumber,
        logRecordData.severityNumber
      );
      assert.strictEqual(logRecord.severityText, logRecordData.severityText);
      assert.strictEqual(logRecord.body, logRecordData.body);
      assert.deepStrictEqual(logRecord.attributes, logRecordData.attributes);
      assert.deepStrictEqual(logRecord.traceId, logRecordData.traceId);
      assert.deepStrictEqual(logRecord.spanId, logRecordData.spanId);
      assert.deepStrictEqual(logRecord.traceFlags, logRecordData.traceFlags);
      assert.deepStrictEqual(logRecord.resource, config.resource);
      assert.deepStrictEqual(
        logRecord.instrumentationScope,
        config.instrumentationScope
      );
    });

    it('should return ReadableLogRecord with attributes', () => {
      const logRecordData: logsAPI.LogRecord = {
        timestamp: new Date().getTime(),
        severityNumber: logsAPI.SeverityNumber.DEBUG,
        severityText: 'DEBUG',
        body: 'this is a body',
        attributes: {
          name: 'test name',
        },
        traceId: 'trance id',
        spanId: 'span id',
        traceFlags: 1,
      };
      const { logRecord } = setup(undefined, logRecordData);

      assert.deepStrictEqual(logRecord.attributes, { name: 'test name' });

      logRecord.setAttribute('attr1', 'value1');
      assert.deepStrictEqual(logRecord.attributes, {
        name: 'test name',
        attr1: 'value1',
      });

      logRecord.setAttributes({ attr2: 123, attr1: false });
      assert.deepStrictEqual(logRecord.attributes, {
        name: 'test name',
        attr1: false,
        attr2: 123,
      });

      logRecord.emit();
      // shouldn't add new attribute
      logRecord.setAttribute('attr3', 'value3');
      assert.deepStrictEqual(logRecord.attributes, {
        name: 'test name',
        attr1: false,
        attr2: 123,
      });
    });
  });

  describe('setAttribute', () => {
    describe('when default options set', () => {
      it('should set an attribute', () => {
        const { logRecord } = setup();
        for (const [k, v] of Object.entries(validAttributes)) {
          logRecord.setAttribute(k, v);
        }
        for (const [k, v] of Object.entries(invalidAttributes)) {
          logRecord.setAttribute(k, v as unknown as AttributeValue);
        }
        assert.deepStrictEqual(logRecord.attributes, validAttributes);
      });

      it('should be able to overwrite attributes', () => {
        const { logRecord } = setup();
        logRecord.setAttribute('overwrite', 'initial value');
        logRecord.setAttribute('overwrite', 'overwritten value');
        assert.deepStrictEqual(logRecord.attributes, {
          overwrite: 'overwritten value',
        });
      });
    });

    describe('when logRecordLimits options set', () => {
      describe('when "attributeCountLimit" option defined', () => {
        const { logRecord } = setup({ attributeCountLimit: 100 });
        for (let i = 0; i < 150; i++) {
          logRecord.setAttribute(`foo${i}`, `bar${i}`);
        }

        it('should remove / drop all remaining values after the number of values exceeds this limit', () => {
          const { attributes } = logRecord;
          assert.strictEqual(Object.keys(attributes).length, 100);
          assert.strictEqual(attributes.foo0, 'bar0');
          assert.strictEqual(attributes.foo99, 'bar99');
          assert.strictEqual(attributes.foo149, undefined);
        });
      });

      describe('when "attributeValueLengthLimit" option defined', () => {
        const { logRecord } = setup({ attributeValueLengthLimit: 5 });
        const { attributes } = logRecord;

        it('should truncate value which length exceeds this limit', () => {
          logRecord.setAttribute('attr-with-more-length', 'abcdefgh');
          assert.strictEqual(attributes['attr-with-more-length'], 'abcde');
        });

        it('should truncate value of arrays which exceeds this limit', () => {
          logRecord.setAttribute('attr-array-of-strings', [
            'abcdefgh',
            'abc',
            'abcde',
            '',
          ]);
          logRecord.setAttribute('attr-array-of-bool', [true, false]);
          assert.deepStrictEqual(attributes['attr-array-of-strings'], [
            'abcde',
            'abc',
            'abcde',
            '',
          ]);
          assert.deepStrictEqual(attributes['attr-array-of-bool'], [
            true,
            false,
          ]);
        });

        it('should not truncate value which length not exceeds this limit', () => {
          logRecord.setAttribute('attr-with-less-length', 'abc');
          assert.strictEqual(attributes['attr-with-less-length'], 'abc');
        });

        it('should return same value for non-string values', () => {
          logRecord.setAttribute('attr-non-string', true);
          assert.strictEqual(attributes['attr-non-string'], true);
        });
      });

      describe('when "attributeValueLengthLimit" option is invalid', () => {
        const { logRecord } = setup({ attributeValueLengthLimit: -5 });
        const { attributes } = logRecord;

        it('should not truncate any value', () => {
          logRecord.setAttribute('attr-not-truncate', 'abcdefgh');
          logRecord.setAttribute('attr-array-of-strings', [
            'abcdefgh',
            'abc',
            'abcde',
          ]);
          assert.deepStrictEqual(attributes['attr-not-truncate'], 'abcdefgh');
          assert.deepStrictEqual(attributes['attr-array-of-strings'], [
            'abcdefgh',
            'abc',
            'abcde',
          ]);
        });
      });
    });
  });

  describe('setAttributes', () => {
    it('should be able to set multiple attributes', () => {
      const { logRecord } = setup();
      logRecord.setAttributes(validAttributes);
      logRecord.setAttributes(invalidAttributes as unknown as Attributes);
      assert.deepStrictEqual(logRecord.attributes, validAttributes);
    });
  });

  describe('emit', () => {
    it('should be emit', () => {
      const { logRecord, config } = setup();
      const callSpy = sinon.spy(config.activeProcessor, 'onEmit');
      logRecord.emit();
      assert.ok(callSpy.called);
    });

    it('should have emitted', () => {
      const { logRecord } = setup();
      assert.strictEqual(logRecord.emitted, false);
      logRecord.emit();
      assert.strictEqual(logRecord.emitted, true);
    });

    it('should be allow emit only once', () => {
      const { logRecord, config } = setup();
      const callSpy = sinon.spy(config.activeProcessor, 'onEmit');
      logRecord.emit();
      logRecord.emit();
      assert.ok(callSpy.callCount === 1);
    });
  });

  describe('log record processor', () => {
    it('should call onEmit synchronously when log record is emitted', () => {
      let emitted = false;
      const processor: LogRecordProcessor = {
        onEmit: () => {
          emitted = true;
        },
        forceFlush: () => Promise.resolve(),
        shutdown: () => Promise.resolve(),
      };
      const provider = new LoggerProvider();
      provider.addLogRecordProcessor(processor);
      provider.getLogger('default').emit({ body: 'test' });
      assert.ok(emitted);
    });
  });
});
