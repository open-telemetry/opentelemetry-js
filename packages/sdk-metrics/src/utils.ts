/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Attributes, AttributeValue } from '@opentelemetry/api';
import type { InstrumentationScope } from '@opentelemetry/core';

export type Maybe<T> = T | undefined;

function stringifyValue(value: AttributeValue | null | undefined): string {
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  if (value === undefined) {
    return 'u';
  }
  if (value === null) {
    return 'n';
  }
  if (value === true) {
    return 't';
  }
  if (value === false) {
    return 'f';
  }
  return value.toString();
}

function stringifyAttribue(value: AttributeValue | undefined): string {
  if (!Array.isArray(value)) {
    return stringifyValue(value);
  }
  let str = 'A';
  str += stringifyValue(value[0]);
  for (let i = 1, len = value.length; i < len; i++) {
    str += `,${stringifyValue(value[i])}`;
  }
  return str;
}

/**
 * Converting the unordered attributes into unique identifier string.
 * @param attributes user provided unordered Attributes.
 */
export function hashAttributes(attributes: Attributes): string {
  const keys = Object.keys(attributes);
  const length = keys.length;
  if (length === 0) return '';

  // Return a string that is stable on key orders.
  keys.sort();

  let str = `${keys[0]}=${stringifyAttribue(attributes[keys[0]])}`;
  for (let i = 1; i < length; i++) {
    str += `;${keys[i]}=${stringifyAttribue(attributes[keys[i]])}`;
  }
  return str;
}

/**
 * Converting the instrumentation scope object to a unique identifier string.
 * @param instrumentationScope
 */
export function instrumentationScopeId(
  instrumentationScope: InstrumentationScope
): string {
  return `${instrumentationScope.name}:${instrumentationScope.version ?? ''}:${
    instrumentationScope.schemaUrl ?? ''
  }`;
}

/**
 * Error that is thrown on timeouts.
 */
export class TimeoutError extends Error {
  constructor(message?: string) {
    super(message);

    // manually adjust prototype to retain `instanceof` functionality when targeting ES5, see:
    // https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * Adds a timeout to a promise and rejects if the specified timeout has elapsed. Also rejects if the specified promise
 * rejects, and resolves if the specified promise resolves.
 *
 * <p> NOTE: this operation will continue even after it throws a {@link TimeoutError}.
 *
 * @param promise promise to use with timeout.
 * @param timeout the timeout in milliseconds until the returned promise is rejected.
 */
export function callWithTimeout<T>(
  promise: Promise<T>,
  timeout: number
): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>(function timeoutFunction(
    _resolve,
    reject
  ) {
    timeoutHandle = setTimeout(function timeoutHandler() {
      reject(new TimeoutError('Operation timed out.'));
    }, timeout);
  });

  return Promise.race([promise, timeoutPromise]).then(
    result => {
      clearTimeout(timeoutHandle);
      return result;
    },
    reason => {
      clearTimeout(timeoutHandle);
      throw reason;
    }
  );
}

export function setEquals(lhs: Set<unknown>, rhs: Set<unknown>): boolean {
  if (lhs.size !== rhs.size) {
    return false;
  }
  for (const item of lhs) {
    if (!rhs.has(item)) {
      return false;
    }
  }
  return true;
}

/**
 * Binary search the sorted array to the find upper bound for the value.
 * @param arr
 * @param value
 * @returns
 */
export function binarySearchUB(arr: number[], value: number): number {
  let lo = 0;
  let hi = arr.length - 1;
  let ret = arr.length;

  while (hi >= lo) {
    const mid = lo + Math.trunc((hi - lo) / 2);
    if (arr[mid] < value) {
      lo = mid + 1;
    } else {
      ret = mid;
      hi = mid - 1;
    }
  }

  return ret;
}

export function equalsCaseInsensitive(lhs: string, rhs: string): boolean {
  return lhs.toLowerCase() === rhs.toLowerCase();
}
