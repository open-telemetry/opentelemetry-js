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
import { gzip } from 'pako';
import { CompressionAlgorithm, OTLPExporterError } from '../../types';
import {
  DEFAULT_EXPORT_MAX_ATTEMPTS,
  DEFAULT_EXPORT_INITIAL_BACKOFF,
  DEFAULT_EXPORT_BACKOFF_MULTIPLIER,
  DEFAULT_EXPORT_MAX_BACKOFF,
  isExportRetryable,
  parseRetryAfterToMills,
} from '../../util';
import { OTLPExporterBrowserBase } from './OTLPExporterBrowserBase';

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
    const error = new OTLPExporterError(`sendBeacon - cannot send ${body}`);
    onError(error);
  }
}

/**
 * function to send metrics/spans using browser XMLHttpRequest
 *     used when navigator.sendBeacon is not available
 * @param collector
 * @param body
 * @param contentType
 * @param onSuccess
 * @param onError
 */
export function sendWithXhr<ExportItem, ServiceRequest>(
  collector: OTLPExporterBrowserBase<ExportItem, ServiceRequest>,
  body: string | Uint8Array,
  contentType: string,
  onSuccess: () => void,
  onError: (error: OTLPExporterError) => void
): void {
  let retryTimer: ReturnType<typeof setTimeout>;
  let xhr: XMLHttpRequest;
  let reqIsDestroyed = false;

  const exporterTimer = setTimeout(() => {
    clearTimeout(retryTimer);
    reqIsDestroyed = true;

    if (xhr.readyState === XMLHttpRequest.DONE) {
      const err = new OTLPExporterError('Request Timeout');
      onError(err);
    } else {
      xhr.abort();
    }
  }, collector.timeoutMillis);

  const sendWithRetry = (
    retries = DEFAULT_EXPORT_MAX_ATTEMPTS,
    minDelay = DEFAULT_EXPORT_INITIAL_BACKOFF
  ) => {
    xhr = new XMLHttpRequest();
    xhr.open('POST', collector.url);

    const defaultHeaders = {
      Accept: 'application/json',
      'Content-Type': contentType || 'application/json',
    };

    Object.entries({
      ...defaultHeaders,
      ...collector.headers,
    }).forEach(([k, v]) => {
      xhr.setRequestHeader(k, v);
    });

    switch (collector.compression) {
      case CompressionAlgorithm.GZIP: {
        xhr.setRequestHeader('Content-Encoding', 'gzip');
        xhr.send(gzip(body));
        break;
      }
      default:
        xhr.send(body);
        break;
    }

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE && reqIsDestroyed === false) {
        if (xhr.status >= 200 && xhr.status <= 299) {
          diag.debug('xhr success', body);
          onSuccess();
          clearTimeout(exporterTimer);
          clearTimeout(retryTimer);
        } else if (xhr.status && isExportRetryable(xhr.status) && retries > 0) {
          let retryTime: number;
          minDelay = DEFAULT_EXPORT_BACKOFF_MULTIPLIER * minDelay;

          // retry after interval specified in Retry-After header
          if (xhr.getResponseHeader('Retry-After')) {
            retryTime = parseRetryAfterToMills(
              xhr.getResponseHeader('Retry-After')!
            );
          } else {
            // exponential backoff with jitter
            retryTime = Math.round(
              Math.random() * (DEFAULT_EXPORT_MAX_BACKOFF - minDelay) + minDelay
            );
          }

          retryTimer = setTimeout(() => {
            sendWithRetry(retries - 1, minDelay);
          }, retryTime);
        } else {
          const error = new OTLPExporterError(
            `Failed to export with XHR (status: ${xhr.status})`,
            xhr.status
          );
          onError(error);
          clearTimeout(exporterTimer);
          clearTimeout(retryTimer);
        }
      }
    };

    xhr.onabort = () => {
      if (reqIsDestroyed) {
        const err = new OTLPExporterError('Request Timeout');
        onError(err);
      }
      clearTimeout(exporterTimer);
      clearTimeout(retryTimer);
    };

    xhr.onerror = () => {
      if (reqIsDestroyed) {
        const err = new OTLPExporterError('Request Timeout');
        onError(err);
      }
      clearTimeout(exporterTimer);
      clearTimeout(retryTimer);
    };
  };

  sendWithRetry();
}

export function configureCompression(
  compression: CompressionAlgorithm | undefined
): CompressionAlgorithm {
  return compression || CompressionAlgorithm.NONE;
}
