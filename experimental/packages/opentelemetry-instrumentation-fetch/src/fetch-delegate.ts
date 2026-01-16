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

import {
  context,
  DiagLogger,
  propagation,
  Span,
  Tracer,
  trace,
  Attributes,
  SpanKind,
  HrTime,
  SpanStatusCode,
} from '@opentelemetry/api';
import {
  Shimmer,
  SemconvStability,
  semconvStabilityFromStr,
  isWrapped,
  safeExecuteInTheMiddle,
  Instrumentation,
  InstrumentationDelegate,
  createInstrumentation,
} from '@opentelemetry/instrumentation';
import * as core from '@opentelemetry/core';
import * as web from '@opentelemetry/sdk-trace-web';
import { AttributeNames } from './enums/AttributeNames';
import {
  ATTR_HTTP_STATUS_CODE,
  ATTR_HTTP_HOST,
  ATTR_HTTP_USER_AGENT,
  ATTR_HTTP_SCHEME,
  ATTR_HTTP_URL,
  ATTR_HTTP_METHOD,
  ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED,
  ATTR_HTTP_REQUEST_BODY_SIZE,
} from './semconv';
import {
  ATTR_ERROR_TYPE,
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_REQUEST_METHOD_ORIGINAL,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_SERVER_ADDRESS,
  ATTR_SERVER_PORT,
  ATTR_URL_FULL,
} from '@opentelemetry/semantic-conventions';
import {
  FetchError,
  FetchResponse,
  SpanData,
  FetchInstrumentationConfig,
} from './types';
import {
  getFetchBodyLength,
  normalizeHttpRequestMethod,
  serverPortFromUrl,
} from './utils';
import { VERSION } from './version';

// how long to wait for observer to collect information about resources
// this is needed as event "load" is called before observer
// hard to say how long it should really wait, seems like 300ms is
// safe enough
const OBSERVER_WAIT_TIME_MS = 300;

const isNode = typeof process === 'object' && process.release?.name === 'node';
let _shimmer: Shimmer;
let _diag: DiagLogger;
let _tracer: Tracer;
let _config: FetchInstrumentationConfig;
let _semconvStability: SemconvStability;
let _tasksCount: number;
let _usedResources: WeakSet<PerformanceResourceTiming>;

const fetchDelegate: InstrumentationDelegate<FetchInstrumentationConfig> = {
  name: '@opentelemetry/instrumentation-fetch',
  version: VERSION,
  setConfig: function (config: FetchInstrumentationConfig): void {
    _semconvStability = semconvStabilityFromStr(
      'http',
      config.semconvStabilityOptIn
    );
    _config = config;
  },
  getConfig: function (): FetchInstrumentationConfig {
    return _config;
  },
  setDiag: function (diag: DiagLogger): void {
    _diag = diag;
  },
  setTracer(tracer: Tracer): void {
    _tracer = tracer;
  },
  init: function (shimmer) {
    _shimmer = shimmer;
    return undefined;
  },
  enable: function () {
    if (isNode) {
      // Node.js v18+ *does* have a global `fetch()`, but this package does not
      // support instrumenting it.
      _diag.warn(
        "this instrumentation is intended for web usage only, it does not instrument Node.js's fetch()"
      );
      return;
    }
    if (isWrapped(fetch)) {
      _shimmer.unwrap(globalThis, 'fetch');
      _diag.debug('removing previous patch for constructor');
    }
    _shimmer.wrap(globalThis, 'fetch', patchConstructor());
  },
  disable: function () {
    if (isNode) {
      return;
    }
    _shimmer.unwrap(globalThis, 'fetch');
    _usedResources = new WeakSet<PerformanceResourceTiming>();
  },
};

/**
 * Patches the constructor of fetch
 */
