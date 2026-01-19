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

import { MeterProvider } from './MeterProvider';
import { ProxyMeter } from './ProxyMeter';
import { NoopMeterProvider } from './NoopMeterProvider';
import { Meter, MeterOptions } from './Meter';

const NOOP_METER_PROVIDER = new NoopMeterProvider();

/**
 * Meter provider which provides {@link ProxyMeter}s.
 *
 * Before a delegate is set, meters provided are NoOp.
 *   When a delegate is set, meters are provided from the delegate.
 *   When a delegate is set after meters have already been provided,
 *   all meters already provided will use the provided delegate implementation.
 */
export class ProxyMeterProvider implements MeterProvider {
  private _delegate?: MeterProvider;
  private readonly _proxyMeters = new Set<ProxyMeter>();

  /**
   * Get a {@link ProxyMeter}
   */
  getMeter(name: string, version?: string, options?: MeterOptions): Meter {
    const delegate = this.getDelegateMeter(name, version, options);
    if (delegate) {
      return delegate;
    }

    const meter = new ProxyMeter(this, name, version, options);
    this._proxyMeters.add(meter);
    return meter;
  }

  getDelegate(): MeterProvider {
    return this._delegate ?? NOOP_METER_PROVIDER;
  }

  /**
   * Set the delegate meter provider
   */
  setDelegate(delegate: MeterProvider) {
    this._delegate = delegate;
    for (const meter of this._proxyMeters) {
      meter._bindDelegate();
    }
    this._proxyMeters.clear();
  }

  getDelegateMeter(
    name: string,
    version?: string,
    options?: MeterOptions
  ): Meter | undefined {
    return this._delegate?.getMeter(name, version, options);
  }

  /** @internal */
  _onProxyMeterDelegateBound(meter: ProxyMeter): void {
    this._proxyMeters.delete(meter);
  }
}
