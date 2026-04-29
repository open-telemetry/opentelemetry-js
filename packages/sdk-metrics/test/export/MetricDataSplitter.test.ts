/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MetricDataSplitter } from '../../src/export/MetricDataSplitter';
import { DataPointType, ResourceMetrics } from '../../src/export/MetricData';
import { AggregationTemporality } from '../../src/export/AggregationTemporality';
import { ValueType } from '@opentelemetry/api';
import * as assert from 'assert';

describe('MetricDataSplitter', () => {
  const dummyResource = { attributes: {} } as any;

  it('should split batches when exceeding maxExportBatchSize', () => {
    const resourceMetrics: ResourceMetrics = {
      resource: dummyResource,
      scopeMetrics: [
        {
          scope: { name: 'test' },
          metrics: [
            {
              dataPointType: DataPointType.GAUGE,
              dataPoints: [
                { startTime: [0, 0], endTime: [0, 0], attributes: {}, value: 1 },
                { startTime: [0, 0], endTime: [0, 0], attributes: {}, value: 2 },
                { startTime: [0, 0], endTime: [0, 0], attributes: {}, value: 3 },
              ],
              descriptor: { name: 'm1', description: 'desc1', unit: 'unit1', valueType: ValueType.INT },
              aggregationTemporality: AggregationTemporality.CUMULATIVE,
            },
          ],
        },
      ],
    };

    const batches = MetricDataSplitter.split(resourceMetrics, 2);

    assert.strictEqual(batches.length, 2);
    
    // First batch should have 2 data points
    assert.strictEqual(batches[0].scopeMetrics[0].metrics[0].dataPoints.length, 2);
    assert.strictEqual(batches[0].scopeMetrics[0].metrics[0].dataPoints[0].value, 1);
    assert.strictEqual(batches[0].scopeMetrics[0].metrics[0].dataPoints[1].value, 2);
    assert.strictEqual(batches[0].scopeMetrics[0].metrics[0].descriptor.name, 'm1');
    assert.strictEqual(batches[0].scopeMetrics[0].metrics[0].descriptor.description, 'desc1');
    assert.strictEqual(batches[0].scopeMetrics[0].metrics[0].descriptor.unit, 'unit1');

    // Second batch should have 1 data point
    assert.strictEqual(batches[1].scopeMetrics[0].metrics[0].dataPoints.length, 1);
    assert.strictEqual(batches[1].scopeMetrics[0].metrics[0].dataPoints[0].value, 3);
    assert.strictEqual(batches[1].scopeMetrics[0].metrics[0].descriptor.name, 'm1');
    assert.strictEqual(batches[1].scopeMetrics[0].metrics[0].descriptor.description, 'desc1');
    assert.strictEqual(batches[1].scopeMetrics[0].metrics[0].descriptor.unit, 'unit1');
  });

  it('should split data points across metrics if needed', () => {
    const resourceMetrics: ResourceMetrics = {
      resource: dummyResource,
      scopeMetrics: [
        {
          scope: { name: 'test' },
          metrics: [
            {
              dataPointType: DataPointType.GAUGE,
              dataPoints: [
                { startTime: [0, 0], endTime: [0, 0], attributes: {}, value: 1 },
              ],
              descriptor: { name: 'm1', description: 'desc1', unit: 'unit1', valueType: ValueType.INT },
              aggregationTemporality: AggregationTemporality.CUMULATIVE,
            },
            {
              dataPointType: DataPointType.GAUGE,
              dataPoints: [
                { startTime: [0, 0], endTime: [0, 0], attributes: {}, value: 2 },
                { startTime: [0, 0], endTime: [0, 0], attributes: {}, value: 3 },
              ],
              descriptor: { name: 'm2', description: 'desc2', unit: 'unit2', valueType: ValueType.INT },
              aggregationTemporality: AggregationTemporality.CUMULATIVE,
            },
          ],
        },
      ],
    };

    const batches = MetricDataSplitter.split(resourceMetrics, 2);

    assert.strictEqual(batches.length, 2);
    
    // First batch should have 2 data points (m1:1, m2:2)
    assert.strictEqual(batches[0].scopeMetrics[0].metrics.length, 2);
    assert.strictEqual(batches[0].scopeMetrics[0].metrics[0].dataPoints.length, 1);
    assert.strictEqual(batches[0].scopeMetrics[0].metrics[0].dataPoints[0].value, 1);
    assert.strictEqual(batches[0].scopeMetrics[0].metrics[0].descriptor.name, 'm1');
    
    assert.strictEqual(batches[0].scopeMetrics[0].metrics[1].dataPoints.length, 1);
    assert.strictEqual(batches[0].scopeMetrics[0].metrics[1].dataPoints[0].value, 2);
    assert.strictEqual(batches[0].scopeMetrics[0].metrics[1].descriptor.name, 'm2');
    assert.strictEqual(batches[0].scopeMetrics[0].metrics[1].descriptor.description, 'desc2');

    // Second batch should have 1 data point (m2:3)
    assert.strictEqual(batches[1].scopeMetrics[0].metrics.length, 1);
    assert.strictEqual(batches[1].scopeMetrics[0].metrics[0].descriptor.name, 'm2');
    assert.strictEqual(batches[1].scopeMetrics[0].metrics[0].descriptor.description, 'desc2');
    assert.strictEqual(batches[1].scopeMetrics[0].metrics[0].dataPoints.length, 1);
    assert.strictEqual(batches[1].scopeMetrics[0].metrics[0].dataPoints[0].value, 3);
  });

  it('should handle empty data points', () => {
    const resourceMetrics: ResourceMetrics = {
      resource: dummyResource,
      scopeMetrics: [
        {
          scope: { name: 'test' },
          metrics: [
            {
              dataPointType: DataPointType.GAUGE,
              dataPoints: [],
              descriptor: { name: 'm1', description: 'desc1', unit: 'unit1', valueType: ValueType.INT },
              aggregationTemporality: AggregationTemporality.CUMULATIVE,
            },
          ],
        },
      ],
    };

    const batches = MetricDataSplitter.split(resourceMetrics, 2);

    assert.strictEqual(batches.length, 1);
    assert.strictEqual(batches[0].scopeMetrics[0].metrics[0].dataPoints.length, 0);
    assert.strictEqual(batches[0].scopeMetrics[0].metrics[0].descriptor.name, 'm1');
  });

  it('should split across multiple scopes and fill batches', () => {
    const resourceMetrics: ResourceMetrics = {
      resource: dummyResource,
      scopeMetrics: [
        {
          scope: { name: 'scope1' },
          metrics: [
            {
              dataPointType: DataPointType.GAUGE,
              dataPoints: [
                { startTime: [0, 0], endTime: [0, 0], attributes: {}, value: 1 },
                { startTime: [0, 0], endTime: [0, 0], attributes: {}, value: 2 },
              ],
              descriptor: { name: 'm1', description: 'desc1', unit: 'unit1', valueType: ValueType.INT },
              aggregationTemporality: AggregationTemporality.CUMULATIVE,
            },
            {
              dataPointType: DataPointType.GAUGE,
              dataPoints: [
                { startTime: [0, 0], endTime: [0, 0], attributes: {}, value: 3 },
              ],
              descriptor: { name: 'm2', description: 'desc2', unit: 'unit2', valueType: ValueType.INT },
              aggregationTemporality: AggregationTemporality.CUMULATIVE,
            },
          ],
        },
        {
          scope: { name: 'scope2' },
          metrics: [
            {
              dataPointType: DataPointType.GAUGE,
              dataPoints: [
                { startTime: [0, 0], endTime: [0, 0], attributes: {}, value: 4 },
              ],
              descriptor: { name: 'm3', description: 'desc3', unit: 'unit3', valueType: ValueType.INT },
              aggregationTemporality: AggregationTemporality.CUMULATIVE,
            },
          ],
        },
      ],
    };

    const batches = MetricDataSplitter.split(resourceMetrics, 2);

    assert.strictEqual(batches.length, 2);
    
    // Batch 1: scope1, m1 (2 points)
    assert.strictEqual(batches[0].scopeMetrics.length, 1);
    assert.strictEqual(batches[0].scopeMetrics[0].scope.name, 'scope1');
    assert.strictEqual(batches[0].scopeMetrics[0].metrics[0].descriptor.name, 'm1');
    assert.strictEqual(batches[0].scopeMetrics[0].metrics[0].dataPoints.length, 2);

    // Batch 2: scope1, m2 (1 point) AND scope2, m3 (1 point)
    assert.strictEqual(batches[1].scopeMetrics.length, 2);
    assert.strictEqual(batches[1].scopeMetrics[0].scope.name, 'scope1');
    assert.strictEqual(batches[1].scopeMetrics[0].metrics[0].descriptor.name, 'm2');
    assert.strictEqual(batches[1].scopeMetrics[0].metrics[0].descriptor.description, 'desc2');
    assert.strictEqual(batches[1].scopeMetrics[0].metrics[0].dataPoints.length, 1);
    
    assert.strictEqual(batches[1].scopeMetrics[1].scope.name, 'scope2');
    assert.strictEqual(batches[1].scopeMetrics[1].metrics[0].descriptor.name, 'm3');
    assert.strictEqual(batches[1].scopeMetrics[1].metrics[0].descriptor.unit, 'unit3');
    assert.strictEqual(batches[1].scopeMetrics[1].metrics[0].dataPoints.length, 1);
  });

  it('should split a single metric across multiple batches', () => {
    const resourceMetrics: ResourceMetrics = {
      resource: dummyResource,
      scopeMetrics: [
        {
          scope: { name: 'test' },
          metrics: [
            {
              dataPointType: DataPointType.GAUGE,
              dataPoints: [
                { startTime: [0, 0], endTime: [0, 0], attributes: {}, value: 1 },
                { startTime: [0, 0], endTime: [0, 0], attributes: {}, value: 2 },
                { startTime: [0, 0], endTime: [0, 0], attributes: {}, value: 3 },
                { startTime: [0, 0], endTime: [0, 0], attributes: {}, value: 4 },
                { startTime: [0, 0], endTime: [0, 0], attributes: {}, value: 5 },
              ],
              descriptor: { name: 'm1', description: 'desc1', unit: 'unit1', valueType: ValueType.INT },
              aggregationTemporality: AggregationTemporality.CUMULATIVE,
            },
          ],
        },
      ],
    };

    const batches = MetricDataSplitter.split(resourceMetrics, 2);

    assert.strictEqual(batches.length, 3);
    
    assert.strictEqual(batches[0].scopeMetrics[0].metrics[0].dataPoints.length, 2);
    assert.strictEqual(batches[0].scopeMetrics[0].metrics[0].descriptor.name, 'm1');
    
    assert.strictEqual(batches[1].scopeMetrics[0].metrics[0].dataPoints.length, 2);
    assert.strictEqual(batches[1].scopeMetrics[0].metrics[0].descriptor.name, 'm1');
    
    assert.strictEqual(batches[2].scopeMetrics[0].metrics[0].dataPoints.length, 1);
    assert.strictEqual(batches[2].scopeMetrics[0].metrics[0].descriptor.name, 'm1');
  });

  it('should handle partly filled batches with multiple scopes', () => {
    const resourceMetrics: ResourceMetrics = {
      resource: dummyResource,
      scopeMetrics: [
        {
          scope: { name: 'scope1' },
          metrics: [
            {
              dataPointType: DataPointType.GAUGE,
              dataPoints: [{ startTime: [0, 0], endTime: [0, 0], attributes: {}, value: 1 }],
              descriptor: { name: 'm1', description: 'desc1', unit: 'unit1', valueType: ValueType.INT },
              aggregationTemporality: AggregationTemporality.CUMULATIVE,
            },
          ],
        },
        {
          scope: { name: 'scope2' },
          metrics: [
            {
              dataPointType: DataPointType.GAUGE,
              dataPoints: [{ startTime: [0, 0], endTime: [0, 0], attributes: {}, value: 2 }],
              descriptor: { name: 'm2', description: 'desc2', unit: 'unit2', valueType: ValueType.INT },
              aggregationTemporality: AggregationTemporality.CUMULATIVE,
            },
          ],
        },
      ],
    };

    const batches = MetricDataSplitter.split(resourceMetrics, 3);

    assert.strictEqual(batches.length, 1);
    assert.strictEqual(batches[0].scopeMetrics.length, 2);
    assert.strictEqual(batches[0].scopeMetrics[0].metrics[0].descriptor.name, 'm1');
    assert.strictEqual(batches[0].scopeMetrics[0].metrics[0].dataPoints.length, 1);
    assert.strictEqual(batches[0].scopeMetrics[1].metrics[0].descriptor.name, 'm2');
    assert.strictEqual(batches[0].scopeMetrics[1].metrics[0].dataPoints.length, 1);
  });

  it('should throw when maxExportBatchSize is less than or equal to 0', () => {
    const resourceMetrics: ResourceMetrics = {
      resource: dummyResource,
      scopeMetrics: [],
    };

    assert.throws(
      () => MetricDataSplitter.split(resourceMetrics, 0),
      /maxExportBatchSize must be greater than 0/
    );

    assert.throws(
      () => MetricDataSplitter.split(resourceMetrics, -1),
      /maxExportBatchSize must be greater than 0/
    );
  });
});
