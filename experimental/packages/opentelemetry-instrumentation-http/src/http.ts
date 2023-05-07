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
  MetricAttributes,
  ValueType,
} from '@opentelemetry/api';
import {
  hrTime,
  hrTimeDuration,
  hrTimeToMilliseconds,
  suppressTracing,
} from '@opentelemetry/core';
import type * as http from 'http';
import type * as https from 'https';
import { Socket } from 'net';
import * as semver from 'semver';
import * as url from 'url';
import {
  Err,
  Func,
  Http,
  HttpInstrumentationConfig,
  HttpRequestArgs,
  Https,
} from './types';
import * as utils from './utils';
import { VERSION } from './version';
import {
  InstrumentationBase,
  InstrumentationNodeModuleDefinition,
  isWrapped,
  safeExecuteInTheMiddle,
} from '@opentelemetry/instrumentation';
import { RPCMetadata, RPCType, setRPCMetadata } from '@opentelemetry/core';
import { errorMonitor } from 'events';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';

/**
 * Http instrumentation instrumentation for Opentelemetry
 */
export class HttpInstrumentation extends InstrumentationBase<Http> {
  /** keep track on spans not ended */
  private readonly _spanNotEnded: WeakSet<Span> = new WeakSet<Span>();
  private readonly _version = process.versions.node;
  private _headerCapture;
  private _httpServerDurationHistogram!: Histogram;
  private _httpClientDurationHistogram!: Histogram;

  constructor(config?: HttpInstrumentationConfig) {
    super('@opentelemetry/instrumentation-http', VERSION, config);
    this._headerCapture = this._createHeaderCapture();
  }

  protected override _updateMetricInstruments() {
    this._httpServerDurationHistogram = this.meter.createHistogram(
      'http.server.duration',
      {
        description: 'Measures the duration of inbound HTTP requests.',
        unit: 'ms',
        valueType: ValueType.DOUBLE,
      }
    );
    this._httpClientDurationHistogram = this.meter.createHistogram(
      'http.client.duration',
      {
        description: 'Measures the duration of outbound HTTP requests.',
        unit: 'ms',
        valueType: ValueType.DOUBLE,
      }
    );
  }

  private _getConfig(): HttpInstrumentationConfig {
    return this._config;
  }

  override setConfig(config?: HttpInstrumentationConfig): void {
    super.setConfig(config);
    this._headerCapture = this._createHeaderCapture();
  }

  init(): [
    InstrumentationNodeModuleDefinition<Https>,
    InstrumentationNodeModuleDefinition<Http>
  ] {
    return [this._getHttpsInstrumentation(), this._getHttpInstrumentation()];
  }

  private _getHttpInstrumentation() {
    return new InstrumentationNodeModuleDefinition<Http>(
      'http',
      ['*'],
      moduleExports => {
        this._diag.debug(`Applying patch for http@${this._version}`);
        if (isWrapped(moduleExports.request)) {
          this._unwrap(moduleExports, 'request');
        }
        this._wrap(
          moduleExports,
          'request',
          this._getPatchOutgoingRequestFunction('http')
        );
        if (isWrapped(moduleExports.get)) {
          this._unwrap(moduleExports, 'get');
        }
        this._wrap(
          moduleExports,
          'get',
          this._getPatchOutgoingGetFunction(moduleExports.request)
        );
        if (isWrapped(moduleExports.Server.prototype.emit)) {
          this._unwrap(moduleExports.Server.prototype, 'emit');
        }
        this._wrap(
          moduleExports.Server.prototype,
          'emit',
          this._getPatchIncomingRequestFunction('http')
        );
        return moduleExports;
      },
      moduleExports => {
        if (moduleExports === undefined) return;
        this._diag.debug(`Removing patch for http@${this._version}`);

        this._unwrap(moduleExports, 'request');
        this._unwrap(moduleExports, 'get');
        this._unwrap(moduleExports.Server.prototype, 'emit');
      }
    );
  }

