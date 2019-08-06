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
import { Span, SpanKind, SpanOptions, Logger } from '@opentelemetry/types';
import { NodeTracer } from '@opentelemetry/node-tracer';
import {
  ClientRequest,
  IncomingMessage,
  request,
  RequestOptions,
  ServerResponse,
} from 'http';
import * as semver from 'semver';
import * as shimmer from 'shimmer';
import * as url from 'url';
import {
  HttpPluginConfig,
  Http,
  Func,
  HttpCallback,
  ResponseEndArgs,
} from './types';
import { Format } from './enums/format';
import { Attributes } from './enums/attributes';
import { Utils } from './utils';

/**
 * Http instrumentation plugin for Opentelemetry
 */
export class HttpPlugin extends BasePlugin<Http> {
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

    // In Node 8-10, http.get calls a private request method, therefore we patch it
    // here too.
    if (semver.satisfies(this.version, '>=8.0.0')) {
      shimmer.wrap(
        this._moduleExports,
        'get',
        this._getPatchOutgoingGetFunction()
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
    return (original: (event: string) => boolean) => {
      return this.incomingRequestFunction(original);
    };
  }

  /**
   * Creates spans for outgoing requests, sending spans' context for distributed
   * tracing.
   */
  protected _getPatchOutgoingRequestFunction() {
    return (original: Func<ClientRequest>): Func<ClientRequest> => {
      return this.outgoingRequestFunction(original);
    };
  }

  protected _getPatchOutgoingGetFunction() {
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
      return function outgoingGetRequest(
        options: string | RequestOptions | URL,
        callback?: HttpCallback
      ) {
        const req = request(options, callback);
        req.end();
        return req;
      };
    };
  }

  /**
   * Injects span's context to header for distributed tracing and finishes the
   * span when the response is finished.
   * @param request The original request object.
   * @param options The arguments to the original function.
   */
  private getMakeRequestTraceFunction(
    request: ClientRequest,
    options: RequestOptions
  ): Func<ClientRequest> {
    return (span: Span): ClientRequest => {
      this._logger.debug('makeRequestTrace');

      if (!span) {
        this._logger.debug('makeRequestTrace span is null');
        return request;
      }

      const propagation = this._tracer.getHttpTextFormat();
      // If outgoing request headers contain the "Expect" header, the returned
      // ClientRequest will throw an error if any new headers are added.
      // So we need to clone the options object to be able to inject new
      // header.
      if (Utils.hasExpectHeader(options)) {
        options = Object.assign({}, options);
        options.headers = Object.assign({}, options.headers);
      }
      propagation.inject(span.context(), Format.HTTP, options.headers);

      request.on('response', (response: IncomingMessage) => {
        this._tracer.wrapEmitter(response);
        this._logger.debug('outgoingRequest on response()');
        response.on('end', () => {
          this._logger.debug('outgoingRequest on end()');
          const method = response.method
            ? response.method.toUpperCase()
            : 'GET';
          const headers = options.headers;
          const userAgent = headers
            ? headers['user-agent'] || headers['User-Agent']
            : null;

          const host = options.hostname || options.host || 'localhost';
          span.setAttributes({
            ATTRIBUTE_HTTP_HOST: host,
            ATTRIBUTE_HTTP_METHOD: method,
            ATTRIBUTE_HTTP_PATH: options.path || '/',
          });

          if (userAgent) {
            span.setAttribute(Attributes.ATTRIBUTE_HTTP_USER_AGENT, userAgent);
          }
          if (response.statusCode) {
            span
              .setAttribute(
                Attributes.ATTRIBUTE_HTTP_STATUS_CODE,
                response.statusCode.toString()
              )
              .setStatus(Utils.parseResponseStatus(response.statusCode));
          }

          if (this.options.applyCustomAttributesOnSpan) {
            this.options.applyCustomAttributesOnSpan(span, request, response);
          }

          span.end();
        });
        Utils.setSpanOnError(span, response);
      });

      Utils.setSpanOnError(span, request);

      this._logger.debug('makeRequestTrace return request');
      return request;
    };
  }

