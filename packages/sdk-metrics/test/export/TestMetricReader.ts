/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AggregationTemporality, MetricReader } from '../../src';
import { MetricCollector } from '../../src/state/MetricCollector';
import { MetricReaderOptions } from '../../src/export/MetricReader';

/**
 * A test metric reader that implements no-op onForceFlush() and onShutdown() handlers.
 */
export class TestMetricReader extends MetricReader {
  protected onForceFlush(): Promise<void> {
    return Promise.resolve(undefined);
  }

  protected onShutdown(): Promise<void> {
    return Promise.resolve(undefined);
  }

  getMetricCollector(): MetricCollector {
    return this['_sdkMetricProducer'] as MetricCollector;
  }
}

export class TestDeltaMetricReader extends TestMetricReader {
  constructor(options: MetricReaderOptions = {}) {
    super({
      ...options,
      aggregationTemporalitySelector: () => AggregationTemporality.DELTA,
    });
  }
}
