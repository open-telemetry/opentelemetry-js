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

import * as oc from '@opencensus/core';
import { ValueType } from '@opentelemetry/api';
import { emptyResource } from '@opentelemetry/resources';
import {
  AggregationTemporality,
  DataPointType,
  SumMetricData,
} from '@opentelemetry/sdk-metrics';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { OpenCensusMetricProducer } from '../src/OpenCensusMetricProducer';

describe('OpenCensusMetricProducer', () => {
  beforeEach(() => {
    oc.globalStats.clear();
    sinon.useFakeTimers();
  });

  afterEach(() => {
    sinon.restore();
  });

  // Since the resource is replaced by the SDK anyway
  it('should return an empty Resource', async () => {
    const producer = new OpenCensusMetricProducer();
    const resourceMetrics = await producer.collect();

    assert.deepStrictEqual(
      resourceMetrics.resourceMetrics.resource,
      emptyResource()
    );
  });

  it('should return no errors when no metrics are collected from OpenCensus', async () => {
    const producer = new OpenCensusMetricProducer();
    const resourceMetrics = await producer.collect();
    assert.strictEqual(resourceMetrics.errors.length, 0);
  });

  it('should elide the scope when no metrics are collected from OpenCensus', async () => {
    // No OpenCensus setup so won't produce any metrics
    const producer = new OpenCensusMetricProducer();
    const resourceMetrics = await producer.collect();
    assert.strictEqual(resourceMetrics.resourceMetrics.scopeMetrics.length, 0);
  });

  it('should include OpenCensus metrics', async () => {
    // Initialize OC metrics with one counter, adapted from
    // https://opencensus.io/quickstart/nodejs/metrics/
    const measure = oc.globalStats.createMeasureDouble(
      'measure',
      oc.MeasureUnit.MS
    );
    const tagKey = { name: 'label1' };
    oc.globalStats.registerView(
      oc.globalStats.createView(
        'measure',
        measure,
        oc.AggregationType.SUM,
        [tagKey],
        'Test OC description'
      )
    );

    const tagMap = new oc.TagMap();
    tagMap.set(tagKey, { value: 'tagvalue' });
    oc.globalStats.record([{ measure, value: 125 }], tagMap);

    const producer = new OpenCensusMetricProducer();
    const resourceMetrics = await producer.collect();

    assert.strictEqual(resourceMetrics.errors.length, 0);
    assert.strictEqual(resourceMetrics.resourceMetrics.scopeMetrics.length, 1);
    assert.strictEqual(
      resourceMetrics.resourceMetrics.scopeMetrics[0].scope.name,
      '@opentelemetry/shim-opencensus'
    );
    assert.strictEqual(
      resourceMetrics.resourceMetrics.scopeMetrics[0].metrics.length,
      1
    );
    const ocMetric = resourceMetrics.resourceMetrics.scopeMetrics[0]
      .metrics[0] as SumMetricData;
    assert.deepStrictEqual(ocMetric.descriptor, {
      description: 'Test OC description',
      name: 'measure',
      unit: 'ms',
      valueType: ValueType.DOUBLE,
    });
    assert.strictEqual(ocMetric.dataPoints[0].value, 125);
    assert.deepStrictEqual(ocMetric.dataPoints[0].attributes, {
      label1: 'tagvalue',
    });
    assert.strictEqual(ocMetric.dataPointType, DataPointType.SUM);
    assert.strictEqual(ocMetric.isMonotonic, true);
    assert.strictEqual(
      ocMetric.aggregationTemporality,
      AggregationTemporality.CUMULATIVE
    );
  });
});
