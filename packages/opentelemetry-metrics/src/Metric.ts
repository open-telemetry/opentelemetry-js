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
import { hashLabelValues } from './Utils';
import { CounterHandle } from './Handle';

export class Metric<T> implements types.Metric<T> {
  private readonly _monotonic: boolean;
  private readonly _disabled: boolean;
  private readonly _handles: Map<String, T> = new Map();

  constructor(name: string, options: types.MetricOptions) {
    this._monotonic = options.monotonic!;
    this._disabled = options.disabled!;
  }

  /**
   * Returns a Handle associated with specified label values.
   * It is recommended to keep a reference to the Handle instead of always
   * calling this method for every operations.
   * @param labelValues the list of label values.
   */
  getHandle(labelValues: string[]): T {
    const hash = hashLabelValues(labelValues);
    if (this._handles.has(hash)) return this._handles.get(hash)!;

    const handle = new CounterHandle(this._disabled, this._monotonic);
    this._handles.set(hash, handle as never);
    return handle as never;
  }

  /**
   * Returns a Handle for a metric with all labels not set.
   */
  getDefaultHandle(): T {
    throw new Error('not implemented yet');
  }

  /**
   * Removes the Handle from the metric, if it is present.
   * @param labelValues the list of label values.
   */
  removeHandle(labelValues: string[]): void {
    this._handles.delete(hashLabelValues(labelValues));
  }

  /**
   * Clears all Handle from the Metric.
   */
  clear(): void {
    this._handles.clear();
  }

  setCallback(fn: () => void): void {
    // @todo: implement this method
    return;
  }
}
