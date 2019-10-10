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
import { NoopTracerFactory } from './NoopTracerFactory';

// Acts a bridge to the global tracer factory that can be safely called before the
// global tracer factory is initialized. The purpose of the delegation is to avoid the
// sometimes nearly intractable initialization order problems that can arise in
// applications with a complex set of dependencies. Also allows for the factory
// to be changed/disabled during runtime without needing to change reference
// to the global factory.
export class TracerFactoryDelegate implements types.TracerFactory {
  private _currentTracerFactory: types.TracerFactory;
  private readonly _tracerFactory: types.TracerFactory | null;
  private readonly _fallbackTracerFactory: types.TracerFactory;

  // Wrap a TracerFactory with a TracerDelegateFactory. Provided factory becomes the default
  // fallback factory for when a global factory has not been initialized
  constructor(
    tracerFactory?: types.TracerFactory,
    fallbackTracerFactory?: types.TracerFactory
  ) {
    this._tracerFactory = tracerFactory || null;
    this._fallbackTracerFactory =
      fallbackTracerFactory || new NoopTracerFactory();
    this._currentTracerFactory =
      this._tracerFactory || this._fallbackTracerFactory; // equivalent to this.start()
  }

  // Begin using the user provided tracer factory. Stop always falling back to fallback tracer
  // factory.
  start(): void {
    this._currentTracerFactory =
      this._tracerFactory || this._fallbackTracerFactory;
  }

  // Stop the delegate from using the provided tracer factory. Begin to use the fallback factory
  stop(): void {
    this._currentTracerFactory = this._fallbackTracerFactory;
  }

  // -- TracerFactory interface implementation below -- //
  getTracer(name?: string, version?: string): types.Tracer {
    return this._currentTracerFactory.getTracer.apply(
      this._currentTracerFactory,
      // tslint:disable-next-line:no-any
      arguments as any
    );
  }
}