  private _getHttpsInstrumentation() {
    return new InstrumentationNodeModuleDefinition<Https>(
      'https',
      ['*'],
      moduleExports => {
        this._diag.debug(`Applying patch for https@${this._version}`);
        if (isWrapped(moduleExports.request)) {
          this._unwrap(moduleExports, 'request');
        }
        this._wrap(
          moduleExports,
          'request',
          this._getPatchHttpsOutgoingRequestFunction('https')
        );
        if (isWrapped(moduleExports.get)) {
          this._unwrap(moduleExports, 'get');
        }
        this._wrap(
          moduleExports,
          'get',
          this._getPatchHttpsOutgoingGetFunction(moduleExports.request)
        );
        if (isWrapped(moduleExports.Server.prototype.emit)) {
          this._unwrap(moduleExports.Server.prototype, 'emit');
        }
        this._wrap(
          moduleExports.Server.prototype,
          'emit',
          this._getPatchIncomingRequestFunction('https')
        );
        return moduleExports;
      },
      moduleExports => {
        if (moduleExports === undefined) return;
        this._diag.debug(`Removing patch for https@${this._version}`);

        this._unwrap(moduleExports, 'request');
        this._unwrap(moduleExports, 'get');
        this._unwrap(moduleExports.Server.prototype, 'emit');
      }
    );
  }

