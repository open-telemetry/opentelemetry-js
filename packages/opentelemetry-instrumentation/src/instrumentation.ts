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
import * as shimmer from 'shimmer';
import * as types from './types';

/**
 * Base abstract internal class for instrumenting node and web plugins
 */
export abstract class InstrumentationAbstract<T = any>
  implements types.Instrumentation {
  protected _config: types.InstrumentationConfig;

  private _tracer: api.Tracer;
  private _meter: api.Meter;
  protected _logger: api.Logger;

  constructor(
    public readonly instrumentationName: string,
    public readonly instrumentationVersion: string,
    config: types.InstrumentationConfig = {}
  ) {
    this._config = {
      enabled: true,
      ...config,
    };
    this._logger = this._config.logger || new api.NoopLogger();

    this._tracer = api.trace.getTracer(
      instrumentationName,
      instrumentationVersion
    );

    this._meter = api.metrics.getMeter(
      instrumentationName,
      instrumentationVersion
    );
  }

  /* Api to wrap instrumented method */
  protected _wrap = shimmer.wrap;
  /* Api to unwrap instrumented methods */
  protected _unwrap = shimmer.unwrap;
  /* Api to mass wrap instrumented method */
  protected _massWrap = shimmer.massWrap;
  /* Api to mass unwrap instrumented methods */
  protected _massUnwrap = shimmer.massUnwrap;

  /* Returns meter */
  protected get meter(): api.Meter {
    return this._meter;
  }

  /**
   * Sets MeterProvider to this plugin
   * @param meterProvider
   */
  public setMeterProvider(meterProvider: api.MeterProvider) {
    this._meter = meterProvider.getMeter(
      this.instrumentationName,
      this.instrumentationVersion
    );
  }

  /**
   * Sets TraceProvider to this plugin
   * @param tracerProvider
   */
  public setTracerProvider(tracerProvider: api.TracerProvider) {
    this._tracer = tracerProvider.getTracer(
      this.instrumentationName,
      this.instrumentationVersion
    );
  }

  /* Returns tracer */
  protected get tracer(): api.Tracer {
    return this._tracer;
  }

  /* Disable plugin */
  public abstract enable(): void;

  /* Enable plugin */
  public abstract disable(): void;
}
