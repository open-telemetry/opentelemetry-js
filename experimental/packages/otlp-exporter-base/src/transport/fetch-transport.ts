/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { IExporterTransport } from '../exporter-transport';
import type { ExportResponse } from '../export-response';
import { context, diag } from '@opentelemetry/api';
import { suppressTracing } from '@opentelemetry/core';
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
 * Track cumulative body size charged against the keepalive budget.
 * This is necessary because the 64KiB limit is cumulative, not per-request.
 * Charged from request start until the response body drains, which is later
 * than the request completing: that is when the browser gives the quota back.
 */
let pendingBodySize = 0;

/**
 * Track number of requests holding keepalive budget, on the same terms as
 * {@link pendingBodySize}.
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
    // In that case the instrumentation would create a new Span for this request,
    // creating an indirect endless loop Export -> Span -> Export.
    // `__original` lets the call bypass one wrapper; the suppressed context
    // below covers a `fetch` that was wrapped more than once.
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

    // Captured before the first `await`, which a synchronous context manager
    // would not survive.
    const suppressedContext = suppressTracing(context.active());

    // Idempotent so that a double call cannot drive the counters negative,
    // which would defeat the cap check above for every later request.
    let released = false;
    const release = () => {
      if (released) {
        return;
      }
      released = true;
      if (useKeepalive) {
        pendingBodySize -= requestSize;
        pendingKeepaliveCount--;
      }
      clearTimeout(timeout);
    };
    let drainOwnsCleanup = false;

    try {
      const url = new URL(this._parameters.url);
      // Resolve headers before entering the suppressed fetch context.
      const headers = await this._parameters.headers();
      const response = await context.with(suppressedContext, () =>
        fetchApi(url.href, {
          method: 'POST',
          headers,
          body: data,
          signal: abortController.signal,
          keepalive: useKeepalive,
          mode: globalThis.location
            ? globalThis.location.origin === url.origin
              ? 'same-origin'
              : 'cors'
            : 'no-cors',
        })
      );

      // Not awaited: the status already decides the export outcome, and a
      // collector that stalls mid-body must not hold up the caller.
      const drained = drainResponseBody(response);
      // Timer stays armed through the drain: an abort errors the body, so a
      // stalled drain still settles rather than holding the budget forever.
      // Released on rejection too, though the drain swallows its errors today:
      // a missed release would hold the keepalive budget for the page's life.
      void drained.then(release, release);
      // Set before any return, or `finally` frees the budget before it drains.
      drainOwnsCleanup = true;

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
      // Cleanup here only for a failure before the response arrived; past that
      // point the drain owns it.
      if (!drainOwnsCleanup) {
        release();
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

function isFetchNetworkErrorRetryable(error: unknown): boolean {
  return error instanceof TypeError && !error.cause;
}

/**
 * Reads the response body to its end and discards it.
 *
 * Chromium gives the request's share of the keepalive quota back only once the
 * response body has been read to the end, and it skips the buffering consumer
 * that would otherwise drain the body on its own when the response carries a
 * `Cache-Control: no-store` header, which collectors commonly send. Leaving the
 * body unread then leaks the quota until the document goes away and every
 * following keepalive export stays pending forever. Cancelling the body is the
 * client-abort path and releases the quota far more slowly than reading it to
 * the end, so the body is read rather than cancelled.
 *
 * Never rejects. Its settlement, not its outcome, is what releases the
 * request's keepalive budget, so a caller that ignores it leaks that budget
 * for the life of the document.
 *
 * @see https://fetch.spec.whatwg.org/#fetch-processresponseendofbody
 * @see https://issues.chromium.org/issues/546438373
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
      // buffering it - with `response.arrayBuffer()` for instance - would keep
      // a response of arbitrary size in memory.
      let chunk = await reader.read();
      while (!chunk.done) {
        chunk = await reader.read();
      }
    } finally {
      // The reader keeps the body locked until it is released, which would
      // make a later export handed the same response fail to acquire a reader
      // and skip the drain.
      reader.releaseLock();
    }
  } catch (error) {
    // The export outcome is decided by the response status, a body that cannot
    // be read must not change it.
    diag.debug(`error reading export response body: ${error}`);
  }
}
