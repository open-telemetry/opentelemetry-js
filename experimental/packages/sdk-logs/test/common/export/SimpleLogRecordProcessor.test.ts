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
import {
  ExportResultCode,
  loggingErrorHandler,
  setGlobalErrorHandler,
} from '@opentelemetry/core';
import {
  defaultResource,
  Resource,
  resourceFromAttributes,
} from '@opentelemetry/resources';

import {
  InMemoryLogRecordExporter,
  LogRecordExporter,
  SimpleLogRecordProcessor,
} from './../../../src';
import { LoggerProviderSharedState } from '../../../src/internal/LoggerProviderSharedState';
import { TestExporterWithDelay } from './TestExporterWithDelay';
import { LogRecordImpl } from '../../../src/LogRecordImpl';

const setup = (exporter: LogRecordExporter, resource?: Resource) => {
  const sharedState = new LoggerProviderSharedState(
    resource || defaultResource(),
    Infinity,
    {
      attributeCountLimit: 128,
      attributeValueLengthLimit: Infinity,
    },
    []
  );
  const logRecord = new LogRecordImpl(
    sharedState,
    {
      name: 'test name',
      version: 'test version',
      schemaUrl: 'test schema url',
    },
    {
      body: 'body',
    }
  );
  const processor = new SimpleLogRecordProcessor(exporter);
  return { exporter, processor, logRecord };
};

describe('SimpleLogRecordProcessor', () => {
  describe('constructor', () => {
    it('should create an instance', () => {
      assert.ok(
        setup(new InMemoryLogRecordExporter()).processor instanceof
          SimpleLogRecordProcessor
      );
    });
  });

  describe('onEmit', () => {
    it('should handle onEmit', async () => {
      const exporter = new InMemoryLogRecordExporter();
      const { processor, logRecord } = setup(exporter);
      assert.strictEqual(exporter.getFinishedLogRecords().length, 0);

      processor.onEmit(logRecord);
      assert.strictEqual(exporter.getFinishedLogRecords().length, 1);

      await processor.shutdown();
      assert.strictEqual(exporter.getFinishedLogRecords().length, 0);
    });

    it('should call globalErrorHandler when exporting fails', async () => {
      const expectedError = new Error('Exporter failed');
      const exporter: LogRecordExporter = {
        export: (_, callback) =>
          setTimeout(
            () =>
              callback({ code: ExportResultCode.FAILED, error: expectedError }),
            0
          ),
        shutdown: () => Promise.resolve(),
        forceFlush: () => Promise.resolve(),
      };
      const { processor, logRecord } = setup(exporter);

      const errorHandlerSpy = sinon.spy();
      setGlobalErrorHandler(errorHandlerSpy);
      processor.onEmit(logRecord);
      await new Promise<void>(resolve => setTimeout(() => resolve(), 0));
      assert.strictEqual(errorHandlerSpy.callCount, 1);
      const [[error]] = errorHandlerSpy.args;
      assert.deepStrictEqual(error, expectedError);
      // reset global error handler
      setGlobalErrorHandler(loggingErrorHandler());
    });
  });

  describe('shutdown', () => {
    it('should handle shutdown', async () => {
      const shutdownSpy = sinon.spy();
      const exporter: LogRecordExporter = {
        export: (_, callback) => callback({ code: ExportResultCode.SUCCESS }),
        shutdown: shutdownSpy,
        forceFlush: () => Promise.resolve(),
      };
      const { processor } = setup(exporter);
      await processor.shutdown();
      assert.ok(shutdownSpy.callCount === 1);
    });
  });

  describe('force flush', () => {
    it('should await unresolved resources', async () => {
      const exporter = new InMemoryLogRecordExporter();
      const asyncResource = resourceFromAttributes({
        async: new Promise<string>(resolve =>
          setTimeout(() => resolve('fromasync'), 1)
        ),
      });
      const { processor, logRecord } = setup(exporter, asyncResource);
      assert.strictEqual(exporter.getFinishedLogRecords().length, 0);
      processor.onEmit(logRecord);

      await processor.forceFlush();

      const exportedLogs = exporter.getFinishedLogRecords();
      assert.strictEqual(exportedLogs.length, 1);
      assert.strictEqual(
        exportedLogs[0].resource.attributes['async'],
        'fromasync'
      );
    });

    it('should await doExport() and delete from _unresolvedExports', async () => {
      const testExporterWithDelay = new TestExporterWithDelay();
      const asyncResource = resourceFromAttributes({
        async: new Promise<string>(resolve =>
          setTimeout(() => resolve('fromasync'), 1)
        ),
      });
      const processor = new SimpleLogRecordProcessor(testExporterWithDelay);
      const { logRecord } = setup(testExporterWithDelay, asyncResource);

      processor.onEmit(logRecord);
      assert.strictEqual(processor['_unresolvedExports'].size, 1);
      await processor.forceFlush();
      assert.strictEqual(processor['_unresolvedExports'].size, 0);
      const exportedLogRecords = testExporterWithDelay.getFinishedLogRecords();
      assert.strictEqual(exportedLogRecords.length, 1);
    });
  });
});
