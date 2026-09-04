/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { IExporterTransport } from '../exporter-transport';
import type { ExportResponse } from '../export-response';
import { diag } from '@opentelemetry/api';
import {
  isExportHTTPErrorRetryable,
  parseRetryAfterToMills,
} from '../is-export-retryable';
import type { HeadersFactory } from '../configuration/otlp-http-configuration';

/**
 * Maximum total body size for concurrent keepalive requests.
 * Browsers enforce a 64KiB cumulative limit across all pending keepalive requests.
 * We use 60KB to leave headroom for headers.
 * @see https://github.com/whatwg/fetch/issues/679
 * @see https://blog.huli.tw/2025/01/06/en/navigator-sendbeacon-64kib-and-source-code/
 */
const MAX_KEEPALIVE_BODY_SIZE = 60 * 1024;

/**
 * Maximum concurrent keepalive requests.
 * Chrome enforces 9 concurrent keepalive fetch requests per renderer process.
 * @see https://github.com/whatwg/fetch/issues/679
 * Quote: "If the renderer process is processing more than 9 requests with keepalive set, we reject a new request"
 */
const MAX_KEEPALIVE_REQUESTS = 9;

/**
 * Track cumulative pending body size across all in-flight keepalive requests.
 * This is necessary because the 64KiB limit is cumulative, not per-request.
 */
let pendingBodySize = 0;

/**
 * Track number of pending keepalive requests.
 */
let pendingKeepaliveCount = 0;

export interface FetchTransportParameters {
  url: string;
  headers: HeadersFactory;
}

class FetchTransport implements IExporterTransport {
  private _parameters: FetchTransportParameters;

  constructor(parameters: FetchTransportParameters) {
    this._parameters = parameters;
  }

  async send(data: Uint8Array, timeoutMillis: number): Promise<ExportResponse> {
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), timeoutMillis);
    // Fetch API may be wrapped by an instrumentation like `@opentelemetry/instrumentation-fetch`.
    // In that case the instrumentation would create a new Span for this request
    // because the context manager cannot keep the context after `await` calls.
    // This creates an indirect endless loop Export -> Span -> Export
    // By using the `__original` function the instrumentation can't intercept the call
    // and no Span will be created breaking the vicious cycle
    let fetchApi = globalThis.fetch;
    // @ts-expect-error -- fetch could be wrapped
    if (typeof fetchApi.__original === 'function') {
      // @ts-expect-error -- fetch could be wrapped
      fetchApi = fetchApi.__original;
    }

    const requestSize = data.byteLength;

    // Determine if we can use keepalive based on cumulative browser limits.
    // We must check BEFORE adding to pending totals to avoid exceeding limits.
    const wouldExceedSize =
      pendingBodySize + requestSize > MAX_KEEPALIVE_BODY_SIZE;
    const wouldExceedCount = pendingKeepaliveCount >= MAX_KEEPALIVE_REQUESTS;
    const useKeepalive = !wouldExceedSize && !wouldExceedCount;

    if (useKeepalive) {
      pendingBodySize += requestSize;
      pendingKeepaliveCount++;
    } else {
      const reason = wouldExceedSize ? 'size limit' : 'count limit';
      diag.debug(
        `keepalive disabled: ${(requestSize / 1024).toFixed(1)}KB payload, ${pendingKeepaliveCount} pending (${reason})`
      );
    }

    // Budget frees only once the body drains, so the drain owns cleanup.
    const releaseKeepalive = () => {
      clearTimeout(timeout);
      pendingBodySize -= requestSize;
      pendingKeepaliveCount--;
    };
    let drainOwnsCleanup = false;

    try {
      const url = new URL(this._parameters.url);
      const response = await fetchApi(url.href, {
        method: 'POST',
        headers: await this._parameters.headers(),
        body: data,
        signal: abortController.signal,
        keepalive: useKeepalive,
        mode: globalThis.location
          ? globalThis.location.origin === url.origin
            ? 'same-origin'
            : 'cors'
          : 'no-cors',
      });

      // Not awaited: the status already decides the export outcome, and a
      // collector that stalls mid-body must not hold up the caller.
      const drained = drainResponseBody(response);
      if (useKeepalive) {
        // Set after the promise exists so an earlier throw still hits `finally`.
        drainOwnsCleanup = true;
        // The abort timer stays armed so a stalled body cannot hold the
        // budget forever.
        void drained.finally(releaseKeepalive);
      }

      if (response.status >= 200 && response.status <= 299) {
        diag.debug(`export response success (status: ${response.status})`);
        return { status: 'success' };
      } else if (isExportHTTPErrorRetryable(response.status)) {
        diag.warn(`export response retryable (status: ${response.status})`);
        const retryAfter = response.headers.get('Retry-After');
        const retryInMillis = parseRetryAfterToMills(retryAfter);
        return { status: 'retryable', retryInMillis };
      }
      diag.error(`export response failure (status: ${response.status})`);
      return {
        status: 'failure',
        error: new Error(
          `Fetch request failed with non-retryable status ${response.status}`
        ),
      };
    } catch (error) {
      if (isFetchNetworkErrorRetryable(error)) {
        diag.warn(`export request retryable (network error: ${error})`);
        return {
          status: 'retryable',
          error: new Error('Fetch request encountered a network error', {
            cause: error,
          }),
        };
      }
      diag.error(`export request failure (error: ${error})`);
      return {
        status: 'failure',
        error: new Error('Fetch request errored', { cause: error }),
      };
    } finally {
      if (!drainOwnsCleanup) {
        if (useKeepalive) {
          releaseKeepalive();
        } else {
          clearTimeout(timeout);
        }
      }
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

/**
 * Reads the response body to its end and discards it.
 *
 * Chromium returns the request's share of the keepalive quota only once the
 * body has been read to the end, and it skips the buffering consumer that
 * would otherwise drain it when the response carries `Cache-Control: no-store`,
 * which collectors commonly send. Cancelling is the client-abort path and
 * measures far slower, so the body is read rather than cancelled.
 *
 * @see https://fetch.spec.whatwg.org/#fetch-processresponseendofbody
 * @see https://github.com/chromium/chromium/blob/1af7c3cde84323e827f77d8066ca23da811203b8/third_party/blink/renderer/core/fetch/fetch_manager.cc#L818-L836
 */
async function drainResponseBody(response: Response): Promise<void> {
  try {
    // Empty and opaque responses have no body to read.
    const body = response.body;
    if (body == null) {
      return;
    }

    // Throws when the body is already locked to another reader, which happens
    // when the same response is handed to more than one export.
    const reader = body.getReader();
    try {
      // Chunks are dropped as they arrive: the payload is not used, and
      // buffering it would keep a response of arbitrary size in memory.
      let chunk = await reader.read();
      while (!chunk.done) {
        chunk = await reader.read();
      }
    } finally {
      // A held reader keeps the body locked, and a later export handed the
      // same response could then not drain it.
      reader.releaseLock();
    }
  } catch (error) {
    // The export outcome is decided by the response status, a body that cannot
    // be read must not change it.
    diag.debug(`error reading export response body: ${error}`);
  }
}

function isFetchNetworkErrorRetryable(error: unknown): boolean {
  return error instanceof TypeError && !error.cause;
}
