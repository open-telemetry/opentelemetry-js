/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import {
  AggregationTemporality,
  PushMetricExporter,
  ResourceMetrics,
} from '../../src';

export class TestMetricExporter implements PushMetricExporter {
  resourceMetricsList: ResourceMetrics[] = [];
  export(
    resourceMetrics: ResourceMetrics,
    resultCallback: (result: ExportResult) => void
  ): void {
    this.resourceMetricsList.push(resourceMetrics);
    process.nextTick(() => resultCallback({ code: ExportResultCode.SUCCESS }));
  }

  async forceFlush(): Promise<void> {}
  async shutdown(): Promise<void> {}

  selectAggregationTemporality(): AggregationTemporality {
    return AggregationTemporality.CUMULATIVE;
  }
}

export class TestDeltaMetricExporter extends TestMetricExporter {
  override selectAggregationTemporality(): AggregationTemporality {
    return AggregationTemporality.DELTA;
  }
}
