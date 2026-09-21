/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  Attributes,
  Context,
  DiagLogger,
  HrTime,
  Span,
} from '@opentelemetry/api';
import { context, propagation } from '@opentelemetry/api';
import { safeExecuteInTheMiddle } from '@opentelemetry/instrumentation';
import {
  ATTR_SERVER_ADDRESS,
  ATTR_SERVER_PORT,
  ATTR_URL_FULL,
} from '@opentelemetry/semantic-conventions';
import * as diagch from 'diagnostics_channel';
import type * as http from 'http';
import {
  getAbsoluteUrl,
  parseHttpAuthority,
  parseHttpRequestTarget,
} from './http-url';
import type { HttpInstrumentationConfig } from './types';
import { extractHostnameAndPort, getRequestInfo } from './utils';

const CLIENT_REQUEST_CREATED_CHANNEL = 'http.client.request.created';
const SERVER_REQUEST_START_CHANNEL = 'http.server.request.start';

/**
 * Whether `node:http` publishes the diagnostics channels this instrumentation
 * subscribes to (Node.js >=22.12.0, or >=23.2.0 on the 23.x line). Publishing
 * cannot be probed at runtime, so the version is checked instead.
 */
export function isHttpDiagnosticsChannelSupported(
  nodeVersion: string | undefined = typeof process !== 'undefined'
    ? process.versions?.node
    : undefined
): boolean {
  if (typeof nodeVersion !== 'string') {
    return false;
  }
  const match = /^(\d+)\.(\d+)\./.exec(nodeVersion);
  if (match === null) {
    return false;
  }
  const major = Number(match[1]);
  const minor = Number(match[2]);
  if (major === 22) {
    return minor >= 12;
  }
  if (major === 23) {
    return minor >= 2;
  }
  return major > 23;
}

/**
 * What `HttpInstrumentation._startOutgoingHttpSpan` returns for a traced
 * request.
 */
export interface StartedOutgoingRequestSpan {
  span: Span;
  startTime: HrTime;
  metricAttributes: Attributes;
  parentContext: Context;
  requestContext: Context;
}

/**
 * The subset of `HttpInstrumentation` the channel handlers delegate to.
 */
export interface HttpDiagnosticsChannelHost {
  diag: DiagLogger;
  getConfig(): HttpInstrumentationConfig;
  startOutgoingHttpSpan(
    component: 'http' | 'https',
    optionsParsed: http.RequestOptions,
    method: string
  ): StartedOutgoingRequestSpan | undefined;
  traceClientRequest(
    request: http.ClientRequest,
    span: Span,
    startTime: HrTime,
    metricAttributes: Attributes,
    finalizeRequestAttributes?: () => void
  ): http.ClientRequest;
  wrapServerEmit(server: http.Server, component: 'http' | 'https'): void;
  unwrapServerEmit(server: http.Server): void;
}

interface ListenerRecord {
  name: string;
  unsubscribe: () => void;
}

/**
 * Rebuilds the `RequestOptions` that `getRequestInfo` expects from an already
 * created `http.ClientRequest`. The request authority comes from an
 * absolute-form target when present, and from the Host header otherwise.
 */
function recoverRequestOptions(
  request: http.ClientRequest,
  initialOptions?: http.RequestOptions
): http.RequestOptions {
  const headers = request.getHeaders();
  const hostAuthority =
    typeof headers.host === 'string'
      ? parseHttpAuthority(headers.host)
      : undefined;
  let authority = hostAuthority?.value;
  let port: number | string | undefined = hostAuthority?.port;
  let protocol = request.protocol;

  if (hostAuthority === undefined && initialOptions !== undefined) {
    const initialDestination = extractHostnameAndPort(initialOptions);
    const requestHost = request.host.replace(/^\[|\]$/g, '').toLowerCase();
    if (initialDestination.hostname.toLowerCase() === requestHost) {
      port = initialDestination.port;
    }
  }

  // An `Authorization` header set directly by the caller cannot be told apart
  // from one generated from the `auth` option, so `url.full` may carry
  // redacted credentials even when the request URL itself carried none.
  let auth: string | undefined;
  const authHeader = headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Basic ')) {
    auth = Buffer.from(authHeader.slice(6), 'base64').toString('utf8');
  }

  // A proxy request may use an absolute-form request target; recover its
  // origin authority and the origin-form path the caller requested.
  let path = request.path;
  const requestTarget = parseHttpRequestTarget(path, request.method);
  if (requestTarget?.form === 'absolute-form') {
    authority = requestTarget.authority.value;
    protocol = requestTarget.protocol;
    port =
      requestTarget.authority.port ??
      (requestTarget.protocol === 'https:' ? 443 : 80);
    path = `${requestTarget.pathname}${requestTarget.search}`;
  } else if (requestTarget?.form === 'authority-form') {
    authority = requestTarget.authority.value;
    port = requestTarget.authority.port;
    path = '';
  }

  return {
    method: request.method,
    port,
    protocol,
    host: authority ?? request.host,
    path,
    auth,
    headers,
  };
}

