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

// NOTE: do not change these type imports to actual imports. Doing so WILL break `@opentelemetry/instrumentation-http`,
// as they'd be imported before the http/https modules can be wrapped.
import type * as https from 'https';
import type * as http from 'http';
import { ExportResponse } from '../export-response';
import { IExporterTransport } from '../exporter-transport';
import { sendWithHttp } from './http-transport-utils';
import { NodeHttpRequestParameters } from './node-http-transport-types';

interface Utils {
  agent: http.Agent | https.Agent;
  request: typeof http.request | typeof https.request;
}

class HttpExporterTransport implements IExporterTransport {
  private _utils: Utils | null = null;

  constructor(private _parameters: NodeHttpRequestParameters) {}

  async send(data: Uint8Array, timeoutMillis: number): Promise<ExportResponse> {
    const { agent, request } = await this._loadUtils();
    const headers = await this._parameters.headers();

    return new Promise<ExportResponse>(resolve => {
      sendWithHttp(
        request,
        this._parameters.url,
        headers,
        this._parameters.compression,
        this._parameters.userAgent,
        agent,
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

  private async _loadUtils(): Promise<Utils> {
    let utils = this._utils;

    if (utils === null) {
      const protocol = new URL(this._parameters.url).protocol;
      const [agent, request] = await Promise.all([
        this._parameters.agentFactory(protocol),
        requestFunctionFactory(protocol),
      ]);
      utils = this._utils = { agent, request };
    }

    return utils;
  }
}

async function requestFunctionFactory(
  protocol: string
): Promise<typeof http.request | typeof https.request> {
  const module = protocol === 'http:' ? import('http') : import('https');
  const { request } = await module;
  return request;
}

export function createHttpExporterTransport(
  parameters: NodeHttpRequestParameters
): IExporterTransport {
  return new HttpExporterTransport(parameters);
}
