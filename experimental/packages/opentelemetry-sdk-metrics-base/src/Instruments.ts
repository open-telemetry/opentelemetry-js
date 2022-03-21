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
import * as metrics from '@opentelemetry/api-metrics-wip';
import { InstrumentDescriptor } from './InstrumentDescriptor';
import { WritableMetricStorage } from './state/WritableMetricStorage';

export class SyncInstrument {
  constructor(private _writableMetricStorage: WritableMetricStorage, private _descriptor: InstrumentDescriptor) {}

  getName(): string {
    return this._descriptor.name;
  }

  protected _record(value: number, attributes: metrics.Attributes = {}, context: api.Context = api.context.active()) {
    if (this._descriptor.valueType === metrics.ValueType.INT && !Number.isInteger(value)) {
      api.diag.warn(
        `INT value type cannot accept a floating-point value for ${this._descriptor.name}, ignoring the fractional digits.`
      );
      value = Math.trunc(value);
    }
    this._writableMetricStorage.record(value, attributes, context);
  }
}

/**
 * The class implements {@link metrics.UpDownCounter} interface.
 */
export class UpDownCounterInstrument extends SyncInstrument implements metrics.UpDownCounter {
  /**
   * Increment value of counter by the input. Inputs may be negative.
   */
  add(value: number, attributes?: metrics.Attributes, ctx?: api.Context): void {
    this._record(value, attributes, ctx);
  }
}

/**
 * The class implements {@link metrics.Counter} interface.
 */
export class CounterInstrument extends SyncInstrument implements metrics.Counter {
  /**
   * Increment value of counter by the input. Inputs may not be negative.
   */
  add(value: number, attributes?: metrics.Attributes, ctx?: api.Context): void {
    if (value < 0) {
      api.diag.warn(`negative value provided to counter ${this.getName()}: ${value}`);
      return;
    }

    this._record(value, attributes, ctx);
  }
}

/**
 * The class implements {@link metrics.Histogram} interface.
 */
export class HistogramInstrument extends SyncInstrument implements metrics.Histogram {
  /**
   * Records a measurement. Value of the measurement must not be negative.
   */
  record(value: number, attributes?: metrics.Attributes, ctx?: api.Context): void {
    this._record(value, attributes, ctx);
  }
}
