/*!
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

import { Span, PluginConfig } from '@opentelemetry/types';
import * as url from 'url';
import {
  ClientRequest,
  IncomingMessage,
  ServerResponse,
  request,
  get,
} from 'http';
import * as http from 'http';

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
/* tslint:disable-next-line:no-any */
export type Func<T> = (...args: any[]) => T;
export type ResponseEndArgs =
  | [((() => void) | undefined)?]
  | [unknown, ((() => void) | undefined)?]
  | [unknown, string, ((() => void) | undefined)?];

export interface HttpCustomAttributeFunction {
  (
    span: Span,
    request: ClientRequest | IncomingMessage,
    response: IncomingMessage | ServerResponse
  ): void;
}

/**
 * Options available for the HTTP Plugin (see [documentation](https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-plugin-http#http-plugin-options))
 */
export interface HttpPluginConfig extends PluginConfig {
  /** Not trace all incoming requests that match paths */
  ignoreIncomingPaths?: IgnoreMatcher[];
  /** Not trace all outgoing requests that match urls */
  ignoreOutgoingUrls?: IgnoreMatcher[];
  /** Function for adding custom attributes */
  applyCustomAttributesOnSpan?: HttpCustomAttributeFunction;
  /** The primary server name of the matched virtual host. */
  serverName?: string;
}

export interface Err extends Error {
  errno?: number;
  code?: string;
  path?: string;
  syscall?: string;
  stack?: string;
}

export interface SpecialHttpStatusCodeMapping {
  [custom: number]: number;
}
