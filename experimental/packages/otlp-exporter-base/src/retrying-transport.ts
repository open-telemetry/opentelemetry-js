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

const MAX_ATTEMPTS = 5;
const INITIAL_BACKOFF = 1000;
const MAX_BACKOFF = 5000;
const BACKOFF_MULTIPLIER = 1.5;
const JITTER = 0.2;

/**
 * Get a pseudo-random jitter that falls in the range of [-JITTER, +JITTER]
 */
function getJitter() {
  return Math.random() * (2 * JITTER) - JITTER;
}

interface CancellableOperation {
  cancelRetry(): void;
}

class RetryingTransport implements IExporterTransport {
  private readonly _transport: IExporterTransport;
  private readonly _cancellableOperations;

  constructor(transport: IExporterTransport) {
    this._transport = transport;
    this._cancellableOperations = new Set<CancellableOperation>();
  }

  private retry(
    data: Uint8Array,
    timeoutMillis: number,
    inMillis: number
  ): Promise<ExportResponse> {
    return new Promise((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        // Remove from cancellable operations once executing
        this._cancellableOperations.delete(operation);
        this._transport.send(data, timeoutMillis).then(resolve, reject);
      }, inMillis);

      const operation: CancellableOperation = {
        cancelRetry: () => {
          clearTimeout(timeoutHandle);
          resolve({
            status: 'retryable',
            error: new Error('Retry cancelled due to forceFlush()'),
          });
        },
      };
      this._cancellableOperations.add(operation);
    });
  }

  async send(data: Uint8Array, timeoutMillis: number): Promise<ExportResponse> {
    let attempts = MAX_ATTEMPTS;
    let nextBackoff = INITIAL_BACKOFF;

    // Create an operation to track this request and allow cancellation of retries
    let shouldRetry = true;
    const operation: CancellableOperation = {
      cancelRetry: () => {
        shouldRetry = false;
      },
    };
    this._cancellableOperations.add(operation);

    try {
      const deadline = Date.now() + timeoutMillis;
      let result = await this._transport.send(data, timeoutMillis);

      while (result.status === 'retryable' && attempts > 0) {
        attempts--;

        // Don't retry if forceFlush has been called for this request
        if (!shouldRetry) {
          diag.info('Foregoing retry as operation was forceFlushed');
          return result;
        }

        // use maximum of computed backoff and 0 to avoid negative timeouts
        const backoff = Math.max(
          Math.min(nextBackoff * (1 + getJitter()), MAX_BACKOFF),
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

        diag.verbose(
          `Scheduling export retry in ${Math.round(retryInMillis)}ms`
        );
        result = await this.retry(data, remainingTimeoutMillis, retryInMillis);
      }

      if (result.status === 'success') {
        diag.verbose(
          `Export succeeded after ${MAX_ATTEMPTS - attempts} retry attempts.`
        );
      } else if (result.status === 'retryable') {
        diag.info(
          `Export failed after maximum retry attempts (${MAX_ATTEMPTS}).`
        );
      } else {
        diag.info(`Export failed with non-retryable error: ${result.error}`);
      }

      return result;
    } finally {
      // Always remove the operation from the set when done to avoid memory leaks
      this._cancellableOperations.delete(operation);
    }
  }

  forceFlush() {
    this._transport.forceFlush?.();

    diag.debug('cancelling pending retries');
    // Cancel all pending retries and mark active requests to not retry
    for (const operation of this._cancellableOperations) {
      operation.cancelRetry();
    }
    this._cancellableOperations.clear();
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
