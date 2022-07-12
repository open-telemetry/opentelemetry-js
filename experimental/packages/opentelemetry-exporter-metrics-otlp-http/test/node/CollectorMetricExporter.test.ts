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


import { diag, DiagLogger } from '@opentelemetry/api';
import * as core from '@opentelemetry/core';
import * as assert from 'assert';
import * as http from 'http';
import * as sinon from 'sinon';
import {
  OTLPMetricExporterOptions
} from '../../src';

import {
  OTLPMetricExporter
} from '../../src/platform/node';
import {
  ensureCounterIsCorrect,
  ensureExportMetricsServiceRequestIsSet,
  ensureObservableGaugeIsCorrect,
  ensureHistogramIsCorrect,
  mockCounter,
  mockObservableGauge,
  mockHistogram,
  collect, shutdown, setUp,
} from '../metricsHelper';
import { MockedResponse } from './nodeHelpers';
import { AggregationTemporality, ResourceMetrics } from '@opentelemetry/sdk-metrics-base';
import { Stream, PassThrough } from 'stream';
import { OTLPExporterError, OTLPExporterNodeConfigBase } from '@opentelemetry/otlp-exporter-base';
import { IExportMetricsServiceRequest } from '@opentelemetry/otlp-transformer';

let fakeRequest: PassThrough;

const address = 'localhost:1501';