  private incomingRequestFunction(
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
      const response = args[1] as ServerResponse;
      const path = request.url ? url.parse(request.url).pathname || '' : '';
      const method = request.method || 'GET';
      plugin._logger.debug('%s plugin incomingRequest', plugin.moduleName);

      if (Utils.isIgnored(path, request, plugin.options.ignoreIncomingPaths)) {
        return original.apply(this, [event, ...args]);
      }

      const propagation = plugin._tracer.getHttpTextFormat();
      const headers = request.headers;

      const spanOptions: SpanOptions = {
        kind: SpanKind.SERVER,
      };

      const spanContext = propagation.extract(Format.HTTP, headers);
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
        response.end = function(
          this: ServerResponse,
          ...args: ResponseEndArgs
        ) {
          response.end = originalEnd;
          // Cannot pass args of type ResponseEndArgs,
          // tslint complains "Expected 1-2 arguments, but got 1 or more.", it does not make sense to me
          // tslint:disable-next-line:no-any
          const returned = response.end.apply(this, arguments as any);
          const requestUrl = request.url ? url.parse(request.url) : null;
          const host = headers.host || 'localhost';
          const userAgent = (headers['user-agent'] ||
            headers['User-Agent']) as string;

          rootSpan
            .setAttribute(
              Attributes.ATTRIBUTE_HTTP_HOST,
              host.replace(/^(.*)(\:[0-9]{1,5})/, '$1')
            )
            .setAttribute(Attributes.ATTRIBUTE_HTTP_METHOD, method);

          if (requestUrl) {
            rootSpan
              .setAttribute(
                Attributes.ATTRIBUTE_HTTP_PATH,
                requestUrl.pathname || '/'
              )
              .setAttribute(
                Attributes.ATTRIBUTE_HTTP_ROUTE,
                requestUrl.path || '/'
              );
          }
          if (userAgent) {
            rootSpan.setAttribute(
              Attributes.ATTRIBUTE_HTTP_USER_AGENT,
              userAgent
            );
          }
          rootSpan
            .setAttribute(
              Attributes.ATTRIBUTE_HTTP_STATUS_CODE,
              response.statusCode.toString()
            )
            .setStatus(Utils.parseResponseStatus(response.statusCode));

          if (plugin.options.applyCustomAttributesOnSpan) {
            plugin.options.applyCustomAttributesOnSpan(
              rootSpan,
              request,
              response
            );
          }

          rootSpan.end();
          return returned;
        };
        return original.apply(this, [event, ...args]);
      });
    };
  }

  private outgoingRequestFunction(
    original: Func<ClientRequest>
  ): Func<ClientRequest> {
    const plugin = this;
    return function outgoingRequest(
      this: {},
      options: RequestOptions | string,
      callback?: HttpCallback
    ): ClientRequest {
      if (!options) {
        return original.apply(this, [options, callback]);
      }

      // Makes sure the url is an url object
      let pathname;
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
          origin = `${options.protocol || 'http:'}//${options.host}`;
        } catch (ignore) {}
      }
      const request: ClientRequest = original.apply(this, [options, callback]);
      if (
        Utils.isIgnored(
          origin + pathname,
          request,
          plugin.options.ignoreOutgoingUrls
        )
      ) {
        return request;
      }
      plugin._logger.debug('%s plugin outgoingRequest', plugin.moduleName);
      plugin._tracer.wrapEmitter(request);
      // some packages return method in lowercase..
      // ensure upperCase for consistency
      const method = options.method ? options.method.toUpperCase() : 'GET';
      const operationName = `${method} ${pathname}`;
      const spanOptions = {
        kind: SpanKind.CLIENT,
      };
      const currentSpan = plugin._tracer.getCurrentSpan();
      // Checks if this outgoing request is part of an operation by checking
      // if there is a current root span, if so, we create a child span. In
      // case there is no root span, this means that the outgoing request is
      // the first operation, therefore we create a root span.
      if (!currentSpan) {
        plugin._logger.debug('outgoingRequest starting a root span');
        const rootSpan = plugin._tracer.startSpan(operationName, spanOptions);
        return plugin._tracer.withSpan(
          rootSpan,
          plugin.getMakeRequestTraceFunction(request, options)
        );
      } else {
        plugin._logger.debug('outgoingRequest starting a child span');
        const span = plugin._tracer.startSpan(operationName, {
          kind: spanOptions.kind,
          parent: currentSpan,
        });
        return plugin.getMakeRequestTraceFunction(request, options)(span);
      }
    };
  }
}

export const plugin = new HttpPlugin('http', '8.0.0');
