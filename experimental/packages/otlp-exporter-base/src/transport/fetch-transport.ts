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
  isExportHTTPErrorRetryable,
  parseRetryAfterToMills,
} from '../is-export-retryable';
import { HeadersFactory } from '../configuration/otlp-http-configuration';

export interface FetchTransportParameters {
  url: string;
  headers: HeadersFactory;
}

// Keep a ref of the fetch API on top so this transport is not
// affected by instrumentations wrapping. This API is in globalThis
// so we do not affect any (X)ITM hook if used in Node.js
const fetchApi = globalThis.fetch;

class FetchTransport implements IExporterTransport {
  private _parameters: FetchTransportParameters;

  constructor(parameters: FetchTransportParameters) {
    this._parameters = parameters;
  }

  async send(data: Uint8Array, timeoutMillis: number): Promise<ExportResponse> {
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), timeoutMillis);
    try {
      const isBrowserEnvironment = !!globalThis.location;
      const url = new URL(this._parameters.url);
      const response = await fetchApi(url.href, {
        method: 'POST',
        headers: await this._parameters.headers(),
        body: data,
        signal: abortController.signal,
        keepalive: isBrowserEnvironment,
        mode: isBrowserEnvironment
          ? globalThis.location?.origin === url.origin
            ? 'same-origin'
            : 'cors'
          : 'no-cors',
      });

      if (response.status >= 200 && response.status <= 299) {
        diag.debug('response success');
        return { status: 'success' };
      } else if (isExportHTTPErrorRetryable(response.status)) {
        const retryAfter = response.headers.get('Retry-After');
        const retryInMillis = parseRetryAfterToMills(retryAfter);
        return { status: 'retryable', retryInMillis };
      }
      return {
        status: 'failure',
        error: new Error('Fetch request failed with non-retryable status'),
      };
    } catch (error) {
      if (isFetchNetworkErrorRetryable(error)) {
        return {
          status: 'retryable',
          error: new Error('Fetch request encountered a network error', {
            cause: error,
          }),
        };
      }
      return {
        status: 'failure',
        error: new Error('Fetch request errored', { cause: error }),
      };
    } finally {
      clearTimeout(timeout);
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

function isFetchNetworkErrorRetryable(error: unknown): boolean {
  return error instanceof TypeError && !error.cause;
}
