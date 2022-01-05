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

import { Attributes } from '@opentelemetry/api-metrics-wip';

export type Maybe<T> = T | undefined;

export function isNotNullish<T>(item: Maybe<T>): item is T {
  return item !== undefined && item !== null;
}

/**
 * Converting the unordered attributes into unique identifier string.
 * @param attributes user provided unordered Attributes.
 */
export function hashAttributes(attributes: Attributes): string {
  let keys = Object.keys(attributes);
  if (keys.length === 0) return '';

  keys = keys.sort();
  return keys.reduce((result, key) => {
    if (result.length > 2) {
      result += ',';
    }
    return (result += key + ':' + attributes[key]);
  }, '|#');
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
export function callWithTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>(function timeoutFunction(_resolve, reject) {
    timeoutHandle = setTimeout(
      function timeoutHandler() {
        reject(new TimeoutError('Operation timed out.'));
      },
      timeout
    );
  });

  return Promise.race([promise, timeoutPromise]).then(result => {
      clearTimeout(timeoutHandle);
      return result;
    },
    reason => {
      clearTimeout(timeoutHandle);
      throw reason;
    });
}
