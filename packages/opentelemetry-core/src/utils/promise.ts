/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export class Deferred<T> {
  private _promise: Promise<T>;
  private _resolve!: (val: T) => void;
  private _reject!: (error: unknown) => void;
  constructor() {
    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  get promise() {
    return this._promise;
  }

  resolve(val: T) {
    this._resolve(val);
  }

  reject(err: unknown) {
    this._reject(err);
  }
}
