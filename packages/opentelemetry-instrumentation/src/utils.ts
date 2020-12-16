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
 * Checks if certain function has been already wrapped
 * @param func
 */
export function isWrapped(func: any) {
  return (
    typeof func === 'function' &&
    typeof (func as ShimWrapped).__original === 'function' &&
    typeof (func as ShimWrapped).__unwrap === 'function' &&
    (func as ShimWrapped).__wrapped === true
  );
}
