/*!
 * Copyright 2019, OpenTelemetry Authors
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

import * as types from '@opentelemetry/types';
import { CounterHandle, GaugeHandle } from './Handle';
import { MetricOptions } from './types';

/** This is a SDK implementation of {@link Metric} interface. */
export abstract class Metric<T> implements types.Metric<T> {
  protected readonly _monotonic: boolean;
  protected readonly _disabled: boolean;
  protected readonly _logger: types.Logger;
  private readonly _handles: Map<String, T> = new Map();

  constructor(name: string, options: MetricOptions) {
    this._monotonic = options.monotonic;
    this._disabled = options.disabled;
    this._logger = options.logger;
  }

  /**
   * Returns a Handle associated with specified LabelSet.
   * It is recommended to keep a reference to the Handle instead of always
   * calling this method for each operation.
   * @param labelSet the canonicalized LabelSet used to associate with this metric handle.
   */
  getHandle(labelSet: types.LabelSet): T {
    if (this._handles.has(labelSet.labelSetKey))
      return this._handles.get(labelSet.labelSetKey)!;

    const handle = this._makeHandle(labelSet);
    this._handles.set(labelSet.labelSetKey, handle);
    return handle;
  }

  /**
   * Returns a Handle for a metric with all labels not set.
   */
  getDefaultHandle(): T {
    // @todo: implement this method
    this._logger.error('not implemented yet');
    throw new Error('not implemented yet');
  }

  /**
   * Removes the Handle from the metric, if it is present.
   * @param labelSet the canonicalized LabelSet used to associate with this metric handle.
   */
  removeHandle(labelSet: types.LabelSet): void {
    this._handles.delete(labelSet.labelSetKey);
  }

  /**
   * Clears all Handles from the Metric.
   */
  clear(): void {
    this._handles.clear();
  }

  setCallback(fn: () => void): void {
    // @todo: implement this method
    this._logger.error('not implemented yet');
    return;
  }

  protected abstract _makeHandle(labelSet: types.LabelSet): T;
}

/** This is a SDK implementation of Counter Metric. */
export class CounterMetric extends Metric<CounterHandle> {
  constructor(name: string, options: MetricOptions) {
    super(name, options);
  }
  protected _makeHandle(labelSet: types.LabelSet): CounterHandle {
    return new CounterHandle(
      this._disabled,
      this._monotonic,
      labelSet,
      this._logger
    );
  }
}

/** This is a SDK implementation of Gauge Metric. */
export class GaugeMetric extends Metric<GaugeHandle> {
  constructor(name: string, options: MetricOptions) {
    super(name, options);
  }
  protected _makeHandle(labelSet: types.LabelSet): GaugeHandle {
    return new GaugeHandle(
      this._disabled,
      this._monotonic,
      labelSet,
      this._logger
    );
  }
}
