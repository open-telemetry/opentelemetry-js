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
import {
  Counter,
  ObservableGauge,
  Histogram,
} from '@opentelemetry/api-metrics';
import { ExportResultCode } from '@opentelemetry/core';
import {
  OTLPExporterNodeConfigBase,
  otlpTypes,
} from '@opentelemetry/exporter-trace-otlp-http';
import { getExportRequestProto } from '@opentelemetry/exporter-trace-otlp-proto';
import * as metrics from '@opentelemetry/sdk-metrics-base';
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
} from './metricsHelper';

const fakeRequest = {
  end: function () {},
  on: function () {},
  write: function () {},
};

describe('OTLPMetricExporter - node with proto over http', () => {
  let collectorExporter: OTLPMetricExporter;
  let collectorExporterConfig: OTLPExporterNodeConfigBase;
  let metrics: metrics.MetricRecord[];

  describe('when configuring via environment', () => {
    const envSource = process.env;
    it('should use url defined in env', () => {
      envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar/v1/metrics';
      const collectorExporter = new OTLPMetricExporter();
      assert.strictEqual(
        collectorExporter.url,
        envSource.OTEL_EXPORTER_OTLP_ENDPOINT
      );
      envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
    });
    it('should use url defined in env and append version and signal when not present', () => {
      envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar';
      const collectorExporter = new OTLPMetricExporter();
      assert.strictEqual(
        collectorExporter.url,
        `${envSource.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`
      );
      envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
    });
    it('should override global exporter url with signal url defined in env', () => {
      envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar';
      envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = 'http://foo.metrics';
      const collectorExporter = new OTLPMetricExporter();
      assert.strictEqual(
        collectorExporter.url,
        envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT
      );
      envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
      envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = '';
    });
    it('should use headers defined via env', () => {
      envSource.OTEL_EXPORTER_OTLP_HEADERS = 'foo=bar';
      const collectorExporter = new OTLPMetricExporter();
      assert.strictEqual(collectorExporter.headers.foo, 'bar');
      envSource.OTEL_EXPORTER_OTLP_HEADERS = '';
    });
    it('should override global headers config with signal headers defined via env', () => {
      envSource.OTEL_EXPORTER_OTLP_HEADERS = 'foo=bar,bar=foo';
      envSource.OTEL_EXPORTER_OTLP_METRICS_HEADERS = 'foo=boo';
      const collectorExporter = new OTLPMetricExporter();
      assert.strictEqual(collectorExporter.headers.foo, 'boo');
      assert.strictEqual(collectorExporter.headers.bar, 'foo');
      envSource.OTEL_EXPORTER_OTLP_METRICS_HEADERS = '';
      envSource.OTEL_EXPORTER_OTLP_HEADERS = '';
    });
  });

  describe('export', () => {
    beforeEach(async () => {
      collectorExporterConfig = {
        headers: {
          foo: 'bar',
        },
        hostname: 'foo',
        attributes: {},
        url: 'http://foo.bar.com',
        keepAlive: true,
        httpAgentOptions: { keepAliveMsecs: 2000 },
      };
      collectorExporter = new OTLPMetricExporter(collectorExporterConfig);
      // Overwrites the start time to make tests consistent
      Object.defineProperty(collectorExporter, '_startTime', {
        value: 1592602232694000000,
      });
      metrics = [];
      const counter: metrics.Metric<metrics.BoundCounter> &
        Counter = mockCounter();
      const observableGauge: metrics.Metric<metrics.BoundObservable> &
        ObservableGauge = mockObservableGauge(observableResult => {
        observableResult.observe(3, {});
        observableResult.observe(6, {});
      });
      const histogram: metrics.Metric<metrics.BoundHistogram> &
        Histogram = mockHistogram();

      counter.add(1);
      histogram.record(7);
      histogram.record(14);

      metrics.push((await counter.getMetricRecord())[0]);
      metrics.push((await observableGauge.getMetricRecord())[0]);
      metrics.push((await histogram.getMetricRecord())[0]);
    });
    afterEach(() => {
      sinon.restore();
    });

    it('should open the connection', done => {
      collectorExporter.export(metrics, () => {});

      sinon.stub(http, 'request').callsFake((options: any) => {
        assert.strictEqual(options.hostname, 'foo.bar.com');
        assert.strictEqual(options.method, 'POST');
        assert.strictEqual(options.path, '/');
        done();
        return fakeRequest as any;
      });
    });

    it('should set custom headers', done => {
      collectorExporter.export(metrics, () => {});

      sinon.stub(http, 'request').callsFake((options: any) => {
        assert.strictEqual(options.headers['foo'], 'bar');
        done();
        return fakeRequest as any;
      });
    });

    it('should have keep alive and keepAliveMsecs option set', done => {
      collectorExporter.export(metrics, () => {});

      sinon.stub(http, 'request').callsFake((options: any) => {
        assert.strictEqual(options.agent.keepAlive, true);
        assert.strictEqual(options.agent.options.keepAliveMsecs, 2000);
        done();
        return fakeRequest as any;
      });
    });

    it('should successfully send metrics', done => {
      collectorExporter.export(metrics, () => {});

      sinon.stub(http, 'request').returns({
        write: () => {},
        on: () => {},
        end: (...writeArgs: any[]) => {
          const ExportTraceServiceRequestProto = getExportRequestProto();
          const data = ExportTraceServiceRequestProto?.decode(writeArgs[0]);
          const json = data?.toJSON() as otlpTypes.opentelemetryProto.collector.metrics.v1.ExportMetricsServiceRequest;

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
          assert.ok(typeof metric2 !== 'undefined', "observable gauge doesn't exist");
          ensureExportedObservableGaugeIsCorrect(
            metric2,
            metric2.doubleGauge?.dataPoints[0].timeUnixNano
          );
          assert.ok(
            typeof metric3 !== 'undefined',
            "value recorder doesn't exist"
          );
          ensureExportedHistogramIsCorrect(
            metric3,
            metric3.intHistogram?.dataPoints[0].timeUnixNano,
            [0, 100],
            ['0', '2', '0']
          );

          ensureExportMetricsServiceRequestIsSet(json);

          done();
        },
      } as any);
    });

    it('should log the successful message', done => {
      // Need to stub/spy on the underlying logger as the "diag" instance is global
      const spyLoggerError = sinon.stub(diag, 'error');

      collectorExporter.export(metrics, result => {
        assert.strictEqual(result.code, ExportResultCode.SUCCESS);
        assert.strictEqual(spyLoggerError.args.length, 0);
        done();
      });

      sinon.stub(http, 'request').callsFake((options: any, cb: any) => {
        const mockRes = new MockedResponse(200);
        cb(mockRes);
        mockRes.send('success');
        return fakeRequest as any;
      });
    });

    it('should log the error message', done => {
      collectorExporter.export(metrics, result => {
        assert.strictEqual(result.code, ExportResultCode.FAILED);
        // @ts-expect-error verify error code
        assert.strictEqual(result.error.code, 400);
        done();
      });

      sinon.stub(http, 'request').callsFake((options: any, cb: any) => {
        const mockResError = new MockedResponse(400);
        cb(mockResError);
        mockResError.send('failed');

        return fakeRequest as any;
      });
    });
  });
});
