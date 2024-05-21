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
import { CompressionAlgorithm, OTLPExporterError } from '../../types';

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
  body: Uint8Array,
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
  body: Uint8Array,
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
    innerBody: string | Blob | Uint8Array,
    headers: Record<string, string>,
    retries = DEFAULT_EXPORT_MAX_ATTEMPTS,
    minDelay = DEFAULT_EXPORT_INITIAL_BACKOFF
  ) => {
    xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    Object.entries(headers).forEach(([k, v]) => {
      xhr.setRequestHeader(k, v);
    });

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE && reqIsDestroyed === false) {
        if (xhr.status >= 200 && xhr.status <= 299) {
          diag.debug('xhr success', innerBody);
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
            sendWithRetry(innerBody, headers, retries - 1, minDelay);
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

    xhr.send(innerBody);
  };

  const commonHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (
    compressionAlgorithm === CompressionAlgorithm.NONE ||
    typeof CompressionStream === 'undefined'
  ) {
    sendWithRetry(body, {
      ...commonHeaders,
      ...headers,
    });
  } else {
    compressContent(new Blob([body.buffer]), compressionAlgorithm)
      .then(compressedContent => {
        sendWithRetry(compressedContent, {
          ...commonHeaders,
          ...headers,
          'Content-Encoding': compressionAlgorithm,
        });
      })
      .catch(_error => {
        sendWithRetry(body, {
          ...commonHeaders,
          ...headers,
        });
      });
  }
}

async function compressContent(
  content: string | Blob,
  compressionAlgorithm: string
): Promise<Uint8Array> {
  const compressionStream = new CompressionStream(
    compressionAlgorithm as CompressionFormat
  );

  const reader =
    typeof content === 'string'
      ? new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(content));
            controller.close();
          },
        })
      : content.stream();

  const compressedStream = reader.pipeThrough(compressionStream);

  let totalLength = 0;
  const compressedChunks: Uint8Array[] = [];

  const readerStream = compressedStream.getReader();
  try {
    let readResult = await readerStream.read();
    while (!readResult.done) {
      const value = readResult.value;
      if (value instanceof Uint8Array) {
        compressedChunks.push(value);
        totalLength += value.length;
      }
      readResult = await readerStream.read();
    }
  } finally {
    readerStream.releaseLock();
  }

  const compressedData = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of compressedChunks) {
    compressedData.set(chunk, offset);
    offset += chunk.length;
  }

  return compressedData;
}
