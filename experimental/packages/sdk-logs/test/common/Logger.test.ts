/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import type { LoggerPattern } from '../../src';
import { LoggerProvider, createLoggerConfigurator } from '../../src';
import { NoopLogRecordProcessor } from '../../src/export/NoopLogRecordProcessor';
import { LogRecordImpl } from '../../src/LogRecordImpl';
import { ROOT_CONTEXT, TraceFlags, context, trace } from '@opentelemetry/api';
import type { LogRecord as ApiLogRecord } from '@opentelemetry/api-logs';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { Logger } from '../../src/Logger';
import { InMemoryLogRecordExporter } from '../../src/export/InMemoryLogRecordExporter';
import { SimpleLogRecordProcessor } from '../../src/export/SimpleLogRecordProcessor';
import { LoggerProviderSharedState } from '../../src/internal/LoggerProviderSharedState';

function setupLoggerProvider(
  processor: 'noop' | 'simple',
  patterns?: LoggerPattern[]
) {
  const isNoop = processor === 'noop';
  const logExporter = new InMemoryLogRecordExporter();
  const logProcessor = isNoop
    ? new NoopLogRecordProcessor()
    : new SimpleLogRecordProcessor(logExporter);
  const loggerProvider = new LoggerProvider({
    processors: [logProcessor],
    loggerConfigurator: patterns && createLoggerConfigurator(patterns),
  });
  const logger = loggerProvider.getLogger('test name', 'test version', {
    schemaUrl: 'test schema url',
  }) as Logger;
  return { logger, loggerProvider, logProcessor, logExporter };
}

