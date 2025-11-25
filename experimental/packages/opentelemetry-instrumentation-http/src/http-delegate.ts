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
  HrTime,
  INVALID_SPAN_CONTEXT,
  propagation,
  ROOT_CONTEXT,
  Span,
  SpanKind,
  SpanOptions,
  SpanStatus,
  SpanStatusCode,
  trace,
  Histogram,
  Attributes,
  ValueType,
  DiagLogger,
  Meter,
  Tracer,
} from '@opentelemetry/api';
import {
  hrTime,
  hrTimeDuration,
  hrTimeToMilliseconds,
  suppressTracing,
  RPCMetadata,
  RPCType,
  setRPCMetadata,
} from '@opentelemetry/core';
import type * as http from 'http';
import type * as https from 'https';
import { Socket } from 'net';
import * as url from 'url';
import { HttpInstrumentationConfig } from './types';
import { VERSION } from './version';
import {
  Instrumentation,
  InstrumentationNodeModuleDefinition,
  SemconvStability,
  semconvStabilityFromStr,
  safeExecuteInTheMiddle,
  createInstrumentation,
} from '@opentelemetry/instrumentation';
import { errorMonitor } from 'events';
import {
  ATTR_ERROR_TYPE,
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_NETWORK_PROTOCOL_VERSION,
  ATTR_HTTP_ROUTE,
  ATTR_SERVER_ADDRESS,
  ATTR_SERVER_PORT,
  ATTR_URL_SCHEME,
  METRIC_HTTP_CLIENT_REQUEST_DURATION,
  METRIC_HTTP_SERVER_REQUEST_DURATION,
} from '@opentelemetry/semantic-conventions';
import {
  extractHostnameAndPort,
  getIncomingRequestAttributes,
  getIncomingRequestAttributesOnResponse,
  getIncomingRequestMetricAttributes,
  getIncomingRequestMetricAttributesOnResponse,
  getIncomingStableRequestMetricAttributesOnResponse,
  getOutgoingRequestAttributes,
  getOutgoingRequestAttributesOnResponse,
  getOutgoingRequestMetricAttributes,
  getOutgoingRequestMetricAttributesOnResponse,
  getOutgoingStableRequestMetricAttributesOnResponse,
  getRequestInfo,
  headerCapture,
  isValidOptionsType,
  parseResponseStatus,
  setSpanWithError,
} from './utils';
import { Err, Func, Http, HttpRequestArgs, Https } from './internal-types';
import { InstrumentationDelegate, Shimmer } from '@opentelemetry/instrumentation/src/types';
import { Logger } from '@opentelemetry/api-logs';

type HeaderCapture = {
  client: {
    captureRequestHeaders: ReturnType<typeof headerCapture>;
    captureResponseHeaders: ReturnType<typeof headerCapture>;
  };
  server: {
    captureRequestHeaders: ReturnType<typeof headerCapture>;
    captureResponseHeaders: ReturnType<typeof headerCapture>;
  }
}

class HttpInstrumentationDelegate implements InstrumentationDelegate<HttpInstrumentationConfig> {
  name = '@opentelemetry/instrumentation-http';
  version = VERSION;
  private _config!: HttpInstrumentationConfig;
  private _diag!: DiagLogger;
  private _tracer!: Tracer;
  // private _logger!: Logger;

  /** keep track on spans not ended */
  private readonly _spanNotEnded: WeakSet<Span> = new WeakSet<Span>();
  private _headerCapture!: HeaderCapture;
  declare private _oldHttpServerDurationHistogram: Histogram;
  declare private _stableHttpServerDurationHistogram: Histogram;
  declare private _oldHttpClientDurationHistogram: Histogram;
  declare private _stableHttpClientDurationHistogram: Histogram;
  private _semconvStability: SemconvStability = SemconvStability.OLD;

  constructor() {
    this._semconvStability = semconvStabilityFromStr(
      'http',
      process.env.OTEL_SEMCONV_STABILITY_OPT_IN
    );
  }

  setDiag(diag: DiagLogger): void {
    this._diag = diag;
  }

  setTracer(tracer: Tracer): void {
    this._tracer = tracer;
  }

