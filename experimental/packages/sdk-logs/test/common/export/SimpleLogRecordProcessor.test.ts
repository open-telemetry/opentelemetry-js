/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import type { ExportResult } from '@opentelemetry/core';
import {
  ExportResultCode,
  loggingErrorHandler,
  setGlobalErrorHandler,
} from '@opentelemetry/core';
import type { Resource } from '@opentelemetry/resources';
import {
  defaultResource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import { MeterProvider } from '@opentelemetry/sdk-metrics';

import type { LogRecordExporter } from './../../../src';
import {
  InMemoryLogRecordExporter,
  SimpleLogRecordProcessor,
} from './../../../src';
import { LoggerProviderSharedState } from '../../../src/internal/LoggerProviderSharedState';
import { TestExporterWithDelay } from './TestExporterWithDelay';
import { LogRecordImpl } from '../../../src/LogRecordImpl';
import { TestMetricReader } from '../utils';

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

  describe('Metrics', () => {
    it('should record metrics', async () => {
      const metricReader = new TestMetricReader();
      const meterProvider = new MeterProvider({
        readers: [metricReader],
      });
      const exporter = new InMemoryLogRecordExporter();
      const { logRecord } = setup(exporter);
      const processor = new SimpleLogRecordProcessor(exporter, {
        meterProvider,
      });

      const exportStub = sinon.stub(exporter, 'export');
      exportStub
        .onFirstCall()
        .callsFake((_logs, resultCallback: (result: ExportResult) => void) => {
          resultCallback({ code: ExportResultCode.SUCCESS });
        })
        .onSecondCall()
        .callsFake((_logs, resultCallback: (result: ExportResult) => void) => {
          const error = new Error('Export failed');
          error.name = 'SystemError';
          resultCallback({ code: ExportResultCode.FAILED, error });
        });

      processor.onEmit(logRecord);
      processor.onEmit(logRecord);

      await processor.forceFlush();

      const { resourceMetrics } = await metricReader.collect();
      const scopeMetrics = resourceMetrics.scopeMetrics.find(
        sm => sm.scope.name === '@opentelemetry/sdk-logs'
      );
      assert.ok(scopeMetrics);
      const processedLogsMetric = scopeMetrics.metrics.find(
        m => m.descriptor.name === 'otel.sdk.processor.log.processed'
      );
      assert.ok(processedLogsMetric);
      const processedLogsDataPoints = processedLogsMetric.dataPoints as Array<{
        value: number;
        attributes: Record<string, unknown>;
      }>;
      const successPoint = processedLogsDataPoints.find(
        dataPoint => dataPoint.attributes['error.type'] === undefined
      );
      assert.ok(successPoint);
      assert.strictEqual(successPoint.value, 1);
      assert.strictEqual(
        successPoint.attributes['otel.component.type'],
        'simple_log_processor'
      );
      assert.ok(
        successPoint.attributes['otel.component.name']
          ?.toString()
          .startsWith('simple_log_processor/')
      );
      const failedPoint = processedLogsDataPoints.find(
        dataPoint => dataPoint.attributes['error.type'] === 'SystemError'
      );
      assert.ok(failedPoint);
      assert.strictEqual(failedPoint.value, 1);
      assert.strictEqual(
        failedPoint.attributes['otel.component.type'],
        'simple_log_processor'
      );
      assert.ok(
        failedPoint.attributes['otel.component.name']
          ?.toString()
          .startsWith('simple_log_processor/')
      );
    });
  });
});
