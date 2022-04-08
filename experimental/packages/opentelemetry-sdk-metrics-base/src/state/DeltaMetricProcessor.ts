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

import { Context } from '@opentelemetry/api';
import { Attributes } from '@opentelemetry/api-metrics';
import { Maybe } from '../utils';
import { Accumulation, Aggregator } from '../aggregator/types';
import { AttributeHashMap } from './HashMap';

/**
 * Internal interface.
 *
 * Allows synchronous collection of metrics. This processor should allow
 * allocation of new aggregation cells for metrics and convert cumulative
 * recording to delta data points.
 */
export class DeltaMetricProcessor<T extends Maybe<Accumulation>> {
  private _activeCollectionStorage = new AttributeHashMap<T>();
  // TODO: find a reasonable mean to clean the memo;
  // https://github.com/open-telemetry/opentelemetry-specification/pull/2208
  private _cumulativeMemoStorage = new AttributeHashMap<T>();

  constructor(private _aggregator: Aggregator<T>) {}

  /** Bind an efficient storage handle for a set of attributes. */
  private bind(attributes: Attributes) {
    return this._activeCollectionStorage.getOrDefault(attributes, () => this._aggregator.createAccumulation());
  }

  record(value: number, attributes: Attributes, _context: Context) {
    const accumulation = this.bind(attributes);
    accumulation?.record(value);
  }

  batchCumulate(measurements: AttributeHashMap<number>) {
    Array.from(measurements.entries()).forEach(([attributes, value, hashCode]) => {
      let accumulation = this._aggregator.createAccumulation();
      accumulation?.record(value);
      if (this._cumulativeMemoStorage.has(attributes, hashCode)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const previous = this._cumulativeMemoStorage.get(attributes, hashCode)!;
        accumulation = this._aggregator.diff(previous, accumulation);
      }

      this._cumulativeMemoStorage.set(attributes, accumulation, hashCode);
      this._activeCollectionStorage.set(attributes, accumulation, hashCode);
    });
  }

  collect() {
    const unreportedDelta = this._activeCollectionStorage;
    this._activeCollectionStorage = new AttributeHashMap();
    return unreportedDelta;
  }
}
