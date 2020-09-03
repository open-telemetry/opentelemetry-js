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
import { ExportResult } from '@opentelemetry/core';
import * as http from 'http';
import * as https from 'https';
import * as url from 'url';
import * as zipkinTypes from '../../types';
import { OT_REQUEST_HEADER } from '../../utils';

/**
 * Prepares send function that will send spans to the remote Zipkin service.
 */
export function prepareSend(
  logger: api.Logger,
  urlStr: string,
  headers?: Record<string, string>
) {
  const urlOpts = url.parse(urlStr);

  const reqOpts: http.RequestOptions = Object.assign(
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [OT_REQUEST_HEADER]: 1,
        ...headers,
      },
    },
    urlOpts
  );

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

    const { request } = reqOpts.protocol === 'http:' ? http : https;
    const req = request(reqOpts, (res: http.IncomingMessage) => {
      let rawData = '';
      res.on('data', chunk => {
        rawData += chunk;
      });
      res.on('end', () => {
        const statusCode = res.statusCode || 0;
        logger.debug(
          'Zipkin response status code: %d, body: %s',
          statusCode,
          rawData
        );

        // Consider 2xx and 3xx as success.
        if (statusCode < 400) {
          return done(ExportResult.SUCCESS);
          // Consider 4xx as failed non-retriable.
        } else if (statusCode < 500) {
          return done(ExportResult.FAILED_NOT_RETRYABLE);
          // Consider 5xx as failed retriable.
        } else {
          return done(ExportResult.FAILED_RETRYABLE);
        }
      });
    });

    req.on('error', (err: Error) => {
      logger.error('Zipkin request error', err);
      return done(ExportResult.FAILED_RETRYABLE);
    });

    // Issue request to remote service
    const payload = JSON.stringify(zipkinSpans);
    logger.debug('Zipkin request payload: %s', payload);
    req.write(payload, 'utf8');
    req.end();
  };
}
