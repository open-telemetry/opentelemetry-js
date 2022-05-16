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

import { diag, DiagLogger, DiagLogLevel } from '@opentelemetry/api';
import { Counter, Histogram, } from '@opentelemetry/api-metrics';
import { ExportResultCode, hrTimeToNanoseconds } from '@opentelemetry/core';
import { AggregationTemporality, ResourceMetrics, } from '@opentelemetry/sdk-metrics-base';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { OTLPMetricExporter } from '../../src/platform/browser';
import {
  collect,
  ensureCounterIsCorrect,
  ensureExportMetricsServiceRequestIsSet, ensureHeadersContain,
  ensureHistogramIsCorrect,
  ensureObservableGaugeIsCorrect,
  ensureWebResourceIsCorrect,
  mockCounter,
  mockHistogram,
  mockObservableGauge,
  setUp,
  shutdown,
} from '../metricsHelper';
import { OTLPMetricExporterOptions } from '../../src';
import { OTLPExporterConfigBase } from '@opentelemetry/otlp-exporter-base';
import { IExportMetricsServiceRequest } from '@opentelemetry/otlp-transformer';

describe('OTLPMetricExporter - web', () => {
  let collectorExporter: OTLPMetricExporter;
  let stubOpen: sinon.SinonStub;
  let stubBeacon: sinon.SinonStub;
  let metrics: ResourceMetrics;
  let debugStub: sinon.SinonStub;
  let errorStub: sinon.SinonStub;

  beforeEach(async () => {
    setUp();
    stubOpen = sinon.stub(XMLHttpRequest.prototype, 'open');
    sinon.stub(XMLHttpRequest.prototype, 'send');
    stubBeacon = sinon.stub(navigator, 'sendBeacon');

    const counter: Counter = mockCounter();
    mockObservableGauge(
      observableResult => {
        observableResult.observe(3, {});
        observableResult.observe(6, {});
      },
      'double-observable-gauge2'
    );
    const histogram: Histogram = mockHistogram();

    counter.add(1);
    histogram.record(7);
    histogram.record(14);

    const { resourceMetrics, errors } = await collect();
    assert.strictEqual(errors.length, 0);
    metrics = resourceMetrics;

    // Need to stub/spy on the underlying logger as the "diag" instance is global
    debugStub = sinon.stub();
    errorStub = sinon.stub();
    const nop = () => {
    };
    const diagLogger: DiagLogger = {
      debug: debugStub,
      error: errorStub,
      info: nop,
      verbose: nop,
      warn: nop
    };
    diag.setLogger(diagLogger, DiagLogLevel.DEBUG);
  });

  afterEach(async () => {
    await shutdown();
    sinon.restore();
    diag.disable();
  });

  describe('export', () => {
    describe('when "sendBeacon" is available', () => {
      beforeEach(() => {
        collectorExporter = new OTLPMetricExporter({
          url: 'http://foo.bar.com',
          temporalityPreference: AggregationTemporality.CUMULATIVE
        });
      });
      it('should successfully send metrics using sendBeacon', done => {
        collectorExporter.export(metrics, () => {
        });

        setTimeout(async () => {
          const args = stubBeacon.args[0];
          const url = args[0];
          const blob: Blob = args[1];
          const body = await blob.text();
          const json = JSON.parse(body) as IExportMetricsServiceRequest;
          const metric1 = json.resourceMetrics[0].scopeMetrics[0].metrics[0];
          const metric2 = json.resourceMetrics[0].scopeMetrics[0].metrics[1];
          const metric3 = json.resourceMetrics[0].scopeMetrics[0].metrics[2];

          assert.ok(typeof metric1 !== 'undefined', "metric doesn't exist");

          ensureCounterIsCorrect(
            metric1,
            hrTimeToNanoseconds(metrics.scopeMetrics[0].metrics[0].dataPoints[0].endTime),
            hrTimeToNanoseconds(metrics.scopeMetrics[0].metrics[0].dataPoints[0].startTime)
          );


          assert.ok(
            typeof metric2 !== 'undefined',
            "second metric doesn't exist"
          );
          ensureObservableGaugeIsCorrect(
            metric2,
            hrTimeToNanoseconds(metrics.scopeMetrics[0].metrics[1].dataPoints[0].endTime),
            hrTimeToNanoseconds(metrics.scopeMetrics[0].metrics[1].dataPoints[0].startTime),
            6,
            'double-observable-gauge2'
          );

          assert.ok(
            typeof metric3 !== 'undefined',
            "third metric doesn't exist"
          );
          ensureHistogramIsCorrect(
            metric3,
            hrTimeToNanoseconds(metrics.scopeMetrics[0].metrics[2].dataPoints[0].endTime),
            hrTimeToNanoseconds(metrics.scopeMetrics[0].metrics[2].dataPoints[0].startTime),
            [0, 100],
            [0, 2, 0]
          );

          const resource = json.resourceMetrics[0].resource;
          assert.ok(typeof resource !== 'undefined', "resource doesn't exist");
          ensureWebResourceIsCorrect(resource);

          assert.strictEqual(url, 'http://foo.bar.com');

          assert.strictEqual(stubBeacon.callCount, 1);
          assert.strictEqual(stubOpen.callCount, 0);

          ensureExportMetricsServiceRequestIsSet(json);

          done();
        });
      });

      it('should log the successful message', done => {
        stubBeacon.returns(true);

        collectorExporter.export(metrics, () => {
        });

        setTimeout(() => {
          const response: any = debugStub.args[2][0];
          assert.strictEqual(response, 'sendBeacon - can send');
          assert.strictEqual(errorStub.args.length, 0);

          done();
        });
      });

      it('should log the error message', done => {
        stubBeacon.returns(false);

        collectorExporter.export(metrics, result => {
          assert.deepStrictEqual(result.code, ExportResultCode.FAILED);
          assert.ok(result.error?.message.includes('cannot send'));
          done();
        });
      });
    });

    describe('when "sendBeacon" is NOT available', () => {
      let server: any;
      beforeEach(() => {
        (window.navigator as any).sendBeacon = false;
        collectorExporter = new OTLPMetricExporter({
          url: 'http://foo.bar.com',
          temporalityPreference: AggregationTemporality.CUMULATIVE
        });
        // Overwrites the start time to make tests consistent
        Object.defineProperty(collectorExporter, '_startTime', {
          value: 1592602232694000000,
        });
        server = sinon.fakeServer.create();
      });
      afterEach(() => {
        server.restore();
      });

      it('should successfully send the metrics using XMLHttpRequest', done => {
        collectorExporter.export(metrics, () => {
        });

        setTimeout(() => {
          const request = server.requests[0];
          assert.strictEqual(request.method, 'POST');
          assert.strictEqual(request.url, 'http://foo.bar.com');

          const body = request.requestBody;
          const json = JSON.parse(body) as IExportMetricsServiceRequest;
          const metric1 = json.resourceMetrics[0].scopeMetrics[0].metrics[0];
          const metric2 = json.resourceMetrics[0].scopeMetrics[0].metrics[1];
          const metric3 = json.resourceMetrics[0].scopeMetrics[0].metrics[2];

          assert.ok(typeof metric1 !== 'undefined', "metric doesn't exist");
          ensureCounterIsCorrect(
            metric1,
            hrTimeToNanoseconds(metrics.scopeMetrics[0].metrics[0].dataPoints[0].endTime),
            hrTimeToNanoseconds(metrics.scopeMetrics[0].metrics[0].dataPoints[0].startTime)
          );

          assert.ok(
            typeof metric2 !== 'undefined',
            "second metric doesn't exist"
          );
          ensureObservableGaugeIsCorrect(
            metric2,
            hrTimeToNanoseconds(metrics.scopeMetrics[0].metrics[1].dataPoints[0].endTime),
            hrTimeToNanoseconds(metrics.scopeMetrics[0].metrics[1].dataPoints[0].startTime),
            6,
            'double-observable-gauge2'
          );

          assert.ok(
            typeof metric3 !== 'undefined',
            "third metric doesn't exist"
          );
          ensureHistogramIsCorrect(
            metric3,
            hrTimeToNanoseconds(metrics.scopeMetrics[0].metrics[2].dataPoints[0].endTime),
            hrTimeToNanoseconds(metrics.scopeMetrics[0].metrics[2].dataPoints[0].startTime),
            [0, 100],
            [0, 2, 0]
          );

          const resource = json.resourceMetrics[0].resource;
          assert.ok(typeof resource !== 'undefined', "resource doesn't exist");
          ensureWebResourceIsCorrect(resource);

          assert.strictEqual(stubBeacon.callCount, 0);
          ensureExportMetricsServiceRequestIsSet(json);

          done();
        });
      });

      it('should log the successful message', done => {
        collectorExporter.export(metrics, () => {
        });

        setTimeout(() => {
          const request = server.requests[0];
          request.respond(200);

          const response: any = debugStub.args[2][0];
          assert.strictEqual(response, 'xhr success');
          assert.strictEqual(errorStub.args.length, 0);

          assert.strictEqual(stubBeacon.callCount, 0);
          done();
        });
      });

      it('should log the error message', done => {
        collectorExporter.export(metrics, result => {
          assert.deepStrictEqual(result.code, ExportResultCode.FAILED);
          assert.ok(result.error?.message.includes('Failed to export'));
          assert.strictEqual(stubBeacon.callCount, 0);
          done();
        });

        setTimeout(() => {
          const request = server.requests[0];
          request.respond(400);
        });
      });
      it('should send custom headers', done => {
        collectorExporter.export(metrics, () => {
        });

        setTimeout(() => {
          const request = server.requests[0];
          request.respond(200);

          assert.strictEqual(stubBeacon.callCount, 0);
          done();
        });
      });
    });
  });

  describe('export with custom headers', () => {
    let server: any;
    const customHeaders = {
      foo: 'bar',
      bar: 'baz',
    };
    let collectorExporterConfig: (OTLPExporterConfigBase & OTLPMetricExporterOptions) | undefined;

    beforeEach(() => {
      collectorExporterConfig = {
        headers: customHeaders,
        temporalityPreference: AggregationTemporality.CUMULATIVE
      };
      server = sinon.fakeServer.create();
    });

    afterEach(() => {
      server.restore();
    });

    describe('when "sendBeacon" is available', () => {
      beforeEach(() => {
        collectorExporter = new OTLPMetricExporter(
          collectorExporterConfig
        );
      });
      it('should successfully send custom headers using XMLHTTPRequest', done => {
        collectorExporter.export(metrics, () => {
        });

        setTimeout(() => {
          const [{ requestHeaders }] = server.requests;

          ensureHeadersContain(requestHeaders, customHeaders);
          assert.strictEqual(stubBeacon.callCount, 0);
          assert.strictEqual(stubOpen.callCount, 0);

          done();
        });
      });
    });

    describe('when "sendBeacon" is NOT available', () => {
      beforeEach(() => {
        (window.navigator as any).sendBeacon = false;
        collectorExporter = new OTLPMetricExporter(
          collectorExporterConfig
        );
      });

      it('should successfully send metrics using XMLHttpRequest', done => {
        collectorExporter.export(metrics, () => {
        });

        setTimeout(() => {
          const [{ requestHeaders }] = server.requests;

          ensureHeadersContain(requestHeaders, customHeaders);
          assert.strictEqual(stubBeacon.callCount, 0);
          assert.strictEqual(stubOpen.callCount, 0);

          done();
        });
      });
    });
  });
});

describe('when configuring via environment', () => {
  const envSource = window as any;
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
    const collectorExporter = new OTLPMetricExporter({
      headers: {},
      temporalityPreference: AggregationTemporality.CUMULATIVE
    });
    assert.strictEqual(collectorExporter['_otlpExporter']['_headers'].foo, 'bar');
    envSource.OTEL_EXPORTER_OTLP_HEADERS = '';
  });
  it('should override global headers config with signal headers defined via env', () => {
    envSource.OTEL_EXPORTER_OTLP_HEADERS = 'foo=bar,bar=foo';
    envSource.OTEL_EXPORTER_OTLP_METRICS_HEADERS = 'foo=boo';
    const collectorExporter = new OTLPMetricExporter({
      headers: {},
      temporalityPreference: AggregationTemporality.CUMULATIVE
    });
    assert.strictEqual(collectorExporter['_otlpExporter']['_headers'].foo, 'boo');
    assert.strictEqual(collectorExporter['_otlpExporter']['_headers'].bar, 'foo');
    envSource.OTEL_EXPORTER_OTLP_METRICS_HEADERS = '';
    envSource.OTEL_EXPORTER_OTLP_HEADERS = '';
  });
});
