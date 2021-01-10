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

import {
  InstrumentationBase,
  InstrumentationConfig,
} from '@opentelemetry/instrumentation';
import { GrpcInstrumentationConfig } from './types';
import { VERSION } from './version';
import { getGrpcPatches } from './grpc';
import { getGrpcJsPatches } from './grpc-js';

/** The metadata key under which span context is stored as a binary value. */
export const GRPC_TRACE_KEY = 'grpc-trace-bin';

export class GrpcInstrumentation extends InstrumentationBase {
  constructor(
    protected _config: GrpcInstrumentationConfig & InstrumentationConfig = {}
  ) {
    super('@opentelemetry/instrumentation-grpc', VERSION, _config);
  }

  public setConfig(
    config: GrpcInstrumentationConfig & InstrumentationConfig = {}
  ) {
    this._config = Object.assign({}, config);
  }

  /**
   * @internal
   * Public reference to the protected BaseInstrumentation shimmer utils to be used by this
   * plugin's external helper functions
   */
  public getShimmer() {
    return {
      wrap: this._wrap,
      unwrap: this._unwrap,
      massWrap: this._massWrap,
      massUnwrap: this._massUnwrap,
    };
  }

  /**
   * @internal
   * Public reference to the protected BaseInstrumentation `_logger` instance to be used by this
   * plugin's external helper functions
   */
  public getLogger() {
    return this._logger;
  }

  /**
   * @internal
   * Public reference to the protected BaseInstrumentation `tracer` instance to be used by this
   * plugin's external helper functions
   */
  public getTracer() {
    return this.tracer;
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
    return [...getGrpcJsPatches.call(this), ...getGrpcPatches.call(this)];
  }
}