  setLogger(logger: Logger): void {
    // this._logger = logger;
  }

  setMeter(meter: Meter) {
    this._oldHttpServerDurationHistogram = meter.createHistogram(
      'http.server.duration',
      {
        description: 'Measures the duration of inbound HTTP requests.',
        unit: 'ms',
        valueType: ValueType.DOUBLE,
      }
    );
    this._oldHttpClientDurationHistogram = meter.createHistogram(
      'http.client.duration',
      {
        description: 'Measures the duration of outbound HTTP requests.',
        unit: 'ms',
        valueType: ValueType.DOUBLE,
      }
    );
    this._stableHttpServerDurationHistogram = meter.createHistogram(
      METRIC_HTTP_SERVER_REQUEST_DURATION,
      {
        description: 'Duration of HTTP server requests.',
        unit: 's',
        valueType: ValueType.DOUBLE,
        advice: {
          explicitBucketBoundaries: [
            0.005, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1, 2.5, 5,
            7.5, 10,
          ],
        },
      }
    );
    this._stableHttpClientDurationHistogram = meter.createHistogram(
      METRIC_HTTP_CLIENT_REQUEST_DURATION,
      {
        description: 'Duration of HTTP client requests.',
        unit: 's',
        valueType: ValueType.DOUBLE,
        advice: {
          explicitBucketBoundaries: [
            0.005, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1, 2.5, 5,
            7.5, 10,
          ],
        },
      }
    );
  }

  private _recordServerDuration(
    durationMs: number,
    oldAttributes: Attributes,
    stableAttributes: Attributes
  ) {
    if (this._semconvStability & SemconvStability.OLD) {
      // old histogram is counted in MS
      this._oldHttpServerDurationHistogram.record(durationMs, oldAttributes);
    }

    if (this._semconvStability & SemconvStability.STABLE) {
      // stable histogram is counted in S
      this._stableHttpServerDurationHistogram.record(
        durationMs / 1000,
        stableAttributes
      );
    }
  }

  private _recordClientDuration(
    durationMs: number,
    oldAttributes: Attributes,
    stableAttributes: Attributes
  ) {
    if (this._semconvStability & SemconvStability.OLD) {
      // old histogram is counted in MS
      this._oldHttpClientDurationHistogram.record(durationMs, oldAttributes);
    }

    if (this._semconvStability & SemconvStability.STABLE) {
      // stable histogram is counted in S
      this._stableHttpClientDurationHistogram.record(
        durationMs / 1000,
        stableAttributes
      );
    }
  }

  setConfig(config: HttpInstrumentationConfig = {}) {
    this._config = config;
    this._headerCapture = this._createHeaderCapture();
  }

  getConfig(): HttpInstrumentationConfig {
    return this._config;
  }

  init(shimmer: Shimmer): [
    InstrumentationNodeModuleDefinition,
    InstrumentationNodeModuleDefinition,
  ] {
    return [this._getHttpsInstrumentation(shimmer), this._getHttpInstrumentation(shimmer)];
  }

