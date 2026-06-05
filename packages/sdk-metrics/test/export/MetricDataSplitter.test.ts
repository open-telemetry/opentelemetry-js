/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { splitMetricData } from '../../src/export/MetricDataSplitter';
import type { ResourceMetrics } from '../../src/export/MetricData';
import { DataPointType } from '../../src/export/MetricData';
import { AggregationTemporality } from '../../src/export/AggregationTemporality';
import { ValueType } from '@opentelemetry/api';
import * as assert from 'assert';

describe('splitMetricData', () => {
  const dummyResource = { attributes: {} } as any;

  function createMetric(
    dataPointType: DataPointType,
    name: string,
    values: any[],
    options?: {
      isMonotonic?: boolean;
      description?: string;
      unit?: string;
      aggregationTemporality?: AggregationTemporality;
    }
  ) {
    const num = name.replace(/^\D+/, '');
    return {
      dataPointType,
      dataPoints: values.map(value => ({
        startTime: [0, 0] as [number, number],
        endTime: [0, 0] as [number, number],
        attributes: {},
        value,
      })),
      descriptor: {
        name,
        description: options?.description ?? `desc${num}`,
        unit: options?.unit ?? `unit${num}`,
        valueType: ValueType.INT,
      },
      aggregationTemporality: options?.aggregationTemporality ?? AggregationTemporality.CUMULATIVE,
      ...(options?.isMonotonic !== undefined ? { isMonotonic: options.isMonotonic } : {}),
    };
  }

  function createScopeMetrics(scopeName: string, metrics: any[]) {
    return {
      scope: { name: scopeName },
      metrics,
    };
  }

  function createResourceMetrics(scopeMetrics: any[]): ResourceMetrics {
    return {
      resource: dummyResource,
      scopeMetrics,
    };
  }

  describe('GAUGE', () => {
    it('should split batches when exceeding maxExportBatchSize (GAUGE)', () => {
      const resourceMetrics = createResourceMetrics([
        createScopeMetrics('test', [
          createMetric(DataPointType.GAUGE, 'm1', [1, 2, 3]),
        ]),
      ]);

      const batches = splitMetricData(resourceMetrics, 2);

      assert.strictEqual(batches.length, 2);

      // First batch should have 2 data points
      assert.strictEqual(
        batches[0].scopeMetrics[0].metrics[0].dataPoints.length,
        2
      );
      assert.strictEqual(
        batches[0].scopeMetrics[0].metrics[0].dataPoints[0].value,
        1
      );
      assert.strictEqual(
        batches[0].scopeMetrics[0].metrics[0].dataPoints[1].value,
        2
      );
      assert.strictEqual(
        batches[0].scopeMetrics[0].metrics[0].descriptor.name,
        'm1'
      );
      assert.strictEqual(
        batches[0].scopeMetrics[0].metrics[0].descriptor.description,
        'desc1'
      );
      assert.strictEqual(
        batches[0].scopeMetrics[0].metrics[0].descriptor.unit,
        'unit1'
      );

      // Second batch should have 1 data point
      assert.strictEqual(
        batches[1].scopeMetrics[0].metrics[0].dataPoints.length,
        1
      );
      assert.strictEqual(
        batches[1].scopeMetrics[0].metrics[0].dataPoints[0].value,
        3
      );
      assert.strictEqual(
        batches[1].scopeMetrics[0].metrics[0].descriptor.name,
        'm1'
      );
      assert.strictEqual(
        batches[1].scopeMetrics[0].metrics[0].descriptor.description,
        'desc1'
      );
      assert.strictEqual(
        batches[1].scopeMetrics[0].metrics[0].descriptor.unit,
        'unit1'
      );
    });

    it('should split data points across metrics if needed (GAUGE)', () => {
      const resourceMetrics = createResourceMetrics([
        createScopeMetrics('test', [
          createMetric(DataPointType.GAUGE, 'm1', [1]),
          createMetric(DataPointType.GAUGE, 'm2', [2, 3]),
        ]),
      ]);

      const batches = splitMetricData(resourceMetrics, 2);

      assert.strictEqual(batches.length, 2);

      // First batch should have 2 data points (m1:1, m2:2)
      assert.strictEqual(batches[0].scopeMetrics[0].metrics.length, 2);
      assert.strictEqual(
        batches[0].scopeMetrics[0].metrics[0].dataPoints.length,
        1
      );
      assert.strictEqual(
        batches[0].scopeMetrics[0].metrics[0].dataPoints[0].value,
        1
      );
      assert.strictEqual(
        batches[0].scopeMetrics[0].metrics[0].descriptor.name,
        'm1'
      );

      assert.strictEqual(
        batches[0].scopeMetrics[0].metrics[1].dataPoints.length,
        1
      );
      assert.strictEqual(
        batches[0].scopeMetrics[0].metrics[1].dataPoints[0].value,
        2
      );
      assert.strictEqual(
        batches[0].scopeMetrics[0].metrics[1].descriptor.name,
        'm2'
      );
      assert.strictEqual(
        batches[0].scopeMetrics[0].metrics[1].descriptor.description,
        'desc2'
      );

      // Second batch should have 1 data point (m2:3)
      assert.strictEqual(batches[1].scopeMetrics[0].metrics.length, 1);
      assert.strictEqual(
        batches[1].scopeMetrics[0].metrics[0].descriptor.name,
        'm2'
      );
      assert.strictEqual(
        batches[1].scopeMetrics[0].metrics[0].descriptor.description,
        'desc2'
      );
      assert.strictEqual(
        batches[1].scopeMetrics[0].metrics[0].dataPoints.length,
        1
      );
      assert.strictEqual(
        batches[1].scopeMetrics[0].metrics[0].dataPoints[0].value,
        3
      );
    });

    it('should handle empty data points (GAUGE)', () => {
      const resourceMetrics = createResourceMetrics([
        createScopeMetrics('test', [
          createMetric(DataPointType.GAUGE, 'm1', []),
        ]),
      ]);

      const batches = splitMetricData(resourceMetrics, 2);

      assert.strictEqual(batches.length, 1);
      assert.strictEqual(
        batches[0].scopeMetrics[0].metrics[0].dataPoints.length,
        0
      );
      assert.strictEqual(
        batches[0].scopeMetrics[0].metrics[0].descriptor.name,
        'm1'
      );
    });

    it('should split across multiple scopes and fill batches (GAUGE)', () => {
      const resourceMetrics = createResourceMetrics([
        createScopeMetrics('scope1', [
          createMetric(DataPointType.GAUGE, 'm1', [1, 2]),
          createMetric(DataPointType.GAUGE, 'm2', [3]),
        ]),
        createScopeMetrics('scope2', [
          createMetric(DataPointType.GAUGE, 'm3', [4]),
        ]),
      ]);

      const batches = splitMetricData(resourceMetrics, 2);

      assert.strictEqual(batches.length, 2);

      // Batch 1: scope1, m1 (2 points)
      assert.strictEqual(batches[0].scopeMetrics.length, 1);
      assert.strictEqual(batches[0].scopeMetrics[0].scope.name, 'scope1');
      assert.strictEqual(
        batches[0].scopeMetrics[0].metrics[0].descriptor.name,
        'm1'
      );
      assert.strictEqual(
        batches[0].scopeMetrics[0].metrics[0].dataPoints.length,
        2
      );

      // Batch 2: scope1, m2 (1 point) AND scope2, m3 (1 point)
      assert.strictEqual(batches[1].scopeMetrics.length, 2);
      assert.strictEqual(batches[1].scopeMetrics[0].scope.name, 'scope1');
      assert.strictEqual(
        batches[1].scopeMetrics[0].metrics[0].descriptor.name,
        'm2'
      );
      assert.strictEqual(
        batches[1].scopeMetrics[0].metrics[0].descriptor.description,
        'desc2'
      );
      assert.strictEqual(
        batches[1].scopeMetrics[0].metrics[0].dataPoints.length,
        1
      );

      assert.strictEqual(batches[1].scopeMetrics[1].scope.name, 'scope2');
      assert.strictEqual(
        batches[1].scopeMetrics[1].metrics[0].descriptor.name,
        'm3'
      );
      assert.strictEqual(
        batches[1].scopeMetrics[1].metrics[0].descriptor.unit,
        'unit3'
      );
      assert.strictEqual(
        batches[1].scopeMetrics[1].metrics[0].dataPoints.length,
        1
      );
    });

    it('should split a single metric across multiple batches (GAUGE)', () => {
      const resourceMetrics = createResourceMetrics([
        createScopeMetrics('test', [
          createMetric(DataPointType.GAUGE, 'm1', [1, 2, 3, 4, 5]),
        ]),
      ]);

      const batches = splitMetricData(resourceMetrics, 2);

      assert.strictEqual(batches.length, 3);

      assert.strictEqual(
        batches[0].scopeMetrics[0].metrics[0].dataPoints.length,
        2
      );
      assert.strictEqual(
        batches[0].scopeMetrics[0].metrics[0].descriptor.name,
        'm1'
      );

      assert.strictEqual(
        batches[1].scopeMetrics[0].metrics[0].dataPoints.length,
        2
      );
      assert.strictEqual(
        batches[1].scopeMetrics[0].metrics[0].descriptor.name,
        'm1'
      );

      assert.strictEqual(
        batches[2].scopeMetrics[0].metrics[0].dataPoints.length,
        1
      );
      assert.strictEqual(
        batches[2].scopeMetrics[0].metrics[0].descriptor.name,
        'm1'
      );
    });

    it('should handle partly filled batches with multiple scopes (GAUGE)', () => {
      const resourceMetrics = createResourceMetrics([
        createScopeMetrics('scope1', [
          createMetric(DataPointType.GAUGE, 'm1', [1]),
        ]),
        createScopeMetrics('scope2', [
          createMetric(DataPointType.GAUGE, 'm2', [2]),
        ]),
      ]);

      const batches = splitMetricData(resourceMetrics, 3);

      assert.strictEqual(batches.length, 1);
      assert.strictEqual(batches[0].scopeMetrics.length, 2);
      assert.strictEqual(
        batches[0].scopeMetrics[0].metrics[0].descriptor.name,
        'm1'
      );
      assert.strictEqual(
        batches[0].scopeMetrics[0].metrics[0].dataPoints.length,
        1
      );
      assert.strictEqual(
        batches[0].scopeMetrics[1].metrics[0].descriptor.name,
        'm2'
      );
      assert.strictEqual(
        batches[0].scopeMetrics[1].metrics[0].dataPoints.length,
        1
      );
    });
  });

  describe('SUM', () => {
    it('should split batches when exceeding maxExportBatchSize (SUM)', () => {
      const resourceMetrics = createResourceMetrics([
        createScopeMetrics('test', [
          createMetric(DataPointType.SUM, 'm1', [1, 2, 3], { isMonotonic: true }),
        ]),
      ]);

      const batches = splitMetricData(resourceMetrics, 2);

      assert.strictEqual(batches.length, 2);
      assert.strictEqual(
        batches[0].scopeMetrics[0].metrics[0].dataPoints.length,
        2
      );
      assert.strictEqual(
        (batches[0].scopeMetrics[0].metrics[0] as any).isMonotonic,
        true
      );
      assert.strictEqual(
        batches[1].scopeMetrics[0].metrics[0].dataPoints.length,
        1
      );
    });

    it('should split across multiple scopes and fill batches (SUM)', () => {
      const resourceMetrics = createResourceMetrics([
        createScopeMetrics('scope1', [
          createMetric(DataPointType.SUM, 'm1', [1, 2], { isMonotonic: true }),
          createMetric(DataPointType.SUM, 'm2', [3], { isMonotonic: true }),
        ]),
        createScopeMetrics('scope2', [
          createMetric(DataPointType.SUM, 'm3', [4], { isMonotonic: true }),
        ]),
      ]);

      const batches = splitMetricData(resourceMetrics, 2);

      assert.strictEqual(batches.length, 2);
      assert.strictEqual(batches[0].scopeMetrics.length, 1);
      assert.strictEqual(batches[1].scopeMetrics.length, 2);
    });
  });

  describe('HISTOGRAM', () => {
    const dummyHistogram = {
      buckets: { boundaries: [1, 2], counts: [1, 1, 1] },
      sum: 3,
      count: 3,
    };

    it('should split batches when exceeding maxExportBatchSize (HISTOGRAM)', () => {
      const resourceMetrics = createResourceMetrics([
        createScopeMetrics('test', [
          createMetric(DataPointType.HISTOGRAM, 'm1', [
            dummyHistogram,
            dummyHistogram,
            dummyHistogram,
          ]),
        ]),
      ]);

      const batches = splitMetricData(resourceMetrics, 2);

      assert.strictEqual(batches.length, 2);
      assert.strictEqual(
        batches[0].scopeMetrics[0].metrics[0].dataPoints.length,
        2
      );
      assert.strictEqual(
        batches[1].scopeMetrics[0].metrics[0].dataPoints.length,
        1
      );
    });

    it('should split across multiple scopes and fill batches (HISTOGRAM)', () => {
      const resourceMetrics = createResourceMetrics([
        createScopeMetrics('scope1', [
          createMetric(DataPointType.HISTOGRAM, 'm1', [
            dummyHistogram,
            dummyHistogram,
          ]),
          createMetric(DataPointType.HISTOGRAM, 'm2', [dummyHistogram]),
        ]),
        createScopeMetrics('scope2', [
          createMetric(DataPointType.HISTOGRAM, 'm3', [dummyHistogram]),
        ]),
      ]);

      const batches = splitMetricData(resourceMetrics, 2);

      assert.strictEqual(batches.length, 2);
      assert.strictEqual(batches[0].scopeMetrics.length, 1);
      assert.strictEqual(batches[1].scopeMetrics.length, 2);
    });
  });

  describe('EXPONENTIAL_HISTOGRAM', () => {
    const dummyExponentialHistogram = {
      sum: 3,
      count: 3,
      scale: 1,
      zeroCount: 0,
      positive: { offset: 1, bucketCounts: [1, 1, 1] },
      negative: { offset: 1, bucketCounts: [] },
    };

    it('should split batches when exceeding maxExportBatchSize (EXPONENTIAL_HISTOGRAM)', () => {
      const resourceMetrics = createResourceMetrics([
        createScopeMetrics('test', [
          createMetric(DataPointType.EXPONENTIAL_HISTOGRAM, 'm1', [
            dummyExponentialHistogram,
            dummyExponentialHistogram,
            dummyExponentialHistogram,
          ]),
        ]),
      ]);

      const batches = splitMetricData(resourceMetrics, 2);

      assert.strictEqual(batches.length, 2);
      assert.strictEqual(
        batches[0].scopeMetrics[0].metrics[0].dataPoints.length,
        2
      );
      assert.strictEqual(
        batches[1].scopeMetrics[0].metrics[0].dataPoints.length,
        1
      );
    });

    it('should not merge metrics with the same name but different types', () => {
      const resourceMetrics = createResourceMetrics([
        createScopeMetrics('test', [
          createMetric(DataPointType.GAUGE, 'm1', [1]),
          createMetric(DataPointType.SUM, 'm1', [2], {
            isMonotonic: true,
            description: 'desc2',
            unit: 'unit2',
          }),
        ]),
      ]);

      const batches = splitMetricData(resourceMetrics, 10);

      assert.strictEqual(batches.length, 1);
      assert.strictEqual(
        batches[0].scopeMetrics[0].metrics.length,
        2,
        'Should keep distinct metrics separate'
      );
      assert.strictEqual(
        batches[0].scopeMetrics[0].metrics[0].descriptor.name,
        'm1'
      );
      assert.strictEqual(
        batches[0].scopeMetrics[0].metrics[1].descriptor.name,
        'm1'
      );
      assert.strictEqual(
        batches[0].scopeMetrics[0].metrics[0].dataPointType,
        DataPointType.GAUGE
      );
      assert.strictEqual(
        batches[0].scopeMetrics[0].metrics[1].dataPointType,
        DataPointType.SUM
      );
    });
  });

  describe('Validation', () => {
    it('should throw when maxExportBatchSize is less than or equal to 0', () => {
      const resourceMetrics: ResourceMetrics = {
        resource: dummyResource,
        scopeMetrics: [],
      };

      assert.throws(
        () => splitMetricData(resourceMetrics, 0),
        /maxExportBatchSize must be a positive integer/
      );

      assert.throws(
        () => splitMetricData(resourceMetrics, -1),
        /maxExportBatchSize must be a positive integer/
      );

      assert.throws(
        () => splitMetricData(resourceMetrics, -1.5),
        /maxExportBatchSize must be a positive integer/
      );
    });
  });
});
