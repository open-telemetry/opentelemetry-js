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

import * as core from '@opentelemetry/core';
import * as http from 'http';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { CollectorProtocolNode } from '../../src/enums';
import { CollectorMetricExporter } from '../../src/platform/node';
import { CollectorExporterConfigNode } from '../../src/platform/node/types';
import * as collectorTypes from '../../src/types';

import {
  mockCounter,
  mockObserver,
  mockHistogram,
  ensureExportMetricsServiceRequestIsSet,
  ensureCounterIsCorrect,
  mockValueRecorder,
  ensureValueRecorderIsCorrect,
  ensureHistogramIsCorrect,
  ensureObserverIsCorrect,
} from '../helper';
import { MetricRecord, HistogramAggregator } from '@opentelemetry/metrics';

const fakeRequest = {
  end: function () {},
  on: function () {},
  write: function () {},
};

const mockRes = {
  statusCode: 200,
};

const mockResError = {
  statusCode: 400,
};

describe('CollectorMetricExporter - node with json over http', () => {
  let collectorExporter: CollectorMetricExporter;
  let collectorExporterConfig: CollectorExporterConfigNode;
  let spyRequest: sinon.SinonSpy;
  let spyWrite: sinon.SinonSpy;
  let metrics: MetricRecord[];
  describe('export', () => {
    beforeEach(() => {
      spyRequest = sinon.stub(http, 'request').returns(fakeRequest as any);
      spyWrite = sinon.stub(fakeRequest, 'write');
      collectorExporterConfig = {
        headers: {
          foo: 'bar',
        },
        protocolNode: CollectorProtocolNode.HTTP_JSON,
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
      metrics.push(Object.assign({}, mockCounter));
      metrics.push(Object.assign({}, mockObserver));
      metrics.push(Object.assign({}, mockHistogram));
      metrics.push(Object.assign({}, mockValueRecorder));
      metrics[0].aggregator.update(1);
      metrics[1].aggregator.update(10);
      metrics[2].aggregator.update(7);
      metrics[2].aggregator.update(14);
      metrics[3].aggregator.update(5);
    });
    afterEach(() => {
      // Aggregator is not deep-copied
      metrics[0].aggregator.update(-1);
      mockHistogram.aggregator = new HistogramAggregator([10, 20]);
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
      });
    });

    it('should set custom headers', done => {
      collectorExporter.export(metrics, () => {});

      setTimeout(() => {
        const args = spyRequest.args[0];
        const options = args[0];
        assert.strictEqual(options.headers['foo'], 'bar');
        done();
      });
    });

    it('should successfully send metrics', done => {
      collectorExporter.export(metrics, () => {});

      setTimeout(() => {
        const writeArgs = spyWrite.args[0];
        const json = JSON.parse(
          writeArgs[0]
        ) as collectorTypes.opentelemetryProto.collector.metrics.v1.ExportMetricsServiceRequest;
        const metric1 =
          json.resourceMetrics[0].instrumentationLibraryMetrics[0].metrics[0];
        const metric2 =
          json.resourceMetrics[1].instrumentationLibraryMetrics[0].metrics[0];
        const metric3 =
          json.resourceMetrics[2].instrumentationLibraryMetrics[0].metrics[0];
        const metric4 =
          json.resourceMetrics[3].instrumentationLibraryMetrics[0].metrics[0];
        assert.ok(typeof metric1 !== 'undefined', "counter doesn't exist");
        ensureCounterIsCorrect(
          metric1,
          core.hrTimeToNanoseconds(metrics[0].aggregator.toPoint().timestamp)
        );
        assert.ok(typeof metric2 !== 'undefined', "observer doesn't exist");
        ensureObserverIsCorrect(
          metric2,
          core.hrTimeToNanoseconds(metrics[1].aggregator.toPoint().timestamp)
        );
        assert.ok(typeof metric3 !== 'undefined', "histogram doesn't exist");
        ensureHistogramIsCorrect(
          metric3,
          core.hrTimeToNanoseconds(metrics[2].aggregator.toPoint().timestamp)
        );
        assert.ok(
          typeof metric4 !== 'undefined',
          "value recorder doesn't exist"
        );
        ensureValueRecorderIsCorrect(
          metric4,
          core.hrTimeToNanoseconds(metrics[3].aggregator.toPoint().timestamp)
        );

        ensureExportMetricsServiceRequestIsSet(json);

        done();
      });
    });

    it('should log the successful message', done => {
      const spyLoggerDebug = sinon.stub(collectorExporter.logger, 'debug');
      const spyLoggerError = sinon.stub(collectorExporter.logger, 'error');

      const responseSpy = sinon.spy();
      collectorExporter.export(metrics, responseSpy);

      setTimeout(() => {
        const args = spyRequest.args[0];
        const callback = args[1];
        callback(mockRes);
        setTimeout(() => {
          const response: any = spyLoggerDebug.args[1][0];
          assert.strictEqual(response, 'statusCode: 200');
          assert.strictEqual(spyLoggerError.args.length, 0);
          assert.strictEqual(responseSpy.args[0][0], 0);
          done();
        });
      });
    });

    it('should log the error message', done => {
      const spyLoggerError = sinon.stub(collectorExporter.logger, 'error');

      const responseSpy = sinon.spy();
      collectorExporter.export(metrics, responseSpy);

      setTimeout(() => {
        const args = spyRequest.args[0];
        const callback = args[1];
        callback(mockResError);
        setTimeout(() => {
          const response: any = spyLoggerError.args[0][0];
          assert.strictEqual(response, 'statusCode: 400');

          assert.strictEqual(responseSpy.args[0][0], 1);
          done();
        });
      });
    });
  });
  describe('CollectorMetricExporter - node (getDefaultUrl)', () => {
    it('should default to localhost', done => {
      const collectorExporter = new CollectorMetricExporter({
        protocolNode: CollectorProtocolNode.HTTP_JSON,
      });
      setTimeout(() => {
        assert.strictEqual(
          collectorExporter['url'],
          'http://localhost:55681/v1/metrics'
        );
        done();
      });
    });

    it('should keep the URL if included', done => {
      const url = 'http://foo.bar.com';
      const collectorExporter = new CollectorMetricExporter({ url });
      setTimeout(() => {
        assert.strictEqual(collectorExporter['url'], url);
        done();
      });
    });
  });
});
