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
  Attributes,
  SpanStatusCode,
  Span,
  context,
  SpanKind,
  DiagLogger,
  AttributeValue,
} from '@opentelemetry/api';
import {
  ATTR_CLIENT_ADDRESS,
  ATTR_ERROR_TYPE,
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_REQUEST_METHOD_ORIGINAL,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_HTTP_ROUTE,
  ATTR_NETWORK_PEER_ADDRESS,
  ATTR_NETWORK_PEER_PORT,
  ATTR_NETWORK_PROTOCOL_VERSION,
  ATTR_SERVER_ADDRESS,
  ATTR_SERVER_PORT,
  ATTR_URL_FULL,
  ATTR_URL_PATH,
  ATTR_URL_QUERY,
  ATTR_URL_SCHEME,
  ATTR_USER_AGENT_ORIGINAL,
} from '@opentelemetry/semantic-conventions';
import {
  IncomingHttpHeaders,
  IncomingMessage,
  OutgoingHttpHeader,
  OutgoingHttpHeaders,
  RequestOptions,
  ServerResponse,
} from 'http';
import { getRPCMetadata, RPCType } from '@opentelemetry/core';
import * as url from 'url';
import { Err, IgnoreMatcher, ParsedRequestOptions } from './internal-types';
import { SYNTHETIC_BOT_NAMES, SYNTHETIC_TEST_NAMES } from './internal-types';
import {
  ATTR_USER_AGENT_SYNTHETIC_TYPE,
  USER_AGENT_SYNTHETIC_TYPE_VALUE_BOT,
  USER_AGENT_SYNTHETIC_TYPE_VALUE_TEST,
} from './semconv';
import forwardedParse = require('forwarded-parse');

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
 * Sets the span with the error passed in params
 * @param {Span} span the span that need to be set
 * @param {Error} error error that will be set to span
 */
export const setSpanWithError = (span: Span, error: Err): void => {
  const message = error.message;
  span.setAttribute(ATTR_ERROR_TYPE, error.name);

  span.setStatus({ code: SpanStatusCode.ERROR, message });
  span.recordException(error);
};

export const isCompressed = (
  headers: OutgoingHttpHeaders | IncomingHttpHeaders
): boolean => {
  const encoding = headers['content-encoding'];

  return !!encoding && encoding !== 'identity';
};

/**
 * Mimics Node.js conversion of URL strings to RequestOptions expected by
 * `http.request` and `https.request` APIs.
 *
 * See https://github.com/nodejs/node/blob/2505e217bba05fc581b572c685c5cf280a16c5a3/lib/internal/url.js#L1415-L1437
 *
 * @param stringUrl
 * @throws TypeError if the URL is not valid.
 */
function stringUrlToHttpOptions(
  stringUrl: string
): RequestOptions & { pathname: string } {
  // This is heavily inspired by Node.js handling of the same situation, trying
  // to follow it as closely as possible while keeping in mind that we only
  // deal with string URLs, not URL objects.
  const {
    hostname,
    pathname,
    port,
    username,
    password,
    search,
    protocol,
    hash,
    href,
    origin,
    host,
  } = new URL(stringUrl);

  const options: RequestOptions & {
    pathname: string;
    hash: string;
    search: string;
    href: string;
    origin: string;
  } = {
    protocol: protocol,
    hostname:
      hostname && hostname[0] === '[' ? hostname.slice(1, -1) : hostname,
    hash: hash,
    search: search,
    pathname: pathname,
    path: `${pathname || ''}${search || ''}`,
    href: href,
    origin: origin,
    host: host,
  };
  if (port !== '') {
    options.port = Number(port);
  }
  if (username || password) {
    options.auth = `${decodeURIComponent(username)}:${decodeURIComponent(
      password
    )}`;
  }
  return options;
}

/**
 * Makes sure options is an url object
 * return an object with default value and parsed options
 * @param logger component logger
 * @param options original options for the request
 * @param [extraOptions] additional options for the request
 */