function patchConstructor(): (original: typeof fetch) => typeof fetch {
  return original => {
    return function _patchConstructor(
      this: typeof globalThis,
      ...args: Parameters<typeof fetch>
    ): Promise<Response> {
      const self = this;
      const url = web.parseUrl(
        args[0] instanceof Request ? args[0].url : String(args[0])
      ).href;

      const options = args[0] instanceof Request ? args[0] : args[1] || {};
      const createdSpan = createSpan(_tracer, url, options);
      if (!createdSpan) {
        return original.apply(this, args);
      }
      const spanData = prepareSpanData(url);

      if (_config.measureRequestSize) {
        getFetchBodyLength(...args)
          .then(bodyLength => {
            if (!bodyLength) return;
            if (_semconvStability & SemconvStability.OLD) {
              createdSpan.setAttribute(
                ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED,
                bodyLength
              );
            }
            if (_semconvStability & SemconvStability.STABLE) {
              createdSpan.setAttribute(ATTR_HTTP_REQUEST_BODY_SIZE, bodyLength);
            }
          })
          .catch(error => {
            _diag.warn('getFetchBodyLength', error);
          });
      }

      function endSpanOnError(span: Span, error: FetchError) {
        applyAttributesAfterFetch(span, options, error);
        endSpan(_tracer, span, spanData, {
          status: error.status || 0,
          statusText: error.message,
          url,
        });
      }

      function endSpanOnSuccess(span: Span, response: Response) {
        applyAttributesAfterFetch(span, options, response);
        if (response.status >= 200 && response.status < 400) {
          endSpan(_tracer, span, spanData, response);
        } else {
          endSpan(_tracer, span, spanData, {
            status: response.status,
            statusText: response.statusText,
            url,
          });
        }
      }

      function withCancelPropagation(
        body: ReadableStream<Uint8Array> | null,
        readerClone: ReadableStreamDefaultReader<Uint8Array>
      ): ReadableStream<Uint8Array> | null {
        if (!body) return null;

        const reader = body.getReader();

        return new ReadableStream({
          async pull(controller) {
            try {
              const { value, done } = await reader.read();
              if (done) {
                reader.releaseLock();
                controller.close();
              } else {
                controller.enqueue(value);
              }
            } catch (err) {
              controller.error(err);
              reader.cancel(err).catch(_ => {});

              try {
                reader.releaseLock();
              } catch {
                // Spec reference:
                // https://streams.spec.whatwg.org/#default-reader-release-lock
                //
                // releaseLock() only throws if called on an invalid reader
                // (i.e. reader.[[stream]] is undefined, meaning the lock is already released
                // or the reader was never associated). In normal use this cannot happen.
                // This catch is defensive only.
              }
            }
          },
          cancel(reason) {
            readerClone.cancel(reason).catch(_ => {});
            return reader.cancel(reason);
          },
        });
      }

      function onSuccess(
        span: Span,
        resolve: (value: Response | PromiseLike<Response>) => void,
        response: Response
      ): void {
        let proxiedResponse: Response | null = null;

        try {
          // TODO: Switch to a consumer-driven model and drop `resClone`.
          // Keeping eager consumption here to preserve current behavior and avoid breaking existing tests.
          // Context: discussion in PR #5894 → https://github.com/open-telemetry/opentelemetry-js/pull/5894
          const resClone = response.clone();
          const body = resClone.body;
          if (body) {
            const reader = body.getReader();
            const isNullBodyStatus =
              // 101 responses and protocol upgrading is handled internally by the browser
              response.status === 204 ||
              response.status === 205 ||
              response.status === 304;
            const wrappedBody = isNullBodyStatus
              ? null
              : withCancelPropagation(response.body, reader);

            proxiedResponse = new Response(wrappedBody, {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
            });

            const read = (): void => {
              reader.read().then(
                ({ done }) => {
                  if (done) {
                    endSpanOnSuccess(span, response);
                  } else {
                    read();
                  }
                },
                error => {
                  endSpanOnError(span, error);
                }
              );
            };
            read();
          } else {
            // some older browsers don't have .body implemented
            endSpanOnSuccess(span, response);
          }
        } finally {
          resolve(proxiedResponse ?? response);
        }
      }

      function onError(
        span: Span,
        reject: (reason?: unknown) => void,
        error: FetchError
      ) {
        try {
          endSpanOnError(span, error);
        } finally {
          reject(error);
        }
      }

      return new Promise((resolve, reject) => {
        return context.with(
          trace.setSpan(context.active(), createdSpan),
          () => {
            addHeaders(options, url);
            callRequestHook(createdSpan, options);
            _tasksCount++;

            return original
              .apply(
                self,
                options instanceof Request ? [options] : [url, options]
              )
              .then(
                onSuccess.bind(self, createdSpan, resolve),
                onError.bind(self, createdSpan, reject)
              );
          }
        );
      });
    };
  };
}

/**
 * Add cors pre flight child span
 */
