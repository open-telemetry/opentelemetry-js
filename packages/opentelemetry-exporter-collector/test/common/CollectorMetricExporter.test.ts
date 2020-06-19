/*!
 * Copyright 2020, OpenTelemetry Authors
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

import { ExportResult, NoopLogger } from '@opentelemetry/core';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { CollectorMetricExporterBase } from '../../src/CollectorMetricExporterBase';
import { ExporterOptions } from '../../src/types';
import { MetricRecord, MeterProvider } from '@opentelemetry/metrics';
import { Labels } from '@opentelemetry/api';

class CollectorMetricExporter extends CollectorMetricExporterBase {
  onInit() {}
  onShutdown() {}
  sendMetrics() {}
  getDefaultUrl(url: string) {
    return url || '';
  }
}

describe('CollectorMetricExporter - common', () => {
  let collectorExporter: CollectorMetricExporter;
  let collectorExporterConfig: ExporterOptions;
  let records: MetricRecord[];
  describe('constructor', () => {
    let onInitSpy: any;

    beforeEach(() => {
      onInitSpy = sinon.stub(CollectorMetricExporter.prototype, 'onInit');
      collectorExporterConfig = {
        hostName: 'foo',
        logger: new NoopLogger(),
        serviceName: 'bar',
        attributes: {},
        url: 'http://foo.bar.com',
      };
      collectorExporter = new CollectorMetricExporter(collectorExporterConfig);
      const meter = new MeterProvider().getMeter('test-meter');
      const labels: Labels = { ['keyb']: 'value2', ['keya']: 'value1' };
      const counter = meter.createCounter('name', {
        labelKeys: ['keya', 'keyb'],
      });
      counter.bind(labels).add(10);
      meter.collect();
      records = meter.getBatcher().checkPointSet();
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
      it('should set hostName', () => {
        assert.strictEqual(collectorExporter.hostName, 'foo');
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
        collectorExporter = new CollectorMetricExporter();
      });

      it('should set default serviceName', () => {
        assert.strictEqual(
          collectorExporter.serviceName,
          'collector-metric-exporter'
        );
      });

      it('should set default logger', () => {
        assert.ok(collectorExporter.logger instanceof NoopLogger);
      });
    });
  });

  describe('export', () => {
    let spySend: any;
    beforeEach(() => {
      spySend = sinon.stub(CollectorMetricExporter.prototype, 'sendMetrics');
      collectorExporter = new CollectorMetricExporter(collectorExporterConfig);
    });
    afterEach(() => {
      spySend.restore();
    });

    it('should export spans as collectorTypes.Spans', done => {
      const metrics: MetricRecord[] = [];
      metrics.push(Object.assign({}, records[0]));

      collectorExporter.export(metrics, () => {});
      setTimeout(() => {
        const metric1 = spySend.args[0][0][0] as MetricRecord;
        assert.deepStrictEqual(metrics[0], metric1);
        done();
      });
      assert.strictEqual(spySend.callCount, 1);
    });

    describe('when exporter is shutdown', () => {
      it('should not export anything but return callback with code "FailedNotRetryable"', () => {
        const metrics: MetricRecord[] = [];
        metrics.push(Object.assign({}, records[0]));
        collectorExporter.shutdown();
        spySend.resetHistory();

        const callbackSpy = sinon.spy();
        collectorExporter.export(metrics, callbackSpy);
        const returnCode = callbackSpy.args[0][0];

        assert.strictEqual(
          returnCode,
          ExportResult.FAILED_NOT_RETRYABLE,
          'return value is wrong'
        );
        assert.strictEqual(spySend.callCount, 0, 'should not call send');
      });
    });
  });

  describe('shutdown', () => {
    let onShutdownSpy: any;
    beforeEach(() => {
      onShutdownSpy = sinon.stub(
        CollectorMetricExporter.prototype,
        'onShutdown'
      );
      collectorExporterConfig = {
        hostName: 'foo',
        logger: new NoopLogger(),
        serviceName: 'bar',
        attributes: {},
        url: 'http://foo.bar.com',
      };
      collectorExporter = new CollectorMetricExporter(collectorExporterConfig);
    });
    afterEach(() => {
      onShutdownSpy.restore();
    });

    it('should call onShutdown', done => {
      collectorExporter.shutdown();
      setTimeout(() => {
        assert.equal(onShutdownSpy.callCount, 1);
        done();
      });
    });
  });
});
