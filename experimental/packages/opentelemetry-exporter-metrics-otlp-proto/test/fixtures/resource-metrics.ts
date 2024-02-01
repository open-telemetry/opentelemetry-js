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
import {
  AggregationTemporality,
  DataPointType,
  InstrumentType,
  ResourceMetrics,
} from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { ValueType } from '@opentelemetry/api';

export const resourceMetrics: ResourceMetrics = {
  resource: new Resource({
    foo: 'bar',
  }),
  scopeMetrics: [
    {
      scope: {
        name: 'meter1',
        schemaUrl: 'http://example.com/schema',
        version: '0.0.1',
      },
      metrics: [
        {
          descriptor: {
            description: 'My Counter Description',
            name: 'my.counter',
            type: InstrumentType.COUNTER,
            unit: '{connections}',
            valueType: ValueType.INT,
          },
          aggregationTemporality: AggregationTemporality.DELTA,
          dataPointType: DataPointType.SUM,
          isMonotonic: true,
          dataPoints: [
            {
              attributes: {
                foo: 'bar',
              },
              endTime: [1574120165, 438688070],
              startTime: [1574120165, 429803070],
              value: 1,
            },
          ],
        },
      ],
    },
  ],
};
