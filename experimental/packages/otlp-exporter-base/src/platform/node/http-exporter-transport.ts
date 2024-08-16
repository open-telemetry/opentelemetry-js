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

import type {
  HttpRequestParameters,
  sendWithHttp,
} from './http-transport-types';

// NOTE: do not change these type imports to actual imports. Doing so WILL break `@opentelemetry/instrumentation-http`,
// as they'd be imported before the http/https modules can be wrapped.
import type * as https from 'https';
import type * as http from 'http';
import { ExportResponse } from '../../export-response';
import { IExporterTransport } from '../../exporter-transport';

class HttpExporterTransport implements IExporterTransport {
  private _send: sendWithHttp | null = null;
  private _agent: http.Agent | https.Agent | null = null;

  constructor(private _parameters: HttpRequestParameters) {}

  async send(data: Uint8Array, timeoutMillis: number): Promise<ExportResponse> {
    if (this._send == null) {
      // Lazy require to ensure that http/https is not required before instrumentations can wrap it.
      const {
        sendWithHttp,
        createHttpAgent,
        // eslint-disable-next-line @typescript-eslint/no-var-requires
      } = require('./http-transport-utils');
      this._agent = createHttpAgent(
        this._parameters.url,
        this._parameters.agentOptions
      );
      this._send = sendWithHttp;
    }

    return new Promise<ExportResponse>(resolve => {
      // this will always be defined
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this._send?.(
        this._parameters,
        this._agent!,
        data,
        result => {
          resolve(result);
        },
        timeoutMillis
      );
    });
  }
  shutdown() {
    // intentionally left empty, nothing to do.
  }
}

export function createHttpExporterTransport(
  parameters: HttpRequestParameters
): IExporterTransport {
  return new HttpExporterTransport(parameters);
}