describe('OTLPMetricExporter - node with json over http', () => {
  let collectorExporter: OTLPMetricExporter;
  let collectorExporterConfig: OTLPExporterNodeConfigBase & OTLPMetricExporterOptions;
  let stubRequest: sinon.SinonStub;
  let metrics: ResourceMetrics;

  beforeEach(async () => {
    setUp();
  });

  afterEach(async () => {
    fakeRequest = new Stream.PassThrough();
    await shutdown();
    sinon.restore();
  });

  describe('instance', () => {
    let warnStub: sinon.SinonStub;

    beforeEach(() => {
      // Need to stub/spy on the underlying logger as the "diag" instance is global
      warnStub = sinon.stub();
      const nop = () => {
      };
      const diagLogger: DiagLogger = {
        debug: nop,
        error: nop,
        info: nop,
        verbose: nop,
        warn: warnStub
      };
      diag.setLogger(diagLogger);
    });

    afterEach(() => {
      diag.disable();
    });

    it('should warn about metadata when using json', () => {
      const metadata = 'foo';
      collectorExporter = new OTLPMetricExporter({
        url: address,
        metadata,
      } as any);
      const args = warnStub.args[0];
      assert.strictEqual(args[0], 'Metadata cannot be set when using http');
    });
  });

  describe('when configuring via environment', () => {
    const envSource = process.env;
    it('should use url defined in env that ends with root path and append version and signal path', () => {
      envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar/';
      const collectorExporter = new OTLPMetricExporter();
      assert.strictEqual(
        collectorExporter._otlpExporter.url,
        `${envSource.OTEL_EXPORTER_OTLP_ENDPOINT}v1/metrics`
      );
      envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
    });
    it('should use url defined in env without checking if path is already present', () => {
      envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar/v1/metrics';
      const collectorExporter = new OTLPMetricExporter();
      assert.strictEqual(
        collectorExporter._otlpExporter.url,
        `${envSource.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`
      );
      envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
    });
    it('should use url defined in env and append version and signal', () => {
      envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar';
      const collectorExporter = new OTLPMetricExporter();
      assert.strictEqual(
        collectorExporter._otlpExporter.url,
        `${envSource.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`
      );
      envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
    });
    it('should override global exporter url with signal url defined in env', () => {
      envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar/';
      envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = 'http://foo.metrics/';
      const collectorExporter = new OTLPMetricExporter();
      assert.strictEqual(
        collectorExporter._otlpExporter.url,
        envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT
      );
      envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
      envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = '';
    });
    it('should add root path when signal url defined in env contains no path and no root path', () => {
      envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = 'http://foo.bar';
      const collectorExporter = new OTLPMetricExporter();
      assert.strictEqual(
        collectorExporter._otlpExporter.url,
        `${envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT}/`
      );
      envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = '';
    });
    it('should not add root path when signal url defined in env contains root path but no path', () => {
      envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = 'http://foo.bar/';
      const collectorExporter = new OTLPMetricExporter();
      assert.strictEqual(
        collectorExporter._otlpExporter.url,
        `${envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT}`
      );
      envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = '';
    });
    it('should not add root path when signal url defined in env contains path', () => {
      envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = 'http://foo.bar/v1/metrics';
      const collectorExporter = new OTLPMetricExporter();
      assert.strictEqual(
        collectorExporter._otlpExporter.url,
        `${envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT}`
      );
      envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = '';
    });
    it('should not add root path when signal url defined in env contains path and ends in /', () => {
      envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = 'http://foo.bar/v1/metrics/';
      const collectorExporter = new OTLPMetricExporter();
      assert.strictEqual(
        collectorExporter._otlpExporter.url,
        `${envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT}`
      );
      envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = '';
    });
    it('should use headers defined via env', () => {
      envSource.OTEL_EXPORTER_OTLP_HEADERS = 'foo=bar';
      const collectorExporter = new OTLPMetricExporter();
      assert.strictEqual(collectorExporter._otlpExporter.headers.foo, 'bar');
      envSource.OTEL_EXPORTER_OTLP_HEADERS = '';
    });
    it('should override global headers config with signal headers defined via env', () => {
      envSource.OTEL_EXPORTER_OTLP_HEADERS = 'foo=bar,bar=foo';
      envSource.OTEL_EXPORTER_OTLP_METRICS_HEADERS = 'foo=boo';
      const collectorExporter = new OTLPMetricExporter();
      assert.strictEqual(collectorExporter._otlpExporter.headers.foo, 'boo');
      assert.strictEqual(collectorExporter._otlpExporter.headers.bar, 'foo');
      envSource.OTEL_EXPORTER_OTLP_METRICS_HEADERS = '';
      envSource.OTEL_EXPORTER_OTLP_HEADERS = '';
    });
  });

  describe('export', () => {
    beforeEach(async () => {
      stubRequest = sinon.stub(http, 'request').returns(fakeRequest as any);
      collectorExporterConfig = {
        headers: {
          foo: 'bar',
        },
        hostname: 'foo',
        url: 'http://foo.bar.com',
        keepAlive: true,
        httpAgentOptions: { keepAliveMsecs: 2000 },
        temporalityPreference: AggregationTemporality.CUMULATIVE
      };

      collectorExporter = new OTLPMetricExporter(collectorExporterConfig);

      const counter = mockCounter();
      mockObservableGauge(
        observableResult => {
          observableResult.observe(6, {});
        },
        'double-observable-gauge2'
      );
      const histogram = mockHistogram();
      counter.add(1);
      histogram.record(7);
      histogram.record(14);

      const { resourceMetrics, errors } = await collect();
      assert.strictEqual(errors.length, 0);
      metrics = resourceMetrics;
    });

    it('should open the connection', done => {
      collectorExporter.export(metrics, () => {
      });

      setTimeout(() => {
        const mockRes = new MockedResponse(200);
        const args = stubRequest.args[0];
        const callback = args[1];
        callback(mockRes);
        mockRes.send('success');
        const options = args[0];

        assert.strictEqual(options.hostname, 'foo.bar.com');
        assert.strictEqual(options.method, 'POST');
        assert.strictEqual(options.path, '/');
        done();
      });
    });

    it('should set custom headers', done => {
      collectorExporter.export(metrics, () => {
      });

      setTimeout(() => {
        const mockRes = new MockedResponse(200);
        const args = stubRequest.args[0];
        const callback = args[1];
        callback(mockRes);
        mockRes.send('success');
        const options = args[0];
        assert.strictEqual(options.headers['foo'], 'bar');
        done();
      });
    });

    it('should have keep alive and keepAliveMsecs option set', done => {
      collectorExporter.export(metrics, () => {
      });

      setTimeout(() => {
        const mockRes = new MockedResponse(200);
        const args = stubRequest.args[0];
        const callback = args[1];
        callback(mockRes);
        mockRes.send('success');
        const options = args[0];
        const agent = options.agent;
        assert.strictEqual(agent.keepAlive, true);
        assert.strictEqual(agent.options.keepAliveMsecs, 2000);
        done();
      });
    });

    it('should successfully send metrics', done => {
      let buff = Buffer.from('');

      collectorExporter.export(metrics, () => {
      });

      fakeRequest.on('end', () => {
        const responseBody = buff.toString();

        const json = JSON.parse(responseBody) as IExportMetricsServiceRequest;
        const metric1 = json.resourceMetrics[0].scopeMetrics[0].metrics[0];
        const metric2 = json.resourceMetrics[0].scopeMetrics[0].metrics[1];
        const metric3 = json.resourceMetrics[0].scopeMetrics[0].metrics[2];

        assert.ok(typeof metric1 !== 'undefined', "counter doesn't exist");
        ensureCounterIsCorrect(
          metric1,
          core.hrTimeToNanoseconds(metrics.scopeMetrics[0].metrics[0].dataPoints[0].endTime),
          core.hrTimeToNanoseconds(metrics.scopeMetrics[0].metrics[0].dataPoints[0].startTime)
        );
        assert.ok(typeof metric2 !== 'undefined', "observable gauge doesn't exist");
        ensureObservableGaugeIsCorrect(
          metric2,
          core.hrTimeToNanoseconds(metrics.scopeMetrics[0].metrics[1].dataPoints[0].endTime),
          core.hrTimeToNanoseconds(metrics.scopeMetrics[0].metrics[1].dataPoints[0].startTime),
          6,
          'double-observable-gauge2'
        );
        assert.ok(typeof metric3 !== 'undefined', "histogram doesn't exist");
        ensureHistogramIsCorrect(
          metric3,
          core.hrTimeToNanoseconds(metrics.scopeMetrics[0].metrics[2].dataPoints[0].endTime),
          core.hrTimeToNanoseconds(metrics.scopeMetrics[0].metrics[2].dataPoints[0].startTime),
          [0, 100],
          [0, 2, 0]
        );

        ensureExportMetricsServiceRequestIsSet(json);

        done();
      });

      fakeRequest.on('data', chunk => {
        buff = Buffer.concat([buff, chunk]);
      });

      const mockRes = new MockedResponse(200);
      const args = stubRequest.args[0];
      const callback = args[1];

      callback(mockRes);
      mockRes.send('success');
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
          const error = result.error as OTLPExporterError;
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
          collectorExporter._otlpExporter.url,
          'http://localhost:4318/v1/metrics'
        );
        done();
      });
    });

    it('should keep the URL if included', done => {
      const url = 'http://foo.bar.com';
      const collectorExporter = new OTLPMetricExporter({
        url,
        temporalityPreference: AggregationTemporality.CUMULATIVE
      });
      setTimeout(() => {
        assert.strictEqual(collectorExporter._otlpExporter.url, url);
        done();
      });
    });
  });
});
