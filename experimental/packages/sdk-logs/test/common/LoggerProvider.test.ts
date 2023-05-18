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

import { Logger, LoggerProvider, NoopLogRecordProcessor } from '../../src';
import { loadDefaultConfig } from '../../src/config';
import { DEFAULT_LOGGER_NAME } from './../../src/LoggerProvider';

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

      it('should use noop log record processor by default and no diag error', () => {
        const errorStub = sinon.spy(diag, 'error');
        const provider = new LoggerProvider();
        const processors = provider.getActiveLogRecordProcessor().processors;
        assert.ok(processors.length === 1);
        assert.ok(processors[0] instanceof NoopLogRecordProcessor);
        sinon.assert.notCalled(errorStub);
      });

      it('should have default resource if not pass', () => {
        const provider = new LoggerProvider();
        const { resource } = provider;
        assert.deepStrictEqual(resource, Resource.default());
      });

      it('should have default forceFlushTimeoutMillis if not pass', () => {
        const provider = new LoggerProvider();
        const activeProcessor = provider.getActiveLogRecordProcessor();
        assert.ok(
          activeProcessor.forceFlushTimeoutMillis ===
            loadDefaultConfig().forceFlushTimeoutMillis
        );
      });
    });

    describe('when user sets unavailable exporter', () => {
      it('should use noop log record processor by default', () => {
        const provider = new LoggerProvider();
        const processors = provider.getActiveLogRecordProcessor().processors;
        assert.ok(processors.length === 1);
        assert.ok(processors[0] instanceof NoopLogRecordProcessor);
      });
    });

    describe('logRecordLimits', () => {
      describe('when not defined default values', () => {
        it('should have logger with default values', () => {
          const logger = new LoggerProvider({}).getLogger('default') as Logger;
          assert.deepStrictEqual(logger.getLogRecordLimits(), {
            attributeValueLengthLimit: Infinity,
            attributeCountLimit: 128,
          });
        });
      });

      describe('when "attributeCountLimit" is defined', () => {
        it('should have logger with defined value', () => {
          const logger = new LoggerProvider({
            logRecordLimits: {
              attributeCountLimit: 100,
            },
          }).getLogger('default') as Logger;
          const logRecordLimits = logger.getLogRecordLimits();
          assert.strictEqual(logRecordLimits.attributeCountLimit, 100);
        });
      });

      describe('when "attributeValueLengthLimit" is defined', () => {
        it('should have logger with defined value', () => {
          const logger = new LoggerProvider({
            logRecordLimits: {
              attributeValueLengthLimit: 10,
            },
          }).getLogger('default') as Logger;
          const logRecordLimits = logger.getLogRecordLimits();
          assert.strictEqual(logRecordLimits.attributeValueLengthLimit, 10);
        });

        it('should have logger with negative "attributeValueLengthLimit" value', () => {
          const logger = new LoggerProvider({
            logRecordLimits: {
              attributeValueLengthLimit: -10,
            },
          }).getLogger('default') as Logger;
          const logRecordLimits = logger.getLogRecordLimits();
          assert.strictEqual(logRecordLimits.attributeValueLengthLimit, -10);
        });
      });

      describe('when attribute value length limit is defined via env', () => {
        it('should have attribute value length limit as default of Infinity', () => {
          envSource.OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT = 'Infinity';
          const logger = new LoggerProvider().getLogger('default') as Logger;
          const logRecordLimits = logger.getLogRecordLimits();
          assert.strictEqual(
            logRecordLimits.attributeValueLengthLimit,
            Infinity
          );
          delete envSource.OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT;
        });
      });

      describe('when attribute value length limit is not defined via env', () => {
        it('should use default value of Infinity', () => {
          const logger = new LoggerProvider().getLogger('default') as Logger;
          const logRecordLimits = logger.getLogRecordLimits();
          assert.strictEqual(
            logRecordLimits.attributeValueLengthLimit,
            Infinity
          );
        });
      });

      describe('when attribute count limit is defined via env', () => {
        it('should have attribute count limits as defined in env', () => {
          envSource.OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT = '35';
          const logger = new LoggerProvider().getLogger('default') as Logger;
          const logRecordLimits = logger.getLogRecordLimits();
          assert.strictEqual(logRecordLimits.attributeCountLimit, 35);
          delete envSource.OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT;
        });
        it('should have attribute count limit as default of 128', () => {
          envSource.OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT = '128';
          const logger = new LoggerProvider().getLogger('default') as Logger;
          const logRecordLimits = logger.getLogRecordLimits();
          assert.strictEqual(logRecordLimits.attributeCountLimit, 128);
          delete envSource.OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT;
        });
      });

      describe('when attribute count limit is not defined via env', () => {
        it('should use default value of 128', () => {
          const logger = new LoggerProvider().getLogger('default') as Logger;
          const logRecordLimits = logger.getLogRecordLimits();
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
      assert.ok(logger.instrumentationScope.name === DEFAULT_LOGGER_NAME);
    });

    it("should create a logger instance if the name doesn't exist", () => {
      const provider = new LoggerProvider();
      assert.ok(provider.getActiveLoggers().size === 0);
      provider.getLogger(testName);
      assert.ok(provider.getActiveLoggers().size === 1);
    });

    it('should create A new object if the name & version & schemaUrl are not unique', () => {
      const provider = new LoggerProvider();
      assert.ok(provider.getActiveLoggers().size === 0);

      provider.getLogger(testName);
      assert.ok(provider.getActiveLoggers().size === 1);
      provider.getLogger(testName, testVersion);
      assert.ok(provider.getActiveLoggers().size === 2);
      provider.getLogger(testName, testVersion, { schemaUrl: testSchemaURL });
      assert.ok(provider.getActiveLoggers().size === 3);
    });

    it('should not create A new object if the name & version & schemaUrl are unique', () => {
      const provider = new LoggerProvider();

      assert.ok(provider.getActiveLoggers().size === 0);
      provider.getLogger(testName);
      assert.ok(provider.getActiveLoggers().size === 1);
      const logger1 = provider.getLogger(testName, testVersion, {
        schemaUrl: testSchemaURL,
      });
      assert.ok(provider.getActiveLoggers().size === 2);
      const logger2 = provider.getLogger(testName, testVersion, {
        schemaUrl: testSchemaURL,
      });
      assert.ok(provider.getActiveLoggers().size === 2);
      assert.ok(logger2 instanceof Logger);
      assert.ok(logger1 === logger2);
    });
  });

  describe('addLogRecordProcessor', () => {
    it('should add logRecord processor', () => {
      const logRecordProcessor = new NoopLogRecordProcessor();
      const provider = new LoggerProvider();
      provider.addLogRecordProcessor(logRecordProcessor);
      assert.strictEqual(
        provider.getActiveLogRecordProcessor().processors.length,
        1
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
      const shutdownStub = sinon.stub(
        provider.getActiveLogRecordProcessor(),
        'shutdown'
      );
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
      const forceFlushStub = sinon.stub(
        provider.getActiveLogRecordProcessor(),
        'forceFlush'
      );
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
      const shutdownStub = sinon.stub(
        provider.getActiveLogRecordProcessor(),
        'shutdown'
      );
      const warnStub = sinon.spy(diag, 'warn');
      provider.shutdown();
      provider.shutdown();
      sinon.assert.calledOnce(shutdownStub);
      sinon.assert.calledOnce(warnStub);
    });
  });
});
