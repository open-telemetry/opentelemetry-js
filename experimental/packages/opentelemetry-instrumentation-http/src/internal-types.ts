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

import type * as http from 'http';
import type * as https from 'https';
import { get, IncomingMessage, request } from 'http';
import * as url from 'url';

export type IgnoreMatcher = string | RegExp | ((url: string) => boolean);
export type HttpCallback = (res: IncomingMessage) => void;
export type RequestFunction = typeof request;
export type GetFunction = typeof get;

export type HttpCallbackOptional = HttpCallback | undefined;

// from node 10+
export type RequestSignature = [http.RequestOptions, HttpCallbackOptional] &
  HttpCallback;

export type HttpRequestArgs = Array<HttpCallbackOptional | RequestSignature>;

export type ParsedRequestOptions =
  | (http.RequestOptions & Partial<url.UrlWithParsedQuery>)
  | http.RequestOptions;
export type Http = typeof http;
export type Https = typeof https;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Func<T> = (...args: any[]) => T;

export interface Err extends Error {
  errno?: number;
  code?: string;
  path?: string;
  syscall?: string;
  stack?: string;
}

/**
 * Names of possible synthetic test sources.
 */
export const SYNTHETIC_TEST_NAMES = ['alwayson'];

/**
 * Names of possible synthetic bot sources.
 */
export const SYNTHETIC_BOT_NAMES = ['googlebot', 'bingbot'];

/**
 * REDACTED string used to replace sensitive information in URLs.
 */
export const STR_REDACTED = 'REDACTED';

/**
 * List of URL query keys that are considered sensitive and whose value should be redacted.
 */
export const DEFAULT_QUERY_STRINGS_TO_REDACT = [
  'sig',
  'Signature',
  'AWSAccessKeyId',
  'X-Goog-Signature',
] as const;
