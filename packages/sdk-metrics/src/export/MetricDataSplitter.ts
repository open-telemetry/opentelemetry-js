/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { DataPoint, ResourceMetrics, ScopeMetrics } from './MetricData';

/**
 * Splits a ResourceMetrics object into smaller ResourceMetrics objects
 * such that no batch exceeds maxExportBatchSize data points.
 * @param resourceMetrics The metrics to split.
 * @param maxExportBatchSize The maximum number of data points per batch.
 * @internal
 */
export function splitMetricData(
  resourceMetrics: ResourceMetrics,
  maxExportBatchSize: number
): ResourceMetrics[] {
  if (maxExportBatchSize <= 0) {
    throw new Error('maxExportBatchSize must be greater than 0');
  }
  const batches: ResourceMetrics[] = [];
  let currentBatchPoints = 0;
  let currentScopeMetrics: ScopeMetrics[] = [];

  function flush() {
    if (currentScopeMetrics.length > 0) {
      batches.push({
        resource: resourceMetrics.resource,
        scopeMetrics: currentScopeMetrics,
      });
      currentScopeMetrics = [];
      currentBatchPoints = 0;
    }
  }

  for (const scopeMetric of resourceMetrics.scopeMetrics) {
    let scopeMetricCopy: ScopeMetrics | null = null;

    for (const metric of scopeMetric.metrics) {
      let dataPointsRemaining = metric.dataPoints;

      if (dataPointsRemaining.length === 0) {
        if (!scopeMetricCopy) {
          scopeMetricCopy = { scope: scopeMetric.scope, metrics: [] };
          currentScopeMetrics.push(scopeMetricCopy);
        }
        scopeMetricCopy.metrics.push(metric);
        continue;
      }

      while (dataPointsRemaining.length > 0) {
        const spaceLeft = maxExportBatchSize - currentBatchPoints;
        const take = Math.min(spaceLeft, dataPointsRemaining.length);
        const chunk = dataPointsRemaining.slice(0, take);
        dataPointsRemaining = dataPointsRemaining.slice(take);

        if (!scopeMetricCopy) {
          scopeMetricCopy = { scope: scopeMetric.scope, metrics: [] };
          currentScopeMetrics.push(scopeMetricCopy);
        }

        let metricCopy = scopeMetricCopy.metrics.find(
          m => m.descriptor.name === metric.descriptor.name
        );
        if (!metricCopy) {
          metricCopy = { ...metric, dataPoints: [] };
          scopeMetricCopy.metrics.push(metricCopy);
        }

        (metricCopy.dataPoints as DataPoint<unknown>[]).push(
          ...(chunk as DataPoint<unknown>[])
        );
        currentBatchPoints += take;

        if (currentBatchPoints === maxExportBatchSize) {
          flush();
          scopeMetricCopy = null;
        }
      }
    }
  }

  flush();
  return batches;
}
