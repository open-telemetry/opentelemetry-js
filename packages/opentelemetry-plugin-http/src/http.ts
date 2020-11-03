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
  StatusCode,
  context,
  propagation,
  Span,
  SpanKind,
  SpanOptions,
  Status,
  SpanContext,
  TraceFlags,
  setActiveSpan,
} from '@opentelemetry/api';
import { BasePlugin, NoRecordingSpan } from '@opentelemetry/core';
import type {
  ClientRequest,
  IncomingMessage,
  RequestOptions,
  ServerResponse,
} from 'http';
import { Socket } from 'net';
import * as semver from 'semver';
import * as shimmer from 'shimmer';
import * as url from 'url';
import {
  Err,
  Func,
  Http,
  HttpPluginConfig,
  HttpRequestArgs,
  ParsedRequestOptions,
  ResponseEndArgs,
} from './types';
import * as utils from './utils';
import { VERSION } from './version';

/**
 * Http instrumentation plugin for Opentelemetry
 */
export class HttpPlugin extends BasePlugin<Http> {
  readonly component: string;
  protected _config!: HttpPluginConfig;
  /** keep track on spans not ended */
  private readonly _spanNotEnded: WeakSet<Span>;

  private readonly _emptySpanContext: SpanContext = {
    traceId: '',
    spanId: '',
    traceFlags: TraceFlags.NONE,
  };

  constructor(readonly moduleName: string, readonly version: string) {
    super(`@opentelemetry/plugin-${moduleName}`, VERSION);
    // For now component is equal to moduleName but it can change in the future.
    this.component = this.moduleName;
    this._spanNotEnded = new WeakSet<Span>();
    this._config = {};
  }

  /** Patches HTTP incoming and outcoming request functions. */
  protected patch() {
    this._logger.debug(
      'applying patch to %s@%s',
      this.moduleName,
      this.version
    );

    shimmer.wrap(
      this._moduleExports,
      'request',
      this._getPatchOutgoingRequestFunction()
    );

    // In Node >=8, http.get calls a private request method, therefore we patch it
    // here too.
    if (semver.satisfies(this.version, '>=8.0.0')) {
      shimmer.wrap(
        this._moduleExports,
        'get',
        this._getPatchOutgoingGetFunction(this._moduleExports.request)
      );
    }

    if (
      this._moduleExports &&
      this._moduleExports.Server &&
      this._moduleExports.Server.prototype
    ) {
      shimmer.wrap(
        this._moduleExports.Server.prototype,
        'emit',
        this._getPatchIncomingRequestFunction()
      );
    } else {
      this._logger.error(
        'Could not apply patch to %s.emit. Interface is not as expected.',
        this.moduleName
      );
    }

    return this._moduleExports;
  }

  /** Unpatches all HTTP patched function. */
  protected unpatch(): void {
    shimmer.unwrap(this._moduleExports, 'request');
    if (semver.satisfies(this.version, '>=8.0.0')) {
      shimmer.unwrap(this._moduleExports, 'get');
    }
    if (
      this._moduleExports &&
      this._moduleExports.Server &&
      this._moduleExports.Server.prototype
    ) {
      shimmer.unwrap(this._moduleExports.Server.prototype, 'emit');
    }
  }

  /**
   * Creates spans for incoming requests, restoring spans' context if applied.
   */
  protected _getPatchIncomingRequestFunction() {
    return (original: (event: string, ...args: unknown[]) => boolean) => {
      return this._incomingRequestFunction(original);
    };
  }

  /**
   * Creates spans for outgoing requests, sending spans' context for distributed
   * tracing.
   */
  protected _getPatchOutgoingRequestFunction() {
    return (original: Func<ClientRequest>): Func<ClientRequest> => {
      return this._outgoingRequestFunction(original);
    };
  }

  protected _getPatchOutgoingGetFunction(
    clientRequest: (
      options: RequestOptions | string | url.URL,
      ...args: HttpRequestArgs
    ) => ClientRequest
  ) {
    return (_original: Func<ClientRequest>): Func<ClientRequest> => {
      // Re-implement http.get. This needs to be done (instead of using
      // getPatchOutgoingRequestFunction to patch it) because we need to
      // set the trace context header before the returned ClientRequest is
      // ended. The Node.js docs state that the only differences between
      // request and get are that (1) get defaults to the HTTP GET method and
      // (2) the returned request object is ended immediately. The former is
      // already true (at least in supported Node versions up to v10), so we
      // simply follow the latter. Ref:
      // https://nodejs.org/dist/latest/docs/api/http.html#http_http_get_options_callback
      // https://github.com/googleapis/cloud-trace-nodejs/blob/master/src/plugins/plugin-http.ts#L198
      return function outgoingGetRequest<
        T extends RequestOptions | string | url.URL
      >(options: T, ...args: HttpRequestArgs): ClientRequest {
        const req = clientRequest(options, ...args);
        req.end();
        return req;
      };
    };
  }

