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

import { InstrumentDescriptor } from '../InstrumentDescriptor';

// https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#aggregation

/**
 * Configures how measurements are combined into metrics for {@link View}s.
 *
 * Aggregation provides a set of built-in aggregations via static methods.
 */
export abstract class Aggregation {
  // TODO: define the actual aggregator classes
  abstract createAggregator(instrument: InstrumentDescriptor): unknown;

  static None(): Aggregation {
    return NONE_AGGREGATION;
  }
}

export class NoneAggregation extends Aggregation {
  createAggregator(_instrument: InstrumentDescriptor) {
    // TODO: define aggregator type
    return;
  }
}

const NONE_AGGREGATION = new NoneAggregation();
