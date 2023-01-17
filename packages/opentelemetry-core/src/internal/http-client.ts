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

export interface RequestInit {
  /**
   * Defaults to "POST". Some http clients may not support methods orther than "POST", like 'sendBeacon'.
   */
  method?: string;
  /**
   * Content type of the payload. Would be appended to request headers if the http client supports it.
   */
  contentType?: string;
  /**
   * Request headers.
   */
  headers?: Record<string, string>;
  /**
   * Suggestive option, this may not be supported by every http client. After the specified milliseconds the request should timeout.
   */
  timeoutMs?: number;
}

export class RetriableError extends Error {
  override name = 'RetriableError';
  /**
   * @param retryAfterMillis a non-negative number indicating the milliseconds to delay after the response is received.
   *                         If it is -1, it indicates delaying with exponential backoff.
   * @param cause the original error.
   */
  constructor(public retryAfterMillis: number, public cause?: Error) {
    super(cause?.message);
  }
}

export class HttpClientError extends Error {
  override name = 'HttpClientError';
  constructor(
    public statusMessage?: string,
    public statusCode?: number,
    public payload?: unknown
  ) {
    super(statusMessage);
  }
}

export function isRetriableError(error: unknown): error is RetriableError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    error != null &&
    typeof (error as RetriableError).retryAfterMillis === 'number'
  );
}

const RETRIABLE_STATUS_CODES = [429, 502, 503, 504];
export function isRetriableStatusCode(status?: number): boolean {
  return status != null && RETRIABLE_STATUS_CODES.includes(status);
}

export function parseRetryAfterToMills(retryAfter?: string | null): number {
  if (retryAfter == null) {
    return -1;
  }
  const seconds = Number.parseInt(retryAfter, 10);
  if (Number.isInteger(seconds)) {
    return seconds > 0 ? seconds * 1000 : -1;
  }
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After#directives
  const delay = new Date(retryAfter).getTime() - Date.now();
  if (delay >= 0) {
    return delay * 1000;
  }
  return 0;
}

export type BufferLike = Uint8Array | string;

export type HttpClient =
  | 'XMLHttpReuqest'
  | 'fetch'
  | 'node:http'
  | 'sendBeacon';

/**
 * Maximum compatible http request function that can be built on top of various http client ({@link HttpClient}).
 * The returned promise can be rejected by {@link RetriableError} and the initiator should try to retry the request
 * after backoffMs.
 */
export type RequestFunction = (
  url: string,
  payload: BufferLike,
  requestInit?: RequestInit
) => Promise<void>;
