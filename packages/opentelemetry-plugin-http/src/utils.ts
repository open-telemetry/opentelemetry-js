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
import { Attributes, CanonicalCode, Span, Status } from '@opentelemetry/api';
import {
  HttpAttribute,
  GeneralAttribute,
} from '@opentelemetry/semantic-conventions';
import {
  ClientRequest,
  IncomingHttpHeaders,
  IncomingMessage,
  OutgoingHttpHeaders,
  RequestOptions,
  ServerResponse,
} from 'http';
import { Socket } from 'net';
import * as url from 'url';
import {
  Err,
  IgnoreMatcher,
  ParsedRequestOptions,
  SpecialHttpStatusCodeMapping,
} from './types';

/**
 * Specific header used by exporters to "mark" outgoing request to avoid creating
 * spans for request that export them which would create a infinite loop.
 */
export const OT_REQUEST_HEADER = 'x-opentelemetry-outgoing-request';

export const HTTP_STATUS_SPECIAL_CASES: SpecialHttpStatusCodeMapping = {
  401: CanonicalCode.UNAUTHENTICATED,
  403: CanonicalCode.PERMISSION_DENIED,
  404: CanonicalCode.NOT_FOUND,
  429: CanonicalCode.RESOURCE_EXHAUSTED,
  499: CanonicalCode.CANCELLED,
  501: CanonicalCode.UNIMPLEMENTED,
  503: CanonicalCode.UNAVAILABLE,
  504: CanonicalCode.DEADLINE_EXCEEDED,
  598: CanonicalCode.INTERNAL,
  599: CanonicalCode.INTERNAL,
};

/**
 * Get an absolute url
 */
export const getAbsoluteUrl = (
  requestUrl: ParsedRequestOptions | null,
  headers: IncomingHttpHeaders | OutgoingHttpHeaders,
  fallbackProtocol = 'http:'
): string => {
  const reqUrlObject = requestUrl || {};
  const protocol = reqUrlObject.protocol || fallbackProtocol;
  const port = (reqUrlObject.port || '').toString();
  const path = reqUrlObject.path || '/';
  let host =
    reqUrlObject.host || reqUrlObject.hostname || headers.host || 'localhost';

  // if there is no port in host and there is a port
  // it should be displayed if it's not 80 and 443 (default ports)
  if (
    (host as string).indexOf(':') === -1 &&
    port &&
    port !== '80' &&
    port !== '443'
  ) {
    host += `:${port}`;
  }

  return `${protocol}//${host}${path}`;
};
/**
 * Parse status code from HTTP response. [More details](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/data-http.md#status)
 */
export const parseResponseStatus = (
  statusCode: number
): Omit<Status, 'message'> => {
  // search for special case
  const code: number | undefined = HTTP_STATUS_SPECIAL_CASES[statusCode];

  if (code !== undefined) {
    return { code };
  }

  // 0xx are unknown
  if (statusCode < 100) {
    return { code: CanonicalCode.UNKNOWN };
  }

  // 1xx, 2xx, 3xx are OK
  if (statusCode < 400) {
    return { code: CanonicalCode.OK };
  }

  // 4xx are client errors
  if (statusCode < 500) {
    return { code: CanonicalCode.INVALID_ARGUMENT };
  }

  // 5xx are internal errors
  if (statusCode < 512) {
    return { code: CanonicalCode.INTERNAL };
  }

  // All other codes are unknown
  return { code: CanonicalCode.UNKNOWN };
};

/**
 * Returns whether the Expect header is on the given options object.
 * @param options Options for http.request.
 */
export const hasExpectHeader = (options: RequestOptions): boolean => {
  if (!options.headers) {
    return false;
  }

  const keys = Object.keys(options.headers);
  return !!keys.find(key => key.toLowerCase() === 'expect');
};

/**
 * Check whether the given obj match pattern
 * @param constant e.g URL of request
 * @param obj obj to inspect
 * @param pattern Match pattern
 */
