/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface IExportPromiseHandler {
  pushPromise(promise: Promise<void>): void;
  hasReachedLimit(): boolean;
  awaitAll(): Promise<void>;
}

class BoundedQueueExportPromiseHandler implements IExportPromiseHandler {
  private readonly _concurrencyLimit: number;
  private _sendingPromises: Promise<unknown>[] = [];

  /**
   * @param concurrencyLimit maximum promises allowed in a queue at the same time.
   */
  constructor(concurrencyLimit: number) {
    this._concurrencyLimit = concurrencyLimit;
  }

  public pushPromise(promise: Promise<void>): void {
    if (this.hasReachedLimit()) {
      throw new Error('Concurrency Limit reached');
    }

    this._sendingPromises.push(promise);
    const popPromise = () => {
      const index = this._sendingPromises.indexOf(promise);
      void this._sendingPromises.splice(index, 1);
    };
    promise.then(popPromise, popPromise);
  }

  public hasReachedLimit(): boolean {
    return this._sendingPromises.length >= this._concurrencyLimit;
  }

  public async awaitAll(): Promise<void> {
    await Promise.all(this._sendingPromises);
  }
}

/**
 * Promise queue for keeping track of export promises. Finished promises will be auto-dequeued.
 * Allows for awaiting all promises in the queue.
 */
export function createBoundedQueueExportPromiseHandler(options: {
  concurrencyLimit: number;
}): IExportPromiseHandler {
  return new BoundedQueueExportPromiseHandler(options.concurrencyLimit);
}
