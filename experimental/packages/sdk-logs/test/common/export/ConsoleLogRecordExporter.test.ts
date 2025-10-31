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
          'instrumentationScope',
          'resource',
          'severityNumber',
          'severityText',
          'spanId',
          'timestamp',
          'traceFlags',
          'traceId',
        ].join(',');

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

    it('should use default depth of 3', () => {
      const consoleExporter = new ConsoleLogRecordExporter();
      const spyConsole = sinon.spy(console, 'dir');
      const provider = new LoggerProvider({
        processors: [new SimpleLogRecordProcessor(consoleExporter)],
      });

      provider.getLogger('test').emit({ body: 'test' });

      const consoleArgs = spyConsole.args[0];
      const options = consoleArgs[1];
      assert.strictEqual(options?.depth, 3);
    });

    it('should use custom depth when provided', () => {
      const consoleExporter = new ConsoleLogRecordExporter({ depth: 5 });
      const spyConsole = sinon.spy(console, 'dir');
      const provider = new LoggerProvider({
        processors: [new SimpleLogRecordProcessor(consoleExporter)],
      });

      provider.getLogger('test').emit({ body: 'test' });

      const consoleArgs = spyConsole.args[0];
      const options = consoleArgs[1];
      assert.strictEqual(options?.depth, 5);
    });

    it('should use null depth when explicitly provided', () => {
      const consoleExporter = new ConsoleLogRecordExporter({ depth: null });
      const spyConsole = sinon.spy(console, 'dir');
      const provider = new LoggerProvider({
        processors: [new SimpleLogRecordProcessor(consoleExporter)],
      });

      provider.getLogger('test').emit({ body: 'test' });

      const consoleArgs = spyConsole.args[0];
      const options = consoleArgs[1];
      assert.strictEqual(options?.depth, null);
    });
  });
});