function addChildSpan(
  tracer: Tracer,
  span: Span,
  corsPreFlightRequest: PerformanceResourceTiming
): void {
  const childSpan = tracer.startSpan(
    'CORS Preflight',
    {
      startTime: corsPreFlightRequest[web.PerformanceTimingNames.FETCH_START],
    },
    trace.setSpan(context.active(), span)
  );
  const skipOldSemconvContentLengthAttrs = !(
    _semconvStability & SemconvStability.OLD
  );
  web.addSpanNetworkEvents(
    childSpan,
    corsPreFlightRequest,
    _config.ignoreNetworkEvents,
    undefined,
    skipOldSemconvContentLengthAttrs
  );
  childSpan.end(corsPreFlightRequest[web.PerformanceTimingNames.RESPONSE_END]);
}

/**
 * Adds more attributes to span just before ending it
 */
function addFinalSpanAttributes(span: Span, response: FetchResponse): void {
  const parsedUrl = web.parseUrl(response.url);

  if (_semconvStability & SemconvStability.OLD) {
    span.setAttribute(ATTR_HTTP_STATUS_CODE, response.status);
    if (response.statusText != null) {
      span.setAttribute(AttributeNames.HTTP_STATUS_TEXT, response.statusText);
    }
    span.setAttribute(ATTR_HTTP_HOST, parsedUrl.host);
    span.setAttribute(ATTR_HTTP_SCHEME, parsedUrl.protocol.replace(':', ''));
    if (typeof navigator !== 'undefined') {
      span.setAttribute(ATTR_HTTP_USER_AGENT, navigator.userAgent);
    }
  }

  if (_semconvStability & SemconvStability.STABLE) {
    span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, response.status);
    // TODO: Set server.{address,port} at span creation for sampling decisions
    // (a "SHOULD" requirement in semconv).
    span.setAttribute(ATTR_SERVER_ADDRESS, parsedUrl.hostname);
    const serverPort = serverPortFromUrl(parsedUrl);
    if (serverPort) {
      span.setAttribute(ATTR_SERVER_PORT, serverPort);
    }
  }
}

/**
 * Add headers
 * @param options
 * @param spanUrl
 */
function addHeaders(options: Request | RequestInit, spanUrl: string): void {
  if (
    !web.shouldPropagateTraceHeaders(
      spanUrl,
      _config.propagateTraceHeaderCorsUrls
    )
  ) {
    const headers: Partial<Record<string, unknown>> = {};
    propagation.inject(context.active(), headers);
    if (Object.keys(headers).length > 0) {
      _diag.debug('headers inject skipped due to CORS policy');
    }
    return;
  }

  if (options instanceof Request) {
    propagation.inject(context.active(), options.headers, {
      set: (h, k, v) => h.set(k, typeof v === 'string' ? v : String(v)),
    });
  } else if (options.headers instanceof Headers) {
    propagation.inject(context.active(), options.headers, {
      set: (h, k, v) => h.set(k, typeof v === 'string' ? v : String(v)),
    });
  } else if (options.headers instanceof Map) {
    propagation.inject(context.active(), options.headers, {
      set: (h, k, v) => h.set(k, typeof v === 'string' ? v : String(v)),
    });
  } else {
    const headers: Partial<Record<string, unknown>> = {};
    propagation.inject(context.active(), headers);
    options.headers = Object.assign({}, headers, options.headers || {});
  }
}

/**
 * Clears the resource timings and all resources assigned with spans
 *     when {@link FetchPluginConfig.clearTimingResources} is
 *     set to true (default false)
 */
function clearResources() {
  if (_tasksCount === 0 && _config.clearTimingResources) {
    performance.clearResourceTimings();
    _usedResources = new WeakSet<PerformanceResourceTiming>();
  }
}

/**
 * Creates a new span
 */
function createSpan(
  tracer: Tracer,
  url: string,
  options: Partial<Request | RequestInit> = {}
): Span | undefined {
  if (core.isUrlIgnored(url, _config.ignoreUrls)) {
    _diag.debug('ignoring span as url matches ignored url');
    return;
  }

  let name = '';
  const attributes = {} as Attributes;
  if (_semconvStability & SemconvStability.OLD) {
    const method = (options.method || 'GET').toUpperCase();
    name = `HTTP ${method}`;
    attributes[AttributeNames.COMPONENT] = 'fetch';
    attributes[ATTR_HTTP_METHOD] = method;
    attributes[ATTR_HTTP_URL] = url;
  }
  if (_semconvStability & SemconvStability.STABLE) {
    const origMethod = options.method;
    const normMethod = normalizeHttpRequestMethod(options.method || 'GET');
    if (!name) {
      // The "old" span name wins if emitting both old and stable semconv
      // ('http/dup').
      name = normMethod;
    }
    attributes[ATTR_HTTP_REQUEST_METHOD] = normMethod;
    if (normMethod !== origMethod) {
      attributes[ATTR_HTTP_REQUEST_METHOD_ORIGINAL] = origMethod;
    }
    attributes[ATTR_URL_FULL] = url;
  }

  return tracer.startSpan(name, {
    kind: SpanKind.CLIENT,
    attributes,
  });
}

