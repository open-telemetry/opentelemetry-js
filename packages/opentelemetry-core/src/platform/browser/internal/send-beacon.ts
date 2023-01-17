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
  RequestFunction,
  RequestInit,
} from '../../../internal/http-client';

export const isSendBeaconRequestAvailable = () => {
  return (
    typeof navigator === 'object' && typeof navigator.sendBeacon === 'function'
  );
};
/**
 * Sends data using beacon
 */
export const sendBeaconRequest: RequestFunction = (
  url,
  payload,
  requestInit
) => {
  warnUnusedRequestInit(requestInit);
  const blob = new Blob([payload], {
    type: requestInit?.contentType,
  });
  if (navigator.sendBeacon(url, blob)) {
    diag.debug('sendBeacon - can send', payload);
    return Promise.resolve();
  } else {
    return Promise.reject(
      new HttpClientError(`sendBeacon - cannot send ${payload}`)
    );
  }
};

function warnUnusedRequestInit(requestInit?: RequestInit) {
  if (requestInit == null) {
    return;
  }
  if (requestInit.method && requestInit.method !== 'POST') {
    diag.warn(`sendBeacon - can not send with method "${requestInit.method}"`);
  }
  if (requestInit.headers) {
    diag.warn('sendBeacon - can not send request headers');
  }
}
