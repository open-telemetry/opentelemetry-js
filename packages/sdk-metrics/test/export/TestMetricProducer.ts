/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CollectionResult, ResourceMetrics } from '../../src/export/MetricData';
import { MetricProducer } from '../../src/export/MetricProducer';
import { testResource } from '../util';

export const emptyResourceMetrics = {
  resource: testResource,
  scopeMetrics: [],
};

export class TestMetricProducer implements MetricProducer {
  private resourceMetrics: ResourceMetrics;
  private errors: unknown[];

  constructor(params?: {
    resourceMetrics?: ResourceMetrics;
    errors?: unknown[];
  }) {
    this.resourceMetrics = params?.resourceMetrics ?? emptyResourceMetrics;
    this.errors = params?.errors ?? [];
  }

  async collect(): Promise<CollectionResult> {
    return {
      resourceMetrics: this.resourceMetrics,
      errors: this.errors,
    };
  }
}
