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

import { diag } from '@opentelemetry/api';
import { ExportResultCode } from '@opentelemetry/core';
import * as assert from 'assert';
import * as http from 'http';
import * as sinon from 'sinon';
import { OTLPMetricExporter } from '../src';

import {
  ensureExportedCounterIsCorrect,
  ensureExportedObservableGaugeIsCorrect,
  ensureExportedHistogramIsCorrect,
  ensureExportMetricsServiceRequestIsSet,
  mockCounter,
  MockedResponse,
  mockObservableGauge,
  mockHistogram,
  collect,
  setUp,
  shutdown,
} from './metricsHelper';
import { ResourceMetrics } from '@opentelemetry/sdk-metrics';
import {
  AggregationTemporalityPreference,
  OTLPMetricExporterOptions,
} from '@opentelemetry/exporter-metrics-otlp-http';
import { Stream, PassThrough } from 'stream';
import { OTLPExporterNodeConfigBase } from '@opentelemetry/otlp-exporter-base';
import { VERSION } from '../src/version';
import { Root } from 'protobufjs';
import * as path from 'path';

let fakeRequest: PassThrough;

const dir = path.resolve(__dirname, '../../otlp-transformer/protos');
const root = new Root();
root.resolvePath = function (origin, target) {
  return `${dir}/${target}`;
};
const proto = root.loadSync([
  'opentelemetry/proto/common/v1/common.proto',
  'opentelemetry/proto/resource/v1/resource.proto',
  'opentelemetry/proto/metrics/v1/metrics.proto',
  'opentelemetry/proto/collector/metrics/v1/metrics_service.proto',
]);
const exportRequestServiceProto = proto?.lookupType(
  'ExportMetricsServiceRequest'
);

