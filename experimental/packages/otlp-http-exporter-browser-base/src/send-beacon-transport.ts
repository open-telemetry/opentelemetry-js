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
import {
  IExporterTransport,
  ExportResponse,
} from '@opentelemetry/otlp-exporter-base';

export interface SendBeaconParams {
  url: string;
  /**
   * for instance 'application/x-protobuf'
   */
  blobType: string;
}

class SendBeaconTransport implements IExporterTransport {
  constructor(private _params: SendBeaconParams) {}
  send(data: Uint8Array): Promise<ExportResponse> {
    return new Promise<ExportResponse>(resolve => {
      if (
        navigator.sendBeacon(
          this._params.url,
          new Blob([data], { type: this._params.blobType })
        )
      ) {
        // no way to signal retry, treat everything as success
        resolve({
          status: 'success',
        });
      } else {
        resolve({
          status: 'failure',
          error: new Error('SendBeacon failed'),
        });
      }
    });
  }
}

export function createSendBeaconTransport(
  parameters: SendBeaconParams
): IExporterTransport {
  return new SendBeaconTransport(parameters);
}
