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
  Context,
  GetterFunction,
  TextMapPropagator,
  SetterFunction,
} from '@opentelemetry/api';

import { B3MultiPropagator } from './B3MultiPropagator';

export class B3Propagator implements TextMapPropagator {
  private readonly _b3MultiPropagator: B3MultiPropagator = new B3MultiPropagator();

  inject(context: Context, carrier: unknown, setter: SetterFunction) {
    this._b3MultiPropagator.inject(context, carrier, setter);
  }

  extract(context: Context, carrier: unknown, getter: GetterFunction): Context {
    return this._b3MultiPropagator.extract(context, carrier, getter);
  }
}
