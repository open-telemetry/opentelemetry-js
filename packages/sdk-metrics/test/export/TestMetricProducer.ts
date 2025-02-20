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
