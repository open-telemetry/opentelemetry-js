/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchSpanProcessorBase } from '../../../export/BatchSpanProcessorBase';
import type { BatchSpanProcessorOptions } from '../../../types';
import { globalErrorHandler } from '@opentelemetry/core';

export class BatchSpanProcessor extends BatchSpanProcessorBase<BatchSpanProcessorOptions> {
  #visibilityChangeListener?: () => void;

  constructor(options: BatchSpanProcessorOptions) {
    super(options);
    this.#onInit(options);
  }

  #onInit(options: BatchSpanProcessorOptions): void {
    if (
      options.disableAutoFlushOnDocumentHide !== true &&
      typeof document !== 'undefined'
    ) {
      this.#visibilityChangeListener = () => {
        if (document.visibilityState === 'hidden') {
          this.forceFlush().catch(error => {
            globalErrorHandler(error);
          });
        }
      };
      document.addEventListener(
        'visibilitychange',
        this.#visibilityChangeListener
      );
    }
  }

  protected onShutdown(): void {
    if (typeof document !== 'undefined') {
      if (this.#visibilityChangeListener) {
        document.removeEventListener(
          'visibilitychange',
          this.#visibilityChangeListener
        );
      }
    }
  }
}
