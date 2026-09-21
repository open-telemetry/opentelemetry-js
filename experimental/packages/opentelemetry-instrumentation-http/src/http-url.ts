/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { IncomingHttpHeaders, OutgoingHttpHeaders } from 'http';
import { isIPv6 } from 'net';
import {
  DEFAULT_QUERY_STRINGS_TO_REDACT,
  STR_REDACTED,
} from './internal-types';
import type { ParsedRequestOptions } from './internal-types';
import fastUri from 'fast-uri';

export interface ParsedHttpAuthority {
  value: string;
  hostname: string;
  port?: number;
}

interface ParsedHttpRequestTargetBase {
  pathname: string;
  search: string;
}

/**
 * Parsed HTTP/1.1 request-target.
 * @see https://httpwg.org/specs/rfc9112.html#request.target
 */
export type ParsedHttpRequestTarget =
  | (ParsedHttpRequestTargetBase & {
      form: 'absolute-form';
      authority: ParsedHttpAuthority;
      protocol: 'http:' | 'https:';
    })
  | (ParsedHttpRequestTargetBase & {
      form: 'authority-form';
      authority: ParsedHttpAuthority;
    })
  | (ParsedHttpRequestTargetBase & { form: 'origin-form' })
  | (ParsedHttpRequestTargetBase & { form: 'asterisk-form' });

function hostnameWithoutBrackets(hostname: string): string {
  return hostname.startsWith('[') && hostname.endsWith(']')
    ? hostname.slice(1, -1)
    : hostname;
}

function parsedAuthority(
  value: string,
  host: string,
  port?: number
): ParsedHttpAuthority {
  return {
    value,
    hostname: hostnameWithoutBrackets(host),
    port,
  };
}

function hasInvalidPort(port: string | number | undefined): boolean {
  return typeof port === 'string' && port !== '';
}

/**
 * Parses an HTTP authority without interpreting userinfo, paths, queries, or
 * fragments as part of the host.
 */
export function parseHttpAuthority(
  value: string
): ParsedHttpAuthority | undefined {
  const authority = value.trim();
  if (authority.length === 0) {
    return undefined;
  }

  const parsed = fastUri.parse(`http://${authority}`);
  if (
    parsed.error !== undefined ||
    parsed.userinfo !== undefined ||
    parsed.host === undefined ||
    parsed.host.length === 0 ||
    parsed.path !== '' ||
    parsed.query !== undefined ||
    parsed.fragment !== undefined ||
    hasInvalidPort(parsed.port)
  ) {
    return undefined;
  }

  return parsedAuthority(
    parsed.port === '' ? authority.slice(0, -1) : authority,
    parsed.host,
    typeof parsed.port === 'number' ? parsed.port : undefined
  );
}

/** Parses an HTTP/1.1 request-target. */
export function parseHttpRequestTarget(
  value: unknown,
  method?: unknown
): ParsedHttpRequestTarget | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  if (value === '*') {
    return { form: 'asterisk-form', pathname: '', search: '' };
  }

  // RFC 9112 authority-form requires the CONNECT target to include a port.
  if (typeof method === 'string' && method.toUpperCase() === 'CONNECT') {
    const authority = parseHttpAuthority(value);
    if (authority?.port === undefined) {
      return undefined;
    }
    return {
      form: 'authority-form',
      authority,
      pathname: '',
      search: '',
    };
  }

  // Split origin-form without a URI parser so the request-target remains
  // unchanged (for example, `//foo`, dot segments, or malformed escapes).
  if (value.startsWith('/')) {
    if (value.includes('#')) {
      return undefined;
    }
    const queryIndex = value.indexOf('?');
    return {
      form: 'origin-form',
      pathname: queryIndex === -1 ? value : value.slice(0, queryIndex),
      search: queryIndex === -1 ? '' : value.slice(queryIndex),
    };
  }

  const parsed = fastUri.parse(value);
  if (
    parsed.error !== undefined ||
    parsed.fragment !== undefined ||
    hasInvalidPort(parsed.port)
  ) {
    return undefined;
  }

  if (
    (parsed.scheme !== 'http' && parsed.scheme !== 'https') ||
    parsed.userinfo !== undefined ||
    parsed.host === undefined ||
    parsed.host.length === 0
  ) {
    return undefined;
  }

  const hostname = hostnameWithoutBrackets(parsed.host);
  const port = typeof parsed.port === 'number' ? parsed.port : undefined;
  const pathname = parsed.path || '/';
  const search = parsed.query === undefined ? '' : `?${parsed.query}`;
  const authority = `${parsed.host.includes(':') ? `[${hostname}]` : parsed.host}${
    port === undefined ? '' : `:${port}`
  }`;
  return {
    form: 'absolute-form',
    authority: parsedAuthority(authority, parsed.host, port),
    pathname,
    protocol: `${parsed.scheme}:`,
    search,
  };
}

