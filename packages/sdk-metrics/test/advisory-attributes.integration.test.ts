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
import { MeterProvider } from '../src/MeterProvider';
import { TestMetricReader } from './export/TestMetricReader';
import {
  defaultInstrumentationScope,
  testResource,
} from './util';

describe('Advisory attributes parameter - Integration test', () => {
  let meterProvider: MeterProvider;
  let metricReader: TestMetricReader;

  beforeEach(() => {
    metricReader = new TestMetricReader();
    meterProvider = new MeterProvider({
      resource: testResource,
      readers: [metricReader],
    });
  });

  afterEach(() => {
    metricReader.shutdown();
  });

  it('should filter attributes based on advisory attributes parameter', async () => {
    const meter = meterProvider.getMeter(
      defaultInstrumentationScope.name,
      defaultInstrumentationScope.version,
      {
        schemaUrl: defaultInstrumentationScope.schemaUrl,
      }
    );
    
    // Create counter with advisory attributes
    const counter = meter.createCounter('test_counter', {
      description: 'Test counter with advisory attributes',
      advice: {
        attributes: ['allowed_key1', 'allowed_key2'], // @experimental
      },
    });

    // Record measurements with various attributes
    counter.add(1, {
      allowed_key1: 'value1',
      allowed_key2: 'value2',
      filtered_key: 'filtered_value', // This should be filtered out
    });

    counter.add(2, {
      allowed_key1: 'value3',
      another_filtered_key: 'another_filtered_value', // This should be filtered out
    });

    // Collect metrics
    const metrics = await metricReader.collect();
    
    assert.strictEqual(metrics.resourceMetrics.scopeMetrics.length, 1);
    
    const scopeMetrics = metrics.resourceMetrics.scopeMetrics[0];
    assert.strictEqual(scopeMetrics.metrics.length, 1);
    
    const metric = scopeMetrics.metrics[0];
    assert.strictEqual(metric.descriptor.name, 'test_counter');
    assert.strictEqual(metric.dataPoints.length, 2);

    // Verify that only allowed attributes are present
    const firstDataPoint = metric.dataPoints[0];
    assert.deepStrictEqual(firstDataPoint.attributes, {
      allowed_key1: 'value1',
      allowed_key2: 'value2',
    });

    const secondDataPoint = metric.dataPoints[1];
    assert.deepStrictEqual(secondDataPoint.attributes, {
      allowed_key1: 'value3',
    });
  });

  it('should keep all attributes when no advisory attributes are specified', async () => {
    const meter = meterProvider.getMeter(
      defaultInstrumentationScope.name,
      defaultInstrumentationScope.version,
      {
        schemaUrl: defaultInstrumentationScope.schemaUrl,
      }
    );
    
    // Create counter without advisory attributes
    const counter = meter.createCounter('test_counter_no_filter', {
      description: 'Test counter without advisory attributes',
    });

    // Record measurements with various attributes
    counter.add(1, {
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
    });

    // Collect metrics
    const metrics = await metricReader.collect();
    
    assert.strictEqual(metrics.resourceMetrics.scopeMetrics.length, 1);
    
    const scopeMetrics = metrics.resourceMetrics.scopeMetrics[0];
    assert.strictEqual(scopeMetrics.metrics.length, 1);
    
    const metric = scopeMetrics.metrics[0];
    assert.strictEqual(metric.descriptor.name, 'test_counter_no_filter');
    assert.strictEqual(metric.dataPoints.length, 1);

    // Verify that all attributes are present
    const dataPoint = metric.dataPoints[0];
    assert.deepStrictEqual(dataPoint.attributes, {
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
    });
  });

  it('should work with different instrument types', async () => {
    const meter = meterProvider.getMeter(
      defaultInstrumentationScope.name,
      defaultInstrumentationScope.version,
      {
        schemaUrl: defaultInstrumentationScope.schemaUrl,
      }
    );
    
    // Test with Histogram
    const histogram = meter.createHistogram('test_histogram', {
      description: 'Test histogram with advisory attributes',
      advice: {
        attributes: ['service'], // @experimental
      },
    });

    histogram.record(10, {
      service: 'api',
      endpoint: '/users', // This should be filtered out
    });

    // Test with UpDownCounter
    const upDownCounter = meter.createUpDownCounter('test_updown', {
      description: 'Test updown counter with advisory attributes',
      advice: {
        attributes: ['region'], // @experimental
      },
    });

    upDownCounter.add(5, {
      region: 'us-west',
      instance: 'i-12345', // This should be filtered out
    });

    // Collect metrics
    const metrics = await metricReader.collect();
    
    assert.strictEqual(metrics.resourceMetrics.scopeMetrics.length, 1);
    
    const scopeMetrics = metrics.resourceMetrics.scopeMetrics[0];
    assert.strictEqual(scopeMetrics.metrics.length, 2);

    // Verify histogram filtering
    const histogramMetric = scopeMetrics.metrics.find((m: any) => m.descriptor.name === 'test_histogram');
    assert.ok(histogramMetric);
    assert.deepStrictEqual(histogramMetric.dataPoints[0].attributes, {
      service: 'api',
    });

    // Verify updown counter filtering
    const upDownMetric = scopeMetrics.metrics.find((m: any) => m.descriptor.name === 'test_updown');
    assert.ok(upDownMetric);
    assert.deepStrictEqual(upDownMetric.dataPoints[0].attributes, {
      region: 'us-west',
    });
  });
});
