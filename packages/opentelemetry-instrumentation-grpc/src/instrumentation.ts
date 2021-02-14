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

import { InstrumentationConfig } from '@opentelemetry/instrumentation';
import { GrpcInstrumentationConfig } from './types';
import { VERSION } from './version';
import { GrpcNativeInstrumentation } from './grpc';
import { GrpcJsInstrumentation } from './grpc-js';
import * as api from '@opentelemetry/api';
import { MeterProvider } from '@opentelemetry/api-metrics';

/** The metadata key under which span context is stored as a binary value. */
export const GRPC_TRACE_KEY = 'grpc-trace-bin';

export class GrpcInstrumentation {
  private _grpcNativeInstrumentation: GrpcNativeInstrumentation;
  private _grpcJsInstrumentation: GrpcJsInstrumentation;

  public readonly instrumentationName: string =
    '@opentelemetry/instrumentation-grpc';
  public readonly instrumentationVersion: string = VERSION;

  constructor(
    protected _config: GrpcInstrumentationConfig & InstrumentationConfig = {}
  ) {
    this._grpcJsInstrumentation = new GrpcJsInstrumentation(
      _config,
      this.instrumentationName,
      this.instrumentationVersion
    );
    this._grpcNativeInstrumentation = new GrpcNativeInstrumentation(
      _config,
      this.instrumentationName,
      this.instrumentationVersion
    );
  }

  public setConfig(
    config: GrpcInstrumentationConfig & InstrumentationConfig = {}
  ) {
    this._config = Object.assign({}, config);
    this._grpcJsInstrumentation.setConfig(this._config);
    this._grpcNativeInstrumentation.setConfig(this._config);
  }

  /**
   * @internal
   * Public reference to the protected BaseInstrumentation `_config` instance to be used by this
   * plugin's external helper functions
   */
  public getConfig() {
    return this._config;
  }

  init() {
    // sub instrumentations will already be init when constructing them
    return;
  }

  enable() {
    this._grpcJsInstrumentation.enable();
    this._grpcNativeInstrumentation.enable();
  }

  disable() {
    this._grpcJsInstrumentation.disable();
    this._grpcNativeInstrumentation.disable();
  }

  /**
   * Sets MeterProvider to this plugin
   * @param meterProvider
   */
  public setMeterProvider(meterProvider: MeterProvider) {
    this._grpcJsInstrumentation.setMeterProvider(meterProvider);
    this._grpcNativeInstrumentation.setMeterProvider(meterProvider);
  }

  /**
   * Sets TraceProvider to this plugin
   * @param tracerProvider
   */
  public setTracerProvider(tracerProvider: api.TracerProvider) {
    this._grpcJsInstrumentation.setTracerProvider(tracerProvider);
    this._grpcNativeInstrumentation.setTracerProvider(tracerProvider);
  }
}