  private _getHttpInstrumentation(shimmer: Shimmer) {
    return new InstrumentationNodeModuleDefinition(
      'http',
      ['*'],
      (moduleExports: Http): Http => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isESM = (moduleExports as any)[Symbol.toStringTag] === 'Module';
        if (!this.getConfig().disableOutgoingRequestInstrumentation) {
          const patchedRequest = shimmer.wrap(
            moduleExports,
            'request',
            this._getPatchOutgoingRequestFunction('http')
          ) as unknown as Func<http.ClientRequest>;
          const patchedGet = shimmer.wrap(
            moduleExports,
            'get',
            this._getPatchOutgoingGetFunction(patchedRequest)
          );
          if (isESM) {
            // To handle `import http from 'http'`, which returns the default
            // export, we need to set `module.default.*`.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (moduleExports as any).default.request = patchedRequest;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (moduleExports as any).default.get = patchedGet;
          }
        }
        if (!this.getConfig().disableIncomingRequestInstrumentation) {
          shimmer.wrap(
            moduleExports.Server.prototype,
            'emit',
            this._getPatchIncomingRequestFunction('http')
          );
        }
        return moduleExports;
      },
      (moduleExports: Http) => {
        if (moduleExports === undefined) return;

        if (!this.getConfig().disableOutgoingRequestInstrumentation) {
          shimmer.unwrap(moduleExports, 'request');
          shimmer.unwrap(moduleExports, 'get');
        }
        if (!this.getConfig().disableIncomingRequestInstrumentation) {
          shimmer.unwrap(moduleExports.Server.prototype, 'emit');
        }
      }
    );
  }

  private _getHttpsInstrumentation(shimmer: Shimmer) {
    return new InstrumentationNodeModuleDefinition(
      'https',
      ['*'],
      (moduleExports: Https): Https => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isESM = (moduleExports as any)[Symbol.toStringTag] === 'Module';
        if (!this.getConfig().disableOutgoingRequestInstrumentation) {
          const patchedRequest = shimmer.wrap(
            moduleExports,
            'request',
            this._getPatchHttpsOutgoingRequestFunction('https')
          ) as unknown as Func<http.ClientRequest>;
          const patchedGet = shimmer.wrap(
            moduleExports,
            'get',
            this._getPatchHttpsOutgoingGetFunction(patchedRequest)
          );
          if (isESM) {
            // To handle `import https from 'https'`, which returns the default
            // export, we need to set `module.default.*`.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (moduleExports as any).default.request = patchedRequest;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (moduleExports as any).default.get = patchedGet;
          }
        }
        if (!this.getConfig().disableIncomingRequestInstrumentation) {
          shimmer.wrap(
            moduleExports.Server.prototype,
            'emit',
            this._getPatchIncomingRequestFunction('https')
          );
        }
        return moduleExports;
      },
      (moduleExports: Https) => {
        if (moduleExports === undefined) return;

        if (!this.getConfig().disableOutgoingRequestInstrumentation) {
          shimmer.unwrap(moduleExports, 'request');
          shimmer.unwrap(moduleExports, 'get');
        }
        if (!this.getConfig().disableIncomingRequestInstrumentation) {
          shimmer.unwrap(moduleExports.Server.prototype, 'emit');
        }
      }
    );
  }

  /**
   * Creates spans for incoming requests, restoring spans' context if applied.
   */
  private _getPatchIncomingRequestFunction(component: 'http' | 'https') {
    return (
      original: (event: string, ...args: unknown[]) => boolean
    ): ((this: unknown, event: string, ...args: unknown[]) => boolean) => {
      return this._incomingRequestFunction(component, original);
    };
  }

  /**
   * Creates spans for outgoing requests, sending spans' context for distributed
   * tracing.
   */
  private _getPatchOutgoingRequestFunction(component: 'http' | 'https') {
    return (original: Func<http.ClientRequest>): Func<http.ClientRequest> => {
      return this._outgoingRequestFunction(component, original);
    };
  }

  private _getPatchOutgoingGetFunction(
    clientRequest: (
      options: http.RequestOptions | string | url.URL,
      ...args: HttpRequestArgs
    ) => http.ClientRequest
  ) {
    return (_original: Func<http.ClientRequest>): Func<http.ClientRequest> => {
      // Re-implement http.get. This needs to be done (instead of using
      // getPatchOutgoingRequestFunction to patch it) because we need to
      // set the trace context header before the returned http.ClientRequest is
      // ended. The Node.js docs state that the only differences between
      // request and get are that (1) get defaults to the HTTP GET method and
      // (2) the returned request object is ended immediately. The former is
      // already true (at least in supported Node versions up to v10), so we
      // simply follow the latter. Ref:
      // https://nodejs.org/dist/latest/docs/api/http.html#http_http_get_options_callback
      // https://github.com/googleapis/cloud-trace-nodejs/blob/master/src/instrumentations/instrumentation-http.ts#L198
      return function outgoingGetRequest<
        T extends http.RequestOptions | string | url.URL,
      >(options: T, ...args: HttpRequestArgs): http.ClientRequest {
        const req = clientRequest(options, ...args);
        req.end();
        return req;
      };
    };
  }

  /** Patches HTTPS outgoing requests */
  private _getPatchHttpsOutgoingRequestFunction(component: 'http' | 'https') {
    return (original: Func<http.ClientRequest>): Func<http.ClientRequest> => {
      const instrumentation = this;
      return function httpsOutgoingRequest(
        // eslint-disable-next-line n/no-unsupported-features/node-builtins
        options: https.RequestOptions | string | URL,
        ...args: HttpRequestArgs
      ): http.ClientRequest {
        // Makes sure options will have default HTTPS parameters
        if (
          component === 'https' &&
          typeof options === 'object' &&
          options?.constructor?.name !== 'URL'
        ) {
          options = Object.assign({}, options);
          instrumentation._setDefaultOptions(options);
        }
        return instrumentation._getPatchOutgoingRequestFunction(component)(
          original
        )(options, ...args);
      };
    };
  }

  private _setDefaultOptions(options: https.RequestOptions) {
    options.protocol = options.protocol || 'https:';
    options.port = options.port || 443;
  }

  /** Patches HTTPS outgoing get requests */
  private _getPatchHttpsOutgoingGetFunction(
    clientRequest: (
      // eslint-disable-next-line n/no-unsupported-features/node-builtins
      options: http.RequestOptions | string | URL,
      ...args: HttpRequestArgs
    ) => http.ClientRequest
  ) {
    return (original: Func<http.ClientRequest>): Func<http.ClientRequest> => {
      const instrumentation = this;
      return function httpsOutgoingRequest(
        // eslint-disable-next-line n/no-unsupported-features/node-builtins
        options: https.RequestOptions | string | URL,
        ...args: HttpRequestArgs
      ): http.ClientRequest {
        return instrumentation._getPatchOutgoingGetFunction(clientRequest)(
          original
        )(options, ...args);
      };
    };
  }

  /**
   * Attach event listeners to a client request to end span and add span attributes.
   *
   * @param request The original request object.
   * @param span representing the current operation
   * @param startTime representing the start time of the request to calculate duration in Metric
   * @param oldMetricAttributes metric attributes for old semantic conventions
   * @param stableMetricAttributes metric attributes for new semantic conventions
   */
  private _traceClientRequest(
    request: http.ClientRequest,
    span: Span,
    startTime: HrTime,
    oldMetricAttributes: Attributes,
    stableMetricAttributes: Attributes
  ): http.ClientRequest {
    if (this.getConfig().requestHook) {
      this._callRequestHook(span, request);
    }

    /**
     * Determines if the request has errored or the response has ended/errored.
     */
    let responseFinished = false;

    /*
     * User 'response' event listeners can be added before our listener,
     * force our listener to be the first, so response emitter is bound
     * before any user listeners are added to it.
     */
    request.prependListener(
      'response',
      (response: http.IncomingMessage & { aborted?: boolean }) => {
        this._diag.debug('outgoingRequest on response()');
        if (request.listenerCount('response') <= 1) {
          response.resume();
        }
        const responseAttributes = getOutgoingRequestAttributesOnResponse(
          response,
          this._semconvStability
        );
        span.setAttributes(responseAttributes);
        oldMetricAttributes = Object.assign(
          oldMetricAttributes,
          getOutgoingRequestMetricAttributesOnResponse(responseAttributes)
        );
        stableMetricAttributes = Object.assign(
          stableMetricAttributes,
          getOutgoingStableRequestMetricAttributesOnResponse(responseAttributes)
        );

        if (this.getConfig().responseHook) {
          this._callResponseHook(span, response);
        }

        this._headerCapture.client.captureRequestHeaders(span, header =>
          request.getHeader(header)
        );
        this._headerCapture.client.captureResponseHeaders(
          span,
          header => response.headers[header]
        );

        context.bind(context.active(), response);

        const endHandler = () => {
          this._diag.debug('outgoingRequest on end()');
          if (responseFinished) {
            return;
          }
          responseFinished = true;
          let status: SpanStatus;

          if (response.aborted && !response.complete) {
            status = { code: SpanStatusCode.ERROR };
          } else {
            // behaves same for new and old semconv
            status = {
              code: parseResponseStatus(SpanKind.CLIENT, response.statusCode),
            };
          }

          span.setStatus(status);

          if (this.getConfig().applyCustomAttributesOnSpan) {
            safeExecuteInTheMiddle(
              () =>
                this.getConfig().applyCustomAttributesOnSpan!(
                  span,
                  request,
                  response
                ),
              () => {},
              true
            );
          }

          this._closeHttpSpan(
            span,
            SpanKind.CLIENT,
            startTime,
            oldMetricAttributes,
            stableMetricAttributes
          );
        };

        response.on('end', endHandler);
        response.on(errorMonitor, (error: Err) => {
          this._diag.debug('outgoingRequest on error()', error);
          if (responseFinished) {
            return;
          }
          responseFinished = true;
          this._onOutgoingRequestError(
            span,
            oldMetricAttributes,
            stableMetricAttributes,
            startTime,
            error
          );
        });
      }
    );
    request.on('close', () => {
      this._diag.debug('outgoingRequest on request close()');
      if (request.aborted || responseFinished) {
        return;
      }
      responseFinished = true;
      this._closeHttpSpan(
        span,
        SpanKind.CLIENT,
        startTime,
        oldMetricAttributes,
        stableMetricAttributes
      );
    });
    request.on(errorMonitor, (error: Err) => {
      this._diag.debug('outgoingRequest on request error()', error);
      if (responseFinished) {
        return;
      }
      responseFinished = true;
      this._onOutgoingRequestError(
        span,
        oldMetricAttributes,
        stableMetricAttributes,
        startTime,
        error
      );
    });

    this._diag.debug('http.ClientRequest return request');
    return request;
  }

  private _incomingRequestFunction(
    component: 'http' | 'https',
    original: (event: string, ...args: unknown[]) => boolean
  ) {
    const instrumentation = this;
    return function incomingRequest(
      this: unknown,
      event: string,
      ...args: unknown[]
    ): boolean {
      // Only traces request events
      if (event !== 'request') {
        return original.apply(this, [event, ...args]);
      }

      const request = args[0] as http.IncomingMessage;
      const response = args[1] as http.ServerResponse & { socket: Socket };
      const method = request.method || 'GET';

      instrumentation._diag.debug(
        `${component} instrumentation incomingRequest`
      );

      if (
        safeExecuteInTheMiddle(
          () =>
            instrumentation.getConfig().ignoreIncomingRequestHook?.(request),
          (e: unknown) => {
            if (e != null) {
              instrumentation._diag.error(
                'caught ignoreIncomingRequestHook error: ',
                e
              );
            }
          },
          true
        )
      ) {
        return context.with(suppressTracing(context.active()), () => {
          context.bind(context.active(), request);
          context.bind(context.active(), response);
          return original.apply(this, [event, ...args]);
        });
      }

      const headers = request.headers;

      const spanAttributes = getIncomingRequestAttributes(
        request,
        {
          component: component,
          serverName: instrumentation.getConfig().serverName,
          hookAttributes: instrumentation._callStartSpanHook(
            request,
            instrumentation.getConfig().startIncomingSpanHook
          ),
          semconvStability: instrumentation._semconvStability,
          enableSyntheticSourceDetection:
            instrumentation.getConfig().enableSyntheticSourceDetection || false,
        },
        instrumentation._diag
      );

      const spanOptions: SpanOptions = {
        kind: SpanKind.SERVER,
        attributes: spanAttributes,
      };

      const startTime = hrTime();
      const oldMetricAttributes =
        getIncomingRequestMetricAttributes(spanAttributes);

      // request method and url.scheme are both required span attributes
      const stableMetricAttributes: Attributes = {
        [ATTR_HTTP_REQUEST_METHOD]: spanAttributes[ATTR_HTTP_REQUEST_METHOD],
        [ATTR_URL_SCHEME]: spanAttributes[ATTR_URL_SCHEME],
      };

      // recommended if and only if one was sent, same as span recommendation
      if (spanAttributes[ATTR_NETWORK_PROTOCOL_VERSION]) {
        stableMetricAttributes[ATTR_NETWORK_PROTOCOL_VERSION] =
          spanAttributes[ATTR_NETWORK_PROTOCOL_VERSION];
      }

      const ctx = propagation.extract(ROOT_CONTEXT, headers);
      const span = instrumentation._startHttpSpan(method, spanOptions, ctx);
      const rpcMetadata: RPCMetadata = {
        type: RPCType.HTTP,
        span,
      };

      return context.with(
        setRPCMetadata(trace.setSpan(ctx, span), rpcMetadata),
        () => {
          context.bind(context.active(), request);
          context.bind(context.active(), response);

          if (instrumentation.getConfig().requestHook) {
            instrumentation._callRequestHook(span, request);
          }
          if (instrumentation.getConfig().responseHook) {
            instrumentation._callResponseHook(span, response);
          }

          instrumentation._headerCapture.server.captureRequestHeaders(
            span,
            header => request.headers[header]
          );

          // After 'error', no further events other than 'close' should be emitted.
          let hasError = false;
          response.on('close', () => {
            if (hasError) {
              return;
            }
            instrumentation._onServerResponseFinish(
              request,
              response,
              span,
              oldMetricAttributes,
              stableMetricAttributes,
              startTime
            );
          });
          response.on(errorMonitor, (err: Err) => {
            hasError = true;
            instrumentation._onServerResponseError(
              span,
              oldMetricAttributes,
              stableMetricAttributes,
              startTime,
              err
            );
          });

          return safeExecuteInTheMiddle(
            () => original.apply(this, [event, ...args]),
            error => {
              if (error) {
                instrumentation._onServerResponseError(
                  span,
                  oldMetricAttributes,
                  stableMetricAttributes,
                  startTime,
                  error
                );
                throw error;
              }
            }
          );
        }
      );
    };
  }

  private _outgoingRequestFunction(
    component: 'http' | 'https',
    original: Func<http.ClientRequest>
  ): Func<http.ClientRequest> {
    const instrumentation = this;
    return function outgoingRequest(
      this: unknown,
      options: url.URL | http.RequestOptions | string,
      ...args: unknown[]
    ): http.ClientRequest {
      if (!isValidOptionsType(options)) {
        return original.apply(this, [options, ...args]);
      }
      const extraOptions =
        typeof args[0] === 'object' &&
        (typeof options === 'string' || options instanceof url.URL)
          ? (args.shift() as http.RequestOptions)
          : undefined;
      const { method, invalidUrl, optionsParsed } = getRequestInfo(
        instrumentation._diag,
        options,
        extraOptions
      );

      if (
        safeExecuteInTheMiddle(
          () =>
            instrumentation
              .getConfig()
              .ignoreOutgoingRequestHook?.(optionsParsed),
          (e: unknown) => {
            if (e != null) {
              instrumentation._diag.error(
                'caught ignoreOutgoingRequestHook error: ',
                e
              );
            }
          },
          true
        )
      ) {
        return original.apply(this, [optionsParsed, ...args]);
      }

      const { hostname, port } = extractHostnameAndPort(optionsParsed);
      const attributes = getOutgoingRequestAttributes(
        optionsParsed,
        {
          component,
          port,
          hostname,
          hookAttributes: instrumentation._callStartSpanHook(
            optionsParsed,
            instrumentation.getConfig().startOutgoingSpanHook
          ),
          redactedQueryParams: instrumentation.getConfig().redactedQueryParams, // Added config for adding custom query strings
        },
        instrumentation._semconvStability,
        instrumentation.getConfig().enableSyntheticSourceDetection || false
      );

      const startTime = hrTime();
      const oldMetricAttributes: Attributes =
        getOutgoingRequestMetricAttributes(attributes);

      // request method, server address, and server port are both required span attributes
      const stableMetricAttributes: Attributes = {
        [ATTR_HTTP_REQUEST_METHOD]: attributes[ATTR_HTTP_REQUEST_METHOD],
        [ATTR_SERVER_ADDRESS]: attributes[ATTR_SERVER_ADDRESS],
        [ATTR_SERVER_PORT]: attributes[ATTR_SERVER_PORT],
      };

      // required if and only if one was sent, same as span requirement
      if (attributes[ATTR_HTTP_RESPONSE_STATUS_CODE]) {
        stableMetricAttributes[ATTR_HTTP_RESPONSE_STATUS_CODE] =
          attributes[ATTR_HTTP_RESPONSE_STATUS_CODE];
      }

      // recommended if and only if one was sent, same as span recommendation
      if (attributes[ATTR_NETWORK_PROTOCOL_VERSION]) {
        stableMetricAttributes[ATTR_NETWORK_PROTOCOL_VERSION] =
          attributes[ATTR_NETWORK_PROTOCOL_VERSION];
      }

      const spanOptions: SpanOptions = {
        kind: SpanKind.CLIENT,
        attributes,
      };
      const span = instrumentation._startHttpSpan(method, spanOptions);

      const parentContext = context.active();
      const requestContext = trace.setSpan(parentContext, span);

      if (!optionsParsed.headers) {
        optionsParsed.headers = {};
      } else {
        // Make a copy of the headers object to avoid mutating an object the
        // caller might have a reference to.
        optionsParsed.headers = Object.assign({}, optionsParsed.headers);
      }
      propagation.inject(requestContext, optionsParsed.headers);

      return context.with(requestContext, () => {
        /*
         * The response callback is registered before ClientRequest is bound,
         * thus it is needed to bind it before the function call.
         */
        const cb = args[args.length - 1];
        if (typeof cb === 'function') {
          args[args.length - 1] = context.bind(parentContext, cb);
        }

        const request: http.ClientRequest = safeExecuteInTheMiddle(
          () => {
            if (invalidUrl) {
              // we know that the url is invalid, there's no point in injecting context as it will fail validation.
              // Passing in what the user provided will give the user an error that matches what they'd see without
              // the instrumentation.
              return original.apply(this, [options, ...args]);
            } else {
              return original.apply(this, [optionsParsed, ...args]);
            }
          },
          error => {
            if (error) {
              instrumentation._onOutgoingRequestError(
                span,
                oldMetricAttributes,
                stableMetricAttributes,
                startTime,
                error
              );
              throw error;
            }
          }
        );

        instrumentation._diag.debug(
          `${component} instrumentation outgoingRequest`
        );
        context.bind(parentContext, request);
        return instrumentation._traceClientRequest(
          request,
          span,
          startTime,
          oldMetricAttributes,
          stableMetricAttributes
        );
      });
    };
  }

  private _onServerResponseFinish(
    request: http.IncomingMessage,
    response: http.ServerResponse,
    span: Span,
    oldMetricAttributes: Attributes,
    stableMetricAttributes: Attributes,
    startTime: HrTime
  ) {
    const attributes = getIncomingRequestAttributesOnResponse(
      request,
      response,
      this._semconvStability
    );
    oldMetricAttributes = Object.assign(
      oldMetricAttributes,
      getIncomingRequestMetricAttributesOnResponse(attributes)
    );
    stableMetricAttributes = Object.assign(
      stableMetricAttributes,
      getIncomingStableRequestMetricAttributesOnResponse(attributes)
    );

    this._headerCapture.server.captureResponseHeaders(span, header =>
      response.getHeader(header)
    );

    span.setAttributes(attributes).setStatus({
      code: parseResponseStatus(SpanKind.SERVER, response.statusCode),
    });

    const route = attributes[ATTR_HTTP_ROUTE];
    if (route) {
      span.updateName(`${request.method || 'GET'} ${route}`);
    }

    if (this.getConfig().applyCustomAttributesOnSpan) {
      safeExecuteInTheMiddle(
        () =>
          this.getConfig().applyCustomAttributesOnSpan!(
            span,
            request,
            response
          ),
        () => {},
        true
      );
    }

    this._closeHttpSpan(
      span,
      SpanKind.SERVER,
      startTime,
      oldMetricAttributes,
      stableMetricAttributes
    );
  }

  private _onOutgoingRequestError(
    span: Span,
    oldMetricAttributes: Attributes,
    stableMetricAttributes: Attributes,
    startTime: HrTime,
    error: Err
  ) {
    setSpanWithError(span, error, this._semconvStability);
    stableMetricAttributes[ATTR_ERROR_TYPE] = error.name;

    this._closeHttpSpan(
      span,
      SpanKind.CLIENT,
      startTime,
      oldMetricAttributes,
      stableMetricAttributes
    );
  }

  private _onServerResponseError(
    span: Span,
    oldMetricAttributes: Attributes,
    stableMetricAttributes: Attributes,
    startTime: HrTime,
    error: Err
  ) {
    setSpanWithError(span, error, this._semconvStability);
    stableMetricAttributes[ATTR_ERROR_TYPE] = error.name;

    this._closeHttpSpan(
      span,
      SpanKind.SERVER,
      startTime,
      oldMetricAttributes,
      stableMetricAttributes
    );
  }

  private _startHttpSpan(
    name: string,
    options: SpanOptions,
    ctx = context.active()
  ) {
    /*
     * If a parent is required but not present, we use a `NoopSpan` to still
     * propagate context without recording it.
     */
    const requireParent =
      options.kind === SpanKind.CLIENT
        ? this.getConfig().requireParentforOutgoingSpans
        : this.getConfig().requireParentforIncomingSpans;

    let span: Span;
    const currentSpan = trace.getSpan(ctx);

    if (
      requireParent === true &&
      (!currentSpan || !trace.isSpanContextValid(currentSpan.spanContext()))
    ) {
      span = trace.wrapSpanContext(INVALID_SPAN_CONTEXT);
    } else if (requireParent === true && currentSpan?.spanContext().isRemote) {
      span = currentSpan;
    } else {
      span = this._tracer.startSpan(name, options, ctx);
    }
    this._spanNotEnded.add(span);
    return span;
  }

  private _closeHttpSpan(
    span: Span,
    spanKind: SpanKind,
    startTime: HrTime,
    oldMetricAttributes: Attributes,
    stableMetricAttributes: Attributes
  ) {
    if (!this._spanNotEnded.has(span)) {
      return;
    }

    span.end();
    this._spanNotEnded.delete(span);

    // Record metrics
    const duration = hrTimeToMilliseconds(hrTimeDuration(startTime, hrTime()));
    if (spanKind === SpanKind.SERVER) {
      this._recordServerDuration(
        duration,
        oldMetricAttributes,
        stableMetricAttributes
      );
    } else if (spanKind === SpanKind.CLIENT) {
      this._recordClientDuration(
        duration,
        oldMetricAttributes,
        stableMetricAttributes
      );
    }
  }

  private _callResponseHook(
    span: Span,
    response: http.IncomingMessage | http.ServerResponse
  ) {
    safeExecuteInTheMiddle(
      () => this.getConfig().responseHook!(span, response),
      () => {},
      true
    );
  }

  private _callRequestHook(
    span: Span,
    request: http.ClientRequest | http.IncomingMessage
  ) {
    safeExecuteInTheMiddle(
      () => this.getConfig().requestHook!(span, request),
      () => {},
      true
    );
  }

  private _callStartSpanHook(
    request: http.IncomingMessage | http.RequestOptions,
    hookFunc: Function | undefined
  ) {
    if (typeof hookFunc === 'function') {
      return safeExecuteInTheMiddle(
        () => hookFunc(request),
        () => {},
        true
      );
    }
  }

  private _createHeaderCapture() {
    const config = this.getConfig();

    return {
      client: {
        captureRequestHeaders: headerCapture(
          'request',
          config.headersToSpanAttributes?.client?.requestHeaders ?? []
        ),
        captureResponseHeaders: headerCapture(
          'response',
          config.headersToSpanAttributes?.client?.responseHeaders ?? []
        ),
      },
      server: {
        captureRequestHeaders: headerCapture(
          'request',
          config.headersToSpanAttributes?.server?.requestHeaders ?? []
        ),
        captureResponseHeaders: headerCapture(
          'response',
          config.headersToSpanAttributes?.server?.responseHeaders ?? []
        ),
      },
    };
  }
}

export function createHttpInstrumentation(config: HttpInstrumentationConfig = {}): Instrumentation<HttpInstrumentationConfig> {
  return createInstrumentation(new HttpInstrumentationDelegate(), config);
}
