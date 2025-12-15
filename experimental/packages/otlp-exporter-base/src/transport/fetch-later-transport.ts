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
import { HeadersFactory } from '../configuration/otlp-http-configuration';

export interface FetchLaterTransportParameters {
  url: string;
  headers: HeadersFactory;
}

/**
 * Result returned by fetchLater API
 * @see https://developer.mozilla.org/docs/Web/API/Window/fetchLater
 */
interface FetchLaterResult {
  readonly activated: boolean;
}

/**
 * Options for fetchLater, extends RequestInit with activateAfter
 * @see https://developer.mozilla.org/docs/Web/API/DeferredRequestInit
 */
interface DeferredRequestInit extends RequestInit {
  activateAfter?: number;
}

/**
 * fetchLater function type (browser-only API)
 * TODO: Remove once fetchLater is available in lib.dom.d.ts
 */
type FetchLaterFn = (
  resource: string | URL | Request,
  options?: DeferredRequestInit
) => FetchLaterResult;

class FetchLaterTransport implements IExporterTransport {
  private _parameters: FetchLaterTransportParameters;

  constructor(parameters: FetchLaterTransportParameters) {
    this._parameters = parameters;
  }

  async send(data: Uint8Array, timeoutMillis: number): Promise<ExportResponse> {
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), timeoutMillis);
    let beaconResult: FetchLaterResult | undefined;
    try {
      // fetchLater with activateAfter: 0 sends immediately while providing
      // reliability guarantees (request will be sent even if page is closed).
      // See: https://fetch.spec.whatwg.org/#dom-window-fetchlater
      const url = new URL(this._parameters.url);
      const fetchLater = (globalThis as Record<string, unknown>)
        .fetchLater as FetchLaterFn;

      beaconResult = fetchLater(url.href, {
        method: 'POST',
        headers: await this._parameters.headers(),
        body: data,
        activateAfter: 0,
        signal: abortController.signal,
        mode:
          globalThis.location?.origin === url.origin ? 'same-origin' : 'cors',
      });

      diag.debug('FetchLater request queued successfully');
      return { status: 'success' };
    } catch (error) {
      // Handle QuotaExceededError specifically - this occurs when quota is exceeded
      // See: https://fetch.spec.whatwg.org/#deferred-fetch-quota
      if (
        error instanceof DOMException &&
        error.name === 'QuotaExceededError'
      ) {
        diag.warn('FetchLater quota exceeded, request not queued');
      }
      return {
        status: 'failure',
        error: new Error('FetchLater request queued failed', { cause: error }),
      };
    } finally {
      if (typeof beaconResult === 'undefined' || beaconResult.activated) {
        clearTimeout(timeout);
      }
    }
  }

  shutdown() {
    // Intentionally left empty, nothing to do.
  }
}

/**
 * Creates an exporter transport that uses `fetchLater` to send the data.
 * @param parameters applied to each request made by transport
 */
export function createFetchLaterTransport(
  parameters: FetchLaterTransportParameters
): IExporterTransport {
  return new FetchLaterTransport(parameters);
}
