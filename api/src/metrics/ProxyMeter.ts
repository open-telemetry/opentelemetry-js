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

import { Meter, MeterOptions } from './Meter';
import { NoopMeter } from './NoopMeter';
import {
  BatchObservableCallback,
  Counter,
  Histogram,
  MetricOptions,
  ObservableCounter,
  ObservableGauge,
  ObservableUpDownCounter,
  UpDownCounter,
  Observable,
  Gauge,
} from './Metric';

const NOOP_METER = new NoopMeter();

/**
 * Proxy meter provided by the proxy meter provider
 */
export class ProxyMeter implements Meter {
  // When a real implementation is provided, this will be it
  private _delegate?: Meter;

  constructor(
    private _provider: MeterDelegator,
    public readonly name: string,
    public readonly version?: string,
    public readonly options?: MeterOptions
  ) {}

  /**
   * @see {@link Meter.createGauge}
   */
  createGauge(_name: string, _options?: MetricOptions): Gauge {
    return this._getMeter().createGauge(_name, _options);
  }

  /**
   * @see {@link Meter.createUpDownCounter}
   */
  createHistogram(_name: string, _options?: MetricOptions): Histogram {
    return this._getMeter().createHistogram(_name, _options);
  }

  /**
   * @see {@link Meter.createUpDownCounter}
   */
  createCounter(_name: string, _options?: MetricOptions): Counter {
    return this._getMeter().createCounter(_name, _options);
  }

  /**
   * @see {@link Meter.createUpDownCounter}
   */
  createUpDownCounter(_name: string, _options?: MetricOptions): UpDownCounter {
    return this._getMeter().createUpDownCounter(_name, _options);
  }

  /**
   * @see {@link Meter.createObservableGauge}
   */
  createObservableGauge(
    _name: string,
    _options?: MetricOptions
  ): ObservableGauge {
    return this._getMeter().createObservableGauge(_name, _options);
  }

  /**
   * @see {@link Meter.createObservableCounter}
   */
  createObservableCounter(
    _name: string,
    _options?: MetricOptions
  ): ObservableCounter {
    return this._getMeter().createObservableCounter(_name, _options);
  }

  /**
   * @see {@link Meter.createObservableUpDownCounter}
   */
  createObservableUpDownCounter(
    _name: string,
    _options?: MetricOptions
  ): ObservableUpDownCounter {
    return this._getMeter().createObservableUpDownCounter(_name, _options);
  }

  /**
   * @see {@link Meter.addBatchObservableCallback}
   */
  addBatchObservableCallback(
    _callback: BatchObservableCallback,
    _observables: Observable[]
  ): void {
    this._getMeter().addBatchObservableCallback(_callback, _observables);
  }

  /**
   * @see {@link Meter.removeBatchObservableCallback}
   */
  removeBatchObservableCallback(
    _callback: BatchObservableCallback,
    _observables: Observable[]
  ): void {
    this._getMeter().removeBatchObservableCallback(_callback, _observables);
  }

  /**
   * Try to get a meter from the proxy meter provider.
   * If the proxy meter provider has no delegate, return a noop meter.
   */
  private _getMeter() {
    if (this._delegate) {
      return this._delegate;
    }

    const meter = this._provider.getDelegateMeter(
      this.name,
      this.version,
      this.options
    );

    if (!meter) {
      return NOOP_METER;
    }

    this._delegate = meter;
    return this._delegate;
  }
}

export interface MeterDelegator {
  getDelegateMeter(
    name: string,
    version?: string,
    options?: MeterOptions
  ): Meter | undefined;
}