  /**
   * Attach event listeners to a client request to end span and add span attributes.
   *
   * @param request The original request object.
   * @param options The arguments to the original function.
   * @param span representing the current operation
   */
  private _traceClientRequest(
    request: ClientRequest,
    options: ParsedRequestOptions,
    span: Span
  ): ClientRequest {
    const hostname =
      options.hostname ||
      options.host?.replace(/^(.*)(:[0-9]{1,5})/, '$1') ||
      'localhost';
    const attributes = utils.getOutgoingRequestAttributes(options, {
      component: this.component,
      hostname,
    });
    span.setAttributes(attributes);
    if (this._config.requestHook) {
      this._callRequestHook(span, request);
    }

    request.on(
      'response',
      (response: IncomingMessage & { aborted?: boolean }) => {
        const attributes = utils.getOutgoingRequestAttributesOnResponse(
          response,
          { hostname }
        );
        span.setAttributes(attributes);
        if (this._config.responseHook) {
          this._callResponseHook(span, response);
        }

        this._tracer.bind(response);
        this._logger.debug('outgoingRequest on response()');
        response.on('end', () => {
          this._logger.debug('outgoingRequest on end()');
          let status: Status;

          if (response.aborted && !response.complete) {
            status = { code: StatusCode.ERROR };
          } else {
            status = utils.parseResponseStatus(response.statusCode!);
          }

          span.setStatus(status);

          if (this._config.applyCustomAttributesOnSpan) {
            this._safeExecute(
              span,
              () =>
                this._config.applyCustomAttributesOnSpan!(
                  span,
                  request,
                  response
                ),
              false
            );
          }

          this._closeHttpSpan(span);
        });
        response.on('error', (error: Err) => {
          utils.setSpanWithError(span, error, response);
          this._closeHttpSpan(span);
        });
      }
    );
    request.on('close', () => {
      if (!request.aborted) {
        this._closeHttpSpan(span);
      }
    });
    request.on('error', (error: Err) => {
      utils.setSpanWithError(span, error, request);
      this._closeHttpSpan(span);
    });

    this._logger.debug('_traceClientRequest return request');
    return request;
  }

  private _incomingRequestFunction(
    original: (event: string, ...args: unknown[]) => boolean
  ) {
    const plugin = this;
    return function incomingRequest(
      this: {},
      event: string,
      ...args: unknown[]
    ): boolean {
      // Only traces request events
      if (event !== 'request') {
        return original.apply(this, [event, ...args]);
      }

      const request = args[0] as IncomingMessage;
      const response = args[1] as ServerResponse & { socket: Socket };
      const pathname = request.url
        ? url.parse(request.url).pathname || '/'
        : '/';
      const method = request.method || 'GET';

      plugin._logger.debug('%s plugin incomingRequest', plugin.moduleName);

      if (
        utils.isIgnored(
          pathname,
          plugin._config.ignoreIncomingPaths,
          (e: Error) =>
            plugin._logger.error('caught ignoreIncomingPaths error: ', e)
        )
      ) {
        return original.apply(this, [event, ...args]);
      }

      const headers = request.headers;

      const spanOptions: SpanOptions = {
        kind: SpanKind.SERVER,
        attributes: utils.getIncomingRequestAttributes(request, {
          component: plugin.component,
          serverName: plugin._config.serverName,
        }),
      };

      return context.with(propagation.extract(headers), () => {
        const span = plugin._startHttpSpan(`HTTP ${method}`, spanOptions);

        return plugin._tracer.withSpan(span, () => {
          context.bind(request);
          context.bind(response);

          if (plugin._config.requestHook) {
            plugin._callRequestHook(span, request);
          }
          if (plugin._config.responseHook) {
            plugin._callResponseHook(span, response);
          }

          // Wraps end (inspired by:
          // https://github.com/GoogleCloudPlatform/cloud-trace-nodejs/blob/master/src/plugins/plugin-connect.ts#L75)
          const originalEnd = response.end;
          response.end = function (
            this: ServerResponse,
            ..._args: ResponseEndArgs
          ) {
            response.end = originalEnd;
            // Cannot pass args of type ResponseEndArgs,
            const returned = plugin._safeExecute(
              span,
              () => response.end.apply(this, arguments as any),
              true
            );

            const attributes = utils.getIncomingRequestAttributesOnResponse(
              request,
              response
            );

            span
              .setAttributes(attributes)
              .setStatus(utils.parseResponseStatus(response.statusCode));

            if (plugin._config.applyCustomAttributesOnSpan) {
              plugin._safeExecute(
                span,
                () =>
                  plugin._config.applyCustomAttributesOnSpan!(
                    span,
                    request,
                    response
                  ),
                false
              );
            }

            plugin._closeHttpSpan(span);
            return returned;
          };

          return plugin._safeExecute(
            span,
            () => original.apply(this, [event, ...args]),
            true
          );
        });
      });
    };
  }