/**
 * Finds appropriate resource and add network events to the span
 */
function findResourceAndAddNetworkEvents(
  tracer: Tracer,
  span: Span,
  resourcesObserver: SpanData,
  endTime: HrTime
): void {
  let resources: PerformanceResourceTiming[] = resourcesObserver.entries;
  if (!resources.length) {
    if (!performance.getEntriesByType) {
      return;
    }
    // fallback - either Observer is not available or it took longer
    // then OBSERVER_WAIT_TIME_MS and observer didn't collect enough
    // information
    resources = performance.getEntriesByType(
      'resource'
    ) as PerformanceResourceTiming[];
  }
  const resource = web.getResource(
    resourcesObserver.spanUrl,
    resourcesObserver.startTime,
    endTime,
    resources,
    _usedResources,
    'fetch'
  );

  if (resource.mainRequest) {
    const mainRequest = resource.mainRequest;
    _usedResources.add(mainRequest);

    const corsPreFlightRequest = resource.corsPreFlightRequest;
    if (corsPreFlightRequest) {
      addChildSpan(tracer, span, corsPreFlightRequest);
      _usedResources.add(corsPreFlightRequest);
    }
    const skipOldSemconvContentLengthAttrs = !(
      _semconvStability & SemconvStability.OLD
    );
    web.addSpanNetworkEvents(
      span,
      mainRequest,
      _config.ignoreNetworkEvents,
      undefined,
      skipOldSemconvContentLengthAttrs
    );
  }
}

/**
 * Finish span, add attributes, network events etc.
 */
function endSpan(
  tracer: Tracer,
  span: Span,
  spanData: SpanData,
  response: FetchResponse
) {
  const endTime = core.millisToHrTime(Date.now());
  const performanceEndTime = core.hrTime();
  addFinalSpanAttributes(span, response);

  if (_semconvStability & SemconvStability.STABLE) {
    // https://github.com/open-telemetry/semantic-conventions/blob/main/docs/http/http-spans.md#status
    if (response.status >= 400) {
      span.setStatus({ code: SpanStatusCode.ERROR });
      span.setAttribute(ATTR_ERROR_TYPE, String(response.status));
    }
  }

  setTimeout(() => {
    spanData.observer?.disconnect();
    findResourceAndAddNetworkEvents(tracer, span, spanData, performanceEndTime);
    _tasksCount--;
    clearResources();
    span.end(endTime);
  }, OBSERVER_WAIT_TIME_MS);
}

function applyAttributesAfterFetch(
  span: Span,
  request: Request | RequestInit,
  result: Response | FetchError
) {
  const applyCustomAttributesOnSpan = _config.applyCustomAttributesOnSpan;
  if (applyCustomAttributesOnSpan) {
    safeExecuteInTheMiddle(
      () => applyCustomAttributesOnSpan(span, request, result),
      error => {
        if (error) {
          _diag.error('applyCustomAttributesOnSpan', error);
        }
      },
      true
    );
  }
}

/**
 * Calls the hook in a safe way
 */
function callRequestHook(span: Span, request: Request | RequestInit) {
  const requestHook = _config.requestHook;
  if (requestHook) {
    safeExecuteInTheMiddle(
      () => requestHook(span, request),
      error => {
        if (error) {
          _diag.error('requestHook', error);
        }
      },
      true
    );
  }
}

/**
 * Prepares a span data - needed later for matching appropriate network resources
 */
function prepareSpanData(spanUrl: string): SpanData {
  const startTime = core.hrTime();
  const entries: PerformanceResourceTiming[] = [];
  if (typeof PerformanceObserver !== 'function') {
    return { entries, startTime, spanUrl };
  }

  const observer = new PerformanceObserver(list => {
    const perfObsEntries = list.getEntries() as PerformanceResourceTiming[];
    perfObsEntries.forEach(entry => {
      if (entry.initiatorType === 'fetch' && entry.name === spanUrl) {
        entries.push(entry);
      }
    });
  });
  observer.observe({
    entryTypes: ['resource'],
  });
  return { entries, observer, startTime, spanUrl };
}

export function createFetchInstrumentation(
  config: FetchInstrumentationConfig = {}
): Instrumentation<FetchInstrumentationConfig> {
  return createInstrumentation(fetchDelegate, config);
}
