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

import { Deferred } from './promise';

/**
 * Bind the callback and only invoke the callback once regardless how many times `BindOnceFuture.call` is invoked.
 */
export class BindOnceFuture<
  R,
  This = unknown,
  T extends (this: This, ...args: unknown[]) => R = () => R
> {
  private _isCalled = false;
  private _deferred = new Deferred<R>();
  constructor(private _callback: T, private _that: This) {}

  get isCalled() {
    return this._isCalled;
  }

  get promise() {
    return this._deferred.promise;
  }

  call(...args: Parameters<T>): Promise<R> {
    if (!this._isCalled) {
      this._isCalled = true;
      try {
        Promise.resolve(this._callback.call(this._that, ...args))
          .then(
            val => this._deferred.resolve(val),
            err => this._deferred.reject(err)
          );
      } catch (err) {
        this._deferred.reject(err);
      }
    }
    return this._deferred.promise;
  }
}
