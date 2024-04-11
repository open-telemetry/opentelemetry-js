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
import { logs, NoopLogger } from '@opentelemetry/api-logs';
import { diag } from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import * as assert from 'assert';
import * as sinon from 'sinon';

import { LoggerProvider, NoopLogRecordProcessor } from '../../src';
import { loadDefaultConfig } from '../../src/config';
import { DEFAULT_LOGGER_NAME } from './../../src/LoggerProvider';
import { MultiLogRecordProcessor } from '../../src/MultiLogRecordProcessor';
import { Logger } from '../../src/Logger';

describe('LoggerProvider', () => {
  let envSource: Record<string, any>;

  if (typeof process === 'undefined') {
    envSource = globalThis as unknown as Record<string, any>;
  } else {
    envSource = process.env as Record<string, any>;
  }

  beforeEach(() => {
    // to avoid actually registering the LoggerProvider and leaking env to other tests
    sinon.stub(logs, 'setGlobalLoggerProvider');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    describe('when options not defined', () => {
      it('should construct an instance', () => {
        const provider = new LoggerProvider();
        assert.ok(provider instanceof LoggerProvider);
      });

      it('should use noop log record processor by default', () => {
        const provider = new LoggerProvider();
        const sharedState = provider['_sharedState'];
        const processor = sharedState.activeProcessor;
        assert.ok(processor instanceof NoopLogRecordProcessor);
      });

      it('should have default resource if not pass', () => {
        const provider = new LoggerProvider();
        const { resource } = provider['_sharedState'];
        assert.deepStrictEqual(resource, Resource.default());
      });

      it('should fallback to default resource attrs', () => {
        const passedInResource = new Resource({ foo: 'bar' });
        const provider = new LoggerProvider({ resource: passedInResource });
        const { resource } = provider['_sharedState'];
        assert.deepStrictEqual(
          resource,
          Resource.default().merge(passedInResource)
        );
      });

      it('should have default forceFlushTimeoutMillis if not pass', () => {
        const provider = new LoggerProvider();
        const sharedState = provider['_sharedState'];
        assert.ok(
          sharedState.forceFlushTimeoutMillis ===
            loadDefaultConfig().forceFlushTimeoutMillis
        );
      });
    });

    describe('logRecordLimits', () => {
      describe('when not defined default values', () => {
        it('should have logger with default values', () => {
          const loggerProvider = new LoggerProvider();
          const sharedState = loggerProvider['_sharedState'];
          assert.deepStrictEqual(sharedState.logRecordLimits, {
            attributeValueLengthLimit: Infinity,
            attributeCountLimit: 128,
          });
        });
      });

      describe('when "attributeCountLimit" is defined', () => {
        it('should have logger with defined value', () => {
          const loggerProvider = new LoggerProvider({
            logRecordLimits: {
              attributeCountLimit: 100,
            },
          });
          const logRecordLimits =
            loggerProvider['_sharedState'].logRecordLimits;
          assert.strictEqual(logRecordLimits.attributeCountLimit, 100);
        });
      });

      describe('when "attributeValueLengthLimit" is defined', () => {
        it('should have logger with defined value', () => {
          const loggerProvider = new LoggerProvider({
            logRecordLimits: {
              attributeValueLengthLimit: 10,
            },
          });
          const logRecordLimits =
            loggerProvider['_sharedState'].logRecordLimits;
          assert.strictEqual(logRecordLimits.attributeValueLengthLimit, 10);
        });

        it('should have logger with negative "attributeValueLengthLimit" value', () => {
          const loggerProvider = new LoggerProvider({
            logRecordLimits: {
              attributeValueLengthLimit: -10,
            },
          });
          const logRecordLimits =
            loggerProvider['_sharedState'].logRecordLimits;
          assert.strictEqual(logRecordLimits.attributeValueLengthLimit, -10);
        });
      });

      describe('when attribute value length limit is defined via env', () => {
        it('should have attribute value length limit as default of Infinity', () => {
          envSource.OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT = 'Infinity';
          const loggerProvider = new LoggerProvider();
          const logRecordLimits =
            loggerProvider['_sharedState'].logRecordLimits;
          assert.strictEqual(
            logRecordLimits.attributeValueLengthLimit,
            Infinity
          );
          delete envSource.OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT;
        });
      });

      describe('when attribute value length limit is not defined via env', () => {
        it('should use default value of Infinity', () => {
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
        it('should have attribute count limits as defined in env', () => {
          envSource.OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT = '35';
          const loggerProvider = new LoggerProvider();
          const logRecordLimits =
            loggerProvider['_sharedState'].logRecordLimits;
          assert.strictEqual(logRecordLimits.attributeCountLimit, 35);
          delete envSource.OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT;
        });
        it('should have attribute count limit as default of 128', () => {
          envSource.OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT = '128';
          const loggerProvider = new LoggerProvider();
          const logRecordLimits =
            loggerProvider['_sharedState'].logRecordLimits;
          assert.strictEqual(logRecordLimits.attributeCountLimit, 128);
          delete envSource.OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT;
        });
      });

      describe('when attribute count limit is not defined via env', () => {
        it('should use default value of 128', () => {
          const loggerProvider = new LoggerProvider();
          const logRecordLimits =
            loggerProvider['_sharedState'].logRecordLimits;
          assert.strictEqual(logRecordLimits.attributeCountLimit, 128);
        });
      });
    });
  });

  describe('getLogger', () => {
    const testName = 'test name';
    const testVersion = 'test version';
    const testSchemaURL = 'test schema url';

    it('should create a logger instance with default name if the name is invalid ', () => {
      const provider = new LoggerProvider();
      const logger = provider.getLogger('') as Logger;
      assert.strictEqual(logger.instrumentationScope.name, DEFAULT_LOGGER_NAME);
    });

    it("should create a logger instance if the name doesn't exist", () => {
      const provider = new LoggerProvider();
      const sharedState = provider['_sharedState'];
      assert.strictEqual(sharedState.loggers.size, 0);
      provider.getLogger(testName);
      assert.strictEqual(sharedState.loggers.size, 1);
    });

    it('should create A new object if the name & version & schemaUrl are not unique', () => {
      const provider = new LoggerProvider();
      const sharedState = provider['_sharedState'];
      assert.strictEqual(sharedState.loggers.size, 0);

      provider.getLogger(testName);
      assert.strictEqual(sharedState.loggers.size, 1);
      provider.getLogger(testName, testVersion);
      assert.strictEqual(sharedState.loggers.size, 2);
      provider.getLogger(testName, testVersion, { schemaUrl: testSchemaURL });
      assert.strictEqual(sharedState.loggers.size, 3);
    });

    it('should not create A new object if the name & version & schemaUrl are unique', () => {
      const provider = new LoggerProvider();
      const sharedState = provider['_sharedState'];

      assert.strictEqual(sharedState.loggers.size, 0);
      provider.getLogger(testName);
      assert.strictEqual(sharedState.loggers.size, 1);
      const logger1 = provider.getLogger(testName, testVersion, {
        schemaUrl: testSchemaURL,
      });
      assert.strictEqual(sharedState.loggers.size, 2);
      const logger2 = provider.getLogger(testName, testVersion, {
        schemaUrl: testSchemaURL,
      });
      assert.strictEqual(sharedState.loggers.size, 2);
      assert.ok(logger2 instanceof Logger);
      assert.strictEqual(logger1, logger2);
    });
  });

  describe('addLogRecordProcessor', () => {
    it('should add logRecord processor', () => {
      const provider = new LoggerProvider();
      const sharedState = provider['_sharedState'];
      const logRecordProcessor = new NoopLogRecordProcessor();
      provider.addLogRecordProcessor(logRecordProcessor);
      assert.ok(sharedState.activeProcessor instanceof MultiLogRecordProcessor);
      assert.strictEqual(sharedState.activeProcessor.processors.length, 1);
      assert.strictEqual(
        sharedState.activeProcessor.processors[0],
        logRecordProcessor
      );
    });
  });

  describe('.forceFlush()', () => {
    it('should call forceFlush on all registered log record processors', done => {
      sinon.restore();
      const forceFlushStub = sinon.stub(
        NoopLogRecordProcessor.prototype,
        'forceFlush'
      );
      forceFlushStub.resolves();

      const provider = new LoggerProvider();
      const logRecordProcessorOne = new NoopLogRecordProcessor();
      const logRecordProcessorTwo = new NoopLogRecordProcessor();

      provider.addLogRecordProcessor(logRecordProcessorOne);
      provider.addLogRecordProcessor(logRecordProcessorTwo);

      provider
        .forceFlush()
        .then(() => {
          sinon.restore();
          assert(forceFlushStub.calledTwice);
          done();
        })
        .catch(error => {
          sinon.restore();
          done(error);
        });
    });

    it('should throw error when calling forceFlush on all registered processors fails', done => {
      sinon.restore();

      const forceFlushStub = sinon.stub(
        NoopLogRecordProcessor.prototype,
        'forceFlush'
      );
      forceFlushStub.returns(Promise.reject('Error'));

      const provider = new LoggerProvider();
      const logRecordProcessorOne = new NoopLogRecordProcessor();
      const logRecordProcessorTwo = new NoopLogRecordProcessor();

      provider.addLogRecordProcessor(logRecordProcessorOne);
      provider.addLogRecordProcessor(logRecordProcessorTwo);

      provider
        .forceFlush()
        .then(() => {
          sinon.restore();
          done(new Error('Successful forceFlush not expected'));
        })
        .catch(_error => {
          sinon.restore();
          sinon.assert.calledTwice(forceFlushStub);
          done();
        });
    });
  });

  describe('.shutdown()', () => {
    it('should trigger shutdown when manually invoked', () => {
      const provider = new LoggerProvider();
      const processor = new NoopLogRecordProcessor();
      provider.addLogRecordProcessor(processor);
      const shutdownStub = sinon.stub(processor, 'shutdown');
      provider.shutdown();
      sinon.assert.calledOnce(shutdownStub);
    });

    it('get a noop logger on shutdown', () => {
      const provider = new LoggerProvider();
      provider.shutdown();
      const logger = provider.getLogger('default', '1.0.0');
      // returned tracer should be no-op, not instance of Logger (from SDK)
      assert.ok(logger instanceof NoopLogger);
    });

    it('should not force flush on shutdown', () => {
      const provider = new LoggerProvider();
      const logRecordProcessor = new NoopLogRecordProcessor();
      provider.addLogRecordProcessor(logRecordProcessor);
      const forceFlushStub = sinon.stub(logRecordProcessor, 'forceFlush');
      const warnStub = sinon.spy(diag, 'warn');
      provider.shutdown();
      provider.forceFlush();
      sinon.assert.notCalled(forceFlushStub);
      sinon.assert.calledOnce(warnStub);
    });

    it('should not shutdown on shutdown', () => {
      const provider = new LoggerProvider();
      const logRecordProcessor = new NoopLogRecordProcessor();
      provider.addLogRecordProcessor(logRecordProcessor);
      const shutdownStub = sinon.stub(logRecordProcessor, 'shutdown');
      const warnStub = sinon.spy(diag, 'warn');
      provider.shutdown();
      provider.shutdown();
      sinon.assert.calledOnce(shutdownStub);
      sinon.assert.calledOnce(warnStub);
    });
  });
});
