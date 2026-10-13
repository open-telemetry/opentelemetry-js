/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchSpanProcessorBase } from '../../../export/BatchSpanProcessorBase';
import type { BatchSpanProcessorOptions } from '../../../types';
import { globalErrorHandler } from '@opentelemetry/core';

export class BatchSpanProcessor extends BatchSpanProcessorBase<BatchSpanProcessorOptions> {
  private _visibilityChangeListener?: () => void;

  constructor(options: BatchSpanProcessorOptions) {
    super(options);
    this.onInit(options);
  }

  private onInit(options: BatchSpanProcessorOptions): void {
    if (
      options.disableAutoFlushOnDocumentHide !== true &&
      typeof document !== 'undefined'
    ) {
      this._visibilityChangeListener = () => {
        if (document.visibilityState === 'hidden') {
          this.forceFlush().catch(error => {
            globalErrorHandler(error);
          });
        }
      };
      document.addEventListener(
        'visibilitychange',
        this._visibilityChangeListener
      );
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
    }
  }
}
