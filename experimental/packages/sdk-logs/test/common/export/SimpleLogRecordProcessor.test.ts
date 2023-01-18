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

import type { LogRecordExporter, ReadableLogRecord } from './../../../src';
import { SimpleLogRecordProcessor } from './../../../src';

const setup = (exporter?: LogRecordExporter) => {
  // @ts-expect-error
  const logRecordExporter: LogRecordExporter = exporter || {};
  const processor = new SimpleLogRecordProcessor(logRecordExporter);
  return { processor };
};

describe('SimpleLogRecordProcessor', () => {
  describe('constructor', () => {
    it('should create a SimpleLogRecordProcessor instance', () => {
      assert.ok(setup().processor instanceof SimpleLogRecordProcessor);
    });
  });

  describe('onEmit', () => {
    it('should handle onEmit', async () => {
      const exportSpy = sinon.spy();
      // @ts-expect-error
      const { processor } = setup({ export: exportSpy });
      // @ts-expect-error
      const logRecord: ReadableLogRecord = {};
      processor.onEmit(logRecord);
      assert.ok(exportSpy.callCount === 1);
    });

    it('should call globalErrorHandler when exporting fails', async () => {
      const expectedError = new Error('Exporter failed');
      // @ts-expect-error
      const exporter: LogRecordExporter = {
        export: (_, callback) =>
          setTimeout(
            () =>
              callback({ code: ExportResultCode.FAILED, error: expectedError }),
            0
          ),
      };
      const { processor } = setup(exporter);
      // @ts-expect-error
      const logRecord: ReadableLogRecord = {};
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
      // @ts-expect-error
      const { processor } = setup({ shutdown: shutdownSpy });
      processor.shutdown();
      assert.ok(shutdownSpy.callCount === 1);
    });
  });
});
