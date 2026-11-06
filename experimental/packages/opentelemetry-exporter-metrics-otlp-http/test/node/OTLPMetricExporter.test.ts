/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as http from 'http';
import * as sinon from 'sinon';

import { diag } from '@opentelemetry/api';
import { AggregationTemporalityPreference } from '../../src';
import { OTLPMetricExporter } from '../../src/platform/node';
import type { AggregationOption } from '@opentelemetry/sdk-metrics';
import {
  AggregationTemporality,
  AggregationType,
  InstrumentType,
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { Stream } from 'stream';
import { TestMetricReader } from '../utils';

/*
 * NOTE: Tests here are not intended to test the underlying components directly. They are intended as a quick
 * check if the correct components are used. Use the following packages to test details:
 * - `@opentelemetry/oltp-exporter-base`: OTLP common exporter logic (handling of concurrent exports, ...), HTTP transport code
 * - `@opentelemetry/otlp-transformer`: Everything regarding serialization and transforming internal representations to OTLP
 */

describe('OTLPMetricExporter', () => {
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
    describe('from environment', () => {
      const ENV_KEY =
        'OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION';

      afterEach(() => {
        delete process.env[ENV_KEY];
        sinon.restore();
      });

      it('uses explicit_bucket_histogram by default', () => {
        const exporter = new OTLPMetricExporter();
        assert.deepStrictEqual(
          exporter.selectAggregation(InstrumentType.HISTOGRAM),
          {
            type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
          }
        );
        assert.deepStrictEqual(
          exporter.selectAggregation(InstrumentType.COUNTER),
          {
            type: AggregationType.DEFAULT,
          }
        );
      });

      it('uses explicit_bucket_histogram when configured', () => {
        process.env[ENV_KEY] = 'explicit_bucket_histogram';
        const exporter = new OTLPMetricExporter();
        assert.deepStrictEqual(
          exporter.selectAggregation(InstrumentType.HISTOGRAM),
          {
            type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
          }
        );
        assert.deepStrictEqual(
          exporter.selectAggregation(InstrumentType.COUNTER),
          {
            type: AggregationType.DEFAULT,
          }
        );
      });

      it('uses base2_exponential_bucket_histogram when configured', () => {
        process.env[ENV_KEY] = 'base2_exponential_bucket_histogram';
        const exporter = new OTLPMetricExporter();
        assert.deepStrictEqual(
          exporter.selectAggregation(InstrumentType.HISTOGRAM),
          {
            type: AggregationType.EXPONENTIAL_HISTOGRAM,
          }
        );
        assert.deepStrictEqual(
          exporter.selectAggregation(InstrumentType.COUNTER),
          {
            type: AggregationType.DEFAULT,
          }
        );
      });

      it('is case-insensitive', () => {
        process.env[ENV_KEY] = 'BASE2_EXPONENTIAL_BUCKET_HISTOGRAM';
        const exporter = new OTLPMetricExporter();
        assert.deepStrictEqual(
          exporter.selectAggregation(InstrumentType.HISTOGRAM),
          {
            type: AggregationType.EXPONENTIAL_HISTOGRAM,
          }
        );
      });

      it('warns and uses default aggregation on invalid value', () => {
        process.env[ENV_KEY] = 'invalid_value';
        const warnStub = sinon.stub(diag, 'warn');
        const exporter = new OTLPMetricExporter();
        assert.deepStrictEqual(
          exporter.selectAggregation(InstrumentType.HISTOGRAM),
          {
            type: AggregationType.DEFAULT,
          }
        );
        sinon.assert.calledWithMatch(warnStub, sinon.match('invalid_value'));
      });

      it('explicit aggregationPreference overrides environment', () => {
        process.env[ENV_KEY] = 'base2_exponential_bucket_histogram';
        const exporter = new OTLPMetricExporter({
          aggregationPreference: () => ({ type: AggregationType.DEFAULT }),
        });
        assert.deepStrictEqual(
          exporter.selectAggregation(InstrumentType.HISTOGRAM),
          {
            type: AggregationType.DEFAULT,
          }
        );
      });
    });

    it('aggregationSelector calls the selector supplied to the constructor', () => {
      const aggregation: AggregationOption = {
        type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
        options: {
          boundaries: [0, 100, 100000],
        },
      };
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
        aggregationPreference: _instrumentType => ({
          type: AggregationType.DEFAULT,
        }),
      });
      assert.deepStrictEqual(
        exporter.selectAggregation(InstrumentType.COUNTER),
        {
          type: AggregationType.DEFAULT,
        }
      );
    });
  });

  describe('export', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('successfully exports data', function (done) {
      const testMetricReader = new TestMetricReader();
      // arrange
      const fakeRequest = new Stream.PassThrough();
      Object.defineProperty(fakeRequest, 'setTimeout', {
        value: function (_timeout: number) {},
      });

      // callsFake so the response callback is invoked after the request body is
      // sent, which resolves the sendWithHttp promise and lets the process exit
      // without waiting for the 30 s export timeout to fire.
      (sinon.stub(http, 'request') as sinon.SinonStub).callsFake(
        (...args: unknown[]) => {
          const callback =
            typeof args[args.length - 1] === 'function'
              ? (args[args.length - 1] as (res: unknown) => void)
              : null;
          fakeRequest.on('finish', () => {
            if (callback) {
              const fakeResponse = new Stream.PassThrough() as any;
              fakeResponse.statusCode = 200;
              fakeResponse.statusMessage = 'OK';
              fakeResponse.headers = {};
              callback(fakeResponse);
              fakeResponse.end();
            }
          });
          return fakeRequest as any;
        }
      );
      let buff = Buffer.from('');
      fakeRequest.on('finish', async () => {
        try {
          // assert
          const requestBody = buff.toString();
          assert.doesNotThrow(() => {
            JSON.parse(requestBody);
          }, 'expected requestBody to be in JSON format, but parsing failed');

          const metrics = await testMetricReader.collect();
          const scopeMetrics = metrics.resourceMetrics.scopeMetrics.find(
            sm => sm.scope.name === '@opentelemetry/otlp-exporter'
          );
          assert.ok(scopeMetrics);
          meterProvider.shutdown();

          done();
        } catch (e) {
          done(e);
        }
      });

      fakeRequest.on('data', chunk => {
        buff = Buffer.concat([buff, chunk]);
      });

      const exporter = new OTLPMetricExporter();
      const meterProvider = new MeterProvider({
        readers: [
          new PeriodicExportingMetricReader({
            exporter,
          }),
          testMetricReader,
        ],
      });
      exporter.setSelfObsMeterProvider(meterProvider);
      meterProvider.getMeter('test-meter').createCounter('test-counter').add(1);

      // act
      meterProvider.forceFlush();
    });
  });
});
