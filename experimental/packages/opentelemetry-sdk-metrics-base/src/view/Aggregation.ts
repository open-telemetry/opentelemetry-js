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

import * as api from '@opentelemetry/api';
import { Aggregator, SumAggregator, DropAggregator, LastValueAggregator, HistogramAggregator } from '../aggregator';
import { Accumulation } from '../aggregator/types';
import { InstrumentDescriptor } from '../InstrumentDescriptor';
import { InstrumentType } from '../Instruments';
import { Maybe } from '../utils';

// https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#aggregation

/**
 * Configures how measurements are combined into metrics for {@link View}s.
 *
 * Aggregation provides a set of built-in aggregations via static methods.
 */
export abstract class Aggregation {
  abstract createAggregator(instrument: InstrumentDescriptor): Aggregator<Maybe<Accumulation>>;

  static Drop(): Aggregation {
    return DROP_AGGREGATION;
  }

  static Sum(): Aggregation {
    return SUM_AGGREGATION;
  }

  static LastValue(): Aggregation {
    return LAST_VALUE_AGGREGATION;
  }

  static Histogram(): Aggregation {
    return HISTOGRAM_AGGREGATION;
  }

  static Default(): Aggregation {
    return DEFAULT_AGGREGATION;
  }
}

export class DropAggregation extends Aggregation {
  private static DEFAULT_INSTANCE = new DropAggregator();
  createAggregator(_instrument: InstrumentDescriptor) {
    return DropAggregation.DEFAULT_INSTANCE;
  }
}

export class SumAggregation extends Aggregation {
  private static DEFAULT_INSTANCE = new SumAggregator();
  createAggregator(_instrument: InstrumentDescriptor) {
    return SumAggregation.DEFAULT_INSTANCE;
  }
}

export class LastValueAggregation extends Aggregation {
  private static DEFAULT_INSTANCE = new LastValueAggregator();
  createAggregator(_instrument: InstrumentDescriptor) {
    return LastValueAggregation.DEFAULT_INSTANCE;
  }
}

export class HistogramAggregation extends Aggregation {
  // https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#histogram-aggregation
  private static DEFAULT_INSTANCE = new HistogramAggregator([0, 5, 10, 25, 50, 75, 100, 250, 500, 1000]);
  createAggregator(_instrument: InstrumentDescriptor) {
    return HistogramAggregation.DEFAULT_INSTANCE;
  }
}

export class ExplicitBucketHistogramAggregation extends Aggregation {
  constructor(private _boundaries: number[]) {
    super();
  }

  createAggregator(_instrument: InstrumentDescriptor) {
    return new HistogramAggregator(this._boundaries);
  }
}

// https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#default-aggregation
export class DefaultAggregation extends Aggregation {
  private _resolve(instrument: InstrumentDescriptor): Aggregation {
    // cast to unknown to disable complaints on the (unreachable) fallback.
    switch (instrument.type as unknown) {
      case InstrumentType.COUNTER:
      case InstrumentType.UP_DOWN_COUNTER:
      case InstrumentType.OBSERVABLE_COUNTER:
      case InstrumentType.OBSERVABLE_UP_DOWN_COUNTER: {
        return SUM_AGGREGATION;
      }
      case InstrumentType.OBSERVABLE_GAUGE: {
        return LAST_VALUE_AGGREGATION;
      }
      case InstrumentType.HISTOGRAM: {
        return HISTOGRAM_AGGREGATION;
      }
    }
    api.diag.warn(`Unable to recognize instrument type: ${instrument.type}`);
    return DROP_AGGREGATION;
  }

  createAggregator(instrument: InstrumentDescriptor): Aggregator<Maybe<Accumulation>> {
    return this._resolve(instrument).createAggregator(instrument);
  }
}

const DROP_AGGREGATION = new DropAggregation();
const SUM_AGGREGATION = new SumAggregation();
const LAST_VALUE_AGGREGATION = new LastValueAggregation();
const HISTOGRAM_AGGREGATION = new HistogramAggregation();
const DEFAULT_AGGREGATION = new DefaultAggregation();
