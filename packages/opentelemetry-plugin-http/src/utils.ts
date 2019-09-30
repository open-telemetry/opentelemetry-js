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

import { Status, CanonicalCode, Span } from '@opentelemetry/types';
import {
  RequestOptions,
  IncomingMessage,
  ClientRequest,
  IncomingHttpHeaders,
  OutgoingHttpHeaders,
} from 'http';
import { IgnoreMatcher, Err, ParsedRequestOptions } from './types';
import { AttributeNames } from './enums/AttributeNames';
import * as url from 'url';

/**
 * Utility class
 */
export class Utils {
  static readonly OT_REQUEST_HEADER = 'x-opentelemetry-outgoing-request';
  /**
   * Get an absolute url
   */
  static getAbsoluteUrl(
    requestUrl: ParsedRequestOptions | null,
    headers: IncomingHttpHeaders | OutgoingHttpHeaders,
    fallbackProtocol = 'http:'
  ): string {
    const reqUrlObject = requestUrl || {};
    const protocol = reqUrlObject.protocol || fallbackProtocol;
    const port = (reqUrlObject.port || '').toString();
    const path = reqUrlObject.path || '/';
    let host =
      headers.host || reqUrlObject.hostname || headers.host || 'localhost';

    // if there is no port in host and there is a port
    // it should be displayed if it's not 80 and 443 (default ports)
    if (
      (host as string).indexOf(':') === -1 &&
      (port && port !== '80' && port !== '443')
    ) {
      host += `:${port}`;
    }

    return `${protocol}//${host}${path}`;
  }
  /**
   * Parse status code from HTTP response.
   */
  static parseResponseStatus(statusCode: number): Omit<Status, 'message'> {
    if (statusCode < 200 || statusCode > 504) {
      return { code: CanonicalCode.UNKNOWN };
    } else if (statusCode >= 200 && statusCode < 400) {
      return { code: CanonicalCode.OK };
    } else {
      switch (statusCode) {
        case 400:
          return { code: CanonicalCode.INVALID_ARGUMENT };
        case 504:
          return { code: CanonicalCode.DEADLINE_EXCEEDED };
        case 404:
          return { code: CanonicalCode.NOT_FOUND };
        case 403:
          return { code: CanonicalCode.PERMISSION_DENIED };
        case 401:
          return { code: CanonicalCode.UNAUTHENTICATED };
        case 429:
          return { code: CanonicalCode.RESOURCE_EXHAUSTED };
        case 501:
          return { code: CanonicalCode.UNIMPLEMENTED };
        case 503:
          return { code: CanonicalCode.UNAVAILABLE };
        default:
          return { code: CanonicalCode.UNKNOWN };
      }
    }
  }

  /**
   * Returns whether the Expect header is on the given options object.
   * @param options Options for http.request.
   */
  static hasExpectHeader(options: RequestOptions | url.URL): boolean {
    if (typeof (options as RequestOptions).headers !== 'object') {
      return false;
    }

    const keys = Object.keys((options as RequestOptions).headers!);
    return !!keys.find(key => key.toLowerCase() === 'expect');
  }

  /**
   * Check whether the given obj match pattern
   * @param constant e.g URL of request
   * @param obj obj to inspect
   * @param pattern Match pattern
   */
  static satisfiesPattern<T>(
    constant: string,
    pattern: IgnoreMatcher
  ): boolean {
    if (typeof pattern === 'string') {
      return pattern === constant;
    } else if (pattern instanceof RegExp) {
      return pattern.test(constant);
    } else if (typeof pattern === 'function') {
      return pattern(constant);
    } else {
      throw new TypeError('Pattern is in unsupported datatype');
    }
  }

