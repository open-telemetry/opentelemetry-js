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

import * as http from 'http';
import * as https from 'https';
import { diag } from '@opentelemetry/api';
import {
  HttpClientError,
  isRetriableStatusCode,
  parseRetryAfterToMills,
  RequestFunction,
  RetriableError,
} from '../../../internal/http-client';
import { Deferred } from '../../../utils/promise';

export const isHttpRequestAvailable = () => true;
export const httpRequest: RequestFunction = (url, payload, requestInit) => {
  const exporterTimeout = requestInit?.timeoutMs;
  const parsedUrl = new URL(url);
  let reqIsDestroyed = false;
  const nodeVersion = Number(process.versions.node.split('.')[0]);

  let exporterTimer: NodeJS.Timeout;
  if (exporterTimeout) {
    exporterTimer = setTimeout(() => {
      reqIsDestroyed = true;
      // req.abort() was deprecated since v14
      if (nodeVersion >= 14) {
        req.destroy();
      } else {
        req.abort();
      }
    }, exporterTimeout);
  }

  const options: http.RequestOptions | https.RequestOptions = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    path: parsedUrl.pathname,
    method: 'POST',
    headers: {
      'Content-Type': requestInit?.contentType ?? 'application/json',
      ...requestInit?.headers,
    },
    // TODO:
    // agent: collector.agent,
  };

  const request = parsedUrl.protocol === 'http:' ? http.request : https.request;

  const deferred = new Deferred<void>();

  const req = request(options, (res: http.IncomingMessage) => {
    let responseData = '';
    res.on('data', chunk => (responseData += chunk));

    res.on('aborted', () => {
      if (reqIsDestroyed) {
        const err = new HttpClientError('Request Timeout');
        deferred.reject(err);
      }
    });

    res.on('end', () => {
      if (!reqIsDestroyed) {
        clearTimeout(exporterTimer);
        if (res.statusCode && res.statusCode < 299) {
          diag.debug(`statusCode: ${res.statusCode}`, responseData);
          deferred.resolve();
          return;
        }

        let error = new HttpClientError(
          res.statusMessage,
          res.statusCode,
          responseData
        );

        if (isRetriableStatusCode(res.statusCode)) {
          error = new RetriableError(
            // Duplicates of retry-after are discarded.
            parseRetryAfterToMills(res.headers['retry-after']),
            error
          );
        }
        deferred.reject(error);
      }
    });
  });

  req.on('error', (error: Error | any) => {
    if (reqIsDestroyed) {
      const err = new HttpClientError('Request Timeout', error.code);
      deferred.reject(err);
    } else {
      clearTimeout(exporterTimer);
      deferred.reject(error);
    }
  });

  // TODO:
  // switch (collector.compression) {
  //   case CompressionAlgorithm.GZIP: {
  //     req.setHeader('Content-Encoding', 'gzip');
  //     const dataStream = readableFromBuffer(payload);
  //     dataStream
  //       .on('error', () => )
  //       .pipe(zlib.createGzip())
  //       .on('error', () => )
  //       .pipe(req);

  //     break;
  //   }
  //   default:
  //     req.end(payload);
  //     break;
  // }
  req.end(payload);

  return deferred.promise;
};

// function readableFromBuffer(buff: BufferLike): Readable {
//   const readable = new Readable();
//   readable.push(buff);
//   readable.push(null);

//   return readable;
// }
