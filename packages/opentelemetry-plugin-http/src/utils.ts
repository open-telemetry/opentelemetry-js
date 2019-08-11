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

import { Status, CanonicalCode, Span } from '@opentelemetry/types';
import {
  RequestOptions,
  IncomingMessage,
  ClientRequest,
  IncomingHttpHeaders,
} from 'http';
import { IgnoreMatcher, ParsedRequestOptions } from './types';
import { AttributeNames } from './enums/attributeNames';
import * as url from 'url';

/**
 * Utility class
 */
export class Utils {
  /**
   * return an absolute url
   */
  static getUrlFromIncomingRequest(
    requestUrl: url.UrlWithStringQuery | null,
    headers: IncomingHttpHeaders
  ): string {
    if (!requestUrl) {
      return `http://${headers.host || 'localhost'}/`;
    }

    return requestUrl.href && requestUrl.href.startsWith('http')
      ? `${requestUrl.protocol}//${requestUrl.hostname}${requestUrl.path}`
      : `${requestUrl.protocol || 'http:'}//${headers.host ||
          'localhost'}${requestUrl.path || '/'}`;
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
    return !!(
      (options as RequestOptions).headers &&
      (options as RequestOptions).headers!.Expect
    );
  }

  /**
   * Check whether the given obj match pattern
   * @param constant e.g URL of request
   * @param obj obj to inspect
   * @param pattern Match pattern
   */
  static satisfiesPattern<T>(
    constant: string,
    obj: T,
    pattern: IgnoreMatcher<T>
  ): boolean {
    if (typeof pattern === 'string') {
      return pattern === constant;
    } else if (pattern instanceof RegExp) {
      return pattern.test(constant);
    } else if (typeof pattern === 'function') {
      return pattern(constant, obj);
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
  static isIgnored<T>(
    constant: string,
    obj: T,
    list?: Array<IgnoreMatcher<T>>
  ): boolean {
    if (!list) {
      // No ignored urls - trace everything
      return false;
    }

    for (const pattern of list) {
      if (Utils.satisfiesPattern(constant, obj, pattern)) {
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
    obj.on('error', error => {
      span.setAttributes({
        [AttributeNames.ERROR]: true,
        [AttributeNames.HTTP_ERROR_NAME]: error.name,
        [AttributeNames.HTTP_ERROR_MESSAGE]: error.message,
      });

      let status: Status;
      if ((obj as IncomingMessage).statusCode) {
        status = Utils.parseResponseStatus(
          (obj as IncomingMessage).statusCode!
        );
      } else {
        status = { code: CanonicalCode.UNKNOWN };
      }

      status.message = error.message;

      span.setStatus(status);
      span.end();
    });
  }

  /**
   * Makes sure options is an url object
   * return an object with default value and parsed options
   * @param options for the request
   */
  static getRequestInfo(options: RequestOptions | string) {
    let pathname = '/';
    let origin = '';
    let optionsParsed: url.URL | url.UrlWithStringQuery | RequestOptions;
    if (typeof options === 'string') {
      optionsParsed = url.parse(options);
      pathname = (optionsParsed as url.UrlWithStringQuery).pathname || '/';
      origin = `${optionsParsed.protocol || 'http:'}//${optionsParsed.host}`;
    } else {
      optionsParsed = options;
      try {
        pathname = (options as url.URL).pathname;
        if (!pathname && options.path) {
          pathname = url.parse(options.path).pathname || '/';
        }
        origin = `${options.protocol || 'http:'}//${options.host}`;
      } catch (ignore) {}
    }
    // some packages return method in lowercase..
    // ensure upperCase for consistency
    let method = (optionsParsed as RequestOptions).method;
    method = method ? method.toUpperCase() : 'GET';

    return { origin, pathname, method, optionsParsed };
  }

  static getIncomingOptions(options: ParsedRequestOptions) {
    // If outgoing request headers contain the "Expect" header, the returned
    // ClientRequest will throw an error if any new headers are added.
    // So we need to clone the options object to be able to inject new
    // header.
    if (Utils.hasExpectHeader(options)) {
      const safeOptions = Object.assign({}, options);
      safeOptions.headers = Object.assign({}, options.headers);
      return safeOptions;
    }

    if (!options.headers) {
      options.headers = {};
    }
    return options;
  }
}
