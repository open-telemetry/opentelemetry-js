/**
 * Copyright 2019, OpenTelemetry Authors
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

import { BasePlugin, NoopLogger, isValid } from '@opentelemetry/core';
import { CanonicalCode, Span, SpanKind, SpanOptions, Logger, Status } from '@opentelemetry/types';
import { NodeTracer } from '@opentelemetry/node-tracer';
import { ClientRequest, IncomingMessage, request, get, RequestOptions, ServerResponse } from 'http';
import * as http from 'http';
import * as semver from 'semver';
import * as shimmer from 'shimmer';
import * as url from 'url';
import { HttpPluginConfig, IgnoreMatcher } from './types';

export type HttpCallback = (res: IncomingMessage) => void;
export type RequestFunction = typeof request;
export type GetFunction = typeof get;
export type Http = typeof http;

/**
 * Default type for functions
 * @TODO: export this to types package
 */
type Func<T> = (...args: any[]) => T;

/**
 * Http instrumentation plugin for Opentelemetry
 */
export class HttpPlugin extends BasePlugin<Http> {
  /**
   * Attributes Names according to Opencensus HTTP Specs since there is no specific OpenTelemetry Attributes
   * https://github.com/open-telemetry/opentelemetry-specification/blob/master/work_in_progress/opencensus/HTTP.md#attributes
   */
  static ATTRIBUTE_HTTP_HOST = 'http.host';
  // NOT ON OFFICIAL SPEC
  static ATTRIBUTE_ERROR = 'error';
  static ATTRIBUTE_HTTP_METHOD = 'http.method';
  static ATTRIBUTE_HTTP_PATH = 'http.path';
  static ATTRIBUTE_HTTP_ROUTE = 'http.route';
  static ATTRIBUTE_HTTP_USER_AGENT = 'http.user_agent';
  static ATTRIBUTE_HTTP_STATUS_CODE = 'http.status_code';
  // NOT ON OFFICIAL SPEC
  static ATTRIBUTE_HTTP_ERROR_NAME = 'http.error_name';
  static ATTRIBUTE_HTTP_ERROR_MESSAGE = 'http.error_message';
  static PROPAGATION_FORMAT = 'HttpTraceContext';

  /**
   * Parse status code from HTTP response.
   */
  static parseResponseStatus(statusCode: number): Omit<Status, 'message'> {
    if (statusCode < 200 || statusCode > 504) {
      return { code: CanonicalCode.UNKNOWN };
    } else if (statusCode >= 200 && statusCode < 400) {
      return { code: CanonicalCode.OK };
    } else {
      switch (statusCode) {
        case 400:
          return { code: CanonicalCode.INVALID_ARGUMENT };
        case 504:
          return { code: CanonicalCode.DEADLINE_EXCEEDED };
        case 404:
          return { code: CanonicalCode.NOT_FOUND };
        case 403:
          return { code: CanonicalCode.PERMISSION_DENIED };
        case 401:
          return { code: CanonicalCode.UNAUTHENTICATED };
        case 429:
          return { code: CanonicalCode.RESOURCE_EXHAUSTED };
        case 501:
          return { code: CanonicalCode.UNIMPLEMENTED };
        case 503:
          return { code: CanonicalCode.UNAVAILABLE };
        default:
          return { code: CanonicalCode.UNKNOWN };
      }
    }
  }

  /**
   * Returns whether the Expect header is on the given options object.
   * @param options Options for http.request.
   */
  static hasExpectHeader(options: RequestOptions | url.URL): boolean {
    return !!((options as RequestOptions).headers && (options as RequestOptions).headers!.Expect);
  }

  /**
   * Check whether the given request match pattern
   * @param url URL of request
   * @param request Request to inspect
   * @param pattern Match pattern
   */
  static isSatisfyPattern<T>(url: string, request: T, pattern: IgnoreMatcher<T>): boolean {
    if (typeof pattern === 'string') {
      return pattern === url;
    } else if (pattern instanceof RegExp) {
      return pattern.test(url);
    } else if (typeof pattern === 'function') {
      return pattern(url, request);
    } else {
      throw new TypeError('Pattern is in unsupported datatype');
    }
  }

