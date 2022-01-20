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

import * as assert from 'assert';
import {
  Aggregator,
  DropAggregator,
  HistogramAggregator,
  LastValueAggregator,
  SumAggregator,
} from '../../src/aggregator';
import { InstrumentDescriptor, InstrumentType } from '../../src/InstrumentDescriptor';
import {
  Aggregation,
  DefaultAggregation,
  DropAggregation,
  ExplicitBucketHistogramAggregation,
  HistogramAggregation,
  LastValueAggregation,
  SumAggregation,
} from '../../src/view/Aggregation';
import { defaultInstrumentDescriptor } from '../util';

interface AggregationConstructor {
  new(...args: any[]): Aggregation;
}

interface AggregatorConstructor {
  new(...args: any[]): Aggregator<unknown>;
}

describe('Aggregation', () => {
  it('static aggregations', () => {
    const staticMembers: [keyof typeof Aggregation, AggregationConstructor][] = [
      ['Drop', DropAggregation],
      ['Sum', SumAggregation],
      ['LastValue', LastValueAggregation],
      ['Histogram', HistogramAggregation],
      ['Default', DefaultAggregation],
    ];

    for (const [key, type] of staticMembers) {
      const aggregation = (Aggregation[key] as () => Aggregation)();
      assert(aggregation instanceof type);
      assert(aggregation.createAggregator(defaultInstrumentDescriptor));
    }
  });
});

describe('DefaultAggregation', () => {
  describe('createAggregator', () => {
    it('should create aggregators for instrument descriptors', () => {
      // https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#default-aggregation
      const expectations: [InstrumentDescriptor, AggregatorConstructor][] = [
        [{ ...defaultInstrumentDescriptor, type: InstrumentType.COUNTER }, SumAggregator],
        [{ ...defaultInstrumentDescriptor, type: InstrumentType.OBSERVABLE_COUNTER }, SumAggregator],
        [{ ...defaultInstrumentDescriptor, type: InstrumentType.UP_DOWN_COUNTER }, SumAggregator],
        [{ ...defaultInstrumentDescriptor, type: InstrumentType.OBSERVABLE_UP_DOWN_COUNTER }, SumAggregator],
        [{ ...defaultInstrumentDescriptor, type: InstrumentType.OBSERVABLE_GAUGE }, LastValueAggregator],
        [{ ...defaultInstrumentDescriptor, type: InstrumentType.HISTOGRAM }, HistogramAggregator],
        // unknown instrument type
        [{ ...defaultInstrumentDescriptor, type: -1 as unknown as InstrumentType }, DropAggregator],
      ];

      const aggregation = new DefaultAggregation();
      for (const [instrumentDescriptor, type] of expectations) {
        assert(aggregation.createAggregator(instrumentDescriptor) instanceof type, `${InstrumentType[instrumentDescriptor.type]}`);
      }
    });
  });
});

describe('ExplicitBucketHistogramAggregation', () => {
  it('construct without exceptions', () => {
    const aggregation = new ExplicitBucketHistogramAggregation([1, 10, 100]);
    assert(aggregation instanceof ExplicitBucketHistogramAggregation);
  });

  describe('createAggregator', () => {
    it('should create histogram aggregators with boundaries', () => {
      const aggregator1 = new ExplicitBucketHistogramAggregation([1, 10, 100]).createAggregator(defaultInstrumentDescriptor);
      assert(aggregator1 instanceof HistogramAggregator);
      assert.deepStrictEqual(aggregator1['_boundaries'], [1, 10, 100]);

      const aggregator2 = new ExplicitBucketHistogramAggregation([10, 100, 1000]).createAggregator(defaultInstrumentDescriptor);
      assert(aggregator2 instanceof HistogramAggregator);
      assert.deepStrictEqual(aggregator2['_boundaries'], [10, 100, 1000]);
    });
  });
});
