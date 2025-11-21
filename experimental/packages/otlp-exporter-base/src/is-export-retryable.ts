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

export function isExportHTTPErrorRetryable(statusCode: number): boolean {
  const retryCodes = [429, 502, 503, 504];
  return retryCodes.includes(statusCode);
}

function getErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  if ('code' in error && typeof error.code === 'string') {
    return error.code;
  }

  const err = error as Error;
  if (err.cause && typeof err.cause === 'object' && 'code' in err.cause) {
    const code = (err.cause as { code: unknown }).code;
    if (typeof code === 'string') {
      return code;
    }
  }

  return undefined;
}

export function isExportNetworkErrorRetryable(error: Error): boolean {
  const RETRYABLE_ERROR_CODES = new Set([
    'ECONNRESET',
    'ECONNREFUSED',
    'EPIPE',
    'ETIMEDOUT',
    'EAI_AGAIN',
    'ENOTFOUND',
    'ENETUNREACH',
    'EHOSTUNREACH',
    'UND_ERR_CONNECT_TIMEOUT',
    'UND_ERR_HEADERS_TIMEOUT',
    'UND_ERR_BODY_TIMEOUT',
    'UND_ERR_SOCKET',
  ]);

  if (error.name === 'AbortError') {
    return false;
  }

  const code = getErrorCode(error);
  if (code && RETRYABLE_ERROR_CODES.has(code)) {
    return true;
  }

  if (error instanceof TypeError && !error.cause) {
    return true;
  }

  return false;
}

export function parseRetryAfterToMills(
  retryAfter?: string | undefined | null
): number | undefined {
  if (retryAfter == null) {
    return undefined;
  }

  const seconds = Number.parseInt(retryAfter, 10);
  if (Number.isInteger(seconds)) {
    return seconds > 0 ? seconds * 1000 : -1;
  }
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After#directives
  const delay = new Date(retryAfter).getTime() - Date.now();

  if (delay >= 0) {
    return delay;
  }
  return 0;
}
