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
import {
  NOOP_COUNTER_METRIC,
  NOOP_GAUGE_METRIC,
  NOOP_HISTOGRAM_METRIC,
  NOOP_METER,
  NOOP_OBSERVABLE_COUNTER_METRIC,
  NOOP_OBSERVABLE_GAUGE_METRIC,
  NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC,
  NOOP_UP_DOWN_COUNTER_METRIC,
} from './NoopMeter';
import {
  BatchObservableCallback,
  Counter,
  Gauge,
  Histogram,
  MetricOptions,
  Observable,
  ObservableCallback,
  ObservableCounter,
  ObservableGauge,
  ObservableUpDownCounter,
  UpDownCounter,
} from './Metric';

const INTERNAL_NOOP_METER = NOOP_METER;

/**
 * Proxy meter provided by the proxy meter provider
 */
export class ProxyMeter implements Meter {
  private _delegate?: Meter;
  private readonly _instruments = new Set<ProxyInstrumentBase<unknown>>();
  private readonly _batchCallbacks = new Map<
    BatchObservableCallback,
    Observable[]
  >();

  constructor(
    private readonly _provider: MeterDelegator,
    private readonly _name: string,
    private readonly _version?: string,
    private readonly _options?: MeterOptions
  ) {}

  /**
   * @see {@link Meter.createGauge}
   */
  createGauge(name: string, options?: MetricOptions): Gauge {
    const delegate = this._getDelegateOrUndefined();
    if (delegate) {
      return delegate.createGauge(name, options);
    }

    const instrument = new ProxyGauge(() =>
      this._delegate?.createGauge(name, options)
    );
    this._trackInstrument(instrument);
    return instrument;
  }

  /**
   * @see {@link Meter.createHistogram}
   */
  createHistogram(name: string, options?: MetricOptions): Histogram {
    const delegate = this._getDelegateOrUndefined();
    if (delegate) {
      return delegate.createHistogram(name, options);
    }

    const instrument = new ProxyHistogram(() =>
      this._delegate?.createHistogram(name, options)
    );
    this._trackInstrument(instrument);
    return instrument;
  }

  /**
   * @see {@link Meter.createCounter}
   */
  createCounter(name: string, options?: MetricOptions): Counter {
    const delegate = this._getDelegateOrUndefined();
    if (delegate) {
      return delegate.createCounter(name, options);
    }

    const instrument = new ProxyCounter(() =>
      this._delegate?.createCounter(name, options)
    );
    this._trackInstrument(instrument);
    return instrument;
  }

  /**
   * @see {@link Meter.createUpDownCounter}
   */
  createUpDownCounter(name: string, options?: MetricOptions): UpDownCounter {
    const delegate = this._getDelegateOrUndefined();
    if (delegate) {
      return delegate.createUpDownCounter(name, options);
    }

    const instrument = new ProxyUpDownCounter(() =>
      this._delegate?.createUpDownCounter(name, options)
    );
    this._trackInstrument(instrument);
    return instrument;
  }

  /**
   * @see {@link Meter.createObservableGauge}
   */
  createObservableGauge(
    name: string,
    options?: MetricOptions
  ): ObservableGauge {
    const delegate = this._getDelegateOrUndefined();
    if (delegate) {
      return delegate.createObservableGauge(name, options);
    }

    const instrument = new ProxyObservableGauge(() =>
      this._delegate?.createObservableGauge(name, options)
    );
    this._trackInstrument(instrument);
    return instrument;
  }

  /**
   * @see {@link Meter.createObservableCounter}
   */
  createObservableCounter(
    name: string,
    options?: MetricOptions
  ): ObservableCounter {
    const delegate = this._getDelegateOrUndefined();
    if (delegate) {
      return delegate.createObservableCounter(name, options);
    }

    const instrument = new ProxyObservableCounter(() =>
      this._delegate?.createObservableCounter(name, options)
    );
    this._trackInstrument(instrument);
    return instrument;
  }

  /**
   * @see {@link Meter.createObservableUpDownCounter}
   */
  createObservableUpDownCounter(
    name: string,
    options?: MetricOptions
  ): ObservableUpDownCounter {
    const delegate = this._getDelegateOrUndefined();
    if (delegate) {
      return delegate.createObservableUpDownCounter(name, options);
    }

    const instrument = new ProxyObservableUpDownCounter(() =>
      this._delegate?.createObservableUpDownCounter(name, options)
    );
    this._trackInstrument(instrument);
    return instrument;
  }

  /**
   * @see {@link Meter.addBatchObservableCallback}
   */
  addBatchObservableCallback(
    callback: BatchObservableCallback,
    observables: Observable[]
  ): void {
    const delegate = this._getDelegateOrUndefined();
    if (!delegate) {
      this._batchCallbacks.set(callback, observables);
      return;
    }

    delegate.addBatchObservableCallback(
      callback,
      this._mapObservablesToDelegates(observables)
    );
  }

  /**
   * @see {@link Meter.removeBatchObservableCallback}
   */
  removeBatchObservableCallback(
    callback: BatchObservableCallback,
    observables: Observable[]
  ): void {
    this._batchCallbacks.delete(callback);
    this._getMeter().removeBatchObservableCallback(callback, observables);
  }

  /**
   * Ensure this proxy binds to the delegate meter if available.
   */
  _bindDelegate(): void {
    this._getDelegateOrUndefined();
  }

  private _trackInstrument(instrument: ProxyInstrumentBase<unknown>) {
    if (instrument.hasDelegate()) {
      return;
    }
    this._instruments.add(instrument);
  }

  private _mapObservablesToDelegates(observables: Observable[]): Observable[] {
    return observables.map(observable => {
      if (observable instanceof ProxyInstrumentBase) {
        observable.bindDelegate();
        return (observable.getDelegateIfBound() ?? observable) as Observable;
      }

      return observable;
    });
  }

