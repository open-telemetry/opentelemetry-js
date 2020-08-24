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

import { NoopLogger } from '@opentelemetry/core';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { CollectorMetricExporter } from '../../src/platform/browser/index';
import { CollectorExporterConfigBase } from '../../src/types';
import * as collectorTypes from '../../src/types';
import { MetricRecord } from '@opentelemetry/metrics';
import {
  mockCounter,
  mockObserver,
  ensureCounterIsCorrect,
  ensureObserverIsCorrect,
  ensureWebResourceIsCorrect,
  ensureExportMetricsServiceRequestIsSet,
  ensureHeadersContain,
  mockHistogram,
  mockValueRecorder,
  ensureValueRecorderIsCorrect,
  ensureHistogramIsCorrect,
} from '../helper';
import { hrTimeToNanoseconds } from '@opentelemetry/core';
const sendBeacon = navigator.sendBeacon;

describe('CollectorMetricExporter - web', () => {
  let collectorExporter: CollectorMetricExporter;
  let spyOpen: any;
  let spySend: any;
  let spyBeacon: any;
  let metrics: MetricRecord[];

  beforeEach(() => {
    spyOpen = sinon.stub(XMLHttpRequest.prototype, 'open');
    spySend = sinon.stub(XMLHttpRequest.prototype, 'send');
    spyBeacon = sinon.stub(navigator, 'sendBeacon');
    metrics = [];
    metrics.push(mockCounter());
    metrics.push(mockObserver());
    metrics.push(mockHistogram());
    metrics.push(mockValueRecorder());

    metrics[0].aggregator.update(1);
    metrics[1].aggregator.update(3);
    metrics[1].aggregator.update(6);
    metrics[2].aggregator.update(7);
    metrics[2].aggregator.update(14);
    metrics[3].aggregator.update(5);
  });

  afterEach(() => {
    navigator.sendBeacon = sendBeacon;
    spyOpen.restore();
    spySend.restore();
    spyBeacon.restore();
  });

  describe('export', () => {
    describe('when "sendBeacon" is available', () => {
      beforeEach(() => {
        collectorExporter = new CollectorMetricExporter({
          logger: new NoopLogger(),
          url: 'http://foo.bar.com',
          serviceName: 'bar',
        });
        // Overwrites the start time to make tests consistent
        Object.defineProperty(collectorExporter, '_startTime', {
          value: 1592602232694000000,
        });
      });
      it('should successfully send metrics using sendBeacon', done => {
        collectorExporter.export(metrics, () => {});

        setTimeout(() => {
          const args = spyBeacon.args[0];
          const url = args[0];
          const body = args[1];
          const json = JSON.parse(
            body
          ) as collectorTypes.opentelemetryProto.collector.metrics.v1.ExportMetricsServiceRequest;
          const metric1 =
            json.resourceMetrics[0].instrumentationLibraryMetrics[0].metrics[0];
          const metric2 =
            json.resourceMetrics[1].instrumentationLibraryMetrics[0].metrics[0];
          const metric3 =
            json.resourceMetrics[2].instrumentationLibraryMetrics[0].metrics[0];
          const metric4 =
            json.resourceMetrics[3].instrumentationLibraryMetrics[0].metrics[0];
          assert.ok(typeof metric1 !== 'undefined', "metric doesn't exist");
          if (metric1) {
            ensureCounterIsCorrect(
              metric1,
              hrTimeToNanoseconds(metrics[0].aggregator.toPoint().timestamp)
            );
          }

          assert.ok(
            typeof metric2 !== 'undefined',
            "second metric doesn't exist"
          );
          if (metric2) {
            ensureObserverIsCorrect(
              metric2,
              hrTimeToNanoseconds(metrics[1].aggregator.toPoint().timestamp)
            );
          }

          assert.ok(
            typeof metric3 !== 'undefined',
            "third metric doesn't exist"
          );
          if (metric3) {
            ensureHistogramIsCorrect(
              metric3,
              hrTimeToNanoseconds(metrics[2].aggregator.toPoint().timestamp)
            );
          }

          assert.ok(
            typeof metric4 !== 'undefined',
            "fourth metric doesn't exist"
          );
          if (metric4) {
            ensureValueRecorderIsCorrect(
              metric4,
              hrTimeToNanoseconds(metrics[3].aggregator.toPoint().timestamp)
            );
          }

          const resource = json.resourceMetrics[0].resource;
          assert.ok(typeof resource !== 'undefined', "resource doesn't exist");
          if (resource) {
            ensureWebResourceIsCorrect(resource);
          }

          assert.strictEqual(url, 'http://foo.bar.com');
          assert.strictEqual(spyBeacon.callCount, 1);

          assert.strictEqual(spyOpen.callCount, 0);

          ensureExportMetricsServiceRequestIsSet(json);

          done();
        });
      });

      it('should log the successful message', done => {
        const spyLoggerDebug = sinon.stub(collectorExporter.logger, 'debug');
        const spyLoggerError = sinon.stub(collectorExporter.logger, 'error');
        spyBeacon.restore();
        spyBeacon = sinon.stub(window.navigator, 'sendBeacon').returns(true);

        collectorExporter.export(metrics, () => {});

        setTimeout(() => {
          const response: any = spyLoggerDebug.args[1][0];
          assert.strictEqual(response, 'sendBeacon - can send');
          assert.strictEqual(spyLoggerError.args.length, 0);

          done();
        });
      });

      it('should log the error message', done => {
        const spyLoggerDebug = sinon.stub(collectorExporter.logger, 'debug');
        const spyLoggerError = sinon.stub(collectorExporter.logger, 'error');
        spyBeacon.restore();
        spyBeacon = sinon.stub(window.navigator, 'sendBeacon').returns(false);

        collectorExporter.export(metrics, () => {});

        setTimeout(() => {
          const response: any = spyLoggerError.args[0][0];
          assert.strictEqual(response, 'sendBeacon - cannot send');
          assert.strictEqual(spyLoggerDebug.args.length, 1);

          done();
        });
      });
    });

    describe('when "sendBeacon" is NOT available', () => {
      let server: any;
      beforeEach(() => {
        (window.navigator as any).sendBeacon = false;
        collectorExporter = new CollectorMetricExporter({
          logger: new NoopLogger(),
          url: 'http://foo.bar.com',
          serviceName: 'bar',
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

        setTimeout(() => {
          const request = server.requests[0];
          assert.strictEqual(request.method, 'POST');
          assert.strictEqual(request.url, 'http://foo.bar.com');

          const body = request.requestBody;
          const json = JSON.parse(
            body
          ) as collectorTypes.opentelemetryProto.collector.metrics.v1.ExportMetricsServiceRequest;
          const metric1 =
            json.resourceMetrics[0].instrumentationLibraryMetrics[0].metrics[0];
          const metric2 =
            json.resourceMetrics[1].instrumentationLibraryMetrics[0].metrics[0];
          const metric3 =
            json.resourceMetrics[2].instrumentationLibraryMetrics[0].metrics[0];
          const metric4 =
            json.resourceMetrics[3].instrumentationLibraryMetrics[0].metrics[0];
          assert.ok(typeof metric1 !== 'undefined', "metric doesn't exist");
          if (metric1) {
            ensureCounterIsCorrect(
              metric1,
              hrTimeToNanoseconds(metrics[0].aggregator.toPoint().timestamp)
            );
          }
          assert.ok(
            typeof metric2 !== 'undefined',
            "second metric doesn't exist"
          );
          if (metric2) {
            ensureObserverIsCorrect(
              metric2,
              hrTimeToNanoseconds(metrics[1].aggregator.toPoint().timestamp)
            );
          }

          assert.ok(
            typeof metric3 !== 'undefined',
            "third metric doesn't exist"
          );
          if (metric3) {
            ensureHistogramIsCorrect(
              metric3,
              hrTimeToNanoseconds(metrics[2].aggregator.toPoint().timestamp)
            );
          }

          assert.ok(
            typeof metric4 !== 'undefined',
            "fourth metric doesn't exist"
          );
          if (metric4) {
            ensureValueRecorderIsCorrect(
              metric4,
              hrTimeToNanoseconds(metrics[3].aggregator.toPoint().timestamp)
            );
          }

          const resource = json.resourceMetrics[0].resource;
          assert.ok(typeof resource !== 'undefined', "resource doesn't exist");
          if (resource) {
            ensureWebResourceIsCorrect(resource);
          }

          assert.strictEqual(spyBeacon.callCount, 0);
          ensureExportMetricsServiceRequestIsSet(json);

          done();
        });
      });

      it('should log the successful message', done => {
        const spyLoggerDebug = sinon.stub(collectorExporter.logger, 'debug');
        const spyLoggerError = sinon.stub(collectorExporter.logger, 'error');

        collectorExporter.export(metrics, () => {});

        setTimeout(() => {
          const request = server.requests[0];
          request.respond(200);

          const response: any = spyLoggerDebug.args[1][0];
          assert.strictEqual(response, 'xhr success');
          assert.strictEqual(spyLoggerError.args.length, 0);

          assert.strictEqual(spyBeacon.callCount, 0);
          done();
        });
      });

      it('should log the error message', done => {
        const spyLoggerError = sinon.stub(collectorExporter.logger, 'error');

        collectorExporter.export(metrics, () => {});

        setTimeout(() => {
          const request = server.requests[0];
          request.respond(400);

          const response1: any = spyLoggerError.args[0][0];
          const response2: any = spyLoggerError.args[1][0];
          assert.strictEqual(response1, 'body');
          assert.strictEqual(response2, 'xhr error');

          assert.strictEqual(spyBeacon.callCount, 0);
          done();
        });
      });
      it('should send custom headers', done => {
        collectorExporter.export(metrics, () => {});

        setTimeout(() => {
          const request = server.requests[0];
          request.respond(200);

          assert.strictEqual(spyBeacon.callCount, 0);
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
    let collectorExporterConfig: CollectorExporterConfigBase;

    beforeEach(() => {
      collectorExporterConfig = {
        logger: new NoopLogger(),
        headers: customHeaders,
      };
      server = sinon.fakeServer.create();
    });

    afterEach(() => {
      server.restore();
    });

    describe('when "sendBeacon" is available', () => {
      beforeEach(() => {
        collectorExporter = new CollectorMetricExporter(
          collectorExporterConfig
        );
      });
      it('should successfully send custom headers using XMLHTTPRequest', done => {
        collectorExporter.export(metrics, () => {});

        setTimeout(() => {
          const [{ requestHeaders }] = server.requests;

          ensureHeadersContain(requestHeaders, customHeaders);
          assert.strictEqual(spyBeacon.callCount, 0);
          assert.strictEqual(spyOpen.callCount, 0);

          done();
        });
      });
    });

    describe('when "sendBeacon" is NOT available', () => {
      beforeEach(() => {
        (window.navigator as any).sendBeacon = false;
        collectorExporter = new CollectorMetricExporter(
          collectorExporterConfig
        );
      });

      it('should successfully send metrics using XMLHttpRequest', done => {
        collectorExporter.export(metrics, () => {});

        setTimeout(() => {
          const [{ requestHeaders }] = server.requests;

          ensureHeadersContain(requestHeaders, customHeaders);
          assert.strictEqual(spyBeacon.callCount, 0);
          assert.strictEqual(spyOpen.callCount, 0);

          done();
        });
      });
    });
  });
});
