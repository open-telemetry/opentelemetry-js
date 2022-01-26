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
import * as core from '@opentelemetry/core';
import {
  BoundCounter,
  BoundObservable,
  BoundHistogram,
  Metric,
  MetricRecord,
} from '@opentelemetry/sdk-metrics-base';
import * as assert from 'assert';
import * as http from 'http';
import * as sinon from 'sinon';
import {
  OTLPMetricExporter,
} from '../../src/platform/node';
import { OTLPExporterNodeConfigBase, otlpTypes } from '@opentelemetry/exporter-trace-otlp-http';
import {
  ensureCounterIsCorrect,
  ensureExportMetricsServiceRequestIsSet,
  ensureObservableGaugeIsCorrect,
  ensureHistogramIsCorrect,
  mockCounter,
  mockObservableGauge,
  mockHistogram,
} from '../metricsHelper';
import { MockedResponse } from './nodeHelpers';

const fakeRequest = {
  end: function () {},
  on: function () {},
  write: function () {},
};

const address = 'localhost:1501';

describe('OTLPMetricExporter - node with json over http', () => {
  let collectorExporter: OTLPMetricExporter;
  let collectorExporterConfig: OTLPExporterNodeConfigBase;
  let stubRequest: sinon.SinonStub;
  let stubWrite: sinon.SinonStub;
  let metrics: MetricRecord[];

  afterEach(() => {
    sinon.restore();
  });

  describe('instance', () => {
    it('should warn about metadata when using json', () => {
      const metadata = 'foo';
      // Need to stub/spy on the underlying logger as the "diag" instance is global
      const spyLoggerWarn = sinon.stub(diag, 'warn');
      collectorExporter = new OTLPMetricExporter({
        url: address,
        metadata,
      } as any);
      const args = spyLoggerWarn.args[0];
      assert.strictEqual(args[0], 'Metadata cannot be set when using http');
    });
  });

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
      stubRequest = sinon.stub(http, 'request').returns(fakeRequest as any);
      stubWrite = sinon.stub(fakeRequest, 'write');
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
      const counter: Metric<BoundCounter> & Counter = mockCounter();
      const observableGauge: Metric<BoundObservable> & ObservableGauge = mockObservableGauge(
        observableResult => {
          observableResult.observe(6, {});
        },
        'double-observable-gauge2'
      );
      const histogram: Metric<BoundHistogram> &
        Histogram = mockHistogram();
      counter.add(1);
      histogram.record(7);
      histogram.record(14);

      metrics.push((await counter.getMetricRecord())[0]);
      metrics.push((await observableGauge.getMetricRecord())[0]);
      metrics.push((await histogram.getMetricRecord())[0]);
    });

    it('should open the connection', done => {
      collectorExporter.export(metrics, () => {});

      setTimeout(() => {
        const args = stubRequest.args[0];
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
        const args = stubRequest.args[0];
        const options = args[0];
        assert.strictEqual(options.headers['foo'], 'bar');
        done();
      });
    });

    it('should have keep alive and keepAliveMsecs option set', done => {
      collectorExporter.export(metrics, () => {});

      setTimeout(() => {
        const args = stubRequest.args[0];
        const options = args[0];
        const agent = options.agent;
        assert.strictEqual(agent.keepAlive, true);
        assert.strictEqual(agent.options.keepAliveMsecs, 2000);
        done();
      });
    });

    it('should successfully send metrics', done => {
      collectorExporter.export(metrics, () => {});

      setTimeout(() => {
        const writeArgs = stubWrite.args[0];
        const json = JSON.parse(
          writeArgs[0]
        ) as otlpTypes.opentelemetryProto.collector.metrics.v1.ExportMetricsServiceRequest;
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
        assert.ok(typeof metric2 !== 'undefined', "observable gauge doesn't exist");
        ensureObservableGaugeIsCorrect(
          metric2,
          core.hrTimeToNanoseconds(metrics[1].aggregator.toPoint().timestamp),
          6,
          'double-observable-gauge2'
        );
        assert.ok(typeof metric3 !== 'undefined', "histogram doesn't exist");
        ensureHistogramIsCorrect(
          metric3,
          core.hrTimeToNanoseconds(metrics[2].aggregator.toPoint().timestamp),
          [0, 100],
          [0, 2, 0]
        );

        ensureExportMetricsServiceRequestIsSet(json);

        done();
      });
    });

    it('should log the successful message', done => {
      // Need to stub/spy on the underlying logger as the "diag" instance is global
      const stubLoggerError = sinon.stub(diag, 'error');

      const responseSpy = sinon.spy();
      collectorExporter.export(metrics, responseSpy);

      setTimeout(() => {
        const mockRes = new MockedResponse(200);
        const args = stubRequest.args[0];
        const callback = args[1];
        callback(mockRes);
        mockRes.send('success');
        setTimeout(() => {
          assert.strictEqual(stubLoggerError.args.length, 0);
          assert.strictEqual(
            responseSpy.args[0][0].code,
            core.ExportResultCode.SUCCESS
          );
          done();
        });
      });
    });

    it('should log the error message', done => {
      const handler = core.loggingErrorHandler();
      core.setGlobalErrorHandler(handler);

      const responseSpy = sinon.spy();
      collectorExporter.export(metrics, responseSpy);

      setTimeout(() => {
        const mockRes = new MockedResponse(400);
        const args = stubRequest.args[0];
        const callback = args[1];
        callback(mockRes);
        mockRes.send('failed');
        setTimeout(() => {
          const result = responseSpy.args[0][0] as core.ExportResult;
          assert.strictEqual(result.code, core.ExportResultCode.FAILED);
          const error = result.error as otlpTypes.OTLPExporterError;
          assert.ok(error !== undefined);
          assert.strictEqual(error.code, 400);
          assert.strictEqual(error.data, 'failed');
          done();
        });
      });
    });
  });
  describe('OTLPMetricExporter - node (getDefaultUrl)', () => {
    it('should default to localhost', done => {
      const collectorExporter = new OTLPMetricExporter();
      setTimeout(() => {
        assert.strictEqual(
          collectorExporter['url'],
          'http://localhost:4318/v1/metrics'
        );
        done();
      });
    });

    it('should keep the URL if included', done => {
      const url = 'http://foo.bar.com';
      const collectorExporter = new OTLPMetricExporter({ url });
      setTimeout(() => {
        assert.strictEqual(collectorExporter['url'], url);
        done();
      });
    });
  });
});