describe('OTLPMetricExporter - node with proto over http', () => {
  let collectorExporter: OTLPMetricExporter;
  let collectorExporterConfig: OTLPExporterNodeConfigBase &
    OTLPMetricExporterOptions;
  let metrics: ResourceMetrics;

  afterEach(() => {
    fakeRequest = new Stream.PassThrough();
    Object.defineProperty(fakeRequest, 'setTimeout', {
      value: function (_timeout: number) {},
    });
    sinon.restore();
  });

  describe('default behavior for headers', () => {
    const exporter = new OTLPMetricExporter();
    it('should include user agent in header', () => {
      assert.strictEqual(
        exporter._otlpExporter['_transport']['_transport']['_parameters'][
          'headers'
        ]['User-Agent'],
        `OTel-OTLP-Exporter-JavaScript/${VERSION}`
      );
    });
  });

  describe('export', () => {
    beforeEach(async () => {
      collectorExporterConfig = {
        headers: {
          foo: 'bar',
        },
        url: 'http://foo.bar.com',
        keepAlive: true,
        httpAgentOptions: { keepAliveMsecs: 2000 },
        temporalityPreference: AggregationTemporalityPreference.CUMULATIVE,
      };
      collectorExporter = new OTLPMetricExporter(collectorExporterConfig);
      setUp();

      const counter = mockCounter();
      mockObservableGauge(observableResult => {
        observableResult.observe(3, {});
        observableResult.observe(6, {});
      });
      const histogram = mockHistogram();

      counter.add(1);
      histogram.record(7);
      histogram.record(14);

      const { resourceMetrics, errors } = await collect();
      assert.strictEqual(errors.length, 0);
      metrics = resourceMetrics;
    });

    afterEach(async () => {
      await shutdown();
      sinon.restore();
    });

    it('should open the connection', done => {
      sinon.stub(http, 'request').callsFake((options: any, cb: any) => {
        assert.strictEqual(options.hostname, 'foo.bar.com');
        assert.strictEqual(options.method, 'POST');
        assert.strictEqual(options.path, '/');

        queueMicrotask(() => {
          const mockRes = new MockedResponse(200);
          cb(mockRes);
          mockRes.send(Buffer.from('success'));
          done();
        });
        return fakeRequest as any;
      });

      collectorExporter.export(metrics, () => {});
    });

    it('should set custom headers', done => {
      sinon.stub(http, 'request').callsFake((options: any, cb: any) => {
        assert.strictEqual(options.headers['foo'], 'bar');

        queueMicrotask(() => {
          const mockRes = new MockedResponse(200);
          cb(mockRes);
          mockRes.send(Buffer.from('success'));
          done();
        });
        return fakeRequest as any;
      });

      collectorExporter.export(metrics, () => {});
    });

    it('should have keep alive and keepAliveMsecs option set', done => {
      sinon.stub(http, 'request').callsFake((options: any, cb: any) => {
        try {
          assert.strictEqual(options.agent.keepAlive, true);
          assert.strictEqual(options.agent.options.keepAliveMsecs, 2000);

          queueMicrotask(() => {
            const mockRes = new MockedResponse(200);
            cb(mockRes);
            mockRes.send(Buffer.from('success'));
            done();
          });
        } catch (e) {
          done(e);
        }
        return fakeRequest as any;
      });

      collectorExporter.export(metrics, () => {});
    });

    it('should successfully send metrics', done => {
      const fakeRequest = new Stream.PassThrough();
      Object.defineProperty(fakeRequest, 'setTimeout', {
        value: function (_timeout: number) {},
      });
      sinon.stub(http, 'request').returns(fakeRequest as any);

      let buff = Buffer.from('');

      fakeRequest.on('finish', () => {
        try {
          const data = exportRequestServiceProto.decode(buff);
          const json = data?.toJSON() as any;

          // The order of the metrics is not guaranteed.
          const counterIndex = metrics.scopeMetrics[0].metrics.findIndex(
            it => it.descriptor.name === 'int-counter'
          );
          const observableIndex = metrics.scopeMetrics[0].metrics.findIndex(
            it => it.descriptor.name === 'double-observable-gauge'
          );
          const histogramIndex = metrics.scopeMetrics[0].metrics.findIndex(
            it => it.descriptor.name === 'int-histogram'
          );

          const metric1 =
            json.resourceMetrics[0].scopeMetrics[0].metrics[counterIndex];
          const metric2 =
            json.resourceMetrics[0].scopeMetrics[0].metrics[observableIndex];
          const metric3 =
            json.resourceMetrics[0].scopeMetrics[0].metrics[histogramIndex];

          assert.ok(typeof metric1 !== 'undefined', "counter doesn't exist");
          ensureExportedCounterIsCorrect(
            metric1,
            metrics.scopeMetrics[0].metrics[counterIndex].dataPoints[0].endTime,
            metrics.scopeMetrics[0].metrics[counterIndex].dataPoints[0]
              .startTime
          );
          assert.ok(
            typeof metric2 !== 'undefined',
            "observable gauge doesn't exist"
          );
          ensureExportedObservableGaugeIsCorrect(
            metric2,
            metrics.scopeMetrics[0].metrics[observableIndex].dataPoints[0]
              .endTime,
            metrics.scopeMetrics[0].metrics[observableIndex].dataPoints[0]
              .startTime
          );
          assert.ok(
            typeof metric3 !== 'undefined',
            "value recorder doesn't exist"
          );
          ensureExportedHistogramIsCorrect(
            metric3,
            metrics.scopeMetrics[0].metrics[histogramIndex].dataPoints[0]
              .endTime,
            metrics.scopeMetrics[0].metrics[histogramIndex].dataPoints[0]
              .startTime,
            [0, 100],
            ['0', '2', '0']
          );

          ensureExportMetricsServiceRequestIsSet(json);
          done();
        } catch (e) {
          done(e);
        }
      });

      fakeRequest.on('data', chunk => {
        buff = Buffer.concat([buff, chunk]);
      });

      try {
        collectorExporter.export(metrics, () => {});
      } catch (error) {
        done(error);
      }
    });

    it('should log the successful message', done => {
      // Need to stub/spy on the underlying logger as the "diag" instance is global
      const spyLoggerError = sinon.stub(diag, 'error');

      sinon.stub(http, 'request').callsFake((options: any, cb: any) => {
        queueMicrotask(() => {
          const mockRes = new MockedResponse(200);
          cb(mockRes);
          mockRes.send(Buffer.from('success'));
        });

        return fakeRequest as any;
      });

      collectorExporter.export(metrics, result => {
        assert.strictEqual(result.code, ExportResultCode.SUCCESS);
        assert.strictEqual(spyLoggerError.args.length, 0);
        done();
      });
    });

    it('should return the error code message', done => {
      sinon.stub(http, 'request').callsFake((options: any, cb: any) => {
        queueMicrotask(() => {
          const mockRes = new MockedResponse(400);
          cb(mockRes);
          mockRes.send(Buffer.from('failure'));
        });

        return fakeRequest as any;
      });

      collectorExporter.export(metrics, result => {
        try {
          assert.strictEqual(result.code, ExportResultCode.FAILED);
          // @ts-expect-error verify error code
          assert.strictEqual(result.error.code, 400);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
});
