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

import { collectorTypes } from '@opentelemetry/exporter-collector';
import * as core from '@opentelemetry/core';
import * as http from 'http';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { CollectorMetricExporter } from '../src';
import { getExportRequestProto } from '../src/util';

import {
  mockCounter,
  mockObserver,
  ensureExportMetricsServiceRequestIsSet,
  mockValueRecorder,
  ensureExportedCounterIsCorrect,
  ensureExportedObserverIsCorrect,
  ensureExportedValueRecorderIsCorrect,
  MockedResponse,
} from './helper';
import { MetricRecord } from '@opentelemetry/metrics';
import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import { CollectorExporterError } from '@opentelemetry/exporter-collector/build/src/types';

const fakeRequest = {
  end: function () {},
  on: function () {},
  write: function () {},
};

// send is lazy loading file so need to wait a bit
const waitTimeMS = 20;

describe('CollectorMetricExporter - node with proto over http', () => {
  let collectorExporter: CollectorMetricExporter;
  let collectorExporterConfig: collectorTypes.CollectorExporterConfigBase;
  let spyRequest: sinon.SinonSpy;
  let spyWrite: sinon.SinonSpy;
  let metrics: MetricRecord[];
  describe('export', () => {
    beforeEach(async () => {
      spyRequest = sinon.stub(http, 'request').returns(fakeRequest as any);
      spyWrite = sinon.stub(fakeRequest, 'write');
      collectorExporterConfig = {
        headers: {
          foo: 'bar',
        },
        hostname: 'foo',
        logger: new core.NoopLogger(),
        serviceName: 'bar',
        attributes: {},
        url: 'http://foo.bar.com',
      };
      collectorExporter = new CollectorMetricExporter(collectorExporterConfig);
      // Overwrites the start time to make tests consistent
      Object.defineProperty(collectorExporter, '_startTime', {
        value: 1592602232694000000,
      });
      metrics = [];
      metrics.push(await mockCounter());
      metrics.push(await mockObserver());
      metrics.push(await mockValueRecorder());
      metrics[0].aggregator.update(1);
      metrics[1].aggregator.update(3);
      metrics[1].aggregator.update(6);
      metrics[2].aggregator.update(7);
      metrics[2].aggregator.update(14);
    });
    afterEach(() => {
      spyRequest.restore();
      spyWrite.restore();
    });

    it('should open the connection', done => {
      collectorExporter.export(metrics, () => {});

      setTimeout(() => {
        const args = spyRequest.args[0];
        const options = args[0];

        assert.strictEqual(options.hostname, 'foo.bar.com');
        assert.strictEqual(options.method, 'POST');
        assert.strictEqual(options.path, '/');
        done();
      }, waitTimeMS);
    });

    it('should set custom headers', done => {
      collectorExporter.export(metrics, () => {});

      setTimeout(() => {
        const args = spyRequest.args[0];
        const options = args[0];
        assert.strictEqual(options.headers['foo'], 'bar');
        done();
      }, waitTimeMS);
    });

    it('should successfully send metrics', done => {
      collectorExporter.export(metrics, () => {});

      setTimeout(() => {
        const writeArgs = spyWrite.args[0];
        const ExportTraceServiceRequestProto = getExportRequestProto();
        const data = ExportTraceServiceRequestProto?.decode(writeArgs[0]);
        const json = data?.toJSON() as collectorTypes.opentelemetryProto.collector.metrics.v1.ExportMetricsServiceRequest;

        const metric1 =
          json.resourceMetrics[0].instrumentationLibraryMetrics[0].metrics[0];
        const metric2 =
          json.resourceMetrics[0].instrumentationLibraryMetrics[0].metrics[1];
        const metric3 =
          json.resourceMetrics[0].instrumentationLibraryMetrics[0].metrics[2];

        assert.ok(typeof metric1 !== 'undefined', "counter doesn't exist");
        ensureExportedCounterIsCorrect(
          metric1,
          metric1.intSum?.dataPoints[0].timeUnixNano
        );
        assert.ok(typeof metric2 !== 'undefined', "observer doesn't exist");
        ensureExportedObserverIsCorrect(
          metric2,
          metric2.doubleGauge?.dataPoints[0].timeUnixNano
        );
        assert.ok(
          typeof metric3 !== 'undefined',
          "value recorder doesn't exist"
        );
        ensureExportedValueRecorderIsCorrect(
          metric3,
          metric3.intHistogram?.dataPoints[0].timeUnixNano,
          [0, 100],
          ['0', '2', '0']
        );

        ensureExportMetricsServiceRequestIsSet(json);

        done();
      }, waitTimeMS);
    });

    it('should log the successful message', done => {
      const spyLoggerError = sinon.stub(collectorExporter.logger, 'error');

      const responseSpy = sinon.spy();
      collectorExporter.export(metrics, responseSpy);

      setTimeout(() => {
        const mockRes = new MockedResponse(200);
        const args = spyRequest.args[0];
        const callback = args[1];
        callback(mockRes);
        mockRes.send('success');
        setTimeout(() => {
          const result = responseSpy.args[0][0] as ExportResult;
          assert.strictEqual(result.code, ExportResultCode.SUCCESS);
          assert.strictEqual(spyLoggerError.args.length, 0);
          done();
        });
      }, waitTimeMS);
    });

    it('should log the error message', done => {
      const responseSpy = sinon.spy();
      collectorExporter.export(metrics, responseSpy);

      setTimeout(() => {
        const mockRes = new MockedResponse(400);
        const args = spyRequest.args[0];
        const callback = args[1];
        callback(mockRes);
        mockRes.send('failed');
        setTimeout(() => {
          const result = responseSpy.args[0][0] as ExportResult;
          assert.strictEqual(result.code, ExportResultCode.FAILED);
          const error = result.error as CollectorExporterError;
          assert.strictEqual(error.code, 400);
          assert.strictEqual(error.data, 'failed');
          done();
        });
      }, waitTimeMS);
    });
  });
});