describe('Logger', () => {
  describe('constructor', () => {
    it('should create an instance', () => {
      const { logger } = setupLoggerProvider('simple');
      assert.ok(logger instanceof Logger);
    });

    it('should cache the logger config at construction time', () => {
      const { loggerProvider } = setupLoggerProvider('simple');
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
    it('should not emit a logRecord instance if no processors are active', () => {
      const { logger, logProcessor } = setupLoggerProvider('noop');
      const callSpy = sinon.spy(logProcessor, 'onEmit');
      logger.emit({
        body: 'test log body',
      });
      assert.ok(callSpy.called === false);
    });

    it('should emit a logRecord instance', () => {
      const { logger, logProcessor } = setupLoggerProvider('simple');
      const callSpy = sinon.spy(logProcessor, 'onEmit');
      logger.emit({
        body: 'test log body',
      });
      assert.ok(callSpy.called);
    });

    it('should make log record instance readonly after emit it', () => {
      const { logger } = setupLoggerProvider('simple');
      const makeOnlySpy = sinon.spy(LogRecordImpl.prototype, '_makeReadonly');
      logger.emit({
        body: 'test log body',
      });
      assert.ok(makeOnlySpy.called);
    });

    it('should emit with current Context', () => {
      const { logger, logProcessor } = setupLoggerProvider('simple');
      const callSpy = sinon.spy(logProcessor, 'onEmit');
      logger.emit({
        body: 'test log body',
      });
      assert.ok(callSpy.calledWith(sinon.match.any, context.active()));
    });

    it('should emit with Context specified in LogRecord', () => {
      const { logger, logProcessor } = setupLoggerProvider('simple');
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
        const { loggerProvider, logExporter } = setupLoggerProvider('simple', [
          {
            pattern: 'test-logger',
            config: { minimumSeverity: SeverityNumber.INFO },
          },
        ]);
        const logger = loggerProvider.getLogger('test-logger') as Logger;

        logger.emit({
          body: 'info message',
          severityNumber: SeverityNumber.INFO,
        });

        logger.emit({
          body: 'warn message',
          severityNumber: SeverityNumber.WARN,
        });

        const logRecords = logExporter.getFinishedLogRecords();
        assert.strictEqual(logRecords.length, 2);
      });

      it('should drop log records with severity below minimum', () => {
        const { loggerProvider, logExporter } = setupLoggerProvider('simple', [
          {
            pattern: 'test-logger',
            config: { minimumSeverity: SeverityNumber.WARN },
          },
        ]);
        const logger = loggerProvider.getLogger('test-logger');

        logger.emit({
          body: 'debug message',
          severityNumber: SeverityNumber.DEBUG,
        });

        logger.emit({
          body: 'info message',
          severityNumber: SeverityNumber.INFO,
        });

        const logRecords = logExporter.getFinishedLogRecords();
        assert.strictEqual(logRecords.length, 0);
      });

      it('should emit log records with severity equal to minimum', () => {
        const { loggerProvider, logExporter } = setupLoggerProvider('simple', [
          {
            pattern: 'test-logger',
            config: { minimumSeverity: SeverityNumber.WARN },
          },
        ]);
        const logger = loggerProvider.getLogger('test-logger');

        logger.emit({
          body: 'warn message',
          severityNumber: SeverityNumber.WARN,
        });

        const logRecords = logExporter.getFinishedLogRecords();
        assert.strictEqual(logRecords.length, 1);
      });

      it('should emit log records with unspecified severity (0) regardless of minimum', () => {
        const { loggerProvider, logExporter } = setupLoggerProvider('simple', [
          {
            pattern: 'test-logger',
            config: { minimumSeverity: SeverityNumber.ERROR },
          },
        ]);
        const logger = loggerProvider.getLogger('test-logger') as Logger;

        logger.emit({
          body: 'unspecified severity message',
          severityNumber: SeverityNumber.UNSPECIFIED,
        });

        logger.emit({
          body: 'no severity specified',
          // severityNumber not specified at all
        });

        const logRecords = logExporter.getFinishedLogRecords();
        assert.strictEqual(logRecords.length, 2);
      });

      it('should use default minimum severity of 0 when not configured', () => {
        const { loggerProvider, logExporter } = setupLoggerProvider('simple');
        const logger = loggerProvider.getLogger('unconfigured-logger');

        logger.emit({
          body: 'debug message',
          severityNumber: SeverityNumber.DEBUG,
        });

        logger.emit({
          body: 'trace message',
          severityNumber: SeverityNumber.TRACE,
        });

        const logRecords = logExporter.getFinishedLogRecords();
        assert.strictEqual(logRecords.length, 2);
      });

      it('should only filter logs for configured logger, not other loggers', () => {
        const { loggerProvider, logExporter } = setupLoggerProvider('simple', [
          {
            pattern: 'filtered-logger',
            config: { minimumSeverity: SeverityNumber.ERROR },
          },
          {
            pattern: '*',
            config: { minimumSeverity: SeverityNumber.UNSPECIFIED },
          },
        ]);
        const filteredLogger = loggerProvider.getLogger('filtered-logger');
        const unfilteredLogger = loggerProvider.getLogger('unfiltered-logger');

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

        const logRecords = logExporter.getFinishedLogRecords();
        assert.strictEqual(logRecords.length, 1);
        assert.strictEqual(logRecords[0].body, 'unfiltered debug');
      });
    });

    describe('trace-based filtering', () => {
      it('should emit log records associated with sampled traces', () => {
        const { loggerProvider, logExporter } = setupLoggerProvider('simple', [
          {
            pattern: 'test-logger',
            config: { traceBased: true },
          },
        ]);
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

        const logRecords = logExporter.getFinishedLogRecords();
        assert.strictEqual(logRecords.length, 1);
      });

      it('should drop log records associated with unsampled traces', () => {
        const { loggerProvider, logExporter } = setupLoggerProvider('simple', [
          {
            pattern: 'test-logger',
            config: { traceBased: true },
          },
        ]);
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

        const logRecords = logExporter.getFinishedLogRecords();
        assert.strictEqual(logRecords.length, 0);
      });

      it('should emit log records without trace context when trace-based filtering is enabled', () => {
        const { loggerProvider, logExporter } = setupLoggerProvider('simple', [
          {
            pattern: 'test-logger',
            config: { traceBased: true },
          },
        ]);
        const logger = loggerProvider.getLogger('test-logger') as Logger;

        logger.emit({
          body: 'message without trace context',
          context: ROOT_CONTEXT,
        });

        const logRecords = logExporter.getFinishedLogRecords();
        assert.strictEqual(logRecords.length, 1);
      });

      it('should not filter when trace-based filtering is disabled (default)', () => {
        const { loggerProvider, logExporter } = setupLoggerProvider('simple');
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

        const logRecords = logExporter.getFinishedLogRecords();
        assert.strictEqual(logRecords.length, 1);
      });

      it('should combine trace-based and minimum severity filtering', () => {
        const { loggerProvider, logExporter } = setupLoggerProvider('simple', [
          {
            pattern: 'test-logger',
            config: {
              traceBased: true,
              minimumSeverity: SeverityNumber.WARN,
            },
          },
        ]);
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

        const logRecords = logExporter.getFinishedLogRecords();
        assert.strictEqual(logRecords.length, 1);
        assert.strictEqual(logRecords[0].body, 'sampled warn');
      });
    });
  });

  describe('enabled', () => {
    describe('with default configuration and disabled log processors', () => {
      const { logger } = setupLoggerProvider('noop');

      it('should return "false" when called with no options', () => {
        assert.ok(!logger.enabled());
      });

      it('should return "false" when called with a severity number', () => {
        assert.ok(!logger.enabled({ severityNumber: SeverityNumber.WARN }));
      });

      it('should return "false" when called with a context with a recording span', () => {
        const spanContext = {
          traceId: 'd4cda95b652f4a1592b449d5929fda1b',
          spanId: '6e0c63257de34c92',
          traceFlags: TraceFlags.NONE,
        };
        const activeContext = trace.setSpanContext(ROOT_CONTEXT, spanContext);
        assert.ok(!logger.enabled({ context: activeContext }));
      });
    });

    describe('with default configuration and enabled log processors', () => {
      const { logger } = setupLoggerProvider('simple');

      it('should return "true" when called with no options', () => {
        assert.ok(logger.enabled());
      });

      it('should return "true" when called with a severity number', () => {
        assert.ok(logger.enabled({ severityNumber: SeverityNumber.WARN }));
      });

      it('should return "true" when called with a context with an unsampled span', () => {
        const spanContext = {
          traceId: 'd4cda95b652f4a1592b449d5929fda1b',
          spanId: '6e0c63257de34c92',
          traceFlags: TraceFlags.NONE,
        };
        const activeContext = trace.setSpanContext(ROOT_CONTEXT, spanContext);
        assert.ok(logger.enabled({ context: activeContext }));
      });
    });

    describe('with custom configuration and disabled log processors', () => {
      const { loggerProvider } = setupLoggerProvider('noop', [
        {
          pattern: 'disabled-logger',
          config: { disabled: true },
        },
        {
          pattern: 'warn-logger',
          config: { minimumSeverity: SeverityNumber.WARN },
        },
        {
          pattern: 'trace-logger',
          config: { traceBased: true },
        },
      ]);

      it('should return "false" no matter the combinations', () => {
        const disabledLogger = loggerProvider.getLogger('disabled-logger');
        assert.ok(!disabledLogger.enabled());

        const warnLogger = loggerProvider.getLogger('warn-logger');
        assert.ok(!warnLogger.enabled({ severityNumber: SeverityNumber.INFO }));
        assert.ok(
          !warnLogger.enabled({ severityNumber: SeverityNumber.ERROR })
        );

        const sampledSpanContext = {
          traceId: 'e4cda95b652f4a1592b449d5929fda1b',
          spanId: '9e0c63257de34c92',
          traceFlags: TraceFlags.SAMPLED,
        };
        const traceLogger = loggerProvider.getLogger('trace-logger');
        assert.ok(
          !traceLogger.enabled({
            context: trace.setSpanContext(ROOT_CONTEXT, sampledSpanContext),
          })
        );

        const customLogger = loggerProvider.getLogger('custom-logger');
        assert.ok(!customLogger.enabled());
      });
    });

    describe('with custom configuration and enabled log processors', () => {
      const { loggerProvider } = setupLoggerProvider('simple', [
        {
          pattern: 'disabled-logger',
          config: { disabled: true },
        },
        {
          pattern: 'warn-logger',
          config: { minimumSeverity: SeverityNumber.WARN },
        },
        {
          pattern: 'trace-logger',
          config: { traceBased: true },
        },
      ]);

      it('should return "false" if the logger is configured to be disabled', () => {
        const logger = loggerProvider.getLogger('disabled-logger');
        assert.ok(!logger.enabled());
      });

      it('should return "true" when severity is greater or equal than the configured', () => {
        const logger = loggerProvider.getLogger('warn-logger');
        assert.ok(!logger.enabled({ severityNumber: SeverityNumber.INFO }));
        assert.ok(logger.enabled({ severityNumber: SeverityNumber.WARN }));
        assert.ok(logger.enabled({ severityNumber: SeverityNumber.ERROR }));
      });

      it('should return "true" when severity is not passed or UNSPECIFIED', () => {
        const logger = loggerProvider.getLogger('warn-logger');
        assert.ok(logger.enabled());
        assert.ok(
          logger.enabled({ severityNumber: SeverityNumber.UNSPECIFIED })
        );
      });

      it('should return "true" when trace based and context has a sampled span', () => {
        const logger = loggerProvider.getLogger('trace-logger');
        const unsampledSpanContext = {
          traceId: 'd4cda95b652f4a1592b449d5929fda1b',
          spanId: '6e0c63257de34c92',
          traceFlags: TraceFlags.NONE,
        };
        const sampledSpanContext = {
          traceId: 'e4cda95b652f4a1592b449d5929fda1b',
          spanId: '9e0c63257de34c92',
          traceFlags: TraceFlags.SAMPLED,
        };

        assert.ok(
          !logger.enabled({
            context: trace.setSpanContext(ROOT_CONTEXT, unsampledSpanContext),
          })
        );
        assert.ok(
          logger.enabled({
            context: trace.setSpanContext(ROOT_CONTEXT, sampledSpanContext),
          })
        );
      });

      it('should return "true" when a log processor is enabled', () => {
        const logger = loggerProvider.getLogger('my-logger');
        assert.ok(logger.enabled());
      });
    });
  });
});
