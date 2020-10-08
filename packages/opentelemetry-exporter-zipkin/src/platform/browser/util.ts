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

import * as api from '@opentelemetry/api';
import { ExportResult, globalErrorHandler } from '@opentelemetry/core';
import * as zipkinTypes from '../../types';

/**
 * Prepares send function that will send spans to the remote Zipkin service.
 */
export function prepareSend(
  logger: api.Logger,
  urlStr: string,
  headers?: Record<string, string>
) {
  let xhrHeaders: Record<string, string>;
  const useBeacon = navigator.sendBeacon && !headers;
  if (headers) {
    xhrHeaders = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    };
  }

  /**
   * Send spans to the remote Zipkin service.
   */
  return function send(
    zipkinSpans: zipkinTypes.Span[],
    done: (result: ExportResult) => void
  ) {
    if (zipkinSpans.length === 0) {
      logger.debug('Zipkin send with empty spans');
      return done(ExportResult.SUCCESS);
    }
    const payload = JSON.stringify(zipkinSpans);
    if (useBeacon) {
      sendWithBeacon(payload, done, urlStr, logger);
    } else {
      sendWithXhr(payload, done, urlStr, logger, xhrHeaders);
    }
  };
}

/**
 * Sends data using beacon
 * @param data
 * @param done
 * @param urlStr
 * @param logger
 */
function sendWithBeacon(
  data: string,
  done: (result: ExportResult) => void,
  urlStr: string,
  logger: api.Logger
) {
  if (navigator.sendBeacon(urlStr, data)) {
    logger.debug('sendBeacon - can send', data);
    done(ExportResult.SUCCESS);
  } else {
    globalErrorHandler(new Error(`sendBeacon - cannot send ${data}`));
    done(ExportResult.FAILED_NOT_RETRYABLE);
  }
}

/**
 * Sends data using XMLHttpRequest
 * @param data
 * @param done
 * @param urlStr
 * @param logger
 * @param xhrHeaders
 */
function sendWithXhr(
  data: string,
  done: (result: ExportResult) => void,
  urlStr: string,
  logger: api.Logger,
  xhrHeaders: Record<string, string> = {}
) {
  const xhr = new window.XMLHttpRequest();
  xhr.open('POST', urlStr);
  Object.entries(xhrHeaders).forEach(([k, v]) => {
    xhr.setRequestHeader(k, v);
  });

  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      const statusCode = xhr.status || 0;
      logger.debug(
        'Zipkin response status code: %d, body: %s',
        statusCode,
        data
      );

      if (xhr.status >= 200 && xhr.status < 400) {
        return done(ExportResult.SUCCESS);
      } else if (statusCode < 500) {
        return done(ExportResult.FAILED_NOT_RETRYABLE);
      } else {
        return done(ExportResult.FAILED_RETRYABLE);
      }
    }
  };

  xhr.onerror = msg => {
    globalErrorHandler(new Error(`Zipkin request error: ${msg}`));
    return done(ExportResult.FAILED_RETRYABLE);
  };

  // Issue request to remote service
  logger.debug('Zipkin request payload: %s', data);
  xhr.send(data);
}
