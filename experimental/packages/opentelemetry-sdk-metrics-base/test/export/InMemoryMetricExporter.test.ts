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
import assert = require('assert');
import { AggregationTemporality } from '../../src/export/AggregationTemporality';
import { InMemoryMetricExporter } from "../../src/export/InMemoryMetricExporter"
import { ResourceMetrics } from '../../src/export/MetricData';
import { PeriodicExportingMetricReader } from '../../src/export/PeriodicExportingMetricReader';
import { MeterProvider } from '../../src/MeterProvider';
import { defaultResource } from '../util';

function setup() {
  const exporter = new InMemoryMetricExporter(AggregationTemporality.CUMULATIVE)
  const meterProvider = new MeterProvider({ resource: defaultResource });
  const meter = meterProvider.getMeter('InMemoryMetricExporter', '1.0.0');
  const meterReader = new PeriodicExportingMetricReader({
    exporter: exporter,
    exportIntervalMillis: 100,
    exportTimeoutMillis: 100
  })
  meterProvider.addMetricReader(meterReader);

  return {
    meterProvider,
    meter,
    meterReader,
    exporter,
  };
}
async function waitForNumberOfExports(exporter: InMemoryMetricExporter , numberOfExports: number): Promise<ResourceMetrics[]> {
  if (numberOfExports <= 0) {
    throw new Error('numberOfExports must be greater than or equal to 0');
  }

  let totalExports = 0
  while (totalExports < numberOfExports) {
    await new Promise(resolve => setTimeout(resolve, 20));
    const exportedMetrics = exporter.getMetrics()
    totalExports = exportedMetrics.length
  }

  return exporter.getMetrics()
}

describe.only('InMemoryMetricExporter', () => {

  it('should be able to access metric', async () => {
    const {
      meter,
      meterReader,
      exporter,
    } = setup()

    const counter = meter.createCounter('counter_total', {
      description: 'a test description',
    });
    const counterAttribute = { key1: 'attributeValue1' }
    counter.add(10, counterAttribute);
    counter.add(10, counterAttribute);

    const histogram = meter.createHistogram('histogram', { description: 'a histogram' })
    histogram.record(10)
    histogram.record(100)
    histogram.record(1000)

    const exportedMetrics = await waitForNumberOfExports(exporter, 1)
    assert.ok(exportedMetrics.length > 0);

    const resourceMetrics = exportedMetrics.shift()
    assert.ok(resourceMetrics)
    const firstScopeMetric = resourceMetrics?.scopeMetrics.shift()
    assert.ok(firstScopeMetric)
    assert.ok(firstScopeMetric.metrics.length > 0)
    const [counterMetric, histogramMetric] = firstScopeMetric.metrics
    assert.ok(counterMetric.descriptor.name, 'counter_total')
    assert.ok(counterMetric.dataPoints.length > 0)
    const counterDataPoint = counterMetric.dataPoints.shift()
    assert.ok(counterDataPoint)
    assert.strictEqual(counterDataPoint.attributes, counterAttribute)

    assert.ok(histogramMetric.descriptor.name, 'histogram')
    assert.ok(histogramMetric.dataPoints.length > 0)
    const histogramDataPoint = histogramMetric.dataPoints.shift()
    assert.ok(histogramDataPoint)

    await meterReader.shutdown()
  })
})