  private _outgoingRequestFunction(
    original: Func<ClientRequest>
  ): Func<ClientRequest> {
    const plugin = this;
    return function outgoingRequest(
      this: {},
      options: url.URL | RequestOptions | string,
      ...args: unknown[]
    ): ClientRequest {
      if (!utils.isValidOptionsType(options)) {
        return original.apply(this, [options, ...args]);
      }

      const extraOptions =
        typeof args[0] === 'object' &&
        (typeof options === 'string' || options instanceof url.URL)
          ? (args.shift() as RequestOptions)
          : undefined;
      const { origin, pathname, method, optionsParsed } = utils.getRequestInfo(
        options,
        extraOptions
      );

      if (
        utils.isIgnored(
          origin + pathname,
          plugin._config.ignoreOutgoingUrls,
          (e: Error) =>
            plugin._logger.error('caught ignoreOutgoingUrls error: ', e)
        )
      ) {
        return original.apply(this, [optionsParsed, ...args]);
      }

      const operationName = `HTTP ${method}`;
      const spanOptions: SpanOptions = {
        kind: SpanKind.CLIENT,
      };
      const span = plugin._startHttpSpan(operationName, spanOptions);
      if (!optionsParsed.headers) {
        optionsParsed.headers = {};
      }
      propagation.inject(
        optionsParsed.headers,
        undefined,
        setActiveSpan(context.active(), span)
      );

      const request: ClientRequest = plugin._safeExecute(
        span,
        () => original.apply(this, [optionsParsed, ...args]),
        true
      );

      plugin._logger.debug('%s plugin outgoingRequest', plugin.moduleName);
      plugin._tracer.bind(request);
      return plugin._traceClientRequest(request, optionsParsed, span);
    };
  }

  private _startHttpSpan(name: string, options: SpanOptions) {
    /*
     * If a parent is required but not present, we use a `NoRecordingSpan` to still
     * propagate context without recording it.
     */
    const requireParent =
      options.kind === SpanKind.CLIENT
        ? this._config.requireParentforOutgoingSpans
        : this._config.requireParentforIncomingSpans;

    let span: Span;
    const currentSpan = this._tracer.getCurrentSpan();

    if (requireParent === true && currentSpan === undefined) {
      // TODO: Refactor this when a solution is found in
      // https://github.com/open-telemetry/opentelemetry-specification/issues/530
      span = new NoRecordingSpan(plugin._emptySpanContext);
    } else if (requireParent === true && currentSpan?.context().isRemote) {
      span = currentSpan;
    } else {
      span = this._tracer.startSpan(name, options);
    }
    this._spanNotEnded.add(span);
    return span;
  }

  private _closeHttpSpan(span: Span) {
    if (!this._spanNotEnded.has(span)) {
      return;
    }

    span.end();
    this._spanNotEnded.delete(span);
  }

  private _callResponseHook(
    span: Span,
    response: IncomingMessage | ServerResponse
  ) {
    this._safeExecute(
      span,
      () => this._config.responseHook!(span, response),
      false
    );
  }

  private _callRequestHook(
    span: Span,
    request: ClientRequest | IncomingMessage
  ) {
    this._safeExecute(
      span,
      () => this._config.requestHook!(span, request),
      false
    );
  }

  private _safeExecute<
    T extends (...args: unknown[]) => ReturnType<T>,
    K extends boolean
  >(
    span: Span,
    execute: T,
    rethrow: K
  ): K extends true ? ReturnType<T> : ReturnType<T> | void;
  private _safeExecute<T extends (...args: unknown[]) => ReturnType<T>>(
    span: Span,
    execute: T,
    rethrow: boolean
  ): ReturnType<T> | void {
    try {
      return execute();
    } catch (error) {
      if (rethrow) {
        utils.setSpanWithError(span, error);
        this._closeHttpSpan(span);
        throw error;
      }
      this._logger.error('caught error ', error);
    }
  }
}

export const plugin = new HttpPlugin('http', process.versions.node);
