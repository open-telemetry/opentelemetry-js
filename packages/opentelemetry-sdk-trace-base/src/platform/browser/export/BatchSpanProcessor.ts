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

import { BatchSpanProcessorBase } from '../../../export/BatchSpanProcessorBase';
import { SpanExporter } from '../../../export/SpanExporter';
import { BatchSpanProcessorBrowserConfig } from '../../../types';

export class BatchSpanProcessor extends BatchSpanProcessorBase<BatchSpanProcessorBrowserConfig> {
  private _visibilityChangeListener?: () => void;
  private _pageHideListener?: () => void;

  constructor(_exporter: SpanExporter, config?: BatchSpanProcessorBrowserConfig) {
    super(_exporter, config);
    this.onInit(config);
  }

  private onInit(config?: BatchSpanProcessorBrowserConfig): void {
    if (config?.disableAutoFlushOnDocumentHide !== true && document != null) {
      this._visibilityChangeListener = () => {
        if (document.visibilityState === 'hidden') {
          void this.forceFlush();
        }
      };
      this._pageHideListener = () => {
        void this.forceFlush();
      };
      document.addEventListener('visibilitychange', this._visibilityChangeListener);

      // use 'pagehide' event as a fallback for Safari; see https://bugs.webkit.org/show_bug.cgi?id=116769
      document.addEventListener('pagehide', this._pageHideListener);
    }
  }

  protected onShutdown(): void {
    if (this._visibilityChangeListener) {
      document.removeEventListener('visibilitychange', this._visibilityChangeListener);
    }
    if (this._pageHideListener) {
      document.removeEventListener('pagehide', this._pageHideListener);
    }
  }
}
