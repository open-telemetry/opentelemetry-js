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
  if (!Number.isInteger(maxExportBatchSize) || maxExportBatchSize <= 0) {
    throw new Error('maxExportBatchSize must be a positive integer');
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

  // Iterate through all scopes in the input metrics
  for (const scopeMetric of resourceMetrics.scopeMetrics) {
    let scopeMetricCopy: ScopeMetrics | null = null;

    // Iterate through all metrics within the current scope
    for (const metric of scopeMetric.metrics) {
      let dataPointsRemaining = metric.dataPoints;
      let metricCopy: typeof metric | undefined = undefined;

      // If a metric has no data points, add it directly to the current batch
      if (dataPointsRemaining.length === 0) {
        if (!scopeMetricCopy) {
          scopeMetricCopy = { scope: scopeMetric.scope, metrics: [] };
          currentScopeMetrics.push(scopeMetricCopy);
        }
        scopeMetricCopy.metrics.push(metric);
        continue;
      }

      // Chunk the data points of the current metric across batches
      while (dataPointsRemaining.length > 0) {
        const spaceLeft = maxExportBatchSize - currentBatchPoints;
        const take = Math.min(spaceLeft, dataPointsRemaining.length);
        const chunk = dataPointsRemaining.slice(0, take);
        dataPointsRemaining = dataPointsRemaining.slice(take);

        // Ensure we have a ScopeMetrics object in the current batch
        if (!scopeMetricCopy) {
          scopeMetricCopy = { scope: scopeMetric.scope, metrics: [] };
          currentScopeMetrics.push(scopeMetricCopy);
          metricCopy = undefined; // Reset because we are starting a new batch
        }

        // Ensure we have a MetricData object for this specific metric in the current batch.
        if (!metricCopy) {
          metricCopy = { ...metric, dataPoints: [] };
          scopeMetricCopy.metrics.push(metricCopy);
        }

        (metricCopy.dataPoints as DataPoint<unknown>[]).push(
          ...(chunk as DataPoint<unknown>[])
        );
        currentBatchPoints += take;

        // If the current batch is full, flush it and start a new one
        if (currentBatchPoints === maxExportBatchSize) {
          flush();
          scopeMetricCopy = null; // Force recreation of scope copy in the next batch
        }
      }
    }
  }

  flush();
  return batches;
}
