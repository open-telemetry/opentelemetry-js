/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export const isPromiseLike = <R>(val: unknown): val is PromiseLike<R> => {
  return (
    val !== null &&
    typeof val === 'object' &&
    typeof (val as Partial<PromiseLike<R>>).then === 'function'
  );
};
