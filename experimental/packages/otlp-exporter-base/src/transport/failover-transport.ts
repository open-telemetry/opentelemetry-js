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

export interface FailoverTransportParameters {
  primary: IExporterTransport;
  failover: IExporterTransport;
}

class FailoverTransport implements IExporterTransport {
  private _primary: IExporterTransport;
  private _failover: IExporterTransport;

  constructor(parameters: FailoverTransportParameters) {
    this._primary = parameters.primary;
    this._failover = parameters.failover;
  }

  async send(data: Uint8Array, timeoutMillis: number): Promise<ExportResponse> {
    const result = await this._primary.send(data, timeoutMillis);
    if (result.status === 'failure') {
      diag.debug('Primary transport failed, switching to failover transport');
      return this._failover.send(data, timeoutMillis);
    }
    return result;
  }

  shutdown(): void {
    this._primary.shutdown();
    this._failover.shutdown();
  }
}

/**
 * Creates a transport that tries the primary transport first,
 * and switches to the failover transport if the primary fails.
 */
export function createFailoverTransport(
  parameters: FailoverTransportParameters
): IExporterTransport {
  return new FailoverTransport(parameters);
}
