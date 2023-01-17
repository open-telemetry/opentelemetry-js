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

import { diag } from '@opentelemetry/api';
import {
  HttpClientError,
  isRetriableStatusCode,
  parseRetryAfterToMills,
  RequestFunction,
  RetriableError,
} from '../../../internal/http-client';
import { Deferred } from '../../../utils/promise';

export const isXhrRequestAvailable = () => {
  return typeof XMLHttpRequest === 'function';
};
export const xhrRequest: RequestFunction = (url, payload, requestInit) => {
  let reqIsDestroyed: boolean;

  const exporterTimer = setTimeout(() => {
    reqIsDestroyed = true;
    xhr.abort();
  }, requestInit?.timeoutMs);

  const xhr = new XMLHttpRequest();
  const deferred = new Deferred<void>();

  xhr.open(requestInit?.method ?? 'POST', url);

  const defaultHeaders = {
    'Content-Type': requestInit?.contentType ?? 'application/json',
  };

  Object.entries({
    ...defaultHeaders,
    ...requestInit?.headers,
  }).forEach(([k, v]) => {
    if (v) {
      xhr.setRequestHeader(k, v);
    }
  });

  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      clearTimeout(exporterTimer);

      if (xhr.status >= 200 && xhr.status <= 299) {
        diag.debug('xhr success', payload);
        deferred.resolve();
        return;
      }
      if (reqIsDestroyed) {
        const error = new HttpClientError('Request Timeout', xhr.status);
        deferred.reject(error);
        return;
      }

      let error = new HttpClientError(
        `Failed to export with XHR (status: ${xhr.status})`,
        xhr.status
      );

      if (isRetriableStatusCode(xhr.status)) {
        error = new RetriableError(
          parseRetryAfterToMills(xhr.getResponseHeader('Retry-After')),
          error
        );
      }

      deferred.reject(error);
    }
  };

  xhr.send(payload);

  return deferred.promise;
};
