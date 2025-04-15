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

import * as assert from 'assert';
import * as sinon from 'sinon';
import { MeterProvider } from '../../src/MeterProvider';
import { emptyResourceMetrics, TestMetricProducer } from './TestMetricProducer';
import { TestMetricReader } from './TestMetricReader';
import {
  AggregationTemporality,
  AggregationType,
  DataPointType,
  ScopeMetrics,
} from '../../src';
import {
  DEFAULT_AGGREGATION_SELECTOR,
  DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR,
} from '../../src/export/AggregationSelector';
import {
  assertAggregationSelector,
  assertAggregationTemporalitySelector,
} from './utils';
import { testResource } from '../util';
import { ValueType } from '@opentelemetry/api';
import { resourceFromAttributes } from '@opentelemetry/resources';

const testScopeMetrics: ScopeMetrics[] = [
  {
    scope: {
      name: 'additionalMetricProducerMetrics',
    },
    metrics: [
      {
        aggregationTemporality: AggregationTemporality.CUMULATIVE,
        dataPointType: DataPointType.SUM,
        dataPoints: [
          {
            attributes: {},
            value: 1,
            startTime: [0, 0],
            endTime: [1, 0],
          },
        ],
        descriptor: {
          name: 'additionalCounter',
          unit: '',
          description: '',
          valueType: ValueType.INT,
        },
        isMonotonic: true,
      },
    ],
  },
];

describe('MetricReader', () => {
  describe('setMetricProducer', () => {
    it('The SDK MUST NOT allow a MetricReader instance to be registered on more than one MeterProvider instance', () => {
      const reader = new TestMetricReader();
      assert.throws(
        () =>
          new MeterProvider({
            readers: [reader, reader],
          }),
        /MetricReader can not be bound to a MeterProvider again/
      );
      assert.throws(
        () =>
          new MeterProvider({
            readers: [reader],
          }),
        /MetricReader can not be bound to a MeterProvider again/
      );
    });
  });

  describe('setMetricProducer', () => {
    it('should initialize the metric reader', async () => {
      const reader = new TestMetricReader();

      reader.setMetricProducer(new TestMetricProducer());
      const result = await reader.collect();

      assert.deepStrictEqual(result, {
        resourceMetrics: emptyResourceMetrics,
        errors: [],
      });
      await reader.shutdown();
    });
  });

  describe('collect', () => {
    it('should throw on non-initialized instance', async () => {
      const reader = new TestMetricReader();

      await assert.rejects(
        () => reader.collect(),
        /MetricReader is not bound to a MetricProducer/
      );
    });

    it('should return empty on shut-down instance', async () => {
      const reader = new TestMetricReader();

      reader.setMetricProducer(new TestMetricProducer());

      await reader.shutdown();
      await assert.rejects(reader.collect(), /MetricReader is shutdown/);
    });

    it('should call MetricProducer.collect with timeout', async () => {
      const reader = new TestMetricReader();
      const producer = new TestMetricProducer();
      reader.setMetricProducer(producer);

      const collectSpy = sinon.spy(producer, 'collect');

      await reader.collect({ timeoutMillis: 20 });
      assert.ok(collectSpy.calledOnce);
      const args = collectSpy.args[0];
      assert.deepStrictEqual(args, [{ timeoutMillis: 20 }]);

      await reader.shutdown();
    });

    it('should collect metrics from the SDK and the additional metricProducers', async () => {
      const additionalProducer = new TestMetricProducer({
        resourceMetrics: {
          resource: resourceFromAttributes({
            shouldBeDiscarded: 'should-be-discarded',
          }),
          scopeMetrics: testScopeMetrics,
        },
      });
      const reader = new TestMetricReader({
        metricProducers: [additionalProducer],
      });
      const meterProvider = new MeterProvider({
        resource: testResource,
        readers: [reader],
      });

      // Make a measurement
      meterProvider
        .getMeter('someSdkMetrics')
        .createCounter('sdkCounter')
        .add(5, { hello: 'world' });
      const collectionResult = await reader.collect();

      assert.strictEqual(collectionResult.errors.length, 0);
      // Should keep the SDK's Resource only
      assert.deepStrictEqual(
        collectionResult.resourceMetrics.resource.attributes,
        testResource.attributes
      );
      assert.strictEqual(
        collectionResult.resourceMetrics.scopeMetrics.length,
        2
      );
      const [sdkScopeMetrics, additionalScopeMetrics] =
        collectionResult.resourceMetrics.scopeMetrics;

      assert.strictEqual(sdkScopeMetrics.scope.name, 'someSdkMetrics');
      assert.strictEqual(
        additionalScopeMetrics.scope.name,
        'additionalMetricProducerMetrics'
      );

      await reader.shutdown();
    });

    it('should merge the errors from the SDK and all metricProducers', async () => {
      const reader = new TestMetricReader({
        metricProducers: [
          new TestMetricProducer({ errors: ['err1'] }),
          new TestMetricProducer({ errors: ['err2'] }),
        ],
      });
      const meterProvider = new MeterProvider({
        readers: [reader],
      });

      // Provide a callback throwing an error too
      meterProvider
        .getMeter('someSdkMetrics')
        .createObservableCounter('sdkCounter')
        .addCallback(result => {
          throw 'errsdk';
        });
      const collectionResult = await reader.collect();

      assert.deepStrictEqual(collectionResult.errors, [
        'errsdk',
        'err1',
        'err2',
      ]);
      await reader.shutdown();
    });
  });

  describe('selectAggregation', () => {
    it('should override default when not provided with a selector', () => {
      assertAggregationSelector(
        new TestMetricReader(),
        DEFAULT_AGGREGATION_SELECTOR
      );
      assertAggregationSelector(
        new TestMetricReader({}),
        DEFAULT_AGGREGATION_SELECTOR
      );
    });

    it('should override default when provided with a selector', () => {
      const reader = new TestMetricReader({
        aggregationSelector: _instrumentType => {
          return {
            type: AggregationType.SUM,
          };
        },
      });
      assertAggregationSelector(reader, _instrumentType => {
        return {
          type: AggregationType.SUM,
        };
      });
      reader.shutdown();
    });
  });

  describe('selectAggregationTemporality', () => {
    it('should override default when not provided with a selector', () => {
      assertAggregationTemporalitySelector(
        new TestMetricReader(),
        DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR
      );
      assertAggregationTemporalitySelector(
        new TestMetricReader({}),
        DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR
      );
    });

    it('should override default when provided with a selector', () => {
      const reader = new TestMetricReader({
        aggregationTemporalitySelector: _instrumentType =>
          AggregationTemporality.DELTA,
      });
      assertAggregationTemporalitySelector(
        reader,
        _instrumentType => AggregationTemporality.DELTA
      );
      reader.shutdown();
    });
  });
});
