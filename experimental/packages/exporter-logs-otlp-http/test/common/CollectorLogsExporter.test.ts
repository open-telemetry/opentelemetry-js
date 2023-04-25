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

import { ExportResultCode } from '@opentelemetry/core';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { setUp, shutdown } from '../logsHelper';
import {
  OTLPExporterBase,
  OTLPExporterConfigBase,
} from '@opentelemetry/otlp-exporter-base';
import { IExportMetricsServiceRequest } from '@opentelemetry/otlp-transformer';
import { ReadableLogRecord } from '@opentelemetry/sdk-logs';

type CollectorExporterConfig = OTLPExporterConfigBase;

class OTLPLogsExporter extends OTLPExporterBase<
  CollectorExporterConfig,
  ReadableLogRecord,
  IExportMetricsServiceRequest
> {
  onInit() {}

  onShutdown() {}

  send() {}

  getDefaultUrl(config: CollectorExporterConfig) {
    return config.url || '';
  }

  convert(logs: ReadableLogRecord[]): IExportMetricsServiceRequest {
    return { resourceMetrics: [] };
  }
}

describe('OTLPLogsExporter - common', () => {
  let collectorExporter: OTLPLogsExporter;
  let collectorExporterConfig: CollectorExporterConfig;
  let logs: ReadableLogRecord;

  beforeEach(() => {
    setUp();
  });

  afterEach(async () => {
    await shutdown();
    sinon.restore();
  });

  describe('constructor', () => {
    let onInitSpy: any;

    beforeEach(async () => {
      onInitSpy = sinon.stub(OTLPLogsExporter.prototype, 'onInit');
      collectorExporterConfig = {
        hostname: 'foo',
        url: 'http://foo.bar.com',
      };
      collectorExporter = new OTLPLogsExporter(collectorExporterConfig);
    });

    it('should create an instance', () => {
      assert.ok(typeof collectorExporter !== 'undefined');
    });

    it('should call onInit', () => {
      assert.strictEqual(onInitSpy.callCount, 1);
    });

    describe('when config contains certain params', () => {
      it('should set hostname', () => {
        assert.strictEqual(collectorExporter.hostname, 'foo');
      });

      it('should set url', () => {
        assert.strictEqual(collectorExporter.url, 'http://foo.bar.com');
      });
    });

    describe('when config is missing certain params', () => {
      beforeEach(() => {
        collectorExporter = new OTLPLogsExporter();
      });
    });
  });

  describe('export', () => {
    let spySend: any;
    beforeEach(() => {
      spySend = sinon.stub(OTLPLogsExporter.prototype, 'send');
      collectorExporter = new OTLPLogsExporter(collectorExporterConfig);
    });

    it('should export metrics as otlpTypes.Metrics', done => {
      collectorExporter.export([logs], () => {});
      setTimeout(() => {
        const metric1 = spySend.args[0][0][0] as ReadableLogRecord;
        assert.deepStrictEqual(logs, metric1);
        done();
      });
      assert.strictEqual(spySend.callCount, 1);
    });

    describe('when exporter is shutdown', () => {
      it(
        'should not export anything but return callback with code' +
          ' "FailedNotRetryable"',
        async () => {
          await collectorExporter.shutdown();
          spySend.resetHistory();

          const callbackSpy = sinon.spy();
          collectorExporter.export([logs], callbackSpy);
          const returnCode = callbackSpy.args[0][0];
          assert.strictEqual(
            returnCode.code,
            ExportResultCode.FAILED,
            'return value is wrong'
          );
          assert.strictEqual(spySend.callCount, 0, 'should not call send');
        }
      );
    });
    describe('when an error occurs', () => {
      it('should return failed export result', done => {
        spySend.throws({
          code: 600,
          details: 'Test error',
          metadata: {},
          message: 'Non-Retryable',
          stack: 'Stack',
        });
        const callbackSpy = sinon.spy();
        collectorExporter.export([logs], callbackSpy);
        setTimeout(() => {
          const returnCode = callbackSpy.args[0][0];
          assert.strictEqual(
            returnCode.code,
            ExportResultCode.FAILED,
            'return value is wrong'
          );
          assert.strictEqual(
            returnCode.error.message,
            'Non-Retryable',
            'return error message is wrong'
          );
          assert.strictEqual(spySend.callCount, 1, 'should call send');
          done();
        });
      });
    });
  });

  describe('shutdown', () => {
    let onShutdownSpy: any;
    beforeEach(() => {
      onShutdownSpy = sinon.stub(OTLPLogsExporter.prototype, 'onShutdown');
      collectorExporterConfig = {
        hostname: 'foo',
        url: 'http://foo.bar.com',
      };
      collectorExporter = new OTLPLogsExporter(collectorExporterConfig);
    });

    it('should call onShutdown', async () => {
      await collectorExporter.shutdown();
      assert.strictEqual(onShutdownSpy.callCount, 1);
    });
  });
});
