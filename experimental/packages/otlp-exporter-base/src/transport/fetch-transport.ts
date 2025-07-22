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

import { IExporterTransport } from '../exporter-transport';
import { ExportResponse } from '../export-response';
import { diag } from '@opentelemetry/api';
import {
  isExportRetryable,
  parseRetryAfterToMills,
} from '../is-export-retryable';

export interface FetchTransportParameters {
  url: string;
  headers: () => Record<string, string>;
}

class FetchTransport implements IExporterTransport {
  constructor(private _parameters: FetchTransportParameters) {}

  async send(data: Uint8Array, timeoutMillis: number): Promise<ExportResponse> {
    try {
      const abortController = new AbortController();
      const timeout = timeoutMillis
        ? setTimeout(() => abortController.abort(), timeoutMillis)
        : undefined;

      const base = globalThis.location.href;
      const url = new URL(this._parameters.url ?? '/v1/traces', base);
      const response = await fetch(this._parameters.url ?? '/v1/traces', {
        method: 'POST',
        headers: this._parameters.headers(),
        body: data,
        signal: abortController.signal,
        mode:
          globalThis.location.origin === url.origin ? 'same-origin' : 'cors',
      });
      clearTimeout(timeout);

      if (response.status >= 200 && response.status <= 299) {
        diag.debug('response success');
        return { status: 'success' };
      } else if (isExportRetryable(response.status)) {
        const retryAfter = response.headers.get('Retry-After');
        const retryInMillis = parseRetryAfterToMills(retryAfter);
        return { status: 'retryable', retryInMillis };
      }
      return {
        status: 'failure',
        error: new Error('Fetch request failed with non-retryable status'),
      };
    } catch (error) {
      if (error?.name === 'AbortError') {
        return {
          status: 'failure',
          error: new Error('Fetch request timed out', { cause: error }),
        };
      }
      return {
        status: 'failure',
        error: new Error('Fetch request errored', { cause: error }),
      };
    }
  }

  shutdown() {
    // Intentionally left empty, nothing to do.
  }
}

/**
 * Creates an exporter transport that uses `fetch` to send the data
 * @param parameters applied to each request made by transport
 */
export function createFetchTransport(
  parameters: FetchTransportParameters
): IExporterTransport {
  return new FetchTransport(parameters);
}
