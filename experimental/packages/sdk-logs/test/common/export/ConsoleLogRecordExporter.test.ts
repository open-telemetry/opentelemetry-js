/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import { SeverityNumber } from '@opentelemetry/api-logs';

import {
  LoggerProvider,
  ConsoleLogRecordExporter,
  SimpleLogRecordProcessor,
} from './../../../src';

/* eslint-disable no-console */
describe('ConsoleLogRecordExporter', () => {
  let previousConsoleDir: typeof console.dir;

  beforeEach(() => {
    previousConsoleDir = console.dir;
    console.dir = () => {};
  });

  afterEach(() => {
    console.dir = previousConsoleDir;
  });

  describe('export', () => {
    it('should export information about log record', () => {
      assert.doesNotThrow(() => {
        const instrumentationScopeName = '@opentelemetry/sdk-logs/test';
        const instrumentationScopeVersion = '1.2.3';
        const consoleExporter = new ConsoleLogRecordExporter();
        const spyConsole = sinon.spy(console, 'dir');
        const spyExport = sinon.spy(consoleExporter, 'export');
        const provider = new LoggerProvider({
          processors: [new SimpleLogRecordProcessor(consoleExporter)],
        });

        provider
          .getLogger(instrumentationScopeName, instrumentationScopeVersion)
          .emit({
            eventName: 'event1',
            body: 'body1',
            severityNumber: SeverityNumber.DEBUG,
            severityText: 'DEBUG',
          });

        const logRecords = spyExport.args[0];
        const firstLogRecord = logRecords[0][0];
        const consoleArgs = spyConsole.args[0];
        const consoleLogRecord = consoleArgs[0];
        const keys = Object.keys(consoleLogRecord).sort().join(',');

        const expectedKeys = [
          'attributes',
          'body',
          'eventName',
          'instrumentationScope',
          'resource',
          'severityNumber',
          'severityText',
          'spanId',
          'timestamp',
          'traceFlags',
          'traceId',
        ].join(',');

        assert.ok(firstLogRecord.eventName === 'event1');
        assert.ok(firstLogRecord.body === 'body1');
        assert.ok(firstLogRecord.severityNumber === SeverityNumber.DEBUG);
        assert.ok(firstLogRecord.severityText === 'DEBUG');
        assert.ok(keys === expectedKeys, 'expectedKeys');
        assert.ok(
          firstLogRecord.instrumentationScope.name === instrumentationScopeName
        );
        assert.ok(
          firstLogRecord.instrumentationScope.version ===
            instrumentationScopeVersion
        );

        assert.ok(spyExport.calledOnce);
      });
    });
  });
});
