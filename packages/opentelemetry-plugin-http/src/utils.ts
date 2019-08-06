import { Status, CanonicalCode, Span } from '@opentelemetry/types';
import { RequestOptions, IncomingMessage, ClientRequest } from 'http';
import { IgnoreMatcher } from './types';
import { Attributes } from './enums/attributes';
import * as url from 'url';

/**
 * Utility class
 */
export class Utils {
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
  static isSatisfyPattern<T>(
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
      if (Utils.isSatisfyPattern(constant, obj, pattern)) {
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
        [Attributes.ATTRIBUTE_ERROR]: true,
        [Attributes.ATTRIBUTE_HTTP_ERROR_NAME]: error.name,
        [Attributes.ATTRIBUTE_HTTP_ERROR_MESSAGE]: error.message,
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
}