  /**
   * Check whether the given request is ignored by configuration
   * @param url URL of request
   * @param request Request to inspect
   * @param list List of ignore patterns
   */
  static isIgnored<T>(url: string, request: T, list?: Array<IgnoreMatcher<T>>): boolean {
    if (!list) {
      // No ignored urls - trace everything
      return false;
    }

    for (const pattern of list) {
      if (HttpPlugin.isSatisfyPattern(url, request, pattern)) {
        return true;
      }
    }

    return false;
  }

  static setSpanOnError(span: Span, obj: NodeJS.EventEmitter) {
    obj.on('error', error => {
      span
        .setAttribute(HttpPlugin.ATTRIBUTE_ERROR, true)
        .setAttribute(HttpPlugin.ATTRIBUTE_HTTP_ERROR_NAME, error.name)
        .setAttribute(HttpPlugin.ATTRIBUTE_HTTP_ERROR_MESSAGE, error.message);
      span.setStatus({ code: CanonicalCode.UNKNOWN, message: error.message });
      span.end();
    });
  }

  options!: HttpPluginConfig;

  // TODO: BasePlugin should pass the logger or when we enable the plugin
  protected readonly _logger!: Logger;
  protected readonly _tracer!: NodeTracer;

  /** Constructs a new HttpPlugin instance. */
  constructor(public moduleName: string, public version: string) {
    super();
    // TODO: remove this once a logger will be passed
    this._logger = new NoopLogger();
  }

  /** Patches HTTP incoming and outcoming request functions. */
  protected patch() {
    this._logger.debug('applying patch to %s@%s', this.moduleName, this.version);

    shimmer.wrap(this._moduleExports, 'request', this.getPatchOutgoingRequestFunction());

    // In Node 8-10, http.get calls a private request method, therefore we patch it
    // here too.
    if (semver.satisfies(this.version, '>=8.0.0')) {
      shimmer.wrap(this._moduleExports, 'get', this.getPatchOutgoingGetFunction());
    }

    if (this._moduleExports && this._moduleExports.Server && this._moduleExports.Server.prototype) {
      shimmer.wrap(this._moduleExports.Server.prototype, 'emit', this.getPatchIncomingRequestFunction());
    } else {
      this._logger.error('Could not apply patch to %s.emit. Interface is not as expected.', this.moduleName);
    }

    return this._moduleExports;
  }

  /** Unpatches all HTTP patched function. */
  protected unpatch(): void {
    shimmer.unwrap(this._moduleExports, 'request');
    if (semver.satisfies(this.version, '>=8.0.0')) {
      shimmer.unwrap(this._moduleExports, 'get');
    }
    if (this._moduleExports && this._moduleExports.Server && this._moduleExports.Server.prototype) {
      shimmer.unwrap(this._moduleExports.Server.prototype, 'emit');
    }
  }

  /**
   * Creates spans for incoming requests, restoring spans' context if applied.
   */
  protected getPatchIncomingRequestFunction() {
    return (original: (event: string) => boolean) => {
      return this.incomingRequestFunction(original, this);
    };
  }

  /**
   * Creates spans for outgoing requests, sending spans' context for distributed
   * tracing.
   */
  protected getPatchOutgoingRequestFunction() {
    return (original: Func<ClientRequest>): Func<ClientRequest> => {
      return this.outgoingRequestFunction(original, this);
    };
  }

  protected getPatchOutgoingGetFunction() {
    return (original: Func<ClientRequest>): Func<ClientRequest> => {
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
      return function outgoingGetRequest(options: string | RequestOptions | URL, callback?: HttpCallback) {
        const req = request(options, callback);
        req.end();
        return req;
      };
    };
  }

