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

import * as types from './types';
import { Context } from './context';

export class NoopContextManager implements types.ContextManager {
  active(): Context {
    return Context.ROOT_CONTEXT;
  }

  with(context: Context, fn: Function) {
    return fn();
  }

  withAsync(context: Context, fn: Function) {
    return fn();
  }

  bind<T>(target: T, context?: Context): T {
    return target;
  }

  enable(): this {
    return this;
  }

  disable(): this {
    return this;
  }
}