  /**
   * Check whether the given request is ignored by configuration
   * @param constant e.g URL of request
   * @param obj obj to inspect
   * @param list List of ignore patterns
   */
  static isIgnored(constant: string, list?: IgnoreMatcher[]): boolean {
    if (!list) {
      // No ignored urls - trace everything
      return false;
    }

    for (const pattern of list) {
      if (Utils.satisfiesPattern(constant, pattern)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Will subscribe obj on error event and will set attributes when emitting event
   * @param span to set
   * @param obj to subscribe on error
   */
  static setSpanOnError(span: Span, obj: IncomingMessage | ClientRequest) {
    obj.on('error', (error: Err) => {
      Utils.setSpanWithError(span, error, obj);
    });
  }

  /**
   * Sets the span with the error passed in params
   * @param {Span} span the span that need to be set
   * @param {Error} error error that will be set to span
   * @param {(IncomingMessage | ClientRequest)} [obj] used for enriching the status by checking the statusCode.
   */
  static setSpanWithError(
    span: Span,
    error: Err,
    obj?: IncomingMessage | ClientRequest
  ) {
    const message = error.message;

    span.setAttributes({
      [AttributeNames.HTTP_ERROR_NAME]: error.name,
      [AttributeNames.HTTP_ERROR_MESSAGE]: message,
    });

    if (!obj) {
      span.setStatus({ code: CanonicalCode.UNKNOWN, message });
      span.end();
      return;
    }

    let status: Status;
    if ((obj as IncomingMessage).statusCode) {
      status = Utils.parseResponseStatus((obj as IncomingMessage).statusCode!);
    } else if ((obj as ClientRequest).aborted) {
      status = { code: CanonicalCode.ABORTED };
    } else {
      status = { code: CanonicalCode.UNKNOWN };
    }

    status.message = message;

    span.setStatus(status);
    span.end();
  }

  /**
   * Makes sure options is an url object
   * return an object with default value and parsed options
   * @param options for the request
   */
  static getRequestInfo(
    options: RequestOptions | string,
    extraOptions?: RequestOptions
  ) {
    let pathname = '/';
    let origin = '';
    let optionsParsed: url.URL | url.UrlWithStringQuery | RequestOptions;
    if (typeof options === 'string') {
      optionsParsed = url.parse(options);
      pathname = (optionsParsed as url.UrlWithStringQuery).pathname || '/';
      origin = `${optionsParsed.protocol || 'http:'}//${optionsParsed.host}`;
      if (extraOptions !== undefined) {
        Object.assign(optionsParsed, extraOptions);
      }
    } else {
      optionsParsed = options as RequestOptions;
      pathname = (options as url.URL).pathname;
      if (!pathname && optionsParsed.path) {
        pathname = url.parse(optionsParsed.path).pathname || '/';
      }
      origin = `${optionsParsed.protocol || 'http:'}//${optionsParsed.host ||
        `${optionsParsed.hostname}:${optionsParsed.port}`}`;
    }

    if (Utils.hasExpectHeader(optionsParsed)) {
      (optionsParsed as RequestOptions).headers = Object.assign(
        {},
        (optionsParsed as RequestOptions).headers
      );
    } else if (!(optionsParsed as RequestOptions).headers) {
      (optionsParsed as RequestOptions).headers = {};
    }
    // some packages return method in lowercase..
    // ensure upperCase for consistency
    let method = (optionsParsed as RequestOptions).method;
    method = method ? method.toUpperCase() : 'GET';

    return { origin, pathname, method, optionsParsed };
  }

  /**
   * Makes sure options is of type string or object
   * @param options for the request
   */
  static isValidOptionsType(options: unknown): boolean {
    if (!options) {
      return false;
    }

    const type = typeof options;
    return type === 'string' || (type === 'object' && !Array.isArray(options));
  }

  /**
   * Check whether the given request should be ignored
   * Use case: Typically, exporter `SpanExporter` can use http module to send spans.
   * This will also generate spans (from the http-plugin) that will be sended through the exporter
   * and here we have loop.
   * @param {RequestOptions} options
   */
  static isOpenTelemetryRequest(options: RequestOptions) {
    return !!(
      options &&
      options.headers &&
      options.headers[Utils.OT_REQUEST_HEADER]
    );
  }
}
