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

import {
  ConsoleLogger,
  ExportResult,
  ExportResultCode,
  LogLevel,
} from '@opentelemetry/core';
import * as core from '@opentelemetry/core';
import * as http from 'http';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { CollectorMetricExporter } from '../../src/platform/node';
import { CollectorExporterConfigBase } from '../../src/types';
import * as collectorTypes from '../../src/types';
import { MockedResponse } from './nodeHelpers';
import {
  mockCounter,
  mockObserver,
  ensureExportMetricsServiceRequestIsSet,
  ensureCounterIsCorrect,
  mockValueRecorder,
  ensureValueRecorderIsCorrect,
  ensureObserverIsCorrect,
} from '../helper';
import { MetricRecord } from '@opentelemetry/metrics';

const fakeRequest = {
  end: function () {},
  on: function () {},
  write: function () {},
};

const address = 'localhost:1501';

describe('CollectorMetricExporter - node with json over http', () => {
  let collectorExporter: CollectorMetricExporter;
  let collectorExporterConfig: CollectorExporterConfigBase;
  let spyRequest: sinon.SinonSpy;
  let spyWrite: sinon.SinonSpy;
  let metrics: MetricRecord[];
  describe('instance', () => {
    it('should warn about metadata when using json', () => {
      const metadata = 'foo';
      const logger = new ConsoleLogger(LogLevel.DEBUG);
      const spyLoggerWarn = sinon.stub(logger, 'warn');
      collectorExporter = new CollectorMetricExporter({
        logger,
        serviceName: 'basic-service',
        url: address,
        metadata,
      } as any);
      const args = spyLoggerWarn.args[0];
      assert.strictEqual(args[0], 'Metadata cannot be set when using http');
    });
  });

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
          json.resourceMetrics[0].instrumentationLibraryMetrics[0].metrics[1];
        const metric3 =
          json.resourceMetrics[0].instrumentationLibraryMetrics[0].metrics[2];

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
        ensureValueRecorderIsCorrect(
          metric3,
          core.hrTimeToNanoseconds(metrics[2].aggregator.toPoint().timestamp),
          true
        );

        ensureExportMetricsServiceRequestIsSet(json);

        done();
      });
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
          assert.strictEqual(spyLoggerError.args.length, 0);
          assert.strictEqual(
            responseSpy.args[0][0].code,
            ExportResultCode.SUCCESS
          );
          done();
        });
      });
    });

    it('should log the error message', done => {
      const spyLoggerError = sinon.spy();
      const handler = core.loggingErrorHandler({
        debug: sinon.fake(),
        info: sinon.fake(),
        warn: sinon.fake(),
        error: spyLoggerError,
      });
      core.setGlobalErrorHandler(handler);

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
          const error = result.error as collectorTypes.CollectorExporterError;
          assert.ok(error !== undefined);
          assert.strictEqual(error.code, 400);
          assert.strictEqual(error.data, 'failed');
          done();
        });
      });
    });
  });
  describe('CollectorMetricExporter - node (getDefaultUrl)', () => {
    it('should default to localhost', done => {
      const collectorExporter = new CollectorMetricExporter();
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
