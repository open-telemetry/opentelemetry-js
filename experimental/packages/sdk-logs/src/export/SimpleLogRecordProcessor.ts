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

import type { ExportResult } from '@opentelemetry/core';
import {
  BindOnceFuture,
  ExportResultCode,
  globalErrorHandler,
  internal,
} from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import type { LogRecordExporter } from './LogRecordExporter';
import type { LogRecordProcessor } from '../LogRecordProcessor';
import type { LogRecord } from './../LogRecord';

export class SimpleLogRecordProcessor implements LogRecordProcessor {
  private _shutdownOnce: BindOnceFuture<void>;
  private _unresolvedExports: Set<Promise<void>>;

  constructor(private readonly _exporter: LogRecordExporter) {
    this._shutdownOnce = new BindOnceFuture(this._shutdown, this);
    this._unresolvedExports = new Set<Promise<void>>();
  }

  public onEmit(logRecord: LogRecord): void {
    if (this._shutdownOnce.isCalled) {
      return;
    }

    const doExport = () =>
      internal
        ._export(this._exporter, [logRecord])
        .then((result: ExportResult) => {
          if (result.code !== ExportResultCode.SUCCESS) {
            globalErrorHandler(
              result.error ??
                new Error(
                  `SimpleLogRecordProcessor: log record export failed (status ${result})`
                )
            );
          }
        })
        .catch(error => {
          globalErrorHandler(error);
        });

    // Avoid scheduling a promise to make the behavior more predictable and easier to test
    if (logRecord.resource.asyncAttributesPending) {
      const exportPromise = (logRecord.resource as Resource)
        .waitForAsyncAttributes?.()
        .then(
          () => {
            if (exportPromise != null) {
              this._unresolvedExports.delete(exportPromise);
            }
            return doExport();
          },
          err => globalErrorHandler(err)
        );

      // store the unresolved exports
      if (exportPromise != null) {
        this._unresolvedExports.add(exportPromise);
      }
    } else {
      void doExport();
    }
  }

  public async forceFlush(): Promise<void> {
    // await unresolved resources before resolving
    await Promise.all(Array.from(this._unresolvedExports));
  }

  public shutdown(): Promise<void> {
    return this._shutdownOnce.call();
  }

  private _shutdown(): Promise<void> {
    return this._exporter.shutdown();
  }
}