export const getRequestInfo = (
  logger: DiagLogger,
  options: url.URL | RequestOptions | string,
  extraOptions?: RequestOptions
): {
  origin: string;
  pathname: string;
  method: string;
  invalidUrl: boolean;
  optionsParsed: RequestOptions;
} => {
  let pathname: string;
  let origin: string;
  let optionsParsed: RequestOptions;
  let invalidUrl = false;
  if (typeof options === 'string') {
    try {
      const convertedOptions = stringUrlToHttpOptions(options);
      optionsParsed = convertedOptions;
      pathname = convertedOptions.pathname || '/';
    } catch (e) {
      invalidUrl = true;
      logger.verbose(
        'Unable to parse URL provided to HTTP request, using fallback to determine path. Original error:',
        e
      );
      // for backward compatibility with how url.parse() behaved.
      optionsParsed = {
        path: options,
      };
      pathname = optionsParsed.path || '/';
    }

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

    const hostname =
      optionsParsed.host ||
      (optionsParsed.port != null
        ? `${optionsParsed.hostname}${optionsParsed.port}`
        : optionsParsed.hostname);
    origin = `${optionsParsed.protocol || 'http:'}//${hostname}`;

    pathname = (options as url.URL).pathname;
    if (!pathname && optionsParsed.path) {
      try {
        const parsedUrl = new URL(optionsParsed.path, origin);
        pathname = parsedUrl.pathname || '/';
      } catch (e) {
        pathname = '/';
      }
    }
  }

  // some packages return method in lowercase..
  // ensure upperCase for consistency
  const method = optionsParsed.method
    ? optionsParsed.method.toUpperCase()
    : 'GET';

  return { origin, pathname, method, optionsParsed, invalidUrl };
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
 * @param {{ component: string, hostname: string, hookAttributes?: Attributes }} options used to pass data needed to create attributes
 */
export const getOutgoingRequestAttributes = (
  requestOptions: ParsedRequestOptions,
  options: {
    component: string;
    hostname: string;
    port: string | number;
    hookAttributes?: Attributes;
  },
  enableSyntheticSourceDetection: boolean
): Attributes => {
  const hostname = options.hostname;
  const port = options.port;
  const method = requestOptions.method ?? 'GET';
  const normalizedMethod = normalizeMethod(method);
  const headers = requestOptions.headers || {};
  const userAgent = headers['user-agent'];
  const urlFull = getAbsoluteUrl(
    requestOptions,
    headers,
    `${options.component}:`
  );
  const newAttributes: Attributes = {
    // Required attributes
    [ATTR_HTTP_REQUEST_METHOD]: normalizedMethod,
    [ATTR_SERVER_ADDRESS]: hostname,
    [ATTR_SERVER_PORT]: Number(port),
    [ATTR_URL_FULL]: urlFull,
    [ATTR_USER_AGENT_ORIGINAL]: userAgent,
    // leaving out protocol version, it is not yet negotiated
    // leaving out protocol name, it is only required when protocol version is set
    // retries and redirects not supported

    // Opt-in attributes left off for now
  };

  // conditionally required if request method required case normalization
  if (method !== normalizedMethod) {
    newAttributes[ATTR_HTTP_REQUEST_METHOD_ORIGINAL] = method;
  }

  if (enableSyntheticSourceDetection && userAgent) {
    newAttributes[ATTR_USER_AGENT_SYNTHETIC_TYPE] = getSyntheticType(userAgent);
  }
  return Object.assign(newAttributes, options.hookAttributes);
};

/**
 * Returns the type of synthetic source based on the user agent
 * @param {OutgoingHttpHeader} userAgent the user agent string
 */
const getSyntheticType = (
  userAgent: OutgoingHttpHeader
): AttributeValue | undefined => {
  const userAgentString: string = String(userAgent).toLowerCase();
  for (const name of SYNTHETIC_TEST_NAMES) {
    if (userAgentString.includes(name)) {
      return USER_AGENT_SYNTHETIC_TYPE_VALUE_TEST;
    }
  }
  for (const name of SYNTHETIC_BOT_NAMES) {
    if (userAgentString.includes(name)) {
      return USER_AGENT_SYNTHETIC_TYPE_VALUE_BOT;
    }
  }
  return;
};

/**
 * Returns outgoing request attributes scoped to the response data
 * @param {IncomingMessage} response the response object
 */
export const getOutgoingRequestAttributesOnResponse = (
  response: IncomingMessage
): Attributes => {
  const { statusCode, socket } = response;
  const stableAttributes: Attributes = {};

  if (statusCode != null) {
    stableAttributes[ATTR_HTTP_RESPONSE_STATUS_CODE] = statusCode;
  }

  if (socket) {
    const { remoteAddress, remotePort } = socket;

    // Recommended
    stableAttributes[ATTR_NETWORK_PEER_ADDRESS] = remoteAddress;
    stableAttributes[ATTR_NETWORK_PEER_PORT] = remotePort;
    stableAttributes[ATTR_NETWORK_PROTOCOL_VERSION] = response.httpVersion;
  }

  return stableAttributes;
};

/**
 * Returns outgoing request Metric attributes scoped to the response data
 * @param {Attributes} spanAttributes the span attributes
 */
export const getOutgoingRequestMetricAttributesOnResponse = (
  spanAttributes: Attributes
): Attributes => {
  const stableAttributes: Attributes = {};

  if (spanAttributes[ATTR_NETWORK_PROTOCOL_VERSION]) {
    stableAttributes[ATTR_NETWORK_PROTOCOL_VERSION] =
      spanAttributes[ATTR_NETWORK_PROTOCOL_VERSION];
  }

  if (spanAttributes[ATTR_HTTP_RESPONSE_STATUS_CODE]) {
    stableAttributes[ATTR_HTTP_RESPONSE_STATUS_CODE] =
      spanAttributes[ATTR_HTTP_RESPONSE_STATUS_CODE];
  }

  return stableAttributes;
};

function parseHostHeader(
  hostHeader: string,
  proto?: string
): { host: string; port?: string } {
  const parts = hostHeader.split(':');

  // no semicolon implies ipv4 dotted syntax or host name without port
  // x.x.x.x
  // example.com
  if (parts.length === 1) {
    if (proto === 'http') {
      return { host: parts[0], port: '80' };
    }

    if (proto === 'https') {
      return { host: parts[0], port: '443' };
    }

    return { host: parts[0] };
  }

  // single semicolon implies ipv4 dotted syntax or host name with port
  // x.x.x.x:yyyy
  // example.com:yyyy
  if (parts.length === 2) {
    return {
      host: parts[0],
      port: parts[1],
    };
  }

  // more than 2 parts implies ipv6 syntax with multiple colons
  // [x:x:x:x:x:x:x:x]
  // [x:x:x:x:x:x:x:x]:yyyy
  if (parts[0].startsWith('[')) {
    if (parts[parts.length - 1].endsWith(']')) {
      if (proto === 'http') {
        return { host: hostHeader, port: '80' };
      }

      if (proto === 'https') {
        return { host: hostHeader, port: '443' };
      }
    } else if (parts[parts.length - 2].endsWith(']')) {
      return {
        host: parts.slice(0, -1).join(':'),
        port: parts[parts.length - 1],
      };
    }
  }

  // if nothing above matches just return the host header
  return { host: hostHeader };
}

/**
 * Get server.address and port according to http semconv 1.27
 * https://github.com/open-telemetry/semantic-conventions/blob/bf0a2c1134f206f034408b201dbec37960ed60ec/docs/http/http-spans.md#setting-serveraddress-and-serverport-attributes
 */
function getServerAddress(
  request: IncomingMessage,
  component: 'http' | 'https'
): { host: string; port?: string } | null {
  const forwardedHeader = request.headers['forwarded'];
  if (forwardedHeader) {
    for (const entry of parseForwardedHeader(forwardedHeader)) {
      if (entry.host) {
        return parseHostHeader(entry.host, entry.proto);
      }
    }
  }

  const xForwardedHost = request.headers['x-forwarded-host'];
  if (typeof xForwardedHost === 'string') {
    if (typeof request.headers['x-forwarded-proto'] === 'string') {
      return parseHostHeader(
        xForwardedHost,
        request.headers['x-forwarded-proto']
      );
    }

    if (Array.isArray(request.headers['x-forwarded-proto'])) {
      return parseHostHeader(
        xForwardedHost,
        request.headers['x-forwarded-proto'][0]
      );
    }

    return parseHostHeader(xForwardedHost);
  } else if (
    Array.isArray(xForwardedHost) &&
    typeof xForwardedHost[0] === 'string' &&
    xForwardedHost[0].length > 0
  ) {
    if (typeof request.headers['x-forwarded-proto'] === 'string') {
      return parseHostHeader(
        xForwardedHost[0],
        request.headers['x-forwarded-proto']
      );
    }

    if (Array.isArray(request.headers['x-forwarded-proto'])) {
      return parseHostHeader(
        xForwardedHost[0],
        request.headers['x-forwarded-proto'][0]
      );
    }

    return parseHostHeader(xForwardedHost[0]);
  }

  const host = request.headers['host'];
  if (typeof host === 'string' && host.length > 0) {
    return parseHostHeader(host, component);
  }

  return null;
}

/**
 * Get server.address and port according to http semconv 1.27
 * https://github.com/open-telemetry/semantic-conventions/blob/bf0a2c1134f206f034408b201dbec37960ed60ec/docs/http/http-spans.md#setting-serveraddress-and-serverport-attributes
 */
export function getRemoteClientAddress(
  request: IncomingMessage
): string | null {
  const forwardedHeader = request.headers['forwarded'];
  if (forwardedHeader) {
    for (const entry of parseForwardedHeader(forwardedHeader)) {
      if (entry.for) {
        return entry.for;
      }
    }
  }

  const xForwardedFor = request.headers['x-forwarded-for'];
  if (typeof xForwardedFor === 'string') {
    return xForwardedFor;
  } else if (Array.isArray(xForwardedFor)) {
    return xForwardedFor[0];
  }

  const remote = request.socket.remoteAddress;
  if (remote) {
    return remote;
  }

  return null;
}

function getInfoFromIncomingMessage(
  component: 'http' | 'https',
  request: IncomingMessage,
  logger: DiagLogger
): { pathname?: string; search?: string; toString: () => string } {
  try {
    if (request.headers.host) {
      return new URL(
        request.url ?? '/',
        `${component}://${request.headers.host}`
      );
    } else {
      const unsafeParsedUrl = new URL(
        request.url ?? '/',
        // using localhost as a workaround to still use the URL constructor for parsing
        `${component}://localhost`
      );
      // since we use localhost as a workaround, ensure we hide the rest of the properties to avoid
      // our workaround leaking though.
      return {
        pathname: unsafeParsedUrl.pathname,
        search: unsafeParsedUrl.search,
        toString: function () {
          // we cannot use the result of unsafeParsedUrl.toString as it's potentially wrong.
          return unsafeParsedUrl.pathname + unsafeParsedUrl.search;
        },
      };
    }
  } catch (e) {
    // something is wrong, use undefined - this *should* never happen, logging
    // for troubleshooting in case it does happen.
    logger.verbose('Unable to get URL from request', e);
    return {};
  }
}

/**
 * Returns incoming request attributes scoped to the request data
 * @param {IncomingMessage} request the request object
 * @param {{ component: string, hookAttributes?: Attributes }} options used to pass data needed to create attributes
 */
export const getIncomingRequestAttributes = (
  request: IncomingMessage,
  options: {
    component: 'http' | 'https';
    hookAttributes?: Attributes;
    enableSyntheticSourceDetection: boolean;
  },
  logger: DiagLogger
): Attributes => {
  const headers = request.headers;
  const userAgent = headers['user-agent'];
  const method = request.method;
  const normalizedMethod = normalizeMethod(method);

  const serverAddress = getServerAddress(request, options.component);
  const remoteClientAddress = getRemoteClientAddress(request);

  const newAttributes: Attributes = {
    [ATTR_HTTP_REQUEST_METHOD]: normalizedMethod,
    [ATTR_URL_SCHEME]: options.component,
    [ATTR_SERVER_ADDRESS]: serverAddress?.host,
    [ATTR_NETWORK_PEER_ADDRESS]: request.socket.remoteAddress,
    [ATTR_NETWORK_PEER_PORT]: request.socket.remotePort,
    [ATTR_NETWORK_PROTOCOL_VERSION]: request.httpVersion,
    [ATTR_USER_AGENT_ORIGINAL]: userAgent,
  };

  const parsedUrl = getInfoFromIncomingMessage(
    options.component,
    request,
    logger
  );

  if (parsedUrl?.pathname != null) {
    newAttributes[ATTR_URL_PATH] = parsedUrl.pathname;
  }

  if (parsedUrl.search) {
    // Remove leading '?' from URL search (https://developer.mozilla.org/en-US/docs/Web/API/URL/search).
    newAttributes[ATTR_URL_QUERY] = parsedUrl.search.slice(1);
  }

  if (remoteClientAddress != null) {
    newAttributes[ATTR_CLIENT_ADDRESS] = remoteClientAddress.split(',')[0];
  }

  if (serverAddress?.port != null) {
    newAttributes[ATTR_SERVER_PORT] = Number(serverAddress.port);
  }

  // conditionally required if request method required case normalization
  if (method !== normalizedMethod) {
    newAttributes[ATTR_HTTP_REQUEST_METHOD_ORIGINAL] = method;
  }

  if (options.enableSyntheticSourceDetection && userAgent) {
    newAttributes[ATTR_USER_AGENT_SYNTHETIC_TYPE] = getSyntheticType(userAgent);
  }
  return Object.assign(newAttributes, options.hookAttributes);
};

/**
 * Returns incoming request attributes scoped to the response data
 * @param {(ServerResponse & { socket: Socket; })} response the response object
 */
export const getIncomingRequestAttributesOnResponse = (
  request: IncomingMessage,
  response: ServerResponse
): Attributes => {
  const { statusCode } = response;

  const newAttributes: Attributes = {
    [ATTR_HTTP_RESPONSE_STATUS_CODE]: statusCode,
  };

  const rpcMetadata = getRPCMetadata(context.active());

  if (rpcMetadata?.type === RPCType.HTTP && rpcMetadata.route !== undefined) {
    newAttributes[ATTR_HTTP_ROUTE] = rpcMetadata.route;
  }

  return newAttributes;
};

/**
 * Returns incoming request Metric attributes scoped to the request data
 * @param {Attributes} spanAttributes the span attributes
 */
export const getIncomingStableRequestMetricAttributesOnResponse = (
  spanAttributes: Attributes
): Attributes => {
  const metricAttributes: Attributes = {};
  if (spanAttributes[ATTR_HTTP_ROUTE] !== undefined) {
    metricAttributes[ATTR_HTTP_ROUTE] = spanAttributes[ATTR_HTTP_ROUTE];
  }

  // required if and only if one was sent, same as span requirement
  if (spanAttributes[ATTR_HTTP_RESPONSE_STATUS_CODE]) {
    metricAttributes[ATTR_HTTP_RESPONSE_STATUS_CODE] =
      spanAttributes[ATTR_HTTP_RESPONSE_STATUS_CODE];
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

const KNOWN_METHODS = new Set([
  // methods from https://www.rfc-editor.org/rfc/rfc9110.html#name-methods
  'GET',
  'HEAD',
  'POST',
  'PUT',
  'DELETE',
  'CONNECT',
  'OPTIONS',
  'TRACE',

  // PATCH from https://www.rfc-editor.org/rfc/rfc5789.html
  'PATCH',
]);

function normalizeMethod(method?: string | null) {
  if (method == null) {
    return 'GET';
  }

  const upper = method.toUpperCase();
  if (KNOWN_METHODS.has(upper)) {
    return upper;
  }

  return '_OTHER';
}

function parseForwardedHeader(header: string): Record<string, string>[] {
  try {
    return forwardedParse(header);
  } catch {
    return [];
  }
}
