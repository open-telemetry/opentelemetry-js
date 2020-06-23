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
import * as collectorTypes from '../../types';
import { Logger } from '@opentelemetry/api';

/**
 * Send metrics/spans using browser navigator.sendBeacon
 * @param body
 * @param onSuccess
 * @param onError
 */
export function sendWithBeacon(
  body: string,
  url: string,
  logger: Logger,
  onSuccess: () => void,
  onError: (error: collectorTypes.CollectorExporterError) => void
) {
  if (navigator.sendBeacon(url, body)) {
    logger.debug('sendBeacon - can send', body);
    onSuccess();
  } else {
    logger.error('sendBeacon - cannot send', body);
    onError({});
  }
}

/**
 * function to send metrics/spans using browser XMLHttpRequest
 *     used when navigator.sendBeacon is not available
 * @param body
 * @param onSuccess
 * @param onError
 */
export function sendWithXhr(
  body: string,
  url: string,
  headers: { [key: string]: string },
  logger: Logger,
  onSuccess: () => void,
  onError: (error: collectorTypes.CollectorExporterError) => void
) {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url);
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.setRequestHeader('Content-Type', 'application/json');
  Object.entries(headers).forEach(([k, v]) => {
    xhr.setRequestHeader(k, v);
  });

  xhr.send(body);

  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status >= 200 && xhr.status <= 299) {
        logger.debug('xhr success', body);
        onSuccess();
      } else {
        logger.error('body', body);
        logger.error('xhr error', xhr);
        onError({
          code: xhr.status,
          message: xhr.responseText,
        });
      }
    }
  };
}
