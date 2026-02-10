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
import { SeverityNumber } from '@opentelemetry/api-logs';
import { ExportResult, ExportResultCode } from '@opentelemetry/core';

import {
  LoggerProvider,
  InMemoryLogRecordExporter,
  SimpleLogRecordProcessor,
} from '../../../src';

const setup = () => {
  const memoryExporter = new InMemoryLogRecordExporter();
  const provider = new LoggerProvider({
    processors: [new SimpleLogRecordProcessor(memoryExporter)],
  });
  return { provider, memoryExporter };
};

describe('InMemoryLogRecordExporter', () => {
  describe('export', () => {
    it('should export information about log record', () => {
      const { provider, memoryExporter } = setup();
      provider.getLogger('default').emit({
        body: 'body1',
        severityNumber: SeverityNumber.DEBUG,
        severityText: 'DEBUG',
      });
      const logRecords = memoryExporter.getFinishedLogRecords();
      assert.ok(logRecords.length === 1);

      const firstLogRecord = logRecords[0];
      assert.ok(firstLogRecord.body === 'body1');
      assert.ok(firstLogRecord.severityNumber === SeverityNumber.DEBUG);
      assert.ok(firstLogRecord.severityText === 'DEBUG');
    });

    it('should return the success result', () => {
      const { memoryExporter } = setup();
      memoryExporter.export([], (result: ExportResult) => {
        assert.strictEqual(result.code, ExportResultCode.SUCCESS);
      });
    });
  });

  describe('shutdown', () => {
    it('should clear all log records', async () => {
      const { provider, memoryExporter } = setup();
      provider.getLogger('default').emit({
        body: 'body1',
        severityNumber: SeverityNumber.DEBUG,
        severityText: 'DEBUG',
      });
      assert.ok(memoryExporter.getFinishedLogRecords().length === 1);
      await memoryExporter.shutdown();
      assert.strictEqual(memoryExporter.getFinishedLogRecords().length, 0);
    });

    it('should return failed result after shutdown', () => {
      const { memoryExporter } = setup();
      memoryExporter.shutdown();

      // after shutdown export should fail
      memoryExporter.export([], (result: ExportResult) => {
        assert.strictEqual(result.code, ExportResultCode.FAILED);
      });
    });
  });

  describe('reset', () => {
    it('should clear all log records', () => {
      const { provider, memoryExporter } = setup();
      provider.getLogger('default').emit({
        body: 'body1',
        severityNumber: SeverityNumber.DEBUG,
        severityText: 'DEBUG',
      });
      assert.ok(memoryExporter.getFinishedLogRecords().length === 1);
      memoryExporter.reset();
      assert.strictEqual(memoryExporter.getFinishedLogRecords().length, 0);
    });
  });

  describe('forceFlush', function () {
    it('should forceFlush without error', async function () {
      const exporter = new InMemoryLogRecordExporter();
      await exporter.forceFlush();
    });
  });
});
