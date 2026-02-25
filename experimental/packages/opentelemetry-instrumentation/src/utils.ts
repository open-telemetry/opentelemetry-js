/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShimWrapped } from './types';

/**
 * function to execute patched function and being able to catch errors
 * @param execute - function to be executed
 * @param onFinish - callback to run when execute finishes
 */
export function safeExecuteInTheMiddle<T>(
  execute: () => T,
  onFinish: (e: Error | undefined, result: T | undefined) => void,
  preventThrowingError?: boolean
): T {
  let error: Error | undefined;
  let result: T | undefined;
  try {
    result = execute();
  } catch (e) {
    error = e;
  } finally {
    onFinish(error, result);
    if (error && !preventThrowingError) {
      // eslint-disable-next-line no-unsafe-finally
      throw error;
    }
    // eslint-disable-next-line no-unsafe-finally
    return result as T;
  }
}

/**
 * Async function to execute patched function and being able to catch errors
 * @param execute - function to be executed
 * @param onFinish - callback to run when execute finishes
 */
export async function safeExecuteInTheMiddleAsync<T>(
  execute: () => T,
  onFinish: (
    e: Error | undefined,
    result: T | undefined
  ) => Promise<void> | void,
  preventThrowingError?: boolean
): Promise<T> {
  let error: Error | undefined;
  let result: T | undefined;
  try {
    result = await execute();
  } catch (e) {
    error = e;
  } finally {
    await onFinish(error, result);
    if (error && !preventThrowingError) {
      // eslint-disable-next-line no-unsafe-finally
      throw error;
    }
    // eslint-disable-next-line no-unsafe-finally
    return result as T;
  }
}
/**
 * Checks if certain function has been already wrapped
 * @param func
 */
export function isWrapped(func: unknown): func is ShimWrapped {
  return (
    typeof func === 'function' &&
    typeof (func as ShimWrapped).__original === 'function' &&
    typeof (func as ShimWrapped).__unwrap === 'function' &&
    (func as ShimWrapped).__wrapped === true
  );
}
