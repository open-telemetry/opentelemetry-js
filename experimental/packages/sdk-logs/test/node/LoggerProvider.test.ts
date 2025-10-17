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
import { logs } from '@opentelemetry/api-logs';
import * as assert from 'assert';
import * as sinon from 'sinon';

import { LoggerProvider } from '../../src';

describe('LoggerProvider - node', () => {
  beforeEach(() => {
    // to avoid actually registering the LoggerProvider and leaking env to other tests
    sinon.stub(logs, 'setGlobalLoggerProvider');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    describe('logRecordLimits', () => {
      describe('when attribute value length limit is defined via env', () => {
        afterEach(function () {
          delete process.env.OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT;
        });

        it('should have attribute value length limit as default of Infinity', () => {
          process.env.OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT = 'Infinity';
          const loggerProvider = new LoggerProvider();
          const logRecordLimits =
            loggerProvider['_sharedState'].logRecordLimits;
          assert.strictEqual(
            logRecordLimits.attributeValueLengthLimit,
            Infinity
          );
        });
      });

      describe('when attribute count limit is defined via env', () => {
        afterEach(function () {
          delete process.env.OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT;
        });

        it('should have attribute count limits as defined in env', () => {
          process.env.OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT = '35';
          const loggerProvider = new LoggerProvider();
          const logRecordLimits =
            loggerProvider['_sharedState'].logRecordLimits;
          assert.strictEqual(logRecordLimits.attributeCountLimit, 35);
        });
        it('should have attribute count limit as default of 128', () => {
          process.env.OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT = '128';
          const loggerProvider = new LoggerProvider();
          const logRecordLimits =
            loggerProvider['_sharedState'].logRecordLimits;
          assert.strictEqual(logRecordLimits.attributeCountLimit, 128);
        });
      });
    });
  });
});