/** Returns the query unchanged unless a sensitive parameter needs redaction. */
export function redactQueryString(
  query: string,
  paramsToRedact: string[]
): string {
  const params = new URLSearchParams(query);
  const redactedParams = paramsToRedact.filter(param => params.has(param));
  if (redactedParams.length === 0) {
    return query;
  }

  for (const param of redactedParams) {
    params.set(param, STR_REDACTED);
  }
  return params.toString();
}

function formatHttpAuthority(
  host: string,
  port: string,
  protocol: string
): string {
  let authority = host;
  let hasPort = false;
  if (isIPv6(host)) {
    authority = `[${host}]`;
  } else {
    const parsed = parseHttpAuthority(host);
    if (parsed !== undefined) {
      authority = parsed.value;
    }
    hasPort =
      parsed?.port !== undefined ||
      (parsed === undefined && host.includes(':'));
  }

  const isDefaultPort =
    (protocol === 'http:' && port === '80') ||
    (protocol === 'https:' && port === '443');
  return !hasPort && port && !isDefaultPort
    ? `${authority}:${port}`
    : authority;
}

function formatHttpRequestTarget(
  target: string,
  redactedQueryParams: string[],
  requestTarget: ParsedHttpRequestTarget | undefined
): string {
  if (
    requestTarget?.form === 'asterisk-form' ||
    requestTarget?.form === 'authority-form'
  ) {
    return '';
  }
  if (!target.includes('?')) {
    return target;
  }

  let pathname = requestTarget?.pathname;
  let search = requestTarget?.search;
  if (requestTarget === undefined) {
    try {
      const parsedUrl = new URL(target, 'http://localhost');
      pathname = parsedUrl.pathname;
      search = parsedUrl.search;
    } catch {
      return target;
    }
  }
  if (pathname === undefined || !search) {
    return target;
  }

  const redacted = redactQueryString(search.slice(1), redactedQueryParams);
  return `${pathname}?${redacted}`;
}

/** Builds the absolute URL attributes used by HTTP spans. */
export function getAbsoluteUrl(
  requestUrl: ParsedRequestOptions | null,
  headers: IncomingHttpHeaders | OutgoingHttpHeaders,
  fallbackProtocol = 'http:',
  redactedQueryParams: string[] = Array.from(DEFAULT_QUERY_STRINGS_TO_REDACT)
): string {
  const request = requestUrl || {};
  const protocol = request.protocol || fallbackProtocol;
  const port = (request.port || '').toString();
  const requestTarget =
    typeof request.path === 'string'
      ? parseHttpRequestTarget(request.path, request.method)
      : undefined;
  const host =
    (requestTarget?.form === 'authority-form' &&
      requestTarget.authority.value) ||
    (typeof request.host === 'string' && request.host) ||
    (typeof request.hostname === 'string' && request.hostname) ||
    (typeof headers.host === 'string' && headers.host) ||
    'localhost';
  const authority = formatHttpAuthority(host, port, protocol);
  const target =
    typeof request.path === 'string'
      ? formatHttpRequestTarget(
          request.path,
          redactedQueryParams,
          requestTarget
        )
      : request.path || '/';
  const auth = request.auth ? `${STR_REDACTED}:${STR_REDACTED}@` : '';
  return `${protocol}//${auth}${authority}${target}`;
}
