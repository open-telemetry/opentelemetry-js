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
  MetricAttributes,
  SpanAttributes,
  SpanStatusCode,
  Span,
  context,
  SpanKind,
  Attributes,
} from '@opentelemetry/api';
import {
  ATTR_ERROR_TYPE,
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_REQUEST_METHOD_ORIGINAL,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_NETWORK_PEER_ADDRESS,
  ATTR_NETWORK_PEER_PORT,
  ATTR_NETWORK_PROTOCOL_VERSION,
  ATTR_SERVER_ADDRESS,
  ATTR_SERVER_PORT,
  ATTR_URL_FULL,
  NETTRANSPORTVALUES_IP_TCP,
  NETTRANSPORTVALUES_IP_UDP,
  SEMATTRS_HTTP_CLIENT_IP,
  SEMATTRS_HTTP_FLAVOR,
  SEMATTRS_HTTP_HOST,
  SEMATTRS_HTTP_METHOD,
  SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH,
  SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED,
  SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH,
  SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED,
  SEMATTRS_HTTP_ROUTE,
  SEMATTRS_HTTP_SCHEME,
  SEMATTRS_HTTP_SERVER_NAME,
  SEMATTRS_HTTP_STATUS_CODE,
  SEMATTRS_HTTP_TARGET,
  SEMATTRS_HTTP_URL,
  SEMATTRS_HTTP_USER_AGENT,
  SEMATTRS_NET_HOST_IP,
  SEMATTRS_NET_HOST_NAME,
  SEMATTRS_NET_HOST_PORT,
  SEMATTRS_NET_PEER_IP,
  SEMATTRS_NET_PEER_NAME,
  SEMATTRS_NET_PEER_PORT,
  SEMATTRS_NET_TRANSPORT,
} from '@opentelemetry/semantic-conventions';
import {
  IncomingHttpHeaders,
  IncomingMessage,
  OutgoingHttpHeaders,
  RequestOptions,
  ServerResponse,
} from 'http';
import { getRPCMetadata, RPCType } from '@opentelemetry/core';
import * as url from 'url';
import { AttributeNames } from './enums/AttributeNames';
import {
  Err,
  IgnoreMatcher,
  ParsedRequestOptions,
  SemconvStability,
} from './types';

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
  kind: SpanKind,
  statusCode?: number
): SpanStatusCode => {
  const upperBound = kind === SpanKind.CLIENT ? 400 : 500;
  // 1xx, 2xx, 3xx are OK on client and server
  // 4xx is OK on server
  if (statusCode && statusCode >= 100 && statusCode < upperBound) {
    return SpanStatusCode.UNSET;
  }

  // All other codes are error
  return SpanStatusCode.ERROR;
};

/**
 * Check whether the given obj match pattern
 * @param constant e.g URL of request
 * @param pattern Match pattern
 */
