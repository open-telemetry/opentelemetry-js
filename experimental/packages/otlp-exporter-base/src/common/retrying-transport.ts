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

const MAX_ATTEMPTS = 5;
const INITIAL_BACKOFF = 1000;
const MAX_BACKOFF = 5000;
const BACKOFF_MULTIPLIER = 1.5;

class RetryingTransport implements IExporterTransport {
  constructor(private _transport: IExporterTransport) {}

  private retry(data: Uint8Array, inMillis: number): Promise<ExportResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this._transport.send(data).then(resolve, reject);
      }, inMillis);
    });
  }

  async send(data: Uint8Array): Promise<ExportResponse> {
    let result = await this._transport.send(data);
    let attempts = MAX_ATTEMPTS;
    let nextBackoff = INITIAL_BACKOFF;

    // TODO: I'm not sure this is correct, please review in-depth.
    while (result.status === 'retryable' && attempts > 0) {
      attempts--;
      const upperBound = Math.min(nextBackoff, MAX_BACKOFF);
      const backoff = Math.random() * upperBound;
      nextBackoff = nextBackoff * BACKOFF_MULTIPLIER;
      result = await this.retry(data, result.retryInMillis ?? backoff);
    }

    return result;
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
