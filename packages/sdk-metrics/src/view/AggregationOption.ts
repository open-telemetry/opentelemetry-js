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
  Aggregation,
  DEFAULT_AGGREGATION,
  DROP_AGGREGATION,
  ExplicitBucketHistogramAggregation,
  ExponentialHistogramAggregation,
  HISTOGRAM_AGGREGATION,
  LAST_VALUE_AGGREGATION,
  SUM_AGGREGATION,
} from './Aggregation';

export enum AggregationType {
  DEFAULT = 0,
  DROP = 1,
  SUM = 2,
  LAST_VALUE = 3,
  EXPLICIT_BUCKET_HISTOGRAM = 4,
  EXPONENTIAL_HISTOGRAM = 5,
}

export type SumAggregationOption = {
  type: AggregationType.SUM;
};

export type LastValueAggregationOption = {
  type: AggregationType.LAST_VALUE;
};

export type DropAggregationOption = {
  type: AggregationType.DROP;
};

export type DefaultAggregationOption = {
  type: AggregationType.DEFAULT;
};

export type HistogramAggregationOption = {
  type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM;
  options?: {
    recordMinMax?: boolean;
    boundaries: number[];
  };
};

export type ExponentialHistogramAggregationOption = {
  type: AggregationType.EXPONENTIAL_HISTOGRAM;
  options?: {
    recordMinMax?: boolean;
    maxSize?: number;
  };
};

export type AggregationOption =
  | ExponentialHistogramAggregationOption
  | HistogramAggregationOption
  | SumAggregationOption
  | DropAggregationOption
  | DefaultAggregationOption
  | LastValueAggregationOption;

export function toAggregation(option: AggregationOption): Aggregation {
  switch (option.type) {
    case AggregationType.DEFAULT:
      return DEFAULT_AGGREGATION;
    case AggregationType.DROP:
      return DROP_AGGREGATION;
    case AggregationType.SUM:
      return SUM_AGGREGATION;
    case AggregationType.LAST_VALUE:
      return LAST_VALUE_AGGREGATION;
    case AggregationType.EXPONENTIAL_HISTOGRAM: {
      const expOption = option as ExponentialHistogramAggregationOption;
      return new ExponentialHistogramAggregation(
        expOption.options?.maxSize,
        expOption.options?.recordMinMax
      );
    }
    case AggregationType.EXPLICIT_BUCKET_HISTOGRAM: {
      const expOption = option as HistogramAggregationOption;
      if (expOption.options == null) {
        return HISTOGRAM_AGGREGATION;
      } else {
        return new ExplicitBucketHistogramAggregation(
          expOption.options?.boundaries,
          expOption.options?.recordMinMax
        );
      }
    }
    default:
      throw new Error('Unsupported Aggregation');
  }
}
