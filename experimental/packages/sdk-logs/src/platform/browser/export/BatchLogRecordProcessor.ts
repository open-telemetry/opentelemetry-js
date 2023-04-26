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

import type { LogRecordExporter } from './../../../export/LogRecordExporter';
import type { BatchLogRecordProcessorBrowserConfig } from '../../../types';
import { BatchLogRecordProcessorBase } from '../../../export/BatchLogRecordProcessorBase';

export class BatchLogRecordProcessor extends BatchLogRecordProcessorBase<BatchLogRecordProcessorBrowserConfig> {
  private _visibilityChangeListener?: () => void;
  private _pageHideListener?: () => void;

  constructor(
    exporter: LogRecordExporter,
    config?: BatchLogRecordProcessorBrowserConfig
  ) {
    super(exporter, config);
    this._onInit(config);
  }

  protected onShutdown(): void {
    if (typeof document === 'undefined') {
      return;
    }
    if (this._visibilityChangeListener) {
      document.removeEventListener(
        'visibilitychange',
        this._visibilityChangeListener
      );
    }
    if (this._pageHideListener) {
      document.removeEventListener('pagehide', this._pageHideListener);
    }
  }

  private _onInit(config?: BatchLogRecordProcessorBrowserConfig): void {
    if (
      config?.disableAutoFlushOnDocumentHide === true ||
      typeof document === 'undefined'
    ) {
      return;
    }
    this._visibilityChangeListener = () => {
      if (document.visibilityState === 'hidden') {
        void this.forceFlush();
      }
    };
    this._pageHideListener = () => {
      void this.forceFlush();
    };
    document.addEventListener(
      'visibilitychange',
      this._visibilityChangeListener
    );

    // use 'pagehide' event as a fallback for Safari; see https://bugs.webkit.org/show_bug.cgi?id=116769
    document.addEventListener('pagehide', this._pageHideListener);
  }
}