  private _flushPendingState() {
    this._bindPendingInstruments();
    this._flushBatchObservableCallbacks();
  }

  private _bindPendingInstruments() {
    if (!this._delegate) {
      return;
    }

    for (const instrument of this._instruments) {
      instrument.bindDelegate();
      if (instrument.hasDelegate()) {
        this._instruments.delete(instrument);
      }
    }
  }

  private _flushBatchObservableCallbacks() {
    if (!this._delegate || this._batchCallbacks.size === 0) {
      return;
    }

    for (const [callback, observables] of this._batchCallbacks) {
      this._delegate.addBatchObservableCallback(
        callback,
        this._mapObservablesToDelegates(observables)
      );
    }
    this._batchCallbacks.clear();
  }

  /**
   * Try to get a meter from the proxy meter provider.
   * If the proxy meter provider has no delegate, return a noop meter.
   */
  private _getMeter() {
    return this._getDelegateOrUndefined() ?? INTERNAL_NOOP_METER;
  }

  private _getDelegateOrUndefined(): Meter | undefined {
    if (this._delegate) {
      return this._delegate;
    }

    const meter = this._provider.getDelegateMeter(
      this._name,
      this._version,
      this._options
    );

    if (!meter) {
      return undefined;
    }

    this._delegate = meter;
    this._provider._onProxyMeterDelegateBound(this);
    this._flushPendingState();
    return this._delegate;
  }
}

abstract class ProxyInstrumentBase<T> {
  private _delegate?: T;

  constructor(
    private readonly _delegateFactory: () => T | undefined,
    private readonly _fallback: T
  ) {}

  hasDelegate(): boolean {
    return this._delegate != null;
  }

  bindDelegate(): void {
    if (this._delegate) {
      return;
    }

    const delegate = this._delegateFactory();
    if (!delegate) {
      return;
    }

    this._delegate = delegate;
    this._onDelegateAttached(delegate);
  }

  getDelegateIfBound(): T | undefined {
    return this._delegate;
  }

  protected _getDelegate(): T {
    if (this._delegate) {
      return this._delegate;
    }

    const delegate = this._delegateFactory();
    if (!delegate) {
      return this._fallback;
    }

    this._delegate = delegate;
    this._onDelegateAttached(delegate);
    return delegate;
  }

  protected abstract _onDelegateAttached(delegate: T): void;
}

class ProxyCounter extends ProxyInstrumentBase<Counter> implements Counter {
  constructor(delegateFactory: () => Counter | undefined) {
    super(delegateFactory, NOOP_COUNTER_METRIC);
  }

  add(...args: Parameters<Counter['add']>) {
    this._getDelegate().add(...args);
  }

  protected _onDelegateAttached(): void {}
}

class ProxyUpDownCounter
  extends ProxyInstrumentBase<UpDownCounter>
  implements UpDownCounter
{
  constructor(delegateFactory: () => UpDownCounter | undefined) {
    super(delegateFactory, NOOP_UP_DOWN_COUNTER_METRIC);
  }

  add(...args: Parameters<UpDownCounter['add']>) {
    this._getDelegate().add(...args);
  }

  protected _onDelegateAttached(): void {}
}

class ProxyGauge extends ProxyInstrumentBase<Gauge> implements Gauge {
  constructor(delegateFactory: () => Gauge | undefined) {
    super(delegateFactory, NOOP_GAUGE_METRIC);
  }

  record(...args: Parameters<Gauge['record']>) {
    this._getDelegate().record(...args);
  }

  protected _onDelegateAttached(): void {}
}

class ProxyHistogram
  extends ProxyInstrumentBase<Histogram>
  implements Histogram
{
  constructor(delegateFactory: () => Histogram | undefined) {
    super(delegateFactory, NOOP_HISTOGRAM_METRIC);
  }

  record(...args: Parameters<Histogram['record']>) {
    this._getDelegate().record(...args);
  }

  protected _onDelegateAttached(): void {}
}

abstract class ProxyObservableInstrument<T extends Observable>
  extends ProxyInstrumentBase<T>
  implements Observable
{
  private readonly _callbacks = new Set<ObservableCallback>();

  addCallback(callback: ObservableCallback): void {
    this._callbacks.add(callback);
    this._getDelegate().addCallback(callback);
  }

  removeCallback(callback: ObservableCallback): void {
    this._callbacks.delete(callback);
    this._getDelegate().removeCallback(callback);
  }

  protected _onDelegateAttached(delegate: T): void {
    for (const callback of this._callbacks) {
      delegate.addCallback(callback);
    }
  }
}

class ProxyObservableGauge
  extends ProxyObservableInstrument<ObservableGauge>
  implements ObservableGauge
{
  constructor(delegateFactory: () => ObservableGauge | undefined) {
    super(delegateFactory, NOOP_OBSERVABLE_GAUGE_METRIC);
  }
}

class ProxyObservableCounter
  extends ProxyObservableInstrument<ObservableCounter>
  implements ObservableCounter
{
  constructor(delegateFactory: () => ObservableCounter | undefined) {
    super(delegateFactory, NOOP_OBSERVABLE_COUNTER_METRIC);
  }
}

class ProxyObservableUpDownCounter
  extends ProxyObservableInstrument<ObservableUpDownCounter>
  implements ObservableUpDownCounter
{
  constructor(delegateFactory: () => ObservableUpDownCounter | undefined) {
    super(delegateFactory, NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC);
  }
}

interface MeterDelegator {
  getDelegateMeter(
    name: string,
    version?: string,
    options?: MeterOptions
  ): Meter | undefined;
  _onProxyMeterDelegateBound(meter: ProxyMeter): void;
}
