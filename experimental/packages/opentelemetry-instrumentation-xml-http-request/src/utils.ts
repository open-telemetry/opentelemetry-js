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

// Much of the logic here overlaps with the same utils file in opentelemetry-instrumentation-fetch
// These may be unified in the future.

import * as api from '@opentelemetry/api';

const DIAG_LOGGER = api.diag.createComponentLogger({
  namespace:
    '@opentelemetry/opentelemetry-instrumentation-xml-http-request/utils',
});

function isDocument(value: unknown): value is Document {
  return typeof Document !== 'undefined' && value instanceof Document;
}

/**
 * Helper function to determine payload content length for XHR requests
 * @param body
 * @returns content length
 */
export function getXHRBodyLength(
  body: Document | XMLHttpRequestBodyInit
): number | undefined {
  if (isDocument(body)) {
    return new XMLSerializer().serializeToString(document).length;
  }

  // XMLHttpRequestBodyInit expands to the following:
  if (typeof body === 'string') {
    return getByteLength(body);
  }

  if (body instanceof Blob) {
    return body.size;
  }

  if (body instanceof FormData) {
    return getFormDataSize(body);
  }

  if (body instanceof URLSearchParams) {
    return getByteLength(body.toString());
  }

  // ArrayBuffer | ArrayBufferView
  if (body.byteLength !== undefined) {
    return body.byteLength;
  }

  DIAG_LOGGER.warn('unknown body type');
  return undefined;
}

const TEXT_ENCODER = new TextEncoder();
function getByteLength(s: string): number {
  return TEXT_ENCODER.encode(s).byteLength;
}

function getFormDataSize(formData: FormData): number {
  let size = 0;
  for (const [key, value] of formData.entries()) {
    size += key.length;
    if (value instanceof Blob) {
      size += value.size;
    } else {
      size += value.length;
    }
  }
  return size;
}
