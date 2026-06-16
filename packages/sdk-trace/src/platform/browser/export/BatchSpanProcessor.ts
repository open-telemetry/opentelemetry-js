/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchSpanProcessorBase } from '../../../export/BatchSpanProcessorBase';
import type { BatchSpanProcessorBrowserOptions } from '../../../types';
import { globalErrorHandler } from '@opentelemetry/core';

export class BatchSpanProcessor extends BatchSpanProcessorBase<BatchSpanProcessorBrowserOptions> {
  private _visibilityChangeListener?: () => void;
  private _pageHideListener?: () => void;

  constructor(options: BatchSpanProcessorBrowserOptions) {
    super(options);
    this.onInit(options);
  }

  private onInit(options: BatchSpanProcessorBrowserOptions): void {
    if (
      options?.disableAutoFlushOnDocumentHide !== true &&
      typeof document !== 'undefined'
    ) {
      this._visibilityChangeListener = () => {
        if (document.visibilityState === 'hidden') {
          this.forceFlush().catch(error => {
            globalErrorHandler(error);
          });
        }
      };
      this._pageHideListener = () => {
        this.forceFlush().catch(error => {
          globalErrorHandler(error);
        });
      };
      document.addEventListener(
        'visibilitychange',
        this._visibilityChangeListener
      );

      // use 'pagehide' event as a fallback for Safari; see https://bugs.webkit.org/show_bug.cgi?id=116769
      document.addEventListener('pagehide', this._pageHideListener);
    }
  }

  protected onShutdown(): void {
    if (typeof document !== 'undefined') {
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
  }
}
