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

import { IExporterTransport } from './exporter-transport';
import { ExportResponse } from './export-response';
import { diag } from '@opentelemetry/api';

const INITIAL_BACKOFF = 1000;
const MINIMAL_MAX_BACKOFF = 5000;
const MAX_BACKOFF_MULTIPLIER = 0.2;
const MAX_ATTEMPTS = 20;
const BACKOFF_MULTIPLIER = 1.5;
const JITTER = 0.2;

/**
 * Get a pseudo-random jitter that falls in the range of [-JITTER, +JITTER]
 */
function getJitter() {
  return Math.random() * (2 * JITTER) - JITTER;
}

class RetryingTransport implements IExporterTransport {
  private _transport: IExporterTransport;

  constructor(transport: IExporterTransport) {
    this._transport = transport;
  }

  private retry(
    data: Uint8Array,
    timeoutMillis: number,
    inMillis: number
  ): Promise<ExportResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this._transport.send(data, timeoutMillis).then(resolve, reject);
      }, inMillis);
    });
  }

  async send(data: Uint8Array, timeoutMillis: number): Promise<ExportResponse> {
    let attempts = MAX_ATTEMPTS;
    let nextBackoff = INITIAL_BACKOFF;
    const maxBackoff = Math.max(
      MINIMAL_MAX_BACKOFF,
      MAX_BACKOFF_MULTIPLIER * timeoutMillis
    );

    const deadline = Date.now() + timeoutMillis;
    let result = await this._transport.send(data, timeoutMillis);

    while (result.status === 'retryable' && attempts > 0) {
      attempts--;

      // use maximum of computed backoff and 0 to avoid negative timeouts
      const backoff = Math.max(
        Math.min(nextBackoff * (1 + getJitter()), maxBackoff),
        0
      );
      nextBackoff = nextBackoff * BACKOFF_MULTIPLIER;
      const retryInMillis = result.retryInMillis ?? backoff;

      // return when expected retry time is after the export deadline.
      const remainingTimeoutMillis = deadline - Date.now();
      if (retryInMillis > remainingTimeoutMillis) {
        diag.info(
          `Export retry time ${Math.round(retryInMillis)}ms exceeds remaining timeout ${Math.round(
            remainingTimeoutMillis
          )}ms, not retrying further.`
        );
        return result;
      }

      diag.verbose(`Scheduling export retry in ${Math.round(retryInMillis)}ms`);
      result = await this.retry(data, remainingTimeoutMillis, retryInMillis);
    }

    if (result.status === 'success') {
      diag.verbose(
        `Export succeded after ${MAX_ATTEMPTS - attempts} retry attempts.`
      );
    } else if (result.status === 'retryable') {
      diag.info(
        `Export failed after maximum retry attempts (${MAX_ATTEMPTS}).`
      );
    } else {
      diag.info(`Export failed with non-retryable error: ${result.error}`);
    }

    return result;
  }

  shutdown() {
    return this._transport.shutdown();
  }
}

/**
 * Creates an Exporter Transport that retries on 'retryable' response.
 */
export function createRetryingTransport(options: {
  // Underlying transport to wrap.
  transport: IExporterTransport;
}): IExporterTransport {
  return new RetryingTransport(options.transport);
}
