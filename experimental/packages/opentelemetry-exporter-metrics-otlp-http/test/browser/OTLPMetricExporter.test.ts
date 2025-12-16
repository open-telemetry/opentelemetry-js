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

import { AggregationTemporalityPreference } from '../../src';
import {
  AggregationOption,
  AggregationTemporality,
  AggregationType,
  InstrumentType,
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { OTLPMetricExporter } from '../../src/platform/browser';

/*
 * NOTE: Tests here are not intended to test the underlying components directly. They are intended as a quick
 * check if the correct components are used. Use the following packages to test details:
 * - `@opentelemetry/oltp-exporter-base`: OTLP common exporter logic (handling of concurrent exports, ...), HTTP transport code
 * - `@opentelemetry/otlp-transformer`: Everything regarding serialization and transforming internal representations to OTLP
 */

describe('OTLPMetricExporter', function () {
  afterEach(() => {
    sinon.restore();
  });

  describe('export', function () {
    describe('when sendBeacon is available', function () {
      it('should successfully send data using sendBeacon', async function () {
        // arrange
        const stubBeacon = sinon.stub(navigator, 'sendBeacon');
        const meterProvider = new MeterProvider({
          readers: [
            new PeriodicExportingMetricReader({
              exporter: new OTLPMetricExporter(),
            }),
          ],
        });

        // act
        meterProvider
          .getMeter('test-meter')
          .createCounter('test-counter')
          .add(1);
        await meterProvider.shutdown();

        // assert
        const args = stubBeacon.args[0];
        const blob: Blob = args[1] as unknown as Blob;
        const body = await blob.text();
        assert.doesNotThrow(
          () => JSON.parse(body),
          'expected requestBody to be in JSON format, but parsing failed'
        );
      });
    });

    describe('when sendBeacon is not available', function () {
      beforeEach(function () {
        // fake sendBeacon not being available
        (window.navigator as any).sendBeacon = false;
      });

      it('should successfully send data using fetch', async function () {
        // arrange
        const stubFetch = sinon.stub(window, 'fetch').resolves(new Response('', { status: 200 }));
        const meterProvider = new MeterProvider({
          readers: [
            new PeriodicExportingMetricReader({
              exporter: new OTLPMetricExporter(),
            }),
          ],
        });

        // act
        meterProvider
          .getMeter('test-meter')
          .createCounter('test-counter')
          .add(1);
        await meterProvider.shutdown();

        // assert
        const request = new Request(...stubFetch.args[0]);
        const body = await request.text();
        assert.doesNotThrow(
          () => JSON.parse(body),
          'expected request body to be in JSON format, but parsing failed'
        );
      });
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
});
