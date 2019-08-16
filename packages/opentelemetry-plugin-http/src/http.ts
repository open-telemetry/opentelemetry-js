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
import {
  Span,
  SpanKind,
  SpanOptions,
  Logger,
  Tracer,
  Attributes,
} from '@opentelemetry/types';
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
  ResponseEndArgs,
  ParsedRequestOptions,
  HttpRequestArgs,
} from './types';
import { Format } from './enums/format';
import { AttributeNames } from './enums/attributeNames';
import { Utils } from './utils';

/**
 * Http instrumentation plugin for Opentelemetry
 */
export class HttpPlugin extends BasePlugin<Http> {
  static readonly component = 'http';
  options!: HttpPluginConfig;
  protected _logger!: Logger;
  protected readonly _tracer!: Tracer;

  constructor(public moduleName: string, public version: string) {
    super();
    // TODO: remove this once a logger will be passed
    // https://github.com/open-telemetry/opentelemetry-js/issues/193
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
      return function outgoingGetRequest<
        T extends RequestOptions | string | URL
      >(options: T, ...args: HttpRequestArgs) {
        const req = request(options, ...args);
        req.end();
        return req as ClientRequest;
      };
    };
  }

  /**
   * Injects span's context to header for distributed tracing and finishes the
   * span when the response is finished.
   * @param request The original request object.
   * @param options The arguments to the original function.
   * @param span representing the current operation
   */
  private _getMakeRequestTraceFunction(
    request: ClientRequest,
    options: ParsedRequestOptions,
    span: Span
  ): Func<ClientRequest> {
    return (): ClientRequest => {
      this._logger.debug('makeRequestTrace by injecting context into header');

      const propagation = this._tracer.getHttpTextFormat();
      const opts = Utils.getIncomingOptions(options);

      propagation.inject(span.context(), Format.HTTP, opts.headers);

      request.on('response', (response: IncomingMessage) => {
        this._tracer.bind(response);
        this._logger.debug('outgoingRequest on response()');
        response.on('end', () => {
          this._logger.debug('outgoingRequest on end()');

          // TODO: create utils methods
          const method = response.method
            ? response.method.toUpperCase()
            : 'GET';
          const headers = opts.headers;
          const userAgent = headers
            ? headers['user-agent'] || headers['User-Agent']
            : null;

          const host = opts.hostname || opts.host || 'localhost';

          const attributes: Attributes = {
            [AttributeNames.HTTP_URL]: `${opts.protocol}//${opts.hostname}${opts.path}`,
            [AttributeNames.HTTP_HOSTNAME]: host,
            [AttributeNames.HTTP_METHOD]: method,
            [AttributeNames.HTTP_PATH]: opts.path || '/',
          };

          if (userAgent) {
            attributes[AttributeNames.HTTP_USER_AGENT] = userAgent;
          }

          if (response.statusCode) {
            attributes[AttributeNames.HTTP_STATUS_CODE] = response.statusCode;
            attributes[AttributeNames.HTTP_STATUS_TEXT] =
              response.statusMessage;
            span.setStatus(Utils.parseResponseStatus(response.statusCode));
          }

          span.setAttributes(attributes);

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
      const response = args[1] as ServerResponse;
      const pathname = request.url
        ? url.parse(request.url).pathname || '/'
        : '/';
      const method = request.method || 'GET';

      plugin._logger.debug('%s plugin incomingRequest', plugin.moduleName);

      if (
        Utils.isIgnored(pathname, request, plugin.options.ignoreIncomingPaths)
      ) {
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

      const span = plugin._startHttpSpan(`${method} ${pathname}`, spanOptions);

      return plugin._tracer.withSpan(span, () => {
        plugin._tracer.bind(request);
        plugin._tracer.bind(response);

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
          const hostname = headers.host
            ? headers.host.replace(/^(.*)(\:[0-9]{1,5})/, '$1')
            : 'localhost';
          const userAgent = (headers['user-agent'] ||
            headers['User-Agent']) as string;

          const attributes: Attributes = {
            [AttributeNames.HTTP_URL]: Utils.getUrlFromIncomingRequest(
              requestUrl,
              headers
            ),
            [AttributeNames.HTTP_HOSTNAME]: hostname,
            [AttributeNames.HTTP_METHOD]: method,
            [AttributeNames.HTTP_STATUS_CODE]: response.statusCode,
            [AttributeNames.HTTP_STATUS_TEXT]: response.statusMessage,
          };

          if (requestUrl) {
            attributes[AttributeNames.HTTP_PATH] = requestUrl.path || '/';
            attributes[AttributeNames.HTTP_ROUTE] = requestUrl.pathname || '/';
          }

          if (userAgent) {
            attributes[AttributeNames.HTTP_USER_AGENT] = userAgent;
          }

          span
            .setAttributes(attributes)
            .setStatus(Utils.parseResponseStatus(response.statusCode));

          if (plugin.options.applyCustomAttributesOnSpan) {
            plugin.options.applyCustomAttributesOnSpan(span, request, response);
          }

          span.end();
          return returned;
        };
        return original.apply(this, [event, ...args]);
      });
    };
  }

  private _outgoingRequestFunction(
    original: Func<ClientRequest>
  ): Func<ClientRequest> {
    const plugin = this;
    return function outgoingRequest(
      this: {},
      options: RequestOptions | string,
      ...args: unknown[]
    ): ClientRequest {
      if (!options) {
        return original.apply(this, [options, ...args]);
      }

      const { origin, pathname, method, optionsParsed } = Utils.getRequestInfo(
        options
      );
      const request: ClientRequest = original.apply(this, [
        optionsParsed,
        ...args,
      ]);

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
      plugin._tracer.bind(request);

      const operationName = `${method} ${pathname}`;
      const spanOptions = {
        kind: SpanKind.CLIENT,
      };
      const currentSpan = plugin._tracer.getCurrentSpan();
      // Checks if this outgoing request is part of an operation by checking
      // if there is a current span, if so, we create a child span. In
      // case there is no active span, this means that the outgoing request is
      // the first operation, therefore we create a span and call withSpan method.
      if (!currentSpan) {
        plugin._logger.debug('outgoingRequest starting a span without context');
        const span = plugin._startHttpSpan(operationName, spanOptions);
        return plugin._tracer.withSpan(
          span,
          plugin._getMakeRequestTraceFunction(request, optionsParsed, span)
        );
      } else {
        plugin._logger.debug('outgoingRequest starting a child span');
        const span = plugin._startHttpSpan(operationName, {
          kind: spanOptions.kind,
          parent: currentSpan,
        });
        return plugin._getMakeRequestTraceFunction(
          request,
          optionsParsed,
          span
        )();
      }
    };
  }

  private _startHttpSpan(name: string, options: SpanOptions) {
    return this._tracer
      .startSpan(name, options)
      .setAttribute(AttributeNames.COMPONENT, HttpPlugin.component);
  }
}

export const plugin = new HttpPlugin(
  HttpPlugin.component,
  process.versions.node
);
