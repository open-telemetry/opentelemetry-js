/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { BatchLogRecordProcessorBrowserOptions } from '../../../types';
import { BatchLogRecordProcessorBase } from '../../../export/BatchLogRecordProcessorBase';

export class BatchLogRecordProcessor extends BatchLogRecordProcessorBase<BatchLogRecordProcessorBrowserOptions> {
  private _visibilityChangeListener?: () => void;
  private _pageHideListener?: () => void;

  constructor(options: BatchLogRecordProcessorBrowserOptions) {
    super(options);
    this._onInit(options);
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
    if (this._pageHideListener && typeof window !== 'undefined') {
      window.removeEventListener('pagehide', this._pageHideListener);
    }
  }

  private _onInit(options: BatchLogRecordProcessorBrowserOptions): void {
    if (
      options.disableAutoFlushOnDocumentHide === true ||
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
    // 'pagehide' is dispatched on the window and does not reach the document
    if (typeof window !== 'undefined') {
      window.addEventListener('pagehide', this._pageHideListener);
    }
  }
}