export const satisfiesPattern = <T>(
  constant: string,
  pattern: IgnoreMatcher
): boolean => {
  if (typeof pattern === 'string') {
    return pattern === constant;
  } else if (pattern instanceof RegExp) {
    return pattern.test(constant);
  } else if (typeof pattern === 'function') {
    return pattern(constant);
  } else {
    throw new TypeError('Pattern is in unsupported datatype');
  }
};

/**
 * Check whether the given request is ignored by configuration
 * It will not re-throw exceptions from `list` provided by the client
 * @param constant e.g URL of request
 * @param [list] List of ignore patterns
 * @param [onException] callback for doing something when an exception has
 *     occurred
 */
export const isIgnored = (
  constant: string,
  list?: IgnoreMatcher[],
  onException?: (error: Error) => void
): boolean => {
  if (!list) {
    // No ignored urls - trace everything
    return false;
  }
  // Try/catch outside the loop for failing fast
  try {
    for (const pattern of list) {
      if (satisfiesPattern(constant, pattern)) {
        return true;
      }
    }
  } catch (e) {
    if (onException) {
      onException(e);
    }
  }

  return false;
};

/**
 * Sets the span with the error passed in params
 * @param {Span} span the span that need to be set
 * @param {Error} error error that will be set to span
 * @param {(IncomingMessage | ClientRequest)} [obj] used for enriching the status by checking the statusCode.
 */
export const setSpanWithError = (
  span: Span,
  error: Err,
  obj?: IncomingMessage | ClientRequest
) => {
  const message = error.message;

  span.setAttributes({
    [HttpAttribute.HTTP_ERROR_NAME]: error.name,
    [HttpAttribute.HTTP_ERROR_MESSAGE]: message,
  });

  if (!obj) {
    span.setStatus({ code: CanonicalCode.UNKNOWN, message });
    return;
  }

  let status: Status;
  if ((obj as IncomingMessage).statusCode) {
    status = parseResponseStatus((obj as IncomingMessage).statusCode!);
  } else if ((obj as ClientRequest).aborted) {
    status = { code: CanonicalCode.ABORTED };
  } else {
    status = { code: CanonicalCode.UNKNOWN };
  }

  status.message = message;

  span.setStatus(status);
};

/**
 * Makes sure options is an url object
 * return an object with default value and parsed options
 * @param options original options for the request
 * @param [extraOptions] additional options for the request
 */
export const getRequestInfo = (
  options: url.URL | RequestOptions | string,
  extraOptions?: RequestOptions
) => {
  let pathname = '/';
  let origin = '';
  let optionsParsed: RequestOptions;
  if (typeof options === 'string') {
    optionsParsed = url.parse(options);
    pathname = (optionsParsed as url.UrlWithStringQuery).pathname || '/';
    origin = `${optionsParsed.protocol || 'http:'}//${optionsParsed.host}`;
    if (extraOptions !== undefined) {
      Object.assign(optionsParsed, extraOptions);
    }
  } else if (options instanceof url.URL) {
    optionsParsed = {
      protocol: options.protocol,
      hostname:
        typeof options.hostname === 'string' && options.hostname.startsWith('[')
          ? options.hostname.slice(1, -1)
          : options.hostname,
      path: `${options.pathname || ''}${options.search || ''}`,
    };
    if (options.port !== '') {
      optionsParsed.port = Number(options.port);
    }
    if (options.username || options.password) {
      optionsParsed.auth = `${options.username}:${options.password}`;
    }
    pathname = options.pathname;
    origin = options.origin;
    if (extraOptions !== undefined) {
      Object.assign(optionsParsed, extraOptions);
    }
  } else {
    optionsParsed = Object.assign({}, options);
    pathname = (options as url.URL).pathname;
    if (!pathname && optionsParsed.path) {
      pathname = url.parse(optionsParsed.path).pathname || '/';
    }
    origin = `${optionsParsed.protocol || 'http:'}//${
      optionsParsed.host || `${optionsParsed.hostname}:${optionsParsed.port}`
    }`;
  }

  if (hasExpectHeader(optionsParsed)) {
    optionsParsed.headers = Object.assign({}, optionsParsed.headers);
  } else if (!optionsParsed.headers) {
    optionsParsed.headers = {};
  }
  // some packages return method in lowercase..
  // ensure upperCase for consistency
  const method = optionsParsed.method
    ? optionsParsed.method.toUpperCase()
    : 'GET';

  return { origin, pathname, method, optionsParsed };
};

