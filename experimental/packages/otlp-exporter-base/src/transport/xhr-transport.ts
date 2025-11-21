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

import { IExporterTransport } from '../exporter-transport';
import { ExportResponse } from '../export-response';
import { diag } from '@opentelemetry/api';
import {
  isExportHTTPErrorRetryable,
  parseRetryAfterToMills,
} from '../is-export-retryable';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { createFetchTransport } from './fetch-transport';
import { HeadersFactory } from '../configuration/otlp-http-configuration';

/**
 * @deprecated favor the fetch transport
 * @see {@link createFetchTransport}
 */
export interface XhrRequestParameters {
  url: string;
  headers: HeadersFactory;
}

class XhrTransport implements IExporterTransport {
  constructor(private _parameters: XhrRequestParameters) {}

  async send(data: Uint8Array, timeoutMillis: number): Promise<ExportResponse> {
    const headers = await this._parameters.headers();
    const response = await new Promise<ExportResponse>(resolve => {
      const xhr = new XMLHttpRequest();
      xhr.timeout = timeoutMillis;
      xhr.open('POST', this._parameters.url);
      Object.entries(headers).forEach(([k, v]) => {
        xhr.setRequestHeader(k, v);
      });

      xhr.ontimeout = _ => {
        resolve({
          status: 'retryable',
          retryInMillis: 0,
        });
      };

      xhr.onreadystatechange = () => {
        if (xhr.status >= 200 && xhr.status <= 299) {
          diag.debug('XHR success');
          resolve({
            status: 'success',
          });
        } else if (xhr.status && isExportHTTPErrorRetryable(xhr.status)) {
          resolve({
            status: 'retryable',
            retryInMillis: parseRetryAfterToMills(
              xhr.getResponseHeader('Retry-After')
            ),
          });
        } else if (xhr.status !== 0) {
          resolve({
            status: 'failure',
            error: new Error('XHR request failed with non-retryable status'),
          });
        }
      };

      xhr.onabort = () => {
        resolve({
          status: 'failure',
          error: new Error('XHR request aborted'),
        });
      };
      xhr.onerror = () => {
        // XHR onerror typically indicates network failures which are retryable
        resolve({
          status: 'retryable',
          retryInMillis: 0,
        });
      };

      xhr.send(data);
    });

    return response;
  }

  shutdown() {
    // Intentionally left empty, nothing to do.
  }
}

/**
 * @deprecated use {@link createFetchTransport} instead
 *
 * Creates an exporter transport that uses XHR to send the data
 * @param parameters applied to each request made by transport
 */
export function createXhrTransport(
  parameters: XhrRequestParameters
): IExporterTransport {
  return new XhrTransport(parameters);
}