  /**
   * Injects span's context to header for distributed tracing and finshes the
   * span when the response is finished.
   * @param original The original patched function.
   * @param options The arguments to the original function.
   */
  private getMakeRequestTraceFunction(
    request: ClientRequest,
    options: RequestOptions,
    plugin: HttpPlugin
  ): Func<ClientRequest> {
    return (span: Span): ClientRequest => {
      plugin._logger.debug('makeRequestTrace');

      if (!span) {
        plugin._logger.debug('makeRequestTrace span is null');
        return request;
      }

      const propagation = plugin._tracer.getHttpTextFormat();
      // If outgoing request headers contain the "Expect" header, the returned
      // ClientRequest will throw an error if any new headers are added.
      // So we need to clone the options object to be able to inject new
      // header.
      if (HttpPlugin.hasExpectHeader(options)) {
        options = Object.assign({}, options);
        options.headers = Object.assign({}, options.headers);
      }
      propagation.inject(span.context(), HttpPlugin.PROPAGATION_FORMAT, options.headers);

      request.on('response', (response: IncomingMessage) => {
        plugin._tracer.wrapEmitter(response);
        plugin._logger.debug('outgoingRequest on response()');
        response.on('end', () => {
          plugin._logger.debug('outgoingRequest on end()');
          const method = response.method ? response.method.toUpperCase() : 'GET';
          const headers = options.headers;
          const userAgent = headers ? headers['user-agent'] || headers['User-Agent'] : null;

          const host = options.hostname || options.host || 'localhost';
          span
            .setAttribute(HttpPlugin.ATTRIBUTE_HTTP_HOST, host)
            .setAttribute(HttpPlugin.ATTRIBUTE_HTTP_METHOD, method);
          if (options.path) {
            span
              .setAttribute(HttpPlugin.ATTRIBUTE_HTTP_PATH, options.path)
              .setAttribute(HttpPlugin.ATTRIBUTE_HTTP_ROUTE, options.path);
          }

          if (userAgent) {
            span.setAttribute(HttpPlugin.ATTRIBUTE_HTTP_USER_AGENT, userAgent.toString());
          }
          if (response.statusCode) {
            span.setAttribute(HttpPlugin.ATTRIBUTE_HTTP_STATUS_CODE, response.statusCode.toString());
            span.setStatus(HttpPlugin.parseResponseStatus(response.statusCode));
          }

          if (plugin.options.applyCustomAttributesOnSpan) {
            plugin.options.applyCustomAttributesOnSpan(span, request, response);
          }

          span.end();
        });
        HttpPlugin.setSpanOnError(span, response);
      });

      HttpPlugin.setSpanOnError(span, request);

      plugin._logger.debug('makeRequestTrace return request');
      return request;
    };
  }

  private incomingRequestFunction(original: (event: string) => boolean, plugin: HttpPlugin) {
    return function incomingRequest(event: string, ...args: unknown[]): boolean {
      // Only traces request events
      if (event !== 'request') {
        // @ts-ignore @TODO: remove ts-ignore and find how to type this
        return original.apply(this, arguments);
      }

      const request = args[0] as IncomingMessage;
      const response = args[1] as ServerResponse;
      const path = request.url ? url.parse(request.url).pathname || '' : '';
      const method = request.method || 'GET';
      plugin._logger.debug('%s plugin incomingRequest', plugin.moduleName);

      if (HttpPlugin.isIgnored(path, request, plugin.options.ignoreIncomingPaths)) {
        // @ts-ignore @TODO: remove ts-ignore and find how to type this
        return original.apply(this, arguments);
      }

      const propagation = plugin._tracer.getHttpTextFormat();
      const headers = request.headers;

      const spanOptions: SpanOptions = {
        kind: SpanKind.SERVER
      };

      const spanContext = propagation.extract(HttpPlugin.PROPAGATION_FORMAT, headers);
      if (spanContext && isValid(spanContext)) {
        spanOptions.parent = spanContext;
      }

      const rootSpan = plugin._tracer.startSpan(path, spanOptions);
      return plugin._tracer.withSpan(rootSpan, () => {
        plugin._tracer.wrapEmitter(request);
        plugin._tracer.wrapEmitter(response);

        // Wraps end (inspired by:
        // https://github.com/GoogleCloudPlatform/cloud-trace-nodejs/blob/master/src/plugins/plugin-connect.ts#L75)
        const originalEnd = response.end;

        response.end = function(this: ServerResponse) {
          response.end = originalEnd;
          // @ts-ignore @TODO: remove ts-ignore and find how to type this
          const returned = response.end.apply(this, arguments);
          const requestUrl = request.url ? url.parse(request.url) : null;
          const host = headers.host || 'localhost';
          const userAgent = (headers['user-agent'] || headers['User-Agent']) as string;

          rootSpan.setAttribute(HttpPlugin.ATTRIBUTE_HTTP_HOST, host.replace(/^(.*)(\:[0-9]{1,5})/, '$1'));

          rootSpan.setAttribute(HttpPlugin.ATTRIBUTE_HTTP_METHOD, method);
          if (requestUrl) {
            rootSpan.setAttribute(HttpPlugin.ATTRIBUTE_HTTP_PATH, requestUrl.pathname || '');
            rootSpan.setAttribute(HttpPlugin.ATTRIBUTE_HTTP_ROUTE, requestUrl.path || '');
          }
          if (userAgent) {
            rootSpan.setAttribute(HttpPlugin.ATTRIBUTE_HTTP_USER_AGENT, userAgent);
          }
          rootSpan.setAttribute(HttpPlugin.ATTRIBUTE_HTTP_STATUS_CODE, response.statusCode.toString());

          rootSpan.setStatus(HttpPlugin.parseResponseStatus(response.statusCode));

          if (plugin.options.applyCustomAttributesOnSpan) {
            plugin.options.applyCustomAttributesOnSpan(rootSpan, request, response);
          }

          rootSpan.end();
          return returned;
        };
        // @ts-ignore @TODO: remove ts-ignore and find how to type this, arguments
        return original.apply(this, arguments);
      });
    };
  }

