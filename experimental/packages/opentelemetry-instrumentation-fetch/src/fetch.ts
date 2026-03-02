/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  context,
  propagation,
  SpanKind,
  SpanStatusCode,
  trace,
} from '@opentelemetry/api';
import type { Attributes, HrTime, Span } from '@opentelemetry/api';
import {
  SemconvStability,
  semconvStabilityFromStr,
  isWrapped,
  InstrumentationBase,
  InstrumentationConfig,
  safeExecuteInTheMiddle,
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
import { FetchError, FetchResponse, SpanData } from './types';
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

const hasBrowserPerformanceAPI = typeof PerformanceObserver !== 'undefined';

export interface FetchCustomAttributeFunction {
  (
    span: Span,
    request: Request | RequestInit,
    result: Response | FetchError
  ): void;
}

export interface FetchRequestHookFunction {
  (span: Span, request: Request | RequestInit): void;
}

/**
 * FetchPlugin Config
 */
export interface FetchInstrumentationConfig extends InstrumentationConfig {
  // the number of timing resources is limited, after the limit
  // (chrome 250, safari 150) the information is not collected anymore
  // the only way to prevent that is to regularly clean the resources
  // whenever it is possible, this is needed only when PerformanceObserver
  // is not available
  clearTimingResources?: boolean;
  // urls which should include trace headers when origin doesn't match
  propagateTraceHeaderCorsUrls?: web.PropagateTraceHeaderCorsUrls;
  /**
   * URLs that partially match any regex in ignoreUrls will not be traced.
   * In addition, URLs that are _exact matches_ of strings in ignoreUrls will
   * also not be traced.
   */
  ignoreUrls?: Array<string | RegExp>;
  /** Function for adding custom attributes on the span */
  applyCustomAttributesOnSpan?: FetchCustomAttributeFunction;
  /** Function for adding custom attributes or headers before the request is handled */
  requestHook?: FetchRequestHookFunction;
  // Ignore adding network events as span events
  ignoreNetworkEvents?: boolean;
  /** Measure outgoing request size */
  measureRequestSize?: boolean;
  /** Select the HTTP semantic conventions version(s) used. */
  semconvStabilityOptIn?: string;
}

/**
 * This class represents a fetch plugin for auto instrumentation
 */
export class FetchInstrumentation extends InstrumentationBase<FetchInstrumentationConfig> {
  readonly component: string = 'fetch';
  readonly version: string = VERSION;
  moduleName = this.component;
  private _usedResources = new WeakSet<PerformanceResourceTiming>();
  private _tasksCount = 0;

  private _semconvStability: SemconvStability;

  constructor(config: FetchInstrumentationConfig = {}) {
    super('@opentelemetry/instrumentation-fetch', VERSION, config);
    this._semconvStability = semconvStabilityFromStr(
      'http',
      config?.semconvStabilityOptIn
    );
  }

  init(): void {}

  /**
   * Add cors pre flight child span
   * @param span
   * @param corsPreFlightRequest
   */
  private _addChildSpan(
    span: Span,
    corsPreFlightRequest: PerformanceResourceTiming
  ): void {
    const childSpan = this.tracer.startSpan(
      'CORS Preflight',
      {
        startTime: corsPreFlightRequest[web.PerformanceTimingNames.FETCH_START],
      },
      trace.setSpan(context.active(), span)
    );
    const skipOldSemconvContentLengthAttrs = !(
      this._semconvStability & SemconvStability.OLD
    );
    web.addSpanNetworkEvents(
      childSpan,
      corsPreFlightRequest,
      this.getConfig().ignoreNetworkEvents,
      undefined,
      skipOldSemconvContentLengthAttrs
    );
    childSpan.end(
      corsPreFlightRequest[web.PerformanceTimingNames.RESPONSE_END]
    );
  }

  /**
   * Adds more attributes to span just before ending it
   * @param span
   * @param response
   */
  private _addFinalSpanAttributes(span: Span, response: FetchResponse): void {
    const parsedUrl = web.parseUrl(response.url);

    if (this._semconvStability & SemconvStability.OLD) {
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

    if (this._semconvStability & SemconvStability.STABLE) {
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
  private _addHeaders(options: Request | RequestInit, spanUrl: string): void {
    if (
      !web.shouldPropagateTraceHeaders(
        spanUrl,
        this.getConfig().propagateTraceHeaderCorsUrls
      )
    ) {
      const headers: Partial<Record<string, unknown>> = {};
      propagation.inject(context.active(), headers);
      if (Object.keys(headers).length > 0) {
        this._diag.debug('headers inject skipped due to CORS policy');
      }
      return;
    }

    if (options instanceof Request) {
      // This mutates `Request.headers` in-place, because it is read-only
      // (per https://developer.mozilla.org/en-US/docs/Web/API/Request/headers),
      // so we cannot (easily) replace it.
      propagation.inject(context.active(), options.headers, {
        set: (h, k, v) => h.set(k, typeof v === 'string' ? v : String(v)),
      });
    } else {
      // Otherwise, create a new Headers to avoid mutating the caller's
      // possibly re-used headers.
      const headers = new Headers(options.headers);
      propagation.inject(context.active(), headers, {
        set: (h, k, v) => h.set(k, typeof v === 'string' ? v : String(v)),
      });
      options.headers = headers;
    }
  }

  /**
   * Clears the resource timings and all resources assigned with spans
   *     when {@link FetchPluginConfig.clearTimingResources} is
   *     set to true (default false)
   * @private
   */
  private _clearResources() {
    if (this._tasksCount === 0 && this.getConfig().clearTimingResources) {
      performance.clearResourceTimings();
      this._usedResources = new WeakSet<PerformanceResourceTiming>();
    }
  }

  /**
   * Creates a new span
   * @param url
   * @param options
   */
  private _createSpan(
    url: string,
    options: Partial<Request | RequestInit> = {}
  ): Span | undefined {
    if (core.isUrlIgnored(url, this.getConfig().ignoreUrls)) {
      this._diag.debug('ignoring span as url matches ignored url');
      return;
    }

    let name = '';
    const attributes = {} as Attributes;
    if (this._semconvStability & SemconvStability.OLD) {
      const method = (options.method || 'GET').toUpperCase();
      name = `HTTP ${method}`;
      attributes[AttributeNames.COMPONENT] = this.moduleName;
      attributes[ATTR_HTTP_METHOD] = method;
      attributes[ATTR_HTTP_URL] = url;
    }
    if (this._semconvStability & SemconvStability.STABLE) {
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

    return this.tracer.startSpan(name, {
      kind: SpanKind.CLIENT,
      attributes,
    });
  }

  /**
   * Finds appropriate resource and add network events to the span
   * @param span
   * @param resourcesObserver
   * @param endTime
   */
  private _findResourceAndAddNetworkEvents(
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
      this._usedResources,
      'fetch'
    );

    if (resource.mainRequest) {
      const mainRequest = resource.mainRequest;
      this._markResourceAsUsed(mainRequest);

      const corsPreFlightRequest = resource.corsPreFlightRequest;
      if (corsPreFlightRequest) {
        this._addChildSpan(span, corsPreFlightRequest);
        this._markResourceAsUsed(corsPreFlightRequest);
      }
      const skipOldSemconvContentLengthAttrs = !(
        this._semconvStability & SemconvStability.OLD
      );
      web.addSpanNetworkEvents(
        span,
        mainRequest,
        this.getConfig().ignoreNetworkEvents,
        undefined,
        skipOldSemconvContentLengthAttrs
      );
    }
  }

  /**
   * Marks certain [resource]{@link PerformanceResourceTiming} when information
   * from this is used to add events to span.
   * This is done to avoid reusing the same resource again for next span
   * @param resource
   */
  private _markResourceAsUsed(resource: PerformanceResourceTiming): void {
    this._usedResources.add(resource);
  }

  /**
   * Finish span, add attributes, network events etc.
   * @param span
   * @param spanData
   * @param response
   */
  private _endSpan(span: Span, spanData: SpanData, response: FetchResponse) {
    const endTime = core.millisToHrTime(Date.now());
    const performanceEndTime = core.hrTime();
    this._addFinalSpanAttributes(span, response);

    if (this._semconvStability & SemconvStability.STABLE) {
      // https://github.com/open-telemetry/semantic-conventions/blob/main/docs/http/http-spans.md#status
      if (response.status >= 400) {
        span.setStatus({ code: SpanStatusCode.ERROR });
        span.setAttribute(ATTR_ERROR_TYPE, String(response.status));
      }
    }

    setTimeout(() => {
      spanData.observer?.disconnect();
      this._findResourceAndAddNetworkEvents(span, spanData, performanceEndTime);
      this._tasksCount--;
      this._clearResources();
      span.end(endTime);
    }, OBSERVER_WAIT_TIME_MS);
  }

  /**
   * Patches the constructor of fetch
   */
  private _patchConstructor(): (original: typeof fetch) => typeof fetch {
    return original => {
      const plugin = this;
      const readOnlyProps = new Set(['url', 'type', 'redirected']);
      function createResponseProxy(
        target: Response,
        originalResponse: Response
      ): Response {
        return new Proxy(target, {
          get(t, prop, _receiver) {
            if (typeof prop === 'string' && readOnlyProps.has(prop)) {
              return Reflect.get(originalResponse, prop);
            }
            if (prop === 'clone') {
              return function clone() {
                return createResponseProxy(t.clone(), originalResponse);
              };
            }
            // Use target as receiver so getters (e.g. headers) run with correct this and avoid "Illegal invocation"
            const value = Reflect.get(t, prop, t);
            return typeof value === 'function' ? value.bind(t) : value;
          },
        }) as Response;
      }

      return function patchConstructor(
        this: typeof globalThis,
        ...args: Parameters<typeof fetch>
      ): Promise<Response> {
        const self = this;
        const url = web.parseUrl(
          args[0] instanceof Request ? args[0].url : String(args[0])
        ).href;

        const options = args[0] instanceof Request ? args[0] : args[1] || {};
        const createdSpan = plugin._createSpan(url, options);
        if (!createdSpan) {
          return original.apply(this, args);
        }
        const spanData = plugin._prepareSpanData(url);

        if (plugin.getConfig().measureRequestSize) {
          getFetchBodyLength(...args)
            .then(bodyLength => {
              if (!bodyLength) return;
              if (plugin._semconvStability & SemconvStability.OLD) {
                createdSpan.setAttribute(
                  ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED,
                  bodyLength
                );
              }
              if (plugin._semconvStability & SemconvStability.STABLE) {
                createdSpan.setAttribute(
                  ATTR_HTTP_REQUEST_BODY_SIZE,
                  bodyLength
                );
              }
            })
            .catch(error => {
              plugin._diag.warn('getFetchBodyLength', error);
            });
        }

        function endSpanOnError(span: Span, error: FetchError) {
          plugin._applyAttributesAfterFetch(span, options, error);
          plugin._endSpan(span, spanData, {
            status: error.status || 0,
            statusText: error.message,
            url,
          });
        }

        function endSpanOnSuccess(span: Span, response: Response) {
          plugin._applyAttributesAfterFetch(span, options, response);
          if (response.status >= 200 && response.status < 400) {
            plugin._endSpan(span, spanData, response);
          } else {
            plugin._endSpan(span, spanData, {
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

              const newResponse = new Response(wrappedBody, {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
              });

              // Response url, type, and redirected are read-only properties that can't be set via constructor
              // Use a Proxy to forward them from the original response and maintain the wrapped body
              proxiedResponse = createResponseProxy(newResponse, response);

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
              // Call request hook before injection so hooks cannot tamper with propagation headers.
              // Also, this means the hook will see `options.headers` in the same type as passed in,
              // rather than as a `Headers` instance set by `_addHeaders()`.
              plugin._callRequestHook(createdSpan, options);
              plugin._addHeaders(options, url);
              plugin._tasksCount++;

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

  private _applyAttributesAfterFetch(
    span: Span,
    request: Request | RequestInit,
    result: Response | FetchError
  ) {
    const applyCustomAttributesOnSpan =
      this.getConfig().applyCustomAttributesOnSpan;
    if (applyCustomAttributesOnSpan) {
      safeExecuteInTheMiddle(
        () => applyCustomAttributesOnSpan(span, request, result),
        error => {
          if (!error) {
            return;
          }

          this._diag.error('applyCustomAttributesOnSpan', error);
        },
        true
      );
    }
  }

  private _callRequestHook(span: Span, request: Request | RequestInit) {
    const requestHook = this.getConfig().requestHook;
    if (requestHook) {
      safeExecuteInTheMiddle(
        () => requestHook(span, request),
        error => {
          if (!error) {
            return;
          }

          this._diag.error('requestHook', error);
        },
        true
      );
    }
  }

  /**
   * Prepares a span data - needed later for matching appropriate network
   *     resources
   * @param spanUrl
   */
  private _prepareSpanData(spanUrl: string): SpanData {
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

  /**
   * implements enable function
   */
  override enable(): void {
    if (!hasBrowserPerformanceAPI) {
      this._diag.warn(
        'this instrumentation is intended for web usage only, it does not instrument server-side fetch()'
      );
      return;
    }
    if (isWrapped(fetch)) {
      this._unwrap(globalThis, 'fetch');
      this._diag.debug('removing previous patch for constructor');
    }
    this._wrap(globalThis, 'fetch', this._patchConstructor());
  }

  /**
   * implements unpatch function
   */
  override disable(): void {
    if (!hasBrowserPerformanceAPI) {
      return;
    }
    this._unwrap(globalThis, 'fetch');
    this._usedResources = new WeakSet<PerformanceResourceTiming>();
  }
}
