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
import { IExportPromiseHandler } from './bounded-queue-export-promise-handler';
import { ISerializer } from '@opentelemetry/otlp-transformer';
import { OTLPExporterError } from './types';
import { IOtlpResponseHandler } from './response-handler';
import { createLoggingPartialSuccessResponseHandler } from './logging-response-handler';
import { diag, DiagLogger } from '@opentelemetry/api';

/**
 * Internally shared export logic for OTLP.
 */
export interface IOtlpExportDelegate<Internal> {
  export(
    internalRepresentation: Internal,
    resultCallback: (result: ExportResult) => void
  ): void;
  forceFlush(): Promise<void>;
  shutdown(): Promise<void>;
}

class OTLPExportDelegate<Internal, Response>
  implements IOtlpExportDelegate<Internal>
{
  private _diagLogger: DiagLogger;
  constructor(
    private _transport: IExporterTransport,
    private _serializer: ISerializer<Internal, Response>,
    private _responseHandler: IOtlpResponseHandler<Response>,
    private _promiseQueue: IExportPromiseHandler,
    private _timeout: number
  ) {
    this._diagLogger = diag.createComponentLogger({
      namespace: 'OTLPExportDelegate',
    });
  }

  export(
    internalRepresentation: Internal,
    resultCallback: (result: ExportResult) => void
  ): void {
    this._diagLogger.debug('items to be sent', internalRepresentation);

    // don't do any work if too many exports are in progress.
    if (this._promiseQueue.hasReachedLimit()) {
      resultCallback({
        code: ExportResultCode.FAILED,
        error: new Error('Concurrent export limit reached'),
      });
      return;
    }

    const serializedRequest = this._serializer.serializeRequest(
      internalRepresentation
    );

    if (serializedRequest == null) {
      resultCallback({
        code: ExportResultCode.FAILED,
        error: new Error('Nothing to send'),
      });
      return;
    }

    this._promiseQueue.pushPromise(
      this._transport.send(serializedRequest, this._timeout).then(
        response => {
          if (response.status === 'success') {
            if (response.data != null) {
              try {
                this._responseHandler.handleResponse(
                  this._serializer.deserializeResponse(response.data)
                );
              } catch (e) {
                this._diagLogger.warn(
                  'Export succeeded but could not deserialize response - is the response specification compliant?',
                  e,
                  response.data
                );
              }
            }
            // No matter the response, we can consider the export still successful.
            resultCallback({
              code: ExportResultCode.SUCCESS,
            });
            return;
          } else if (response.status === 'failure' && response.error) {
            resultCallback({
              code: ExportResultCode.FAILED,
              error: response.error,
            });
            return;
          } else if (response.status === 'retryable') {
            resultCallback({
              code: ExportResultCode.FAILED,
              error: new OTLPExporterError(
                'Export failed with retryable status'
              ),
            });
          } else {
            resultCallback({
              code: ExportResultCode.FAILED,
              error: new OTLPExporterError('Export failed with unknown error'),
            });
          }
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

  async shutdown(): Promise<void> {
    this._diagLogger.debug('shutdown started');
    await this.forceFlush();
    this._transport.shutdown();
  }
}

/**
 * Creates a generic delegate for OTLP exports which only contains parts of the OTLP export that are shared across all
 * signals.
 */
export function createOtlpExportDelegate<Internal, Response>(
  components: {
    transport: IExporterTransport;
    serializer: ISerializer<Internal, Response>;
    promiseHandler: IExportPromiseHandler;
  },
  settings: { timeout: number }
): IOtlpExportDelegate<Internal> {
  return new OTLPExportDelegate(
    components.transport,
    components.serializer,
    createLoggingPartialSuccessResponseHandler(),
    components.promiseHandler,
    settings.timeout
  );
}
