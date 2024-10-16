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
  AggregationTemporalityPreference,
  OTLPMetricExporterOptions,
} from '../../src';

import { OTLPMetricExporter } from '../../src/platform/node';
import {
  collect,
  ensureCounterIsCorrect,
  ensureExportMetricsServiceRequestIsSet,
  ensureHistogramIsCorrect,
  ensureObservableGaugeIsCorrect,
  HISTOGRAM_AGGREGATION_VIEW,
  mockCounter,
  mockHistogram,
  mockObservableGauge,
  setUp,
  shutdown,
} from '../metricsHelper';
import { MockedResponse } from './nodeHelpers';
import {
  Aggregation,
  AggregationTemporality,
  ExplicitBucketHistogramAggregation,
  InstrumentType,
  ResourceMetrics,
} from '@opentelemetry/sdk-metrics';
import { PassThrough, Stream } from 'stream';
import {
  OTLPExporterError,
  OTLPExporterNodeConfigBase,
} from '@opentelemetry/otlp-exporter-base';
import { IExportMetricsServiceRequest } from '@opentelemetry/otlp-transformer';

let fakeRequest: PassThrough;

const address = 'localhost:1501';

describe('OTLPMetricExporter - node with json over http', () => {
  let collectorExporter: OTLPMetricExporter;
  let collectorExporterConfig: OTLPExporterNodeConfigBase &
    OTLPMetricExporterOptions;
  let stubRequest: sinon.SinonStub;
  let metrics: ResourceMetrics;

  beforeEach(async () => {
    setUp([HISTOGRAM_AGGREGATION_VIEW]);
  });

  afterEach(async () => {
    fakeRequest = new Stream.PassThrough();
    Object.defineProperty(fakeRequest, 'setTimeout', {
      value: function (_timeout: number) {},
    });
    await shutdown();
    sinon.restore();
  });

  describe('instance', () => {
    let warnStub: sinon.SinonStub;

    beforeEach(() => {
      // Need to stub/spy on the underlying logger as the "diag" instance is global
      warnStub = sinon.stub();
      const nop = () => {};
      const diagLogger: DiagLogger = {
        debug: nop,
        error: nop,
        info: nop,
        verbose: nop,
        warn: warnStub,
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

  describe('temporality', () => {
    it('should use the right temporality when Cumulative preference is selected', () => {
      const exporter = new OTLPMetricExporter({
        temporalityPreference: AggregationTemporalityPreference.CUMULATIVE,
      });

      assert.equal(
        exporter.selectAggregationTemporality(InstrumentType.COUNTER),
        AggregationTemporality.CUMULATIVE,
        'Counter'
      );
      assert.equal(
        exporter.selectAggregationTemporality(InstrumentType.HISTOGRAM),
        AggregationTemporality.CUMULATIVE,
        'Histogram'
      );
      assert.equal(
        exporter.selectAggregationTemporality(InstrumentType.UP_DOWN_COUNTER),
        AggregationTemporality.CUMULATIVE,
        'UpDownCounter'
      );
      assert.equal(
        exporter.selectAggregationTemporality(
          InstrumentType.OBSERVABLE_COUNTER
        ),
        AggregationTemporality.CUMULATIVE,
        'Asynchronous Counter'
      );
      assert.equal(
        exporter.selectAggregationTemporality(
          InstrumentType.OBSERVABLE_UP_DOWN_COUNTER
        ),
        AggregationTemporality.CUMULATIVE,
        'Asynchronous UpDownCounter'
      );
    });

    it('should use the right temporality when Delta preference is selected', () => {
      const exporter = new OTLPMetricExporter({
        temporalityPreference: AggregationTemporalityPreference.DELTA,
      });

      assert.equal(
        exporter.selectAggregationTemporality(InstrumentType.COUNTER),
        AggregationTemporality.DELTA,
        'Counter'
      );
      assert.equal(
        exporter.selectAggregationTemporality(InstrumentType.HISTOGRAM),
        AggregationTemporality.DELTA,
        'Histogram'
      );
      assert.equal(
        exporter.selectAggregationTemporality(InstrumentType.UP_DOWN_COUNTER),
        AggregationTemporality.CUMULATIVE,
        'UpDownCounter'
      );
      assert.equal(
        exporter.selectAggregationTemporality(
          InstrumentType.OBSERVABLE_COUNTER
        ),
        AggregationTemporality.DELTA,
        'Asynchronous Counter'
      );
      assert.equal(
        exporter.selectAggregationTemporality(
          InstrumentType.OBSERVABLE_UP_DOWN_COUNTER
        ),
        AggregationTemporality.CUMULATIVE,
        'Asynchronous UpDownCounter'
      );
    });

    it('should use the right temporality when LowMemory preference is selected', () => {
      const exporter = new OTLPMetricExporter({
        temporalityPreference: AggregationTemporalityPreference.LOWMEMORY,
      });

      assert.equal(
        exporter.selectAggregationTemporality(InstrumentType.COUNTER),
        AggregationTemporality.DELTA,
        'Counter'
      );
      assert.equal(
        exporter.selectAggregationTemporality(InstrumentType.HISTOGRAM),
        AggregationTemporality.DELTA,
        'Histogram'
      );
      assert.equal(
        exporter.selectAggregationTemporality(InstrumentType.UP_DOWN_COUNTER),
        AggregationTemporality.CUMULATIVE,
        'UpDownCounter'
      );
      assert.equal(
        exporter.selectAggregationTemporality(
          InstrumentType.OBSERVABLE_COUNTER
        ),
        AggregationTemporality.CUMULATIVE,
        'Asynchronous Counter'
      );
      assert.equal(
        exporter.selectAggregationTemporality(
          InstrumentType.OBSERVABLE_UP_DOWN_COUNTER
        ),
        AggregationTemporality.CUMULATIVE,
        'Asynchronous UpDownCounter'
      );
    });
  });

  describe('aggregation', () => {
    it('aggregationSelector calls the selector supplied to the constructor', () => {
      const aggregation = new ExplicitBucketHistogramAggregation([
        0, 100, 100000,
      ]);
      const exporter = new OTLPMetricExporter({
        aggregationPreference: _instrumentType => aggregation,
      });
      assert.equal(
        exporter.selectAggregation(InstrumentType.COUNTER),
        aggregation
      );
    });

    it('aggregationSelector returns the default aggregation preference when nothing is supplied', () => {
      const exporter = new OTLPMetricExporter({
        aggregationPreference: _instrumentType => Aggregation.Default(),
      });
      assert.equal(
        exporter.selectAggregation(InstrumentType.COUNTER),
        Aggregation.Default()
      );
    });
  });

  describe('export', () => {
    beforeEach(async () => {
      stubRequest = sinon.stub(http, 'request').returns(fakeRequest as any);
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

      const counter = mockCounter();
      mockObservableGauge(observableResult => {
        observableResult.observe(6, {});
      }, 'double-observable-gauge2');
      const histogram = mockHistogram();
      counter.add(1);
      histogram.record(7);
      histogram.record(14);

      const { resourceMetrics, errors } = await collect();
      assert.strictEqual(errors.length, 0);
      metrics = resourceMetrics;
    });

    it('should open the connection', done => {
      collectorExporter.export(metrics, () => {});

      setTimeout(() => {
        const args = stubRequest.args[0];
        const callback = args[1];
        queueMicrotask(() => {
          const mockRes = new MockedResponse(200);
          callback(mockRes);
          mockRes.send(Buffer.from('success'));
        });
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
        const callback = args[1];
        queueMicrotask(() => {
          const mockRes = new MockedResponse(200);
          callback(mockRes);
          mockRes.send(Buffer.from('success'));
        });

        const options = args[0];
        assert.strictEqual(options.headers['foo'], 'bar');
        done();
      });
    });

    it('should have keep alive and keepAliveMsecs option set', done => {
      collectorExporter.export(metrics, () => {});

      setTimeout(() => {
        const args = stubRequest.args[0];
        const callback = args[1];

        queueMicrotask(() => {
          const mockRes = new MockedResponse(200);
          callback(mockRes);
          mockRes.send(Buffer.from('success'));
        });
        const options = args[0];
        const agent = options.agent;
        assert.strictEqual(agent.keepAlive, true);
        assert.strictEqual(agent.options.keepAliveMsecs, 2000);
        done();
      });
    });

    it('should successfully send metrics', done => {
      let buff = Buffer.from('');

      collectorExporter.export(metrics, () => {});

      fakeRequest.on('end', () => {
        const responseBody = buff.toString();

        const json = JSON.parse(responseBody) as IExportMetricsServiceRequest;
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

        assert.ok(typeof metric1 !== 'undefined', "counter doesn't exist");
        ensureCounterIsCorrect(
          metric1,
          metrics.scopeMetrics[0].metrics[counterIndex].dataPoints[0].endTime,
          metrics.scopeMetrics[0].metrics[counterIndex].dataPoints[0].startTime
        );
        assert.ok(
          typeof metric2 !== 'undefined',
          "observable gauge doesn't exist"
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
        assert.ok(typeof metric3 !== 'undefined', "histogram doesn't exist");
        ensureHistogramIsCorrect(
          metric3,
          metrics.scopeMetrics[0].metrics[histogramIndex].dataPoints[0].endTime,
          metrics.scopeMetrics[0].metrics[histogramIndex].dataPoints[0]
            .startTime,
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
      mockRes.send(Buffer.from('success'));
    });

    it('should log the successful message', done => {
      // Need to stub/spy on the underlying logger as the "diag" instance is global
      const stubLoggerError = sinon.stub(diag, 'error');

      const responseSpy = sinon.spy();
      collectorExporter.export(metrics, responseSpy);

      setTimeout(() => {
        const args = stubRequest.args[0];
        const callback = args[1];

        queueMicrotask(() => {
          const mockRes = new MockedResponse(200);
          callback(mockRes);
          mockRes.send(Buffer.from('success'));
        });

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
        const args = stubRequest.args[0];
        const callback = args[1];
        queueMicrotask(() => {
          const mockRes = new MockedResponse(400);
          callback(mockRes);
          mockRes.send(Buffer.from('failure'));
        });

        setTimeout(() => {
          const result = responseSpy.args[0][0] as core.ExportResult;
          assert.strictEqual(result.code, core.ExportResultCode.FAILED);
          const error = result.error as OTLPExporterError;
          assert.ok(error !== undefined);
          assert.strictEqual(error.code, 400);
          done();
        });
      });
    });
  });
});