  /**
   * Creates spans for incoming requests, restoring spans' context if applied.
   */
  protected _getPatchIncomingRequestFunction(component: 'http' | 'https') {
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
  protected _getPatchOutgoingRequestFunction(component: 'http' | 'https') {
    return (original: Func<http.ClientRequest>): Func<http.ClientRequest> => {
      return this._outgoingRequestFunction(component, original);
    };
  }

  protected _getPatchOutgoingGetFunction(
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
        T extends http.RequestOptions | string | url.URL
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
        // eslint-disable-next-line node/no-unsupported-features/node-builtins
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
      // eslint-disable-next-line node/no-unsupported-features/node-builtins
      options: http.RequestOptions | string | URL,
      ...args: HttpRequestArgs
    ) => http.ClientRequest
  ) {
    return (original: Func<http.ClientRequest>): Func<http.ClientRequest> => {
      const instrumentation = this;
      return function httpsOutgoingRequest(
        // eslint-disable-next-line node/no-unsupported-features/node-builtins
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
   * @param metricAttributes metric attributes
   */
  private _traceClientRequest(
    request: http.ClientRequest,
    span: Span,
    startTime: HrTime,
    metricAttributes: MetricAttributes
  ): http.ClientRequest {
    if (this._getConfig().requestHook) {
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
        const responseAttributes =
          utils.getOutgoingRequestAttributesOnResponse(response);
        span.setAttributes(responseAttributes);
        metricAttributes = Object.assign(
          metricAttributes,
          utils.getOutgoingRequestMetricAttributesOnResponse(responseAttributes)
        );

        if (this._getConfig().responseHook) {
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
            status = {
              code: utils.parseResponseStatus(
                SpanKind.CLIENT,
                response.statusCode
              ),
            };
          }

          span.setStatus(status);

          if (this._getConfig().applyCustomAttributesOnSpan) {
            safeExecuteInTheMiddle(
              () =>
                this._getConfig().applyCustomAttributesOnSpan!(
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
            metricAttributes
          );
        };

        response.on('end', endHandler);
        // See https://github.com/open-telemetry/opentelemetry-js/pull/3625#issuecomment-1475673533
        if (semver.lt(process.version, '16.0.0')) {
          response.on('close', endHandler);
        }
        response.on(errorMonitor, (error: Err) => {
          this._diag.debug('outgoingRequest on error()', error);
          if (responseFinished) {
            return;
          }
          responseFinished = true;
          utils.setSpanWithError(span, error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message,
          });
          this._closeHttpSpan(
            span,
            SpanKind.CLIENT,
            startTime,
            metricAttributes
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
      this._closeHttpSpan(span, SpanKind.CLIENT, startTime, metricAttributes);
    });
    request.on(errorMonitor, (error: Err) => {
      this._diag.debug('outgoingRequest on request error()', error);
      if (responseFinished) {
        return;
      }
      responseFinished = true;
      utils.setSpanWithError(span, error);
      this._closeHttpSpan(span, SpanKind.CLIENT, startTime, metricAttributes);
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
      const pathname = request.url
        ? url.parse(request.url).pathname || '/'
        : '/';
      const method = request.method || 'GET';

      instrumentation._diag.debug(
        `${component} instrumentation incomingRequest`
      );

      if (
        utils.isIgnored(
          pathname,
          instrumentation._getConfig().ignoreIncomingPaths,
          (e: unknown) =>
            instrumentation._diag.error('caught ignoreIncomingPaths error: ', e)
        ) ||
        safeExecuteInTheMiddle(
          () =>
            instrumentation._getConfig().ignoreIncomingRequestHook?.(request),
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

      const spanAttributes = utils.getIncomingRequestAttributes(request, {
        component: component,
        serverName: instrumentation._getConfig().serverName,
        hookAttributes: instrumentation._callStartSpanHook(
          request,
          instrumentation._getConfig().startIncomingSpanHook
        ),
      });

      const spanOptions: SpanOptions = {
        kind: SpanKind.SERVER,
        attributes: spanAttributes,
      };

      const startTime = hrTime();
      const metricAttributes =
        utils.getIncomingRequestMetricAttributes(spanAttributes);

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

          if (instrumentation._getConfig().requestHook) {
            instrumentation._callRequestHook(span, request);
          }
          if (instrumentation._getConfig().responseHook) {
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
              metricAttributes,
              startTime
            );
          });
          response.on(errorMonitor, (err: Err) => {
            hasError = true;
            instrumentation._onServerResponseError(
              span,
              metricAttributes,
              startTime,
              err
            );
          });

          return safeExecuteInTheMiddle(
            () => original.apply(this, [event, ...args]),
            error => {
              if (error) {
                utils.setSpanWithError(span, error);
                instrumentation._closeHttpSpan(
                  span,
                  SpanKind.SERVER,
                  startTime,
                  metricAttributes
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
      if (!utils.isValidOptionsType(options)) {
        return original.apply(this, [options, ...args]);
      }
      const extraOptions =
        typeof args[0] === 'object' &&
        (typeof options === 'string' || options instanceof url.URL)
          ? (args.shift() as http.RequestOptions)
          : undefined;
      const { origin, pathname, method, optionsParsed } = utils.getRequestInfo(
        options,
        extraOptions
      );
      /**
       * Node 8's https module directly call the http one so to avoid creating
       * 2 span for the same request we need to check that the protocol is correct
       * See: https://github.com/nodejs/node/blob/v8.17.0/lib/https.js#L245
       */
      if (
        component === 'http' &&
        semver.lt(process.version, '9.0.0') &&
        optionsParsed.protocol === 'https:'
      ) {
        return original.apply(this, [optionsParsed, ...args]);
      }

      if (
        utils.isIgnored(
          origin + pathname,
          instrumentation._getConfig().ignoreOutgoingUrls,
          (e: unknown) =>
            instrumentation._diag.error('caught ignoreOutgoingUrls error: ', e)
        ) ||
        safeExecuteInTheMiddle(
          () =>
            instrumentation
              ._getConfig()
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

      const { hostname, port } = utils.extractHostnameAndPort(optionsParsed);

      const attributes = utils.getOutgoingRequestAttributes(optionsParsed, {
        component,
        port,
        hostname,
        hookAttributes: instrumentation._callStartSpanHook(
          optionsParsed,
          instrumentation._getConfig().startOutgoingSpanHook
        ),
      });

      const startTime = hrTime();
      const metricAttributes: MetricAttributes =
        utils.getOutgoingRequestMetricAttributes(attributes);

      const spanOptions: SpanOptions = {
        kind: SpanKind.CLIENT,
        attributes,
      };
      const span = instrumentation._startHttpSpan(method, spanOptions);

      const parentContext = context.active();
      const requestContext = trace.setSpan(parentContext, span);

      if (!optionsParsed.headers) {
        optionsParsed.headers = {};
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
          () => original.apply(this, [optionsParsed, ...args]),
          error => {
            if (error) {
              utils.setSpanWithError(span, error);
              instrumentation._closeHttpSpan(
                span,
                SpanKind.CLIENT,
                startTime,
                metricAttributes
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
          metricAttributes
        );
      });
    };
  }

  private _onServerResponseFinish(
    request: http.IncomingMessage,
    response: http.ServerResponse,
    span: Span,
    metricAttributes: MetricAttributes,
    startTime: HrTime
  ) {
    const attributes = utils.getIncomingRequestAttributesOnResponse(
      request,
      response
    );
    metricAttributes = Object.assign(
      metricAttributes,
      utils.getIncomingRequestMetricAttributesOnResponse(attributes)
    );

    this._headerCapture.server.captureResponseHeaders(span, header =>
      response.getHeader(header)
    );

    span.setAttributes(attributes).setStatus({
      code: utils.parseResponseStatus(SpanKind.SERVER, response.statusCode),
    });

    const route = attributes[SemanticAttributes.HTTP_ROUTE];
    if (route) {
      span.updateName(`${request.method || 'GET'} ${route}`);
    }

    if (this._getConfig().applyCustomAttributesOnSpan) {
      safeExecuteInTheMiddle(
        () =>
          this._getConfig().applyCustomAttributesOnSpan!(
            span,
            request,
            response
          ),
        () => {},
        true
      );
    }

    this._closeHttpSpan(span, SpanKind.SERVER, startTime, metricAttributes);
  }

  private _onServerResponseError(
    span: Span,
    metricAttributes: MetricAttributes,
    startTime: HrTime,
    error: Err
  ) {
    utils.setSpanWithError(span, error);
    this._closeHttpSpan(span, SpanKind.SERVER, startTime, metricAttributes);
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
        ? this._getConfig().requireParentforOutgoingSpans
        : this._getConfig().requireParentforIncomingSpans;

    let span: Span;
    const currentSpan = trace.getSpan(ctx);

    if (requireParent === true && currentSpan === undefined) {
      span = trace.wrapSpanContext(INVALID_SPAN_CONTEXT);
    } else if (requireParent === true && currentSpan?.spanContext().isRemote) {
      span = currentSpan;
    } else {
      span = this.tracer.startSpan(name, options, ctx);
    }
    this._spanNotEnded.add(span);
    return span;
  }

  private _closeHttpSpan(
    span: Span,
    spanKind: SpanKind,
    startTime: HrTime,
    metricAttributes: MetricAttributes
  ) {
    if (!this._spanNotEnded.has(span)) {
      return;
    }

    span.end();
    this._spanNotEnded.delete(span);

    // Record metrics
    const duration = hrTimeToMilliseconds(hrTimeDuration(startTime, hrTime()));
    if (spanKind === SpanKind.SERVER) {
      this._httpServerDurationHistogram.record(duration, metricAttributes);
    } else if (spanKind === SpanKind.CLIENT) {
      this._httpClientDurationHistogram.record(duration, metricAttributes);
    }
  }

  private _callResponseHook(
    span: Span,
    response: http.IncomingMessage | http.ServerResponse
  ) {
    safeExecuteInTheMiddle(
      () => this._getConfig().responseHook!(span, response),
      () => {},
      true
    );
  }

  private _callRequestHook(
    span: Span,
    request: http.ClientRequest | http.IncomingMessage
  ) {
    safeExecuteInTheMiddle(
      () => this._getConfig().requestHook!(span, request),
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
    const config = this._getConfig();

    return {
      client: {
        captureRequestHeaders: utils.headerCapture(
          'request',
          config.headersToSpanAttributes?.client?.requestHeaders ?? []
        ),
        captureResponseHeaders: utils.headerCapture(
          'response',
          config.headersToSpanAttributes?.client?.responseHeaders ?? []
        ),
      },
      server: {
        captureRequestHeaders: utils.headerCapture(
          'request',
          config.headersToSpanAttributes?.server?.requestHeaders ?? []
        ),
        captureResponseHeaders: utils.headerCapture(
          'response',
          config.headersToSpanAttributes?.server?.responseHeaders ?? []
        ),
      },
    };
  }
}
