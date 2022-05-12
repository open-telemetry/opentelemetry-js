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
import { OTLPExporterError } from '../../types';

/**
 * Send metrics/spans using browser navigator.sendBeacon
 * @param body
 * @param url
 * @param blobPropertyBag
 * @param onSuccess
 * @param onError
 */
export function sendWithBeacon(
  body: string,
  url: string,
  blobPropertyBag: BlobPropertyBag,
  onSuccess: () => void,
  onError: (error: OTLPExporterError) => void
): void {
  if (navigator.sendBeacon(url, new Blob([body], blobPropertyBag))) {
    diag.debug('sendBeacon - can send', body);
    onSuccess();
  } else {
    const error = new OTLPExporterError(
      `sendBeacon - cannot send ${body}`
    );
    onError(error);
  }
}

/**
 * function to send metrics/spans using browser XMLHttpRequest
 *     used when navigator.sendBeacon is not available
 * @param body
 * @param url
 * @param headers
 * @param onSuccess
 * @param onError
 */
export function sendWithXhr(
  body: string,
  url: string,
  headers: Record<string, string>,
  exporterTimeout: number,
  onSuccess: () => void,
  onError: (error: OTLPExporterError) => void
): void {
  let reqIsDestroyed: boolean;

  const exporterTimer = setTimeout(() => {
    reqIsDestroyed = true;
    xhr.abort();
  }, exporterTimeout);

  const xhr = new XMLHttpRequest();
  xhr.open('POST', url);

  const defaultHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  Object.entries({
    ...defaultHeaders,
    ...headers,
  }).forEach(([k, v]) => {
    xhr.setRequestHeader(k, v);
  });

  xhr.send(body);

  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status >= 200 && xhr.status <= 299) {
        clearTimeout(exporterTimer);
        diag.debug('xhr success', body);
        onSuccess();
      } else if (reqIsDestroyed) {
        const error = new OTLPExporterError(
          'Request Timeout', xhr.status
        );
        onError(error);
      } else {
        const error = new OTLPExporterError(
          `Failed to export with XHR (status: ${xhr.status})`,
          xhr.status
        );
        clearTimeout(exporterTimer);
        onError(error);
      }
    }
  };
}
