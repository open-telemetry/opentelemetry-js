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
import { OTLPExporterBase } from '../../src/OTLPExporterBase';
import { OTLPExporterConfigBase } from '../../src/types';
import { ComplexTestObject, mockedComplexTestObject } from '../testHelper';
import * as otlpTypes from '../../src/types';


interface ExportRequest {
  resourceSpans: object[]
}

type CollectorExporterConfig = OTLPExporterConfigBase;
class OTLPTraceExporter extends OTLPExporterBase<
  CollectorExporterConfig,
  ComplexTestObject,
  ExportRequest
  > {
  onInit() {}
  onShutdown() {}
  send(
    items: any[],
    onSuccess: () => void,
    onError: (error: otlpTypes.OTLPExporterError) => void
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

  convert(
    spans: ComplexTestObject[]
  ): ExportRequest {
    return { resourceSpans: [] };
  }
}

describe('OTLPTraceExporter - common', () => {
  let collectorExporter: OTLPTraceExporter;
  let collectorExporterConfig: CollectorExporterConfig;

  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    let onInitSpy: any;

    beforeEach(() => {
      onInitSpy = sinon.stub(OTLPTraceExporter.prototype, 'onInit');
      collectorExporterConfig = {
        hostname: 'foo',
        url: 'http://foo.bar.com',
      };
      collectorExporter = new OTLPTraceExporter(collectorExporterConfig);
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
  });

  describe('export', () => {
    let spySend: any;
    beforeEach(() => {
      spySend = sinon.stub(OTLPTraceExporter.prototype, 'send');
      collectorExporter = new OTLPTraceExporter(collectorExporterConfig);
    });

    it('should export spans as otlpTypes.Spans', done => {
      const spans: ComplexTestObject[] = [];
      spans.push(Object.assign({}, mockedComplexTestObject));

      collectorExporter.export(spans, () => {});
      setTimeout(() => {
        const span1 = spySend.args[0][0][0] as ComplexTestObject;
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
          const spans: ComplexTestObject[] = [];
          spans.push(Object.assign({}, mockedComplexTestObject));
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
        const spans: ComplexTestObject[] = [];
        spans.push(Object.assign({}, mockedComplexTestObject));
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
      const collectorExporterWithConcurrencyLimit = new OTLPTraceExporter({
        ...collectorExporterConfig,
        concurrencyLimit: 3,
      });
      const spans: ComplexTestObject[] = [{ ...mockedComplexTestObject }];
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
        OTLPTraceExporter.prototype,
        'onShutdown'
      );
      collectorExporterConfig = {
        hostname: 'foo',
        url: 'http://foo.bar.com',
      };
      collectorExporter = new OTLPTraceExporter(collectorExporterConfig);
    });

    it('should call onShutdown', async () => {
      await collectorExporter.shutdown();
      assert.strictEqual(onShutdownSpy.callCount, 1);
    });
  });
});
