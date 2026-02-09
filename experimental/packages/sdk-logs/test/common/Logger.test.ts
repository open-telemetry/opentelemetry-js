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
import { LoggerProvider, createLoggerConfigurator } from '../../src';
import { NoopLogRecordProcessor } from '../../src/export/NoopLogRecordProcessor';
import { LogRecordImpl } from '../../src/LogRecordImpl';
import { ROOT_CONTEXT, TraceFlags, context, trace } from '@opentelemetry/api';
import {
  LogRecord as ApiLogRecord,
  SeverityNumber,
} from '@opentelemetry/api-logs';
import {
  ATTR_EXCEPTION_MESSAGE,
  ATTR_EXCEPTION_STACKTRACE,
  ATTR_EXCEPTION_TYPE,
} from '@opentelemetry/semantic-conventions';
import { Logger } from '../../src/Logger';
import { InMemoryLogRecordExporter } from '../../src/export/InMemoryLogRecordExporter';
import { SimpleLogRecordProcessor } from '../../src/export/SimpleLogRecordProcessor';
import { LoggerProviderSharedState } from '../../src/internal/LoggerProviderSharedState';

const setup = () => {
  const logProcessor = new NoopLogRecordProcessor();
  const loggerProvider = new LoggerProvider({ processors: [logProcessor] });
  const logger = loggerProvider.getLogger('test name', 'test version', {
    schemaUrl: 'test schema url',
  }) as Logger;
  return { logger, logProcessor };
};

