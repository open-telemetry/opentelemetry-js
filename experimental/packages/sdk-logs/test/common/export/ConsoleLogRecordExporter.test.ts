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
  afterEach(() => {
    sinon.restore();
  });

  describe('export', () => {
    it('should export information about log record', () => {
      assert.doesNotThrow(() => {
        const instrumentationScopeName = '@opentelemetry/sdk-logs/test';
        const instrumentationScopeVersion = '1.2.3';
        const consoleExporter = new ConsoleLogRecordExporter();
        const stubConsole = sinon.stub(console, 'log');
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
        const loggedPayload = stubConsole.args[0][0];
        const consoleLogRecord = JSON.parse(loggedPayload);
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
        assert.ok(stubConsole.calledOnce);
      });
    });

    it('should serialize log record using String() when JSON fails', () => {
      const consoleExporter = new ConsoleLogRecordExporter();
      const stubConsole = sinon.stub(console, 'log');
      const originalStringify = JSON.stringify;
      let shouldThrow = true;
      sinon.stub(JSON, 'stringify').callsFake((...args) => {
        if (shouldThrow) {
          shouldThrow = false;
          throw new Error('boom');
        }
        return originalStringify(...args);
      });
      const provider = new LoggerProvider({
        processors: [new SimpleLogRecordProcessor(consoleExporter)],
      });

      provider.getLogger('test').emit({ body: 'trigger fallback' });

      assert.ok(stubConsole.calledOnce);
      assert.strictEqual(stubConsole.args[0][0], '[object Object]');
    });
  });
});
