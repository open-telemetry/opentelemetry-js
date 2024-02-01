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

import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import { IExporterTransport } from './exporter-transport';
import { diag } from '@opentelemetry/api';
import { IExportPromiseQueue } from './export-promise-queue';
import { ISerializer } from './serializer';
import { ITransformer } from './transformer';
import { IOTLPResponseHandler } from './response-handler';

/**
 * Internally shared export logic for OTLP.
 */
export interface IOLTPExportDelegate<Internal> {
  export(
    internalRepresentation: Internal,
    resultCallback: (result: ExportResult) => void
  ): void;
  forceFlush(): Promise<void>;
  shutdown(): Promise<void>;
}

class OTLPExportDelegate<Internal, Request, Response>
  implements IOLTPExportDelegate<Internal>
{
  constructor(
    private _transport: IExporterTransport,
    private _transformer: ITransformer<Internal, Request>,
    private _serializer: ISerializer<Request, Response>,
    private _promiseQueue: IExportPromiseQueue,
    private _responseHandler: IOTLPResponseHandler<Response>
  ) {}

  export(
    internalRepresentation: Internal,
    resultCallback: (result: ExportResult) => void
  ): void {
    // don't do any work if too many exports are in progress.
    if (this._promiseQueue.hasReachedLimit()) {
      resultCallback({
        code: ExportResultCode.FAILED,
        error: new Error('Sending queue is full'),
      });
      return;
    }

    const internalRequest = this._transformer.transform(internalRepresentation);
    const serializedRequest =
      this._serializer.serializeRequest(internalRequest);

    if (serializedRequest == null) {
      resultCallback({
        code: ExportResultCode.FAILED,
        error: new Error('Nothing to send'),
      });
      return;
    }

    this._promiseQueue.pushPromise(
      this._transport.send(serializedRequest).then(
        response => {
          if (response.data) {
            try {
              const deserializedResponse = this._serializer.deserializeResponse(
                response.data
              );
              this._responseHandler.handleResponse(deserializedResponse);
            } catch (err) {
              diag.error('Invalid response from remote', err);
            }
          }

          if (response.status === 'success') {
            // No matter the response, we can consider the export still successful.
            resultCallback({
              code: ExportResultCode.SUCCESS,
            });
            return;
          }

          // Other responses may not reject, but still indicate failure.
          resultCallback({
            code: ExportResultCode.FAILED,
            error: response.error,
          });
        },
        reason =>
          resultCallback({
            code: ExportResultCode.FAILED,
            error: reason,
          })
      )
    );
  }

  forceFlush(): Promise<void> {
    return this._promiseQueue.awaitAll();
  }

  shutdown(): Promise<void> {
    return this.forceFlush();
  }
}

/**
 * Creates a generic delegate for OTLP exports which only contains parts of the OTLP export that are shared across all
 * signals.
 */
export function createOtlpExportDelegate<
  Internal,
  Request,
  Response,
>(components: {
  transport: IExporterTransport;
  transformer: ITransformer<Internal, Request>;
  serializer: ISerializer<Request, Response>;
  promiseQueue: IExportPromiseQueue;
  responseHandler: IOTLPResponseHandler<Response>;
}): IOLTPExportDelegate<Internal> {
  return new OTLPExportDelegate(
    components.transport,
    components.transformer,
    components.serializer,
    components.promiseQueue,
    components.responseHandler
  );
}