describe('Logger', () => {
  describe('constructor', () => {
    it('should create an instance', () => {
      const { logger } = setup();
      assert.ok(logger instanceof Logger);
    });

    it('should cache the logger config at construction time', () => {
      const logProcessor = new NoopLogRecordProcessor();
      const loggerProvider = new LoggerProvider({
        processors: [logProcessor],
        loggerConfigurator: createLoggerConfigurator([
          {
            pattern: 'test-logger',
            config: { minimumSeverity: SeverityNumber.WARN },
          },
        ]),
      });

      const getLoggerConfigSpy = sinon.spy(
        LoggerProviderSharedState.prototype,
        'getLoggerConfig'
      );

      try {
        // Get the logger - this should call getLoggerConfig once
        const logger = loggerProvider.getLogger('test-logger') as Logger;
        assert.strictEqual(
          getLoggerConfigSpy.callCount,
          1,
          'getLoggerConfig should be called once during logger construction'
        );

        // Emit multiple log records - getLoggerConfig should not be called again
        logger.emit({
          body: 'message 1',
          severityNumber: SeverityNumber.ERROR,
        });
        logger.emit({ body: 'message 2', severityNumber: SeverityNumber.WARN });
        logger.emit({ body: 'message 3', severityNumber: SeverityNumber.INFO });

        assert.strictEqual(
          getLoggerConfigSpy.callCount,
          1,
          'getLoggerConfig should still be called only once after multiple emit() calls'
        );
      } finally {
        getLoggerConfigSpy.restore();
      }
    });
  });

  describe('emit', () => {
    it('should emit a logRecord instance', () => {
      const { logger, logProcessor } = setup();
      const callSpy = sinon.spy(logProcessor, 'onEmit');
      logger.emit({
        body: 'test log body',
      });
      assert.ok(callSpy.called);
    });

    it('should make log record instance readonly after emit it', () => {
      const { logger } = setup();
      const makeOnlySpy = sinon.spy(LogRecordImpl.prototype, '_makeReadonly');
      logger.emit({
        body: 'test log body',
      });
      assert.ok(makeOnlySpy.called);
    });

    it('should emit with current Context', () => {
      const { logger, logProcessor } = setup();
      const callSpy = sinon.spy(logProcessor, 'onEmit');
      logger.emit({
        body: 'test log body',
      });
      assert.ok(callSpy.calledWith(sinon.match.any, context.active()));
    });

    it('should emit with Context specified in LogRecord', () => {
      const { logger, logProcessor } = setup();
      const spanContext = {
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        spanId: '6e0c63257de34c92',
        traceFlags: TraceFlags.SAMPLED,
      };
      const activeContext = trace.setSpanContext(ROOT_CONTEXT, spanContext);
      const logRecordData: ApiLogRecord = {
        context: activeContext,
      };

      const callSpy = sinon.spy(logProcessor, 'onEmit');
      logger.emit(logRecordData);
      assert.ok(callSpy.calledWith(sinon.match.any, activeContext));
    });

    describe('minimum severity filtering', () => {
      it('should emit log records with severity above minimum', () => {
        const exporter = new InMemoryLogRecordExporter();
        const loggerProvider = new LoggerProvider({
          processors: [new SimpleLogRecordProcessor(exporter)],
          loggerConfigurator: createLoggerConfigurator([
            {
              pattern: 'test-logger',
              config: { minimumSeverity: SeverityNumber.INFO },
            },
          ]),
        });
        const logger = loggerProvider.getLogger('test-logger') as Logger;

        logger.emit({
          body: 'info message',
          severityNumber: SeverityNumber.INFO,
        });

        logger.emit({
          body: 'warn message',
          severityNumber: SeverityNumber.WARN,
        });

        const logRecords = exporter.getFinishedLogRecords();
        assert.strictEqual(logRecords.length, 2);
      });

      it('should drop log records with severity below minimum', () => {
        const exporter = new InMemoryLogRecordExporter();
        const loggerProvider = new LoggerProvider({
          processors: [new SimpleLogRecordProcessor(exporter)],
          loggerConfigurator: createLoggerConfigurator([
            {
              pattern: 'test-logger',
              config: { minimumSeverity: SeverityNumber.WARN },
            },
          ]),
        });
        const logger = loggerProvider.getLogger('test-logger') as Logger;

        logger.emit({
          body: 'debug message',
          severityNumber: SeverityNumber.DEBUG,
        });

        logger.emit({
          body: 'info message',
          severityNumber: SeverityNumber.INFO,
        });

        const logRecords = exporter.getFinishedLogRecords();
        assert.strictEqual(logRecords.length, 0);
      });

      it('should emit log records with severity equal to minimum', () => {
        const exporter = new InMemoryLogRecordExporter();
        const loggerProvider = new LoggerProvider({
          processors: [new SimpleLogRecordProcessor(exporter)],
          loggerConfigurator: createLoggerConfigurator([
            {
              pattern: 'test-logger',
              config: { minimumSeverity: SeverityNumber.WARN },
            },
          ]),
        });
        const logger = loggerProvider.getLogger('test-logger') as Logger;

        logger.emit({
          body: 'warn message',
          severityNumber: SeverityNumber.WARN,
        });

        const logRecords = exporter.getFinishedLogRecords();
        assert.strictEqual(logRecords.length, 1);
      });

      it('should emit log records with unspecified severity (0) regardless of minimum', () => {
        const exporter = new InMemoryLogRecordExporter();
        const loggerProvider = new LoggerProvider({
          processors: [new SimpleLogRecordProcessor(exporter)],
          loggerConfigurator: createLoggerConfigurator([
            {
              pattern: 'test-logger',
              config: { minimumSeverity: SeverityNumber.ERROR },
            },
          ]),
        });
        const logger = loggerProvider.getLogger('test-logger') as Logger;

        logger.emit({
          body: 'unspecified severity message',
          severityNumber: SeverityNumber.UNSPECIFIED,
        });

        logger.emit({
          body: 'no severity specified',
          // severityNumber not specified at all
        });

        const logRecords = exporter.getFinishedLogRecords();
        assert.strictEqual(logRecords.length, 2);
      });

      it('should use default minimum severity of 0 when not configured', () => {
        const exporter = new InMemoryLogRecordExporter();
        const loggerProvider = new LoggerProvider({
          processors: [new SimpleLogRecordProcessor(exporter)],
        });
        const logger = loggerProvider.getLogger(
          'unconfigured-logger'
        ) as Logger;

        logger.emit({
          body: 'debug message',
          severityNumber: SeverityNumber.DEBUG,
        });

        logger.emit({
          body: 'trace message',
          severityNumber: SeverityNumber.TRACE,
        });

        const logRecords = exporter.getFinishedLogRecords();
        assert.strictEqual(logRecords.length, 2);
      });

      it('should only filter logs for configured logger, not other loggers', () => {
        const exporter = new InMemoryLogRecordExporter();
        const loggerProvider = new LoggerProvider({
          processors: [new SimpleLogRecordProcessor(exporter)],
          loggerConfigurator: createLoggerConfigurator([
            {
              pattern: 'filtered-logger',
              config: { minimumSeverity: SeverityNumber.ERROR },
            },
            {
              pattern: '*',
              config: { minimumSeverity: SeverityNumber.UNSPECIFIED },
            },
          ]),
        });
        const filteredLogger = loggerProvider.getLogger(
          'filtered-logger'
        ) as Logger;
        const unfilteredLogger = loggerProvider.getLogger(
          'unfiltered-logger'
        ) as Logger;

        // Should be dropped (below minimum)
        filteredLogger.emit({
          body: 'filtered debug',
          severityNumber: SeverityNumber.DEBUG,
        });

        // Should be emitted (no filter configured)
        unfilteredLogger.emit({
          body: 'unfiltered debug',
          severityNumber: SeverityNumber.DEBUG,
        });

        const logRecords = exporter.getFinishedLogRecords();
        assert.strictEqual(logRecords.length, 1);
        assert.strictEqual(logRecords[0].body, 'unfiltered debug');
      });
    });

    describe('trace-based filtering', () => {
      it('should emit log records associated with sampled traces', () => {
        const exporter = new InMemoryLogRecordExporter();
        const loggerProvider = new LoggerProvider({
          processors: [new SimpleLogRecordProcessor(exporter)],
          loggerConfigurator: createLoggerConfigurator([
            {
              pattern: 'test-logger',
              config: { traceBased: true },
            },
          ]),
        });
        const logger = loggerProvider.getLogger('test-logger') as Logger;

        const spanContext = {
          traceId: 'd4cda95b652f4a1592b449d5929fda1b',
          spanId: '6e0c63257de34c92',
          traceFlags: TraceFlags.SAMPLED,
        };
        const activeContext = trace.setSpanContext(ROOT_CONTEXT, spanContext);

        logger.emit({
          body: 'sampled trace message',
          context: activeContext,
        });

        const logRecords = exporter.getFinishedLogRecords();
        assert.strictEqual(logRecords.length, 1);
      });

      it('should drop log records associated with unsampled traces', () => {
        const exporter = new InMemoryLogRecordExporter();
        const loggerProvider = new LoggerProvider({
          processors: [new SimpleLogRecordProcessor(exporter)],
          loggerConfigurator: createLoggerConfigurator([
            {
              pattern: 'test-logger',
              config: { traceBased: true },
            },
          ]),
        });
        const logger = loggerProvider.getLogger('test-logger') as Logger;

        const spanContext = {
          traceId: 'd4cda95b652f4a1592b449d5929fda1b',
          spanId: '6e0c63257de34c92',
          traceFlags: TraceFlags.NONE,
        };
        const activeContext = trace.setSpanContext(ROOT_CONTEXT, spanContext);

        logger.emit({
          body: 'unsampled trace message',
          context: activeContext,
        });

        const logRecords = exporter.getFinishedLogRecords();
        assert.strictEqual(logRecords.length, 0);
      });

      it('should emit log records without trace context when trace-based filtering is enabled', () => {
        const exporter = new InMemoryLogRecordExporter();
        const loggerProvider = new LoggerProvider({
          processors: [new SimpleLogRecordProcessor(exporter)],
          loggerConfigurator: createLoggerConfigurator([
            {
              pattern: 'test-logger',
              config: { traceBased: true },
            },
          ]),
        });
        const logger = loggerProvider.getLogger('test-logger') as Logger;

        logger.emit({
          body: 'message without trace context',
          context: ROOT_CONTEXT,
        });

        const logRecords = exporter.getFinishedLogRecords();
        assert.strictEqual(logRecords.length, 1);
      });

      it('should not filter when trace-based filtering is disabled (default)', () => {
        const exporter = new InMemoryLogRecordExporter();
        const loggerProvider = new LoggerProvider({
          processors: [new SimpleLogRecordProcessor(exporter)],
        });
        const logger = loggerProvider.getLogger('test-logger') as Logger;

        const spanContext = {
          traceId: 'd4cda95b652f4a1592b449d5929fda1b',
          spanId: '6e0c63257de34c92',
          traceFlags: TraceFlags.NONE,
        };
        const activeContext = trace.setSpanContext(ROOT_CONTEXT, spanContext);

        logger.emit({
          body: 'unsampled trace message',
          context: activeContext,
        });

        const logRecords = exporter.getFinishedLogRecords();
        assert.strictEqual(logRecords.length, 1);
      });

      it('should combine trace-based and minimum severity filtering', () => {
        const exporter = new InMemoryLogRecordExporter();
        const loggerProvider = new LoggerProvider({
          processors: [new SimpleLogRecordProcessor(exporter)],
          loggerConfigurator: createLoggerConfigurator([
            {
              pattern: 'test-logger',
              config: {
                traceBased: true,
                minimumSeverity: SeverityNumber.WARN,
              },
            },
          ]),
        });
        const logger = loggerProvider.getLogger('test-logger') as Logger;

        const sampledSpanContext = {
          traceId: 'd4cda95b652f4a1592b449d5929fda1b',
          spanId: '6e0c63257de34c92',
          traceFlags: TraceFlags.SAMPLED,
        };
        const sampledContext = trace.setSpanContext(
          ROOT_CONTEXT,
          sampledSpanContext
        );

        const unsampledSpanContext = {
          traceId: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
          spanId: '7f8e9d0c1b2a3f4e',
          traceFlags: TraceFlags.NONE,
        };
        const unsampledContext = trace.setSpanContext(
          ROOT_CONTEXT,
          unsampledSpanContext
        );

        // Should be emitted (sampled + severity >= minimum)
        logger.emit({
          body: 'sampled warn',
          severityNumber: SeverityNumber.WARN,
          context: sampledContext,
        });

        // Should be dropped (sampled but severity < minimum)
        logger.emit({
          body: 'sampled info',
          severityNumber: SeverityNumber.INFO,
          context: sampledContext,
        });

        // Should be dropped (severity >= minimum but unsampled)
        logger.emit({
          body: 'unsampled error',
          severityNumber: SeverityNumber.ERROR,
          context: unsampledContext,
        });

        // Should be dropped (unsampled + severity < minimum)
        logger.emit({
          body: 'unsampled debug',
          severityNumber: SeverityNumber.DEBUG,
          context: unsampledContext,
        });

        const logRecords = exporter.getFinishedLogRecords();
        assert.strictEqual(logRecords.length, 1);
        assert.strictEqual(logRecords[0].body, 'sampled warn');
      });
    });
  });

  describe('recordException', () => {
    it('should emit a log record with exception attributes', () => {
      const exporter = new InMemoryLogRecordExporter();
      const loggerProvider = new LoggerProvider({
        processors: [new SimpleLogRecordProcessor(exporter)],
      });
      const logger = loggerProvider.getLogger('test-logger') as Logger;
      const error = new Error('boom');

      logger.recordException(error);

      const logRecords = exporter.getFinishedLogRecords();
      assert.strictEqual(logRecords.length, 1);
      const logRecord = logRecords[0];
      assert.strictEqual(
        logRecord.attributes[ATTR_EXCEPTION_MESSAGE],
        error.message
      );
      assert.strictEqual(
        logRecord.attributes[ATTR_EXCEPTION_TYPE],
        error.name
      );
      if (error.stack) {
        assert.strictEqual(
          logRecord.attributes[ATTR_EXCEPTION_STACKTRACE],
          error.stack
        );
      }
    });
  });
});
