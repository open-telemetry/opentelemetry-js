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

import { ExportResultCode, NoopLogger } from '@opentelemetry/core';
import { ReadableSpan } from '@opentelemetry/tracing';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { CollectorExporterBase } from '../../src/CollectorExporterBase';
import { CollectorExporterConfigBase } from '../../src/types';
import { mockedReadableSpan } from '../helper';
import * as collectorTypes from '../../src/types';

type CollectorExporterConfig = CollectorExporterConfigBase;
class CollectorTraceExporter extends CollectorExporterBase<
  CollectorExporterConfig,
  ReadableSpan,
  collectorTypes.opentelemetryProto.collector.trace.v1.ExportTraceServiceRequest
> {
  onInit() {}
  onShutdown() {}
  send(
    items: any[],
    onSuccess: () => void,
    onError: (error: collectorTypes.CollectorExporterError) => void
  ) {
    const promise = Promise.resolve(null);
    this._sendingPromises.push(
      promise.then(() =>
        this._sendingPromises.splice(this._sendingPromises.indexOf(promise), 1)
      )
    );
  }
  getDefaultUrl(config: CollectorExporterConfig): string {
    return config.url || '';
  }
  getDefaultServiceName(config: CollectorExporterConfig): string {
    return config.serviceName || 'collector-exporter';
  }

  convert(
    spans: ReadableSpan[]
  ): collectorTypes.opentelemetryProto.collector.trace.v1.ExportTraceServiceRequest {
    return { resourceSpans: [] };
  }
}

describe('CollectorTraceExporter - common', () => {
  let collectorExporter: CollectorTraceExporter;
  let collectorExporterConfig: CollectorExporterConfig;

  describe('constructor', () => {
    let onInitSpy: any;

    beforeEach(() => {
      onInitSpy = sinon.stub(CollectorTraceExporter.prototype, 'onInit');
      collectorExporterConfig = {
        hostname: 'foo',
        logger: new NoopLogger(),
        serviceName: 'bar',
        attributes: {},
        url: 'http://foo.bar.com',
      };
      collectorExporter = new CollectorTraceExporter(collectorExporterConfig);
    });

    afterEach(() => {
      onInitSpy.restore();
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

      it('should set serviceName', () => {
        assert.strictEqual(collectorExporter.serviceName, 'bar');
      });

      it('should set url', () => {
        assert.strictEqual(collectorExporter.url, 'http://foo.bar.com');
      });

      it('should set logger', () => {
        assert.ok(collectorExporter.logger === collectorExporterConfig.logger);
      });
    });

    describe('when config is missing certain params', () => {
      beforeEach(() => {
        collectorExporter = new CollectorTraceExporter();
      });

      it('should set default serviceName', () => {
        assert.strictEqual(collectorExporter.serviceName, 'collector-exporter');
      });

      it('should set default logger', () => {
        assert.ok(collectorExporter.logger instanceof NoopLogger);
      });
    });
  });

  describe('export', () => {
    let spySend: any;
    beforeEach(() => {
      spySend = sinon.stub(CollectorTraceExporter.prototype, 'send');
      collectorExporter = new CollectorTraceExporter(collectorExporterConfig);
    });
    afterEach(() => {
      spySend.restore();
    });

    it('should export spans as collectorTypes.Spans', done => {
      const spans: ReadableSpan[] = [];
      spans.push(Object.assign({}, mockedReadableSpan));

      collectorExporter.export(spans, () => {});
      setTimeout(() => {
        const span1 = spySend.args[0][0][0] as ReadableSpan;
        assert.deepStrictEqual(spans[0], span1);
        done();
      });
      assert.strictEqual(spySend.callCount, 1);
    });

    describe('when exporter is shutdown', () => {
      it(
        'should not export anything but return callback with code' +
          ' "FailedNotRetryable"',
        async () => {
          const spans: ReadableSpan[] = [];
          spans.push(Object.assign({}, mockedReadableSpan));
          await collectorExporter.shutdown();
          spySend.resetHistory();

          const callbackSpy = sinon.spy();
          collectorExporter.export(spans, callbackSpy);
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
        const spans: ReadableSpan[] = [];
        spans.push(Object.assign({}, mockedReadableSpan));
        spySend.throws({
          code: 100,
          details: 'Test error',
          metadata: {},
          message: 'Non-retryable',
          stack: 'Stack',
        });
        const callbackSpy = sinon.spy();
        collectorExporter.export(spans, callbackSpy);
        setTimeout(() => {
          const returnCode = callbackSpy.args[0][0];
          assert.strictEqual(
            returnCode.code,
            ExportResultCode.FAILED,
            'return value is wrong'
          );
          assert.strictEqual(
            returnCode.error.message,
            'Non-retryable',
            'return error message is wrong'
          );
          assert.strictEqual(spySend.callCount, 1, 'should call send');
          done();
        });
      });
    });
  });
  describe('export - concurrency limit', () => {
    it('should error if too many concurrent exports are queued', done => {
      const collectorExporterWithConcurrencyLimit = new CollectorTraceExporter({
        ...collectorExporterConfig,
        concurrencyLimit: 3,
      });
      const spans: ReadableSpan[] = [{ ...mockedReadableSpan }];
      const callbackSpy = sinon.spy();
      for (let i = 0; i < 7; i++) {
        collectorExporterWithConcurrencyLimit.export(spans, callbackSpy);
      }

      setTimeout(() => {
        // Expect 4 failures
        assert.strictEqual(callbackSpy.args.length, 4);
        callbackSpy.args.forEach(([result]) => {
          assert.strictEqual(result.code, ExportResultCode.FAILED);
          assert.strictEqual(
            result.error!.message,
            'Concurrent export limit reached'
          );
        });
        done();
      });
    });
  });
  describe('shutdown', () => {
    let onShutdownSpy: any;
    beforeEach(() => {
      onShutdownSpy = sinon.stub(
        CollectorTraceExporter.prototype,
        'onShutdown'
      );
      collectorExporterConfig = {
        hostname: 'foo',
        logger: new NoopLogger(),
        serviceName: 'bar',
        attributes: {},
        url: 'http://foo.bar.com',
      };
      collectorExporter = new CollectorTraceExporter(collectorExporterConfig);
    });
    afterEach(() => {
      onShutdownSpy.restore();
    });

    it('should call onShutdown', async () => {
      await collectorExporter.shutdown();
      assert.strictEqual(onShutdownSpy.callCount, 1);
    });
  });
});
