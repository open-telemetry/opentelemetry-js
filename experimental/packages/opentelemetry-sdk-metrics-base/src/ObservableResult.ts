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
import * as metrics from '@opentelemetry/api-metrics';
import { AttributeHashMap } from './state/HashMap';
import { isObservableInstrument, ObservableInstrument } from './Instruments';
import { InstrumentDescriptor } from '.';

/**
 * The class implements {@link metrics.ObservableResult} interface.
 */
export class ObservableResultImpl implements metrics.ObservableResult {
  /**
   * @internal
   */
  _buffer = new AttributeHashMap<number>();

  constructor(private _descriptor: InstrumentDescriptor) {}

  /**
   * Observe a measurement of the value associated with the given attributes.
   */
  observe(value: number, attributes: metrics.MetricAttributes = {}): void {
    if (this._descriptor.valueType === metrics.ValueType.INT && !Number.isInteger(value)) {
      api.diag.warn(
        `INT value type cannot accept a floating-point value for ${this._descriptor.name}, ignoring the fractional digits.`
      );
      value = Math.trunc(value);
    }
    this._buffer.set(attributes, value);
  }
}

/**
 * The class implements {@link metrics.BatchObservableCallback} interface.
 */
export class BatchObservableResultImpl implements metrics.BatchObservableResult {
  /**
   * @internal
   */
  _buffer: Map<ObservableInstrument, AttributeHashMap<number>> = new Map();

  /**
   * Observe a measurement of the value associated with the given attributes.
   */
  observe(metric: metrics.Observable, value: number, attributes: metrics.MetricAttributes = {}): void {
    if (!isObservableInstrument(metric)) {
      return;
    }
    let map = this._buffer.get(metric);
    if (map == null) {
      map = new AttributeHashMap();
      this._buffer.set(metric, map);
    }
    if (metric._descriptor.valueType === metrics.ValueType.INT && !Number.isInteger(value)) {
      api.diag.warn(
        `INT value type cannot accept a floating-point value for ${metric._descriptor.name}, ignoring the fractional digits.`
      );
      value = Math.trunc(value);
    }
    map.set(attributes, value);
  }
}