/**
 * Makes sure options is of type string or object
 * @param options for the request
 */
export const isValidOptionsType = (options: unknown): boolean => {
  if (!options) {
    return false;
  }

  const type = typeof options;
  return type === 'string' || (type === 'object' && !Array.isArray(options));
};

/**
 * Check whether the given request should be ignored
 * Use case: Typically, exporter `SpanExporter` can use http module to send spans.
 * This will also generate spans (from the http-plugin) that will be sended through the exporter
 * and here we have loop.
 *
 * TODO: Refactor this logic when a solution is found in
 * https://github.com/open-telemetry/opentelemetry-specification/issues/530
 *
 *
 * @param {RequestOptions} options
 */
export const isOpenTelemetryRequest = (
  options: RequestOptions
): options is { headers: {} } & RequestOptions => {
  return !!(options && options.headers && options.headers[OT_REQUEST_HEADER]);
};

/**
 * Returns outgoing request attributes scoped to the options passed to the request
 * @param {ParsedRequestOptions} requestOptions the same options used to make the request
 * @param {{ component: string, hostname: string }} options used to pass data needed to create attributes
 */
export const getOutgoingRequestAttributes = (
  requestOptions: ParsedRequestOptions,
  options: { component: string; hostname: string }
): Attributes => {
  const host = requestOptions.host;
  const hostname =
    requestOptions.hostname ||
    host?.replace(/^(.*)(:[0-9]{1,5})/, '$1') ||
    'localhost';
  const requestMethod = requestOptions.method;
  const method = requestMethod ? requestMethod.toUpperCase() : 'GET';
  const headers = requestOptions.headers || {};
  const userAgent = headers['user-agent'];
  const attributes: Attributes = {
    [HttpAttribute.HTTP_URL]: getAbsoluteUrl(
      requestOptions,
      headers,
      `${options.component}:`
    ),
    [HttpAttribute.HTTP_METHOD]: method,
    [HttpAttribute.HTTP_TARGET]: requestOptions.path || '/',
    [GeneralAttribute.NET_PEER_NAME]: hostname,
  };

  if (userAgent !== undefined) {
    attributes[HttpAttribute.HTTP_USER_AGENT] = userAgent;
  }
  return attributes;
};

/**
 * Returns attributes related to the kind of HTTP protocol used
 * @param {string} [kind] Kind of HTTP protocol used: "1.0", "1.1", "2", "SPDY" or "QUIC".
 */
export const getAttributesFromHttpKind = (kind?: string): Attributes => {
  const attributes: Attributes = {};
  if (kind) {
    attributes[HttpAttribute.HTTP_FLAVOR] = kind;
    if (kind.toUpperCase() !== 'QUIC') {
      attributes[GeneralAttribute.NET_TRANSPORT] = GeneralAttribute.IP_TCP;
    } else {
      attributes[GeneralAttribute.NET_TRANSPORT] = GeneralAttribute.IP_UDP;
    }
  }
  return attributes;
};

/**
 * Returns outgoing request attributes scoped to the response data
 * @param {IncomingMessage} response the response object
 * @param {{ hostname: string }} options used to pass data needed to create attributes
 */