  private outgoingRequestFunction(original: Func<ClientRequest>, plugin: HttpPlugin): Func<ClientRequest> {
    return function outgoingRequest(options: RequestOptions | string, callback?: HttpCallback): ClientRequest {
      if (!options) {
        // @ts-ignore @TODO: remove ts-ignore and find how to type this
        return original.apply(this, [options, callback]);
      }

      // Makes sure the url is an url object
      let pathname;
      let method;
      let origin = '';
      if (typeof options === 'string') {
        const parsedUrl = url.parse(options);
        options = parsedUrl;
        pathname = parsedUrl.pathname || '';
        origin = `${parsedUrl.protocol || 'http:'}//${parsedUrl.host}`;
      } else {
        try {
          pathname = (options as url.URL).pathname;
          if (!pathname) {
            pathname = options.path ? url.parse(options.path).pathname : '';
          }
          method = options.method;
          origin = `${options.protocol || 'http:'}//${options.host}`;
        } catch (ignore) {}
      }
      // @ts-ignore @TODO: remove ts-ignore and find how to type this
      const request: ClientRequest = original.apply(this, [options, callback]);

      if (HttpPlugin.isIgnored(origin + pathname, request, plugin.options.ignoreOutgoingUrls)) {
        return request;
      }

      plugin._tracer.wrapEmitter(request);

      if (!method) {
        method = 'GET';
      } else {
        // some packages return method in lowercase..
        // ensure upperCase for consistency
        method = method.toUpperCase();
      }

      plugin._logger.debug('%s plugin outgoingRequest', plugin.moduleName);
      const operationName = `${method} ${pathname}`;
      const spanOptions = {
        kind: SpanKind.CLIENT
      };
      const currentSpan = plugin._tracer.getCurrentSpan();
      // Checks if this outgoing request is part of an operation by checking
      // if there is a current root span, if so, we create a child span. In
      // case there is no root span, this means that the outgoing request is
      // the first operation, therefore we create a root span.
      if (!currentSpan) {
        plugin._logger.debug('outgoingRequest starting a root span');
        const rootSpan = plugin._tracer.startSpan(operationName, spanOptions);
        return plugin._tracer.withSpan(rootSpan, plugin.getMakeRequestTraceFunction(request, options, plugin));
      } else {
        plugin._logger.debug('outgoingRequest starting a child span');
        const span = plugin._tracer.startSpan(operationName, {
          kind: spanOptions.kind,
          parent: currentSpan
        });
        return plugin.getMakeRequestTraceFunction(request, options, plugin)(span);
      }
    };
  }
}

export const plugin = new HttpPlugin('http', '8.0.0');
