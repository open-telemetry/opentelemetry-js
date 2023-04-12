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

import * as sinon from 'sinon';
import * as assert from 'assert';
import {
  Attributes,
  AttributeValue,
  diag,
  ROOT_CONTEXT,
  trace,
  TraceFlags,
} from '@opentelemetry/api';
import * as logsAPI from '@opentelemetry/api-logs';
import type { HrTime } from '@opentelemetry/api';
import { hrTimeToMilliseconds, timeInputToHrTime } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';

import {
  LogRecordLimits,
  LogRecordProcessor,
  LogRecord,
  Logger,
  LoggerProvider,
} from './../../src';
import { invalidAttributes, validAttributes } from './utils';

const performanceTimeOrigin: HrTime = [1, 1];

const setup = (limits?: LogRecordLimits, data?: logsAPI.LogRecord) => {
  const instrumentationScope = {
    name: 'test name',
    version: 'test version',
    schemaUrl: 'test schema url',
  };
  const resource = Resource.default();
  const loggerProvider = new LoggerProvider({ resource });
  const logger = new Logger(
    instrumentationScope,
    {
      logRecordLimits: limits,
    },
    loggerProvider
  );
  const logRecord = new LogRecord(logger, data || {});
  return { logger, logRecord, instrumentationScope, resource };
};

describe('LogRecord', () => {
  describe('constructor', () => {
    it('should create an instance', () => {
      const { logRecord } = setup();
      assert.ok(logRecord instanceof LogRecord);
    });

    it('should have a default timestamp', () => {
      const { logRecord } = setup();
      assert.ok(logRecord.hrTime !== undefined);
      assert.ok(
        hrTimeToMilliseconds(logRecord.hrTime) >
          hrTimeToMilliseconds(performanceTimeOrigin)
      );
    });

    it('should return LogRecord', () => {
      const spanContext = {
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        spanId: '6e0c63257de34c92',
        traceFlags: TraceFlags.SAMPLED,
      };
      const activeContext = trace.setSpanContext(ROOT_CONTEXT, spanContext);

      const logRecordData: logsAPI.LogRecord = {
        timestamp: new Date().getTime(),
        severityNumber: logsAPI.SeverityNumber.DEBUG,
        severityText: 'DEBUG',
        body: 'this is a body',
        attributes: {
          name: 'test name',
        },
        context: activeContext,
      };
      const { logRecord, resource, instrumentationScope } = setup(
        undefined,
        logRecordData
      );
      assert.deepStrictEqual(
        logRecord.hrTime,
        timeInputToHrTime(logRecordData.timestamp!)
      );
      assert.strictEqual(
        logRecord.severityNumber,
        logRecordData.severityNumber
      );
      assert.strictEqual(logRecord.severityText, logRecordData.severityText);
      assert.strictEqual(logRecord.body, logRecordData.body);
      assert.deepStrictEqual(logRecord.attributes, logRecordData.attributes);
      assert.strictEqual(logRecord.spanContext?.traceId, spanContext.traceId);
      assert.strictEqual(logRecord.spanContext?.spanId, spanContext.spanId);
      assert.strictEqual(
        logRecord.spanContext?.traceFlags,
        spanContext.traceFlags
      );
      assert.deepStrictEqual(logRecord.resource, resource);
      assert.deepStrictEqual(
        logRecord.instrumentationScope,
        instrumentationScope
      );
    });

    it('should return LogRecord with attributes', () => {
      const logRecordData: logsAPI.LogRecord = {
        timestamp: new Date().getTime(),
        severityNumber: logsAPI.SeverityNumber.DEBUG,
        severityText: 'DEBUG',
        body: 'this is a body',
        attributes: {
          name: 'test name',
        },
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

  describe('should rewrite body/severityNumber/severityText', () => {
    const currentTime = new Date().getTime();
    const logRecordData: logsAPI.LogRecord = {
      timestamp: currentTime,
      severityNumber: logsAPI.SeverityNumber.DEBUG,
      severityText: 'DEBUG',
      body: 'this is a body',
      attributes: {
        name: 'test name',
      },
    };

    const newBody = 'this is a new body';
    const newSeverityNumber = logsAPI.SeverityNumber.INFO;
    const newSeverityText = 'INFO';

    it('should rewrite directly through the property method', () => {
      const { logRecord } = setup(undefined, logRecordData);

      logRecord.body = newBody;
      logRecord.severityNumber = newSeverityNumber;
      logRecord.severityText = newSeverityText;

      assert.deepStrictEqual(logRecord.body, newBody);
      assert.deepStrictEqual(logRecord.severityNumber, newSeverityNumber);
      assert.deepStrictEqual(logRecord.severityText, newSeverityText);
    });

    it('should rewrite using the set method', () => {
      const { logRecord } = setup(undefined, logRecordData);

      logRecord.setBody(newBody);
      logRecord.setSeverityNumber(newSeverityNumber);
      logRecord.setSeverityText(newSeverityText);

      assert.deepStrictEqual(logRecord.body, newBody);
      assert.deepStrictEqual(logRecord.severityNumber, newSeverityNumber);
      assert.deepStrictEqual(logRecord.severityText, newSeverityText);
    });
  });

  describe('should be read-only(body/severityNumber/severityText) if makeReadonly has been called', () => {
    const currentTime = new Date().getTime();
    const logRecordData: logsAPI.LogRecord = {
      timestamp: currentTime,
      severityNumber: logsAPI.SeverityNumber.DEBUG,
      severityText: 'DEBUG',
      body: 'this is a body',
      attributes: {
        name: 'test name',
      },
    };

    const newBody = 'this is a new body';
    const newSeverityNumber = logsAPI.SeverityNumber.INFO;
    const newSeverityText = 'INFO';

    it('should not rewrite directly through the property method', () => {
      const warnStub = sinon.spy(diag, 'warn');
      const { logRecord } = setup(undefined, logRecordData);
      logRecord.makeReadonly();

      logRecord.body = newBody;
      logRecord.severityNumber = newSeverityNumber;
      logRecord.severityText = newSeverityText;

      assert.deepStrictEqual(logRecord.body, logRecordData.body);
      assert.deepStrictEqual(
        logRecord.severityNumber,
        logRecordData.severityNumber
      );
      assert.deepStrictEqual(
        logRecord.severityText,
        logRecordData.severityText
      );
      sinon.assert.callCount(warnStub, 3);
      sinon.assert.alwaysCalledWith(
        warnStub,
        'Can not execute the operation on emitted log record'
      );
      warnStub.restore();
    });

    it('should not rewrite using the set method', () => {
      const warnStub = sinon.spy(diag, 'warn');
      const { logRecord } = setup(undefined, logRecordData);
      logRecord.makeReadonly();

      logRecord.setBody(newBody);
      logRecord.setSeverityNumber(newSeverityNumber);
      logRecord.setSeverityText(newSeverityText);

      assert.deepStrictEqual(logRecord.body, logRecordData.body);
      assert.deepStrictEqual(
        logRecord.severityNumber,
        logRecordData.severityNumber
      );
      assert.deepStrictEqual(
        logRecord.severityText,
        logRecordData.severityText
      );
      sinon.assert.callCount(warnStub, 3);
      sinon.assert.alwaysCalledWith(
        warnStub,
        'Can not execute the operation on emitted log record'
      );
      warnStub.restore();
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