export const getOutgoingRequestAttributesOnResponse = (
  response: IncomingMessage,
  options: { hostname: string }
): Attributes => {
  const { statusCode, statusMessage, httpVersion, socket } = response;
  const { remoteAddress, remotePort } = socket;
  const attributes: Attributes = {
    [GeneralAttribute.NET_PEER_IP]: remoteAddress,
    [GeneralAttribute.NET_PEER_PORT]: remotePort,
    [HttpAttribute.HTTP_HOST]: `${options.hostname}:${remotePort}`,
  };

  if (statusCode) {
    attributes[HttpAttribute.HTTP_STATUS_CODE] = statusCode;
    attributes[HttpAttribute.HTTP_STATUS_TEXT] = (
      statusMessage || ''
    ).toUpperCase();
  }

  const httpKindAttributes = getAttributesFromHttpKind(httpVersion);
  return Object.assign(attributes, httpKindAttributes);
};

/**
 * Returns incoming request attributes scoped to the request data
 * @param {IncomingMessage} request the request object
 * @param {{ component: string, serverName?: string }} options used to pass data needed to create attributes
 */
export const getIncomingRequestAttributes = (
  request: IncomingMessage,
  options: { component: string; serverName?: string }
): Attributes => {
  const headers = request.headers;
  const userAgent = headers['user-agent'];
  const ips = headers['x-forwarded-for'];
  const method = request.method || 'GET';
  const httpVersion = request.httpVersion;
  const requestUrl = request.url ? url.parse(request.url) : null;
  const host = requestUrl?.host || headers.host;
  const hostname =
    requestUrl?.hostname ||
    host?.replace(/^(.*)(:[0-9]{1,5})/, '$1') ||
    'localhost';
  const serverName = options.serverName;
  const attributes: Attributes = {
    [HttpAttribute.HTTP_URL]: getAbsoluteUrl(
      requestUrl,
      headers,
      `${options.component}:`
    ),
    [HttpAttribute.HTTP_HOST]: host,
    [GeneralAttribute.NET_HOST_NAME]: hostname,
    [HttpAttribute.HTTP_METHOD]: method,
  };

  if (typeof ips === 'string') {
    attributes[HttpAttribute.HTTP_CLIENT_IP] = ips.split(',')[0];
  }

  if (typeof serverName === 'string') {
    attributes[HttpAttribute.HTTP_SERVER_NAME] = serverName;
  }

  if (requestUrl) {
    attributes[HttpAttribute.HTTP_ROUTE] = requestUrl.pathname || '/';
    attributes[HttpAttribute.HTTP_TARGET] = requestUrl.pathname || '/';
  }

  if (userAgent !== undefined) {
    attributes[HttpAttribute.HTTP_USER_AGENT] = userAgent;
  }

  const httpKindAttributes = getAttributesFromHttpKind(httpVersion);
  return Object.assign(attributes, httpKindAttributes);
};

/**
 * Returns incoming request attributes scoped to the response data
 * @param {(ServerResponse & { socket: Socket; })} response the response object
 */
export const getIncomingRequestAttributesOnResponse = (
  request: IncomingMessage & { __ot_middlewares?: string[] },
  response: ServerResponse & { socket: Socket }
): Attributes => {
  const { statusCode, statusMessage, socket } = response;
  const { localAddress, localPort, remoteAddress, remotePort } = socket;
  const { __ot_middlewares } = (request as unknown) as {
    [key: string]: unknown;
  };
  const route = Array.isArray(__ot_middlewares)
    ? __ot_middlewares
        .filter(path => path !== '/')
        .map(path => {
          return path[0] === '/' ? path : '/' + path;
        })
        .join('')
    : undefined;

  const attributes: Attributes = {
    [GeneralAttribute.NET_HOST_IP]: localAddress,
    [GeneralAttribute.NET_HOST_PORT]: localPort,
    [GeneralAttribute.NET_PEER_IP]: remoteAddress,
    [GeneralAttribute.NET_PEER_PORT]: remotePort,
    [HttpAttribute.HTTP_STATUS_CODE]: statusCode,
    [HttpAttribute.HTTP_STATUS_TEXT]: (statusMessage || '').toUpperCase(),
  };

  if (route !== undefined) {
    attributes[HttpAttribute.HTTP_ROUTE] = route;
  }
  return attributes;
};
