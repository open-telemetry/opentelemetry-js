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
} from '@opentelemetry/api';
import {
  NetTransportValues,
  SemanticAttributes,
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
import { Err, IgnoreMatcher, ParsedRequestOptions } from './types';

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
 */
export const setSpanWithError = (span: Span, error: Err): void => {
  const message = error.message;

  span.setAttributes({
    [AttributeNames.HTTP_ERROR_NAME]: error.name,
    [AttributeNames.HTTP_ERROR_MESSAGE]: message,
  });

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
    attributes[SemanticAttributes.HTTP_REQUEST_CONTENT_LENGTH] = length;
  } else {
    attributes[SemanticAttributes.HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED] =
      length;
  }
};

/**
 * Adds attributes for response content-length and content-encoding HTTP headers
 * @param { IncomingMessage } Response object whose headers will be analyzed
 * @param { SpanAttributes } SpanAttributes object to be modified
 */
export const setResponseContentLengthAttribute = (
  response: IncomingMessage,
  attributes: SpanAttributes
): void => {
  const length = getContentLength(response.headers);
  if (length === null) return;

  if (isCompressed(response.headers)) {
    attributes[SemanticAttributes.HTTP_RESPONSE_CONTENT_LENGTH] = length;
  } else {
    attributes[SemanticAttributes.HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED] =
      length;
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
 */
export const getOutgoingRequestAttributes = (
  requestOptions: ParsedRequestOptions,
  options: {
    component: string;
    hostname: string;
    port: string | number;
    hookAttributes?: SpanAttributes;
  }
): SpanAttributes => {
  const hostname = options.hostname;
  const port = options.port;
  const requestMethod = requestOptions.method;
  const method = requestMethod ? requestMethod.toUpperCase() : 'GET';
  const headers = requestOptions.headers || {};
  const userAgent = headers['user-agent'];
  const attributes: SpanAttributes = {
    [SemanticAttributes.HTTP_URL]: getAbsoluteUrl(
      requestOptions,
      headers,
      `${options.component}:`
    ),
    [SemanticAttributes.HTTP_METHOD]: method,
    [SemanticAttributes.HTTP_TARGET]: requestOptions.path || '/',
    [SemanticAttributes.NET_PEER_NAME]: hostname,
    [SemanticAttributes.HTTP_HOST]:
      requestOptions.headers?.host ?? `${hostname}:${port}`,
  };

  if (userAgent !== undefined) {
    attributes[SemanticAttributes.HTTP_USER_AGENT] = userAgent;
  }
  return Object.assign(attributes, options.hookAttributes);
};

/**
 * Returns outgoing request Metric attributes scoped to the request data
 * @param {SpanAttributes} spanAttributes the span attributes
 */
export const getOutgoingRequestMetricAttributes = (
  spanAttributes: SpanAttributes
): MetricAttributes => {
  const metricAttributes: MetricAttributes = {};
  metricAttributes[SemanticAttributes.HTTP_METHOD] =
    spanAttributes[SemanticAttributes.HTTP_METHOD];
  metricAttributes[SemanticAttributes.NET_PEER_NAME] =
    spanAttributes[SemanticAttributes.NET_PEER_NAME];
  //TODO: http.url attribute, it should susbtitute any parameters to avoid high cardinality.
  return metricAttributes;
};

/**
 * Returns attributes related to the kind of HTTP protocol used
 * @param {string} [kind] Kind of HTTP protocol used: "1.0", "1.1", "2", "SPDY" or "QUIC".
 */
export const getAttributesFromHttpKind = (kind?: string): SpanAttributes => {
  const attributes: SpanAttributes = {};
  if (kind) {
    attributes[SemanticAttributes.HTTP_FLAVOR] = kind;
    if (kind.toUpperCase() !== 'QUIC') {
      attributes[SemanticAttributes.NET_TRANSPORT] = NetTransportValues.IP_TCP;
    } else {
      attributes[SemanticAttributes.NET_TRANSPORT] = NetTransportValues.IP_UDP;
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
  response: IncomingMessage
): SpanAttributes => {
  const { statusCode, statusMessage, httpVersion, socket } = response;
  const { remoteAddress, remotePort } = socket;
  const attributes: SpanAttributes = {
    [SemanticAttributes.NET_PEER_IP]: remoteAddress,
    [SemanticAttributes.NET_PEER_PORT]: remotePort,
  };
  setResponseContentLengthAttribute(response, attributes);

  if (statusCode) {
    attributes[SemanticAttributes.HTTP_STATUS_CODE] = statusCode;
    attributes[AttributeNames.HTTP_STATUS_TEXT] = (
      statusMessage || ''
    ).toUpperCase();
  }

  const httpKindAttributes = getAttributesFromHttpKind(httpVersion);
  return Object.assign(attributes, httpKindAttributes);
};

/**
 * Returns outgoing request Metric attributes scoped to the response data
 * @param {SpanAttributes} spanAttributes the span attributes
 */
export const getOutgoingRequestMetricAttributesOnResponse = (
  spanAttributes: SpanAttributes
): MetricAttributes => {
  const metricAttributes: MetricAttributes = {};
  metricAttributes[SemanticAttributes.NET_PEER_PORT] =
    spanAttributes[SemanticAttributes.NET_PEER_PORT];
  metricAttributes[SemanticAttributes.HTTP_STATUS_CODE] =
    spanAttributes[SemanticAttributes.HTTP_STATUS_CODE];
  metricAttributes[SemanticAttributes.HTTP_FLAVOR] =
    spanAttributes[SemanticAttributes.HTTP_FLAVOR];
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
    [SemanticAttributes.HTTP_URL]: getAbsoluteUrl(
      requestUrl,
      headers,
      `${options.component}:`
    ),
    [SemanticAttributes.HTTP_HOST]: host,
    [SemanticAttributes.NET_HOST_NAME]: hostname,
    [SemanticAttributes.HTTP_METHOD]: method,
    [SemanticAttributes.HTTP_SCHEME]: options.component,
  };

  if (typeof ips === 'string') {
    attributes[SemanticAttributes.HTTP_CLIENT_IP] = ips.split(',')[0];
  }

  if (typeof serverName === 'string') {
    attributes[SemanticAttributes.HTTP_SERVER_NAME] = serverName;
  }

  if (requestUrl) {
    attributes[SemanticAttributes.HTTP_TARGET] = requestUrl.path || '/';
  }

  if (userAgent !== undefined) {
    attributes[SemanticAttributes.HTTP_USER_AGENT] = userAgent;
  }
  setRequestContentLengthAttribute(request, attributes);

  const httpKindAttributes = getAttributesFromHttpKind(httpVersion);
  return Object.assign(attributes, httpKindAttributes, options.hookAttributes);
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
  metricAttributes[SemanticAttributes.HTTP_SCHEME] =
    spanAttributes[SemanticAttributes.HTTP_SCHEME];
  metricAttributes[SemanticAttributes.HTTP_METHOD] =
    spanAttributes[SemanticAttributes.HTTP_METHOD];
  metricAttributes[SemanticAttributes.NET_HOST_NAME] =
    spanAttributes[SemanticAttributes.NET_HOST_NAME];
  metricAttributes[SemanticAttributes.HTTP_FLAVOR] =
    spanAttributes[SemanticAttributes.HTTP_FLAVOR];
  //TODO: http.target attribute, it should susbtitute any parameters to avoid high cardinality.
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
  const { localAddress, localPort, remoteAddress, remotePort } = socket;
  const rpcMetadata = getRPCMetadata(context.active());

  const attributes: SpanAttributes = {
    [SemanticAttributes.NET_HOST_IP]: localAddress,
    [SemanticAttributes.NET_HOST_PORT]: localPort,
    [SemanticAttributes.NET_PEER_IP]: remoteAddress,
    [SemanticAttributes.NET_PEER_PORT]: remotePort,
    [SemanticAttributes.HTTP_STATUS_CODE]: statusCode,
    [AttributeNames.HTTP_STATUS_TEXT]: (statusMessage || '').toUpperCase(),
  };

  if (rpcMetadata?.type === RPCType.HTTP && rpcMetadata.route !== undefined) {
    attributes[SemanticAttributes.HTTP_ROUTE] = rpcMetadata.route;
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
  metricAttributes[SemanticAttributes.HTTP_STATUS_CODE] =
    spanAttributes[SemanticAttributes.HTTP_STATUS_CODE];
  metricAttributes[SemanticAttributes.NET_HOST_PORT] =
    spanAttributes[SemanticAttributes.NET_HOST_PORT];
  if (spanAttributes[SemanticAttributes.HTTP_ROUTE] !== undefined) {
    metricAttributes[SemanticAttributes.HTTP_ROUTE] =
      spanAttributes[SemanticAttributes.HTTP_ROUTE];
  }
  return metricAttributes;
};

export function headerCapture(type: 'request' | 'response', headers: string[]) {
  const normalizedHeaders = new Map(
    headers.map(header => [
      header.toLowerCase(),
      header.toLowerCase().replace(/-/g, '_'),
    ])
  );

  return (
    span: Span,
    getHeader: (key: string) => undefined | string | string[] | number
  ) => {
    for (const [capturedHeader, normalizedHeader] of normalizedHeaders) {
      const value = getHeader(capturedHeader);

      if (value === undefined) {
        continue;
      }

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
