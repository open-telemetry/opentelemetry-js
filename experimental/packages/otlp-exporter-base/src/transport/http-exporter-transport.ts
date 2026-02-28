/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
  private _parameters: NodeHttpRequestParameters;

  constructor(parameters: NodeHttpRequestParameters) {
    this._parameters = parameters;
  }

  async send(data: Uint8Array, timeoutMillis: number): Promise<ExportResponse> {
    const { agent, request } = await this._loadUtils();
    const headers = await this._parameters.headers();

    return sendWithHttp(
      request,
      this._parameters.url,
      headers,
      this._parameters.compression,
      this._parameters.userAgent,
      agent,
      data,
      timeoutMillis
    );
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