function updateOutgoingRequestAuthority(
  component: 'http' | 'https',
  optionsParsed: http.RequestOptions,
  span: Span,
  metricAttributes: Attributes,
  redactedQueryParams?: string[]
): void {
  const { hostname, port } = extractHostnameAndPort(optionsParsed);
  span.setAttributes({
    [ATTR_SERVER_ADDRESS]: hostname,
    [ATTR_SERVER_PORT]: Number(port),
    [ATTR_URL_FULL]: getAbsoluteUrl(
      optionsParsed,
      (optionsParsed.headers as http.OutgoingHttpHeaders | undefined) ?? {},
      `${component}:`,
      redactedQueryParams
    ),
  });
  metricAttributes[ATTR_SERVER_ADDRESS] = hostname;
  metricAttributes[ATTR_SERVER_PORT] = Number(port);
}

/**
 * Create spans from the diagnostics channel messages published by
 * `node:http`.
 */
export class HttpDiagnosticsChannelSubscription {
  private _channelSubs: ListenerRecord[] = [];
  private _wrappedServers = new WeakSet<http.Server>();
  private _wrappedServerRefs = new Set<WeakRef<http.Server>>();
  private _finalization = new FinalizationRegistry<WeakRef<http.Server>>(ref =>
    this._wrappedServerRefs.delete(ref)
  );

  private _host: HttpDiagnosticsChannelHost;

  constructor(host: HttpDiagnosticsChannelHost) {
    this._host = host;
  }

  subscribe(): void {
    if (this._channelSubs.length > 0) {
      return;
    }
    const config = this._host.getConfig();
    if (!config.disableOutgoingRequestInstrumentation) {
      this._subscribeToChannel(CLIENT_REQUEST_CREATED_CHANNEL, message =>
        this._onClientRequestCreated(message)
      );
    }
    if (!config.disableIncomingRequestInstrumentation) {
      this._subscribeToChannel(SERVER_REQUEST_START_CHANNEL, message =>
        this._onServerRequestStart(message)
      );
    }
  }

  unsubscribe(): void {
    this._channelSubs.forEach(sub => sub.unsubscribe());
    this._channelSubs.length = 0;
    for (const ref of this._wrappedServerRefs) {
      const server = ref.deref();
      if (server !== undefined) {
        this._host.unwrapServerEmit(server);
        this._wrappedServers.delete(server);
      }
      this._finalization.unregister(ref);
    }
    this._wrappedServerRefs.clear();
  }

  private _subscribeToChannel(
    name: string,
    onMessage: (message: unknown) => void
  ): void {
    const handler = (message: unknown) => {
      safeExecuteInTheMiddle(
        () => onMessage(message),
        error => {
          if (error != null) {
            this._host.diag.error(`caught ${name} handler error: `, error);
          }
        },
        true
      );
    };
    diagch.subscribe(name, handler);
    this._channelSubs.push({
      name,
      unsubscribe: () => diagch.unsubscribe(name, handler),
    });
  }

  private _onClientRequestCreated(message: unknown): void {
    const { request } = (message ?? {}) as { request?: http.ClientRequest };
    if (request == null) {
      return;
    }

    const component = request.protocol === 'https:' ? 'https' : 'http';
    const initialOptions = recoverRequestOptions(request);
    const { method, optionsParsed } = getRequestInfo(
      this._host.diag,
      initialOptions
    );

    const started = this._host.startOutgoingHttpSpan(
      component,
      optionsParsed,
      method
    );
    if (started === undefined) {
      return;
    }
    const { span, startTime, metricAttributes, parentContext, requestContext } =
      started;
    const redactedQueryParams = this._host
      .getConfig()
      .redactedQueryParams?.slice();
    let requestAttributesFinalized = false;
    const finalizeRequestAttributes = () => {
      if (requestAttributesFinalized) {
        return;
      }
      requestAttributesFinalized = true;
      const { optionsParsed: finalOptions } = getRequestInfo(
        this._host.diag,
        recoverRequestOptions(request, optionsParsed)
      );
      updateOutgoingRequestAuthority(
        component,
        finalOptions,
        span,
        metricAttributes,
        redactedQueryParams
      );
    };

    // The channel fires before the headers are flushed, except for
    // `Expect: 100-continue` requests, which flush them while the request is
    // created; those still get a span, but nothing can be injected.
    if (!request.headersSent) {
      propagation.inject(requestContext, request, {
        set: (req, key, value) => req.setHeader(key, value),
      });
    }

    context.bind(parentContext, request);
    context.with(requestContext, () => {
      this._host.traceClientRequest(
        request,
        span,
        startTime,
        metricAttributes,
        finalizeRequestAttributes
      );
    });

    this._host.diag.debug(`${component} instrumentation outgoingRequest`);
  }

  private _onServerRequestStart(message: unknown): void {
    const { request, server } = (message ?? {}) as {
      request?: http.IncomingMessage;
      server?: http.Server;
    };
    if (request == null || server == null) {
      return;
    }
    if (this._wrappedServers.has(server)) {
      return;
    }

    // The channel is published right before the server emits 'request', so
    // wrapping `emit` here covers the current request as well.
    const component = (request.socket as { encrypted?: boolean })?.encrypted
      ? 'https'
      : 'http';
    this._host.wrapServerEmit(server, component);
    this._wrappedServers.add(server);
    const ref = new WeakRef(server);
    this._wrappedServerRefs.add(ref);
    this._finalization.register(server, ref, ref);
  }
}
