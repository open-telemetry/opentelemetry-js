// export const OTLPProtoExporterBrowserBase = () => {
//   console.log('otlp-proto-exporter-base')
// }

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
import { ServiceClientType } from './types';
import {
  OTLPExporterBrowserBase as OTLPExporterBaseMain,
  // CompressionAlgorithm,
  OTLPExporterError,
  OTLPExporterConfigBase
} from '@opentelemetry/otlp-exporter-base';
import { send } from './util'

type SendFn = <ExportItem, ServiceRequest>(collector: OTLPProtoExporterBrowserBase<ExportItem, ServiceRequest>,
  objects: ExportItem[],
  // compression: CompressionAlgorithm,
  onSuccess: () => void,
  onError: (error: OTLPExporterError) => void) => void;

  /**
 * Collector Exporter abstract base class
 */
export abstract class OTLPProtoExporterBrowserBase<
ExportItem,
ServiceRequest
> extends OTLPExporterBaseMain<ExportItem, ServiceRequest> {
private _send!: SendFn;

constructor(config: OTLPExporterConfigBase = {}) {
  super(config);
}

private _sendPromise(
  objects: ExportItem[],
  onSuccess: () => void,
  onError: (error: OTLPExporterError) => void
): void {
  const promise = new Promise<void>((resolve, reject) => {
    this._send(this, objects, resolve, reject);
  })
    .then(onSuccess, onError);

  this._sendingPromises.push(promise);
  const popPromise = () => {
    const index = this._sendingPromises.indexOf(promise);
    this._sendingPromises.splice(index, 1);
  };
  promise.then(popPromise, popPromise);
}

override send(
  objects: ExportItem[],
  onSuccess: () => void,
  onError: (error: OTLPExporterError) => void
): void {
  if (this._shutdownOnce.isCalled) {
    diag.debug('Shutdown already started. Cannot send objects');
    return;
  }
  if (!this._send) {
    // defer to next tick and lazy load to avoid loading protobufjs too early
    // and making this impossible to be instrumented
    setImmediate(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      this._send = send;
      this._sendPromise(objects, onSuccess, onError);
    });
  } else {
    this._sendPromise(objects, onSuccess, onError);
  }
}
abstract getServiceClientType(): ServiceClientType;

}
