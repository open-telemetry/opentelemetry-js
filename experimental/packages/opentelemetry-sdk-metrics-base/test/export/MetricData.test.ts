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

import { MetricData, MetricsData, PointDataType } from '../../src/export/MetricData';
import { InstrumentType } from '../../src/InstrumentDescriptor';
import { ValueType } from '@opentelemetry/api-metrics-wip';
import * as assert from 'assert';
import { defaultInstrumentationLibrary, defaultResource } from '../util';
import { hrTime, InstrumentationLibrary } from '@opentelemetry/core';

const defaultInstrumentDescriptor = {
  name: 'test',
  description: 'abc',
  unit: 's',
  type: InstrumentType.COUNTER,
  valueType: ValueType.DOUBLE,
};

const defaultMetrics: MetricData[] = [{
  instrumentDescriptor: defaultInstrumentDescriptor,
  pointDataType: PointDataType.SINGULAR,
  pointData: [
    { point: 0, attributes: {}, startTime: hrTime(), endTime: hrTime() }
  ]
}];

describe('MetricsData', () => {
  describe('merge', () => {
    it('should produce empty metrics data when merging empty data', () => {
      const merged = new MetricsData().merge(new MetricsData());
      assert.deepStrictEqual(new MetricsData(), merged);
    });

    it('should retain target values when merging with empty data', () => {
      const target = new MetricsData({
        resource: defaultResource,
        instrumentationLibraryMetrics: [{
          instrumentationLibrary: defaultInstrumentationLibrary,
          metrics: defaultMetrics,
        }]
      });

      const merged = target.merge(new MetricsData());
      assert.deepStrictEqual(target, merged);
    });

    it('should concatenate metrics list for matchin resource and instrumentation library', () => {
      const target = new MetricsData({
        resource: defaultResource,
        instrumentationLibraryMetrics: [{
          instrumentationLibrary: defaultInstrumentationLibrary,
          metrics: defaultMetrics,
        }]
      });

      const merged = target.merge(target);

      const expected = new MetricsData({
        resource: defaultResource,
        instrumentationLibraryMetrics: [{
          instrumentationLibrary: defaultInstrumentationLibrary,
          metrics: defaultMetrics.concat(defaultMetrics),
        }]
      });
      assert.deepStrictEqual(expected, merged);
    });
  });

  it('should add new instrumentation library for matching resource', () => {
    const target = new MetricsData({
      resource: defaultResource,
      instrumentationLibraryMetrics: [{
        instrumentationLibrary: defaultInstrumentationLibrary,
        metrics: defaultMetrics,
      }]
    });

    const instrumentationLibrary: InstrumentationLibrary = {
      name: 'other',
      version: '1.0.0',
      schemaUrl: 'https://opentelemetry.io/schemas/1.7.0'
    };

    const merged = target.merge(new MetricsData({
      resource: defaultResource,
      instrumentationLibraryMetrics: [{
        instrumentationLibrary,
        metrics: defaultMetrics,
      }]
    }));

    const expected = new MetricsData({
      resource: defaultResource,
      instrumentationLibraryMetrics: [{
        instrumentationLibrary: defaultInstrumentationLibrary,
        metrics: defaultMetrics,
      }, {
        instrumentationLibrary,
        metrics: defaultMetrics,
      }]
    });

    assert.deepStrictEqual(expected, merged);
  });
});
