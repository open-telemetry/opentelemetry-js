/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Deferred } from './promise';

/**
 * Bind the callback and only invoke the callback once regardless how many times `BindOnceFuture.call` is invoked.
 */
export class BindOnceFuture<
  R,
  This = unknown,
  T extends (this: This, ...args: unknown[]) => R = () => R,
> {
  private _isCalled = false;
  private _deferred = new Deferred<R>();
  private _callback: T;
  private _that: This;

  constructor(callback: T, that: This) {
    this._callback = callback;
    this._that = that;
  }

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
        Promise.resolve(this._callback.call(this._that, ...args)).then(
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
