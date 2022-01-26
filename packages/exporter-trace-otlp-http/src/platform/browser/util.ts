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
import * as otlpTypes from '../../types';

let minimumFailedSendBeaconPayloadSize = Infinity;

// exported only for test files
export const resetSendWithBeacon = () => {
  minimumFailedSendBeaconPayloadSize = Infinity;
};

/**
 * Send metrics/spans using browser navigator.sendBeacon
 * @param body
 * @param onSuccess
 * @param onError
 */
export function sendWithBeacon(
  body: string,
  url: string,
  blobPropertyBag: BlobPropertyBag
): boolean {
  // navigator.sendBeacon returns 'false' if the given payload exceeds the user agent limit.
  // See https://w3c.github.io/beacon/#return-value for specification.
  // Because we don't know what the limit is and to keep user's console clean, we only try to send payloads that may suceed.
  const blob = new Blob([body], blobPropertyBag);
  if (
    blob.size < minimumFailedSendBeaconPayloadSize &&
    navigator.sendBeacon(url, blob)
  ) {
    diag.debug('sendBeacon - can send', body);
    return true;
  }

  minimumFailedSendBeaconPayloadSize = blob.size;
  diag.info(
    'sendBeacon failed because the given payload was too big; try to lower your span processor limits'
  );

  return false;
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
  headers: Record<string, string>,
  onSuccess: () => void,
  onError: (error: otlpTypes.OTLPExporterError) => void
): void {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url);

  const defaultHeaders = {
    Accept: 'application/json',
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
        diag.debug('xhr success', body);
        onSuccess();
      } else {
        const error = new otlpTypes.OTLPExporterError(
          `Failed to export with XHR (status: ${xhr.status})`,
          xhr.status
        );

        onError(error);
      }
    }
  };
}
