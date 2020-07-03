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
import { InstrumentationLibrary } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { BoundValueRecorder } from './BoundInstrument';
import { Batcher } from './export/Batcher';
import { MetricKind } from './export/types';
import { Metric } from './Metric';

/** This is a SDK implementation of Value Recorder Metric. */
export class ValueRecorderMetric extends Metric<BoundValueRecorder>
  implements api.ValueRecorder {
  protected readonly _absolute: boolean;

  constructor(
    name: string,
    options: api.MetricOptions,
    private readonly _batcher: Batcher,
    resource: Resource,
    instrumentationLibrary: InstrumentationLibrary
  ) {
    super(
      name,
      options,
      MetricKind.VALUE_RECORDER,
      resource,
      instrumentationLibrary
    );

    this._absolute = options.absolute !== undefined ? options.absolute : true; // Absolute default is true
  }
  protected _makeInstrument(labels: api.Labels): BoundValueRecorder {
    return new BoundValueRecorder(
      labels,
      this._disabled,
      this._absolute,
      this._valueType,
      this._logger,
      this._batcher.aggregatorFor(this._descriptor)
    );
  }

  record(value: number, labels: api.Labels = {}) {
    this.bind(labels).record(value);
  }
}
