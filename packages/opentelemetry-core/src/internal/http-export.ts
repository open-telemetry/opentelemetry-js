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

import { diag } from '@opentelemetry/api';
import { ExportResult, ExportResultCode } from '../ExportResult';
import {
  BufferLike,
  HttpClient,
  isRetriableError,
  RequestFunction,
  RequestInit,
} from './http-client';
import { fetchRequest, isFetchRequestAvailable } from './http-clients/fetch';
import { internal } from '../platform';

export interface ExportOptions extends RequestInit {
  /**
   * Defaults to 0.
   */
  maxAttempts?: number;
  initialBackoff?: number;
  maxBackoff?: number;
  backoffMultiplier?: number;
}

const DEFAULT_EXPORT_MAX_ATTEMPTS = 5;
const DEFAULT_EXPORT_INITIAL_BACKOFF = 1000;
const DEFAULT_EXPORT_MAX_BACKOFF = 5000;
const DEFAULT_EXPORT_BACKOFF_MULTIPLIER = 1.5;

const clients = {
  fetch: [isFetchRequestAvailable, fetchRequest],
  'node:http': [internal.isHttpRequestAvailable, internal.httpRequest],
  XMLHttpReuqest: [internal.isXhrRequestAvailable, internal.xhrRequest],
  sendBeacon: [
    internal.isSendBeaconRequestAvailable,
    internal.sendBeaconRequest,
  ],
} as const;
export function determineClient(
  preferredClients: HttpClient[]
): RequestFunction {
  for (let idx = 0; idx < preferredClients.length; idx++) {
    const name = preferredClients[idx];
    if (!(name in clients)) {
      diag.error(`Http client "${name}" is not recognizable.`);
      continue;
    }
    const [test, request] = clients[name];
    if (!test()) {
      diag.error(`Http client "${name}" is not available.`);
      continue;
    }
    return request;
  }
  throw new Error(`No http client available: ${preferredClients}`);
}

export type HttpExportClient = (
  url: string,
  payload: BufferLike,
  options?: ExportOptions
) => Promise<ExportResult>;

/**
 * Creates a http-client based on the preference of the underlying methods.
 * The abstract http-client only exposes necessary information to the exporters
 * in order to broaden the compatibility across platforms.
 */
export function createHttpExportClient(
  preferredClients: HttpClient[]
): HttpExportClient {
  const request = determineClient(preferredClients);

  /**
   * Wraps common retrying process with http clients.
   */
  return function httpExport(url, payload, options) {
    let attemptCount = 0;
    const maxAttempt = options?.maxAttempts ?? DEFAULT_EXPORT_MAX_ATTEMPTS;
    const maxBackoff = options?.maxBackoff ?? DEFAULT_EXPORT_MAX_BACKOFF;
    const initialBackoff =
      options?.initialBackoff ?? DEFAULT_EXPORT_INITIAL_BACKOFF;
    const backoffMultiplier =
      options?.backoffMultiplier ?? DEFAULT_EXPORT_BACKOFF_MULTIPLIER;

    let lastBackoff = initialBackoff;

    const okHandler = (): ExportResult => {
      return {
        code: ExportResultCode.SUCCESS,
      };
    };
    const errorHandler = (
      err: unknown
    ): Promise<ExportResult> | ExportResult => {
      if (!isRetriableError(err) || attemptCount >= maxAttempt) {
        return {
          code: ExportResultCode.FAILED,
          error: err as Error,
        };
      }

      let delay: number;
      if (err.retryAfterMillis >= 0) {
        delay = err.retryAfterMillis;
      } else {
        delay =
          Math.round(Math.random() * (maxBackoff - lastBackoff) + lastBackoff) *
          backoffMultiplier;
      }

      lastBackoff = delay;
      attemptCount++;
      return setTimeoutPromise(err.retryAfterMillis)
        .then(() => request(url, payload, options))
        .then(okHandler, errorHandler);
    };
    const p = request(url, payload, options).then(okHandler, errorHandler);

    return p;
  };
}

function setTimeoutPromise(timeoutMs: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, timeoutMs);
  });
}
