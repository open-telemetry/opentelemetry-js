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

import { GrpcInstrumentationConfig } from './types';
import { VERSION } from './version';
import { GrpcJsInstrumentation } from './grpc-js';
import * as api from '@opentelemetry/api';

/** The metadata key under which span context is stored as a binary value. */
export const GRPC_TRACE_KEY = 'grpc-trace-bin';

export class GrpcInstrumentation {
  private _grpcJsInstrumentation: GrpcJsInstrumentation;

  public readonly instrumentationName: string =
    '@opentelemetry/instrumentation-grpc';
  public readonly instrumentationVersion: string = VERSION;

  constructor(config?: GrpcInstrumentationConfig) {
    this._grpcJsInstrumentation = new GrpcJsInstrumentation(
      this.instrumentationName,
      this.instrumentationVersion,
      config
    );
  }

  public setConfig(config?: GrpcInstrumentationConfig) {
    this._grpcJsInstrumentation.setConfig(config);
  }

  /**
   * @internal
   * Public reference to the protected BaseInstrumentation `_config` instance to be used by this
   * plugin's external helper functions
   */
  public getConfig(): GrpcInstrumentationConfig {
    // grpcNative and grpcJs have their own config copy which should be identical so just pick one
    return this._grpcJsInstrumentation.getConfig();
  }

  init() {
    // sub instrumentations will already be init when constructing them
    return;
  }

  enable() {
    this._grpcJsInstrumentation.enable();
  }

  disable() {
    this._grpcJsInstrumentation.disable();
  }

  /**
   * Sets MeterProvider to this plugin
   * @param meterProvider
   */
  public setMeterProvider(meterProvider: api.MeterProvider) {
    this._grpcJsInstrumentation.setMeterProvider(meterProvider);
  }

  /**
   * Sets TraceProvider to this plugin
   * @param tracerProvider
   */
  public setTracerProvider(tracerProvider: api.TracerProvider) {
    this._grpcJsInstrumentation.setTracerProvider(tracerProvider);
  }
}