export const satisfiesPattern = (
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
  onException?: (error: unknown) => void
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
 * @param {SemconvStability} semconvStability determines which semconv version to use
 */
export const setSpanWithError = (
  span: Span,
  error: Err,
  semconvStability: SemconvStability
): void => {
  const message = error.message;

  if ((semconvStability & SemconvStability.OLD) === SemconvStability.OLD) {
    span.setAttribute(AttributeNames.HTTP_ERROR_NAME, error.name);
    span.setAttribute(AttributeNames.HTTP_ERROR_MESSAGE, message);
  }

  if (
    (semconvStability & SemconvStability.STABLE) ===
    SemconvStability.STABLE
  ) {
    span.setAttribute(ATTR_ERROR_TYPE, error.name);
  }

  span.setStatus({ code: SpanStatusCode.ERROR, message });
  span.recordException(error);
};

/**
 * Adds attributes for request content-length and content-encoding HTTP headers
 * @param { IncomingMessage } Request object whose headers will be analyzed
 * @param { SpanAttributes } SpanAttributes object to be modified
 */
export const setRequestContentLengthAttribute = (
  request: IncomingMessage,
  attributes: SpanAttributes
): void => {
  const length = getContentLength(request.headers);
  if (length === null) return;

  if (isCompressed(request.headers)) {
    attributes[SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH] = length;
  } else {
    attributes[SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED] = length;
  }
};

/**
 * Adds attributes for response content-length and content-encoding HTTP headers
 * @param { IncomingMessage } Response object whose headers will be analyzed
 * @param { SpanAttributes } SpanAttributes object to be modified
 *
 * @deprecated this is for an older version of semconv. It is retained for compatibility using OTEL_SEMCONV_STABILITY_OPT_IN
 */
export const setResponseContentLengthAttribute = (
  response: IncomingMessage,
  attributes: SpanAttributes
): void => {
  const length = getContentLength(response.headers);
  if (length === null) return;

  if (isCompressed(response.headers)) {
    attributes[SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH] = length;
  } else {
    attributes[SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED] = length;
  }
};

function getContentLength(
  headers: OutgoingHttpHeaders | IncomingHttpHeaders
): number | null {
  const contentLengthHeader = headers['content-length'];
  if (contentLengthHeader === undefined) return null;

  const contentLength = parseInt(contentLengthHeader as string, 10);
  if (isNaN(contentLength)) return null;

  return contentLength;
}

export const isCompressed = (
  headers: OutgoingHttpHeaders | IncomingHttpHeaders
): boolean => {
  const encoding = headers['content-encoding'];

  return !!encoding && encoding !== 'identity';
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
): {
  origin: string;
  pathname: string;
  method: string;
  optionsParsed: RequestOptions;
} => {
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
    optionsParsed = Object.assign(
      { protocol: options.host ? 'http:' : undefined },
      options
    );
    pathname = (options as url.URL).pathname;
    if (!pathname && optionsParsed.path) {
      pathname = url.parse(optionsParsed.path).pathname || '/';
    }
    const hostname =
      optionsParsed.host ||
      (optionsParsed.port != null
        ? `${optionsParsed.hostname}${optionsParsed.port}`
        : optionsParsed.hostname);
    origin = `${optionsParsed.protocol || 'http:'}//${hostname}`;
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

export const extractHostnameAndPort = (
  requestOptions: Pick<
    ParsedRequestOptions,
    'hostname' | 'host' | 'port' | 'protocol'
  >
): { hostname: string; port: number | string } => {
  if (requestOptions.hostname && requestOptions.port) {
    return { hostname: requestOptions.hostname, port: requestOptions.port };
  }
  const matches = requestOptions.host?.match(/^([^:/ ]+)(:\d{1,5})?/) || null;
  const hostname =
    requestOptions.hostname || (matches === null ? 'localhost' : matches[1]);
  let port = requestOptions.port;
  if (!port) {
    if (matches && matches[2]) {
      // remove the leading ":". The extracted port would be something like ":8080"
      port = matches[2].substring(1);
    } else {
      port = requestOptions.protocol === 'https:' ? '443' : '80';
    }
  }
  return { hostname, port };
};

/**
 * Returns outgoing request attributes scoped to the options passed to the request
 * @param {ParsedRequestOptions} requestOptions the same options used to make the request
 * @param {{ component: string, hostname: string, hookAttributes?: SpanAttributes }} options used to pass data needed to create attributes
 * @param {SemconvStability} semconvStability determines which semconv version to use
 */
export const getOutgoingRequestAttributes = (
  requestOptions: ParsedRequestOptions,
  options: {
    component: string;
    hostname: string;
    port: string | number;
    hookAttributes?: SpanAttributes;
  },
  semconvStability: SemconvStability
): SpanAttributes => {
  const hostname = options.hostname;
  const port = options.port;
  const requestMethod = requestOptions.method;
  const method = requestMethod ? requestMethod.toUpperCase() : 'GET';
  const headers = requestOptions.headers || {};
  const userAgent = headers['user-agent'];
  const urlFull = getAbsoluteUrl(
    requestOptions,
    headers,
    `${options.component}:`
  );
  const oldAttributes: SpanAttributes = {
    [SEMATTRS_HTTP_URL]: urlFull,
    [SEMATTRS_HTTP_METHOD]: method,
    [SEMATTRS_HTTP_TARGET]: requestOptions.path || '/',
    [SEMATTRS_NET_PEER_NAME]: hostname,
    [SEMATTRS_HTTP_HOST]: headers.host ?? `${hostname}:${port}`,
  };

  const newAttributes: Attributes = {
    // Required attributes
    [ATTR_HTTP_REQUEST_METHOD]: method,
    [ATTR_SERVER_ADDRESS]: hostname,
    [ATTR_SERVER_PORT]: Number(port),
    [ATTR_URL_FULL]: urlFull,
    // leaving out protocol version, it is not yet negotiated
    // leaving out protocol name, it is only required when protocol version is set
    // retries and redirects not supported

    // Opt-in attributes left off for now
  };

  // conditionally required if request method required case normalization
  if (requestMethod && method !== requestMethod) {
    newAttributes[ATTR_HTTP_REQUEST_METHOD_ORIGINAL] = requestMethod;
  }

  if (userAgent !== undefined) {
    oldAttributes[SEMATTRS_HTTP_USER_AGENT] = userAgent;
  }

  switch (semconvStability) {
    case SemconvStability.STABLE:
      return Object.assign(newAttributes, options.hookAttributes);
    case SemconvStability.OLD:
      return Object.assign(oldAttributes, options.hookAttributes);
  }

  return Object.assign(oldAttributes, newAttributes, options.hookAttributes);
};

/**
 * Returns outgoing request Metric attributes scoped to the request data
 * @param {SpanAttributes} spanAttributes the span attributes
 */
export const getOutgoingRequestMetricAttributes = (
  spanAttributes: SpanAttributes
): MetricAttributes => {
  const metricAttributes: MetricAttributes = {};
  metricAttributes[SEMATTRS_HTTP_METHOD] = spanAttributes[SEMATTRS_HTTP_METHOD];
  metricAttributes[SEMATTRS_NET_PEER_NAME] =
    spanAttributes[SEMATTRS_NET_PEER_NAME];
  //TODO: http.url attribute, it should substitute any parameters to avoid high cardinality.
  return metricAttributes;
};

/**
 * Returns attributes related to the kind of HTTP protocol used
 * @param {string} [kind] Kind of HTTP protocol used: "1.0", "1.1", "2", "SPDY" or "QUIC".
 */
export const setAttributesFromHttpKind = (
  kind: string | undefined,
  attributes: SpanAttributes
): void => {
  if (kind) {
    attributes[SEMATTRS_HTTP_FLAVOR] = kind;
    if (kind.toUpperCase() !== 'QUIC') {
      attributes[SEMATTRS_NET_TRANSPORT] = NETTRANSPORTVALUES_IP_TCP;
    } else {
      attributes[SEMATTRS_NET_TRANSPORT] = NETTRANSPORTVALUES_IP_UDP;
    }
  }
};

/**
 * Returns outgoing request attributes scoped to the response data
 * @param {IncomingMessage} response the response object
 * @param {SemconvStability} semconvStability determines which semconv version to use
 */
export const getOutgoingRequestAttributesOnResponse = (
  response: IncomingMessage,
  semconvStability: SemconvStability
): SpanAttributes => {
  const { statusCode, statusMessage, httpVersion, socket } = response;
  const oldAttributes: SpanAttributes = {};
  const stableAttributes: Attributes = {};

  if (statusCode != null) {
    stableAttributes[ATTR_HTTP_RESPONSE_STATUS_CODE] = statusCode;
  }

  if (socket) {
    const { remoteAddress, remotePort } = socket;
    oldAttributes[SEMATTRS_NET_PEER_IP] = remoteAddress;
    oldAttributes[SEMATTRS_NET_PEER_PORT] = remotePort;

    // Recommended
    stableAttributes[ATTR_NETWORK_PEER_ADDRESS] = remoteAddress;
    stableAttributes[ATTR_NETWORK_PEER_PORT] = remotePort;
    stableAttributes[ATTR_NETWORK_PROTOCOL_VERSION] = response.httpVersion;
  }
  setResponseContentLengthAttribute(response, oldAttributes);

  if (statusCode) {
    oldAttributes[SEMATTRS_HTTP_STATUS_CODE] = statusCode;
    oldAttributes[AttributeNames.HTTP_STATUS_TEXT] = (
      statusMessage || ''
    ).toUpperCase();
  }

  setAttributesFromHttpKind(httpVersion, oldAttributes);

  switch (semconvStability) {
    case SemconvStability.STABLE:
      return stableAttributes;
    case SemconvStability.OLD:
      return oldAttributes;
  }

  return Object.assign(oldAttributes, stableAttributes);
};

/**
 * Returns outgoing request Metric attributes scoped to the response data
 * @param {SpanAttributes} spanAttributes the span attributes
 */
export const getOutgoingRequestMetricAttributesOnResponse = (
  spanAttributes: SpanAttributes
): MetricAttributes => {
  const metricAttributes: MetricAttributes = {};
  metricAttributes[SEMATTRS_NET_PEER_PORT] =
    spanAttributes[SEMATTRS_NET_PEER_PORT];
  metricAttributes[SEMATTRS_HTTP_STATUS_CODE] =
    spanAttributes[SEMATTRS_HTTP_STATUS_CODE];
  metricAttributes[SEMATTRS_HTTP_FLAVOR] = spanAttributes[SEMATTRS_HTTP_FLAVOR];
  return metricAttributes;
};

/**
 * Returns incoming request attributes scoped to the request data
 * @param {IncomingMessage} request the request object
 * @param {{ component: string, serverName?: string, hookAttributes?: SpanAttributes }} options used to pass data needed to create attributes
 */
export const getIncomingRequestAttributes = (
  request: IncomingMessage,
  options: {
    component: string;
    serverName?: string;
    hookAttributes?: SpanAttributes;
  }
): SpanAttributes => {
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
  const attributes: SpanAttributes = {
    [SEMATTRS_HTTP_URL]: getAbsoluteUrl(
      requestUrl,
      headers,
      `${options.component}:`
    ),
    [SEMATTRS_HTTP_HOST]: host,
    [SEMATTRS_NET_HOST_NAME]: hostname,
    [SEMATTRS_HTTP_METHOD]: method,
    [SEMATTRS_HTTP_SCHEME]: options.component,
  };

  if (typeof ips === 'string') {
    attributes[SEMATTRS_HTTP_CLIENT_IP] = ips.split(',')[0];
  }

  if (typeof serverName === 'string') {
    attributes[SEMATTRS_HTTP_SERVER_NAME] = serverName;
  }

  if (requestUrl) {
    attributes[SEMATTRS_HTTP_TARGET] = requestUrl.path || '/';
  }

  if (userAgent !== undefined) {
    attributes[SEMATTRS_HTTP_USER_AGENT] = userAgent;
  }
  setRequestContentLengthAttribute(request, attributes);
  setAttributesFromHttpKind(httpVersion, attributes);
  return Object.assign(attributes, options.hookAttributes);
};

/**
 * Returns incoming request Metric attributes scoped to the request data
 * @param {SpanAttributes} spanAttributes the span attributes
 * @param {{ component: string }} options used to pass data needed to create attributes
 */
export const getIncomingRequestMetricAttributes = (
  spanAttributes: SpanAttributes
): MetricAttributes => {
  const metricAttributes: MetricAttributes = {};
  metricAttributes[SEMATTRS_HTTP_SCHEME] = spanAttributes[SEMATTRS_HTTP_SCHEME];
  metricAttributes[SEMATTRS_HTTP_METHOD] = spanAttributes[SEMATTRS_HTTP_METHOD];
  metricAttributes[SEMATTRS_NET_HOST_NAME] =
    spanAttributes[SEMATTRS_NET_HOST_NAME];
  metricAttributes[SEMATTRS_HTTP_FLAVOR] = spanAttributes[SEMATTRS_HTTP_FLAVOR];
  //TODO: http.target attribute, it should substitute any parameters to avoid high cardinality.
  return metricAttributes;
};

/**
 * Returns incoming request attributes scoped to the response data
 * @param {(ServerResponse & { socket: Socket; })} response the response object
 */
export const getIncomingRequestAttributesOnResponse = (
  request: IncomingMessage,
  response: ServerResponse
): SpanAttributes => {
  // take socket from the request,
  // since it may be detached from the response object in keep-alive mode
  const { socket } = request;
  const { statusCode, statusMessage } = response;

  const rpcMetadata = getRPCMetadata(context.active());
  const attributes: SpanAttributes = {};
  if (socket) {
    const { localAddress, localPort, remoteAddress, remotePort } = socket;
    attributes[SEMATTRS_NET_HOST_IP] = localAddress;
    attributes[SEMATTRS_NET_HOST_PORT] = localPort;
    attributes[SEMATTRS_NET_PEER_IP] = remoteAddress;
    attributes[SEMATTRS_NET_PEER_PORT] = remotePort;
  }
  attributes[SEMATTRS_HTTP_STATUS_CODE] = statusCode;
  attributes[AttributeNames.HTTP_STATUS_TEXT] = (
    statusMessage || ''
  ).toUpperCase();

  if (rpcMetadata?.type === RPCType.HTTP && rpcMetadata.route !== undefined) {
    attributes[SEMATTRS_HTTP_ROUTE] = rpcMetadata.route;
  }
  return attributes;
};

/**
 * Returns incoming request Metric attributes scoped to the request data
 * @param {SpanAttributes} spanAttributes the span attributes
 */
export const getIncomingRequestMetricAttributesOnResponse = (
  spanAttributes: SpanAttributes
): MetricAttributes => {
  const metricAttributes: MetricAttributes = {};
  metricAttributes[SEMATTRS_HTTP_STATUS_CODE] =
    spanAttributes[SEMATTRS_HTTP_STATUS_CODE];
  metricAttributes[SEMATTRS_NET_HOST_PORT] =
    spanAttributes[SEMATTRS_NET_HOST_PORT];
  if (spanAttributes[SEMATTRS_HTTP_ROUTE] !== undefined) {
    metricAttributes[SEMATTRS_HTTP_ROUTE] = spanAttributes[SEMATTRS_HTTP_ROUTE];
  }
  return metricAttributes;
};

export function headerCapture(type: 'request' | 'response', headers: string[]) {
  const normalizedHeaders = new Map<string, string>();
  for (let i = 0, len = headers.length; i < len; i++) {
    const capturedHeader = headers[i].toLowerCase();
    normalizedHeaders.set(capturedHeader, capturedHeader.replace(/-/g, '_'));
  }

  return (
    span: Span,
    getHeader: (key: string) => undefined | string | string[] | number
  ) => {
    for (const capturedHeader of normalizedHeaders.keys()) {
      const value = getHeader(capturedHeader);

      if (value === undefined) {
        continue;
      }

      const normalizedHeader = normalizedHeaders.get(capturedHeader);
      const key = `http.${type}.header.${normalizedHeader}`;

      if (typeof value === 'string') {
        span.setAttribute(key, [value]);
      } else if (Array.isArray(value)) {
        span.setAttribute(key, value);
      } else {
        span.setAttribute(key, [value]);
      }
    }
  };
}
