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
  diag,
  DiagLogger,
  DiagLogLevel,
  Counter,
  Histogram,
} from '@opentelemetry/api';
import { ExportResultCode } from '@opentelemetry/core';
import { ResourceMetrics } from '@opentelemetry/sdk-metrics';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { OTLPMetricExporter } from '../../src/platform/browser';
import {
  collect,
  ensureCounterIsCorrect,
  ensureExportMetricsServiceRequestIsSet,
  ensureHeadersContain,
  ensureHistogramIsCorrect,
  ensureObservableGaugeIsCorrect,
  ensureWebResourceIsCorrect,
  HISTOGRAM_AGGREGATION_VIEW,
  mockCounter,
  mockHistogram,
  mockObservableGauge,
  setUp,
  shutdown,
} from '../metricsHelper';
import {
  AggregationTemporalityPreference,
  OTLPMetricExporterOptions,
} from '../../src';
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
    setUp([HISTOGRAM_AGGREGATION_VIEW]);
    stubOpen = sinon.stub(XMLHttpRequest.prototype, 'open');
    sinon.stub(XMLHttpRequest.prototype, 'send');
    stubBeacon = sinon.stub(navigator, 'sendBeacon');

    const counter: Counter = mockCounter();
    mockObservableGauge(observableResult => {
      observableResult.observe(3, {});
      observableResult.observe(6, {});
    }, 'double-observable-gauge2');
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
    const nop = () => {};
    const diagLogger: DiagLogger = {
      debug: debugStub,
      error: errorStub,
      info: nop,
      verbose: nop,
      warn: nop,
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
          temporalityPreference: AggregationTemporalityPreference.CUMULATIVE,
        });
      });

      it('should successfully send metrics using sendBeacon', done => {
        collectorExporter.export(metrics, () => {});

        setTimeout(async () => {
          const args = stubBeacon.args[0];
          const url = args[0];
          const blob: Blob = args[1];
          const body = await blob.text();
          const json = JSON.parse(body) as IExportMetricsServiceRequest;

          // The order of the metrics is not guaranteed.
          const counterIndex = metrics.scopeMetrics[0].metrics.findIndex(
            it => it.descriptor.name === 'int-counter'
          );
          const observableIndex = metrics.scopeMetrics[0].metrics.findIndex(
            it => it.descriptor.name === 'double-observable-gauge2'
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

          assert.ok(typeof metric1 !== 'undefined', "metric doesn't exist");

          ensureCounterIsCorrect(
            metric1,
            metrics.scopeMetrics[0].metrics[counterIndex].dataPoints[0].endTime,
            metrics.scopeMetrics[0].metrics[counterIndex].dataPoints[0]
              .startTime
          );

          assert.ok(
            typeof metric2 !== 'undefined',
            "second metric doesn't exist"
          );
          ensureObservableGaugeIsCorrect(
            metric2,
            metrics.scopeMetrics[0].metrics[observableIndex].dataPoints[0]
              .endTime,
            metrics.scopeMetrics[0].metrics[observableIndex].dataPoints[0]
              .startTime,
            6,
            'double-observable-gauge2'
          );

          assert.ok(
            typeof metric3 !== 'undefined',
            "third metric doesn't exist"
          );
          ensureHistogramIsCorrect(
            metric3,
            metrics.scopeMetrics[0].metrics[histogramIndex].dataPoints[0]
              .endTime,
            metrics.scopeMetrics[0].metrics[histogramIndex].dataPoints[0]
              .startTime,
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

        collectorExporter.export(metrics, () => {});

        queueMicrotask(() => {
          const response: any = debugStub.args[2][0];
          assert.strictEqual(response, 'SendBeacon success');
          assert.strictEqual(errorStub.args.length, 0);

          done();
        });
      });

      it('should log the error message', done => {
        stubBeacon.returns(false);

        collectorExporter.export(metrics, result => {
          try {
            assert.deepStrictEqual(result.code, ExportResultCode.FAILED);
            assert.ok(
              result.error,
              'Expected Error, but no Error was present on the result'
            );
            assert.match(result.error?.message, /SendBeacon failed/);
            done();
          } catch (e) {
            done(e);
          }
        });
      });
    });

    describe('when "sendBeacon" is NOT available', () => {
      let server: any;
      beforeEach(() => {
        (window.navigator as any).sendBeacon = false;
        collectorExporter = new OTLPMetricExporter({
          url: 'http://foo.bar.com',
          temporalityPreference: AggregationTemporalityPreference.CUMULATIVE,
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
        collectorExporter.export(metrics, () => {});

        queueMicrotask(async () => {
          const request = server.requests[0];
          assert.strictEqual(request.method, 'POST');
          assert.strictEqual(request.url, 'http://foo.bar.com');

          const body = request.requestBody;
          const decoder = new TextDecoder();
          const json = JSON.parse(
            decoder.decode(await body.arrayBuffer())
          ) as IExportMetricsServiceRequest;
          // The order of the metrics is not guaranteed.
          const counterIndex = metrics.scopeMetrics[0].metrics.findIndex(
            it => it.descriptor.name === 'int-counter'
          );
          const observableIndex = metrics.scopeMetrics[0].metrics.findIndex(
            it => it.descriptor.name === 'double-observable-gauge2'
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

          assert.ok(typeof metric1 !== 'undefined', "metric doesn't exist");
          ensureCounterIsCorrect(
            metric1,
            metrics.scopeMetrics[0].metrics[counterIndex].dataPoints[0].endTime,
            metrics.scopeMetrics[0].metrics[counterIndex].dataPoints[0]
              .startTime
          );

          assert.ok(
            typeof metric2 !== 'undefined',
            "second metric doesn't exist"
          );
          ensureObservableGaugeIsCorrect(
            metric2,
            metrics.scopeMetrics[0].metrics[observableIndex].dataPoints[0]
              .endTime,
            metrics.scopeMetrics[0].metrics[observableIndex].dataPoints[0]
              .startTime,
            6,
            'double-observable-gauge2'
          );

          assert.ok(
            typeof metric3 !== 'undefined',
            "third metric doesn't exist"
          );
          ensureHistogramIsCorrect(
            metric3,
            metrics.scopeMetrics[0].metrics[histogramIndex].dataPoints[0]
              .endTime,
            metrics.scopeMetrics[0].metrics[histogramIndex].dataPoints[0]
              .startTime,
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
        collectorExporter.export(metrics, () => {});

        queueMicrotask(() => {
          const request = server.requests[0];
          request.respond(200);

          const response: any = debugStub.args[2][0];
          assert.strictEqual(response, 'XHR success');
          assert.strictEqual(errorStub.args.length, 0);

          assert.strictEqual(stubBeacon.callCount, 0);
          done();
        });
      });

      it('should log the error message', done => {
        collectorExporter.export(metrics, result => {
          try {
            assert.deepStrictEqual(result.code, ExportResultCode.FAILED);
            assert.deepStrictEqual(
              result.error?.message,
              'XHR request failed with non-retryable status'
            );
          } catch (e) {
            done(e);
          }
          done();
        });

        queueMicrotask(() => {
          const request = server.requests[0];
          request.respond(400);
        });
      });
      it('should send custom headers', done => {
        collectorExporter.export(metrics, () => {});

        queueMicrotask(() => {
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
    let collectorExporterConfig:
      | (OTLPExporterConfigBase & OTLPMetricExporterOptions)
      | undefined;

    beforeEach(() => {
      collectorExporterConfig = {
        headers: customHeaders,
        temporalityPreference: AggregationTemporalityPreference.CUMULATIVE,
      };
      server = sinon.fakeServer.create();
    });

    afterEach(() => {
      server.restore();
    });

    describe('when "sendBeacon" is available', () => {
      beforeEach(() => {
        collectorExporter = new OTLPMetricExporter(collectorExporterConfig);
      });
      it('should successfully send custom headers using XMLHTTPRequest', done => {
        collectorExporter.export(metrics, () => {});

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
        collectorExporter = new OTLPMetricExporter(collectorExporterConfig);
      });

      it('should successfully send metrics using XMLHttpRequest', done => {
        collectorExporter.export(metrics, () => {});

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
