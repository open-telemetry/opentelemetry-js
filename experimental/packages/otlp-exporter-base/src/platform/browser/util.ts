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
  CompressionAlgorithm,
  OTLPExporterError,
} from '../../types';

import {
  DEFAULT_EXPORT_MAX_ATTEMPTS,
  DEFAULT_EXPORT_INITIAL_BACKOFF,
  DEFAULT_EXPORT_BACKOFF_MULTIPLIER,
  DEFAULT_EXPORT_MAX_BACKOFF,
  isExportRetryable,
  parseRetryAfterToMills,
} from '../../util';

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
 * @param body
 * @param url
 * @param headers
 * @param exporterTimeout
 * @param onSuccess
 * @param onError
 * @param compressionAlgorithm
 */
export function sendWithXhr(
  body: string | Blob,
  url: string,
  headers: Record<string, string>,
  exporterTimeout: number,
  compressionAlgorithm: CompressionAlgorithm,
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
  }, exporterTimeout);

  const sendWithRetry = (
    retries = DEFAULT_EXPORT_MAX_ATTEMPTS,
    minDelay = DEFAULT_EXPORT_INITIAL_BACKOFF
  ) => {
    xhr = new XMLHttpRequest();
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

    if (compressionAlgorithm === CompressionAlgorithm.GZIP) {

      const sendRequest = (requestBody: string | Blob) => {

        const send = (body: string | Blob) => {
          xhr.send(body);
        };

        const sendCompressed = (body: string | Blob | Uint8Array) => {
          xhr.setRequestHeader('Content-Encoding', 'gzip'); // Set the Content-Encoding header to 'gzip' for compressed requests
          xhr.send(body);
        };

        compressContent(requestBody, compressionAlgorithm)
          .then(sendCompressed)
          .catch(() => {
            send(requestBody); // Send the original body when compression fails
          });
      };

      sendRequest(body);
    } else {
      xhr.send(body);
    }
  };

  sendWithRetry();
}

async function compressContent(content: string | Blob, compressionAlgorithm: string): Promise<Uint8Array> {

  const compressionStream = new CompressionStream(compressionAlgorithm as CompressionFormat);

  // Create a new readable stream from the input content
  const reader = typeof content === 'string' ? new ReadableStream({ start(controller) {
      controller.enqueue(new TextEncoder().encode(content));
      controller.close();
  }}) : content.stream();

  // Pipe the readable stream through the compression stream
  const compressedStream = reader.pipeThrough(compressionStream);

  // Create a new Uint8Array to hold the compressed data
  const compressedChunks: Uint8Array[] = [];

  // Read the compressed data from the stream and collect it into chunks
  const readerStream = compressedStream.getReader();
  try {
      while (true) {
          const { done, value } = await readerStream.read();
          if (done) break;
          if (value instanceof Uint8Array) {
              compressedChunks.push(value);
          }
      }
  } finally {
      readerStream.releaseLock();
  }

  // Concatenate the compressed chunks into a single Uint8Array
  const compressedData = new Uint8Array(compressedChunks.reduce((totalLength, chunk) => totalLength + chunk.length, 0));
  let offset = 0;
  for (const chunk of compressedChunks) {
      compressedData.set(chunk, offset);
      offset += chunk.length;
  }

  return compressedData;
}
