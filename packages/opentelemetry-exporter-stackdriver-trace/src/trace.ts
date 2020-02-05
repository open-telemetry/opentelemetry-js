/*!
 * Copyright 2019, OpenTelemetry Authors
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

import { ExportResult } from '@opentelemetry/base';
import { NoopLogger } from '@opentelemetry/core';
import { ReadableSpan, SpanExporter } from '@opentelemetry/tracing';
import { Logger } from '@opentelemetry/api';
import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';
import { StackdriverExporterOptions } from './external-types';
import { getReadableSpanTransformer } from './transform';
import { Span, SpansWithCredentials } from './types';

const OT_REQUEST_HEADER = 'x-opentelemetry-outgoing-request';
google.options({ headers: { [OT_REQUEST_HEADER]: 1 } });

/**
 * Format and sends span information to StackDriver Trace.
 */
export class StackdriverTraceExporter implements SpanExporter {
  private _projectId: string | void | Promise<string | void>;
  private readonly _logger: Logger;
  private readonly _auth: GoogleAuth;

  private static readonly _cloudTrace = google.cloudtrace('v2');

  constructor(options: StackdriverExporterOptions) {
    this._logger = options.logger || new NoopLogger();

    this._auth = new GoogleAuth({
      credentials: options.credentials,
      keyFile: options.keyFile,
      keyFilename: options.keyFilename,
      projectId: options.projectId,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    // Start this async process as early as possible. It will be
    // awaited on the first export because constructors are synchronous
    this._projectId = this._auth.getProjectId().catch(err => {
      this._logger.error(err);
    });
  }

  /**
   * Publishes a list of spans to Stackdriver.
   * @param spans The list of spans to transmit to Stackdriver
   */
  async export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ): Promise<void> {
    if (this._projectId instanceof Promise) {
      this._projectId = await this._projectId;
    }

    if (!this._projectId) {
      return resultCallback(ExportResult.FAILED_NOT_RETRYABLE);
    }

    this._logger.debug('StackDriver Trace export');
    const authorizedSpans = await this._authorize(
      spans.map(getReadableSpanTransformer(this._projectId))
    );

    if (!authorizedSpans) {
      return resultCallback(ExportResult.FAILED_NOT_RETRYABLE);
    }
    this._logger.debug('StackDriver Trace got span authorization');

    try {
      await this._batchWriteSpans(authorizedSpans);
      resultCallback(ExportResult.SUCCESS);
    } catch (err) {
      this._logger.error(`Stackdriver Trace failed to export ${err}`);
      resultCallback(ExportResult.FAILED_RETRYABLE);
    }
  }

  shutdown(): void {}

  /**
   * Sends new spans to new or existing traces in the Stackdriver format to the
   * service.
   * @param spans
   */
  private _batchWriteSpans(spans: SpansWithCredentials) {
    this._logger.debug('StackDriver Trace batch writing traces');

    return new Promise((resolve, reject) => {
      // @todo Consider to use gRPC call (BatchWriteSpansRequest) for sending
      // data to backend :
      // https://cloud.google.com/trace/docs/reference/v2/rpc/google.devtools.
      // cloudtrace.v2#google.devtools.cloudtrace.v2.TraceService
      StackdriverTraceExporter._cloudTrace.projects.traces.batchWrite(
        spans,
        (err: Error | null) => {
          if (err) {
            err.message = `batchWriteSpans error: ${err.message}`;
            this._logger.error(err.message);
            reject(err);
          } else {
            const successMsg = 'batchWriteSpans successfully';
            this._logger.debug(successMsg);
            resolve(successMsg);
          }
        }
      );
    });
  }

  /**
   * Gets the Google Application Credentials from the environment variables,
   * authenticates the client and calls a method to send the spans data.
   * @param stackdriverSpans The spans to export
   */
  private async _authorize(
    spans: Span[]
  ): Promise<SpansWithCredentials | null> {
    try {
      return {
        name: `projects/${this._projectId}`,
        resource: { spans },
        auth: await this._auth.getClient(),
      };
    } catch (err) {
      err.message = `authorize error: ${err.message}`;
      this._logger.error(err.message);
      return null;
    }
  }
}
