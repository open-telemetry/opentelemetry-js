/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { BatchLogRecordProcessorOptions } from '../../../types';
import { BatchLogRecordProcessorBase } from '../../../export/BatchLogRecordProcessorBase';

export class BatchLogRecordProcessor extends BatchLogRecordProcessorBase<BatchLogRecordProcessorOptions> {
  #visibilityChangeListener?: () => void;

  constructor(options: BatchLogRecordProcessorOptions) {
    super(options);
    this.#onInit(options);
  }

  protected onShutdown(): void {
    if (typeof document === 'undefined') {
      return;
    }
    if (this.#visibilityChangeListener) {
      document.removeEventListener(
        'visibilitychange',
        this.#visibilityChangeListener
      );
    }
  }

  #onInit(options: BatchLogRecordProcessorOptions): void {
    if (
      options.disableAutoFlushOnDocumentHide === true ||
      typeof document === 'undefined'
    ) {
      return;
    }
    this.#visibilityChangeListener = () => {
      if (document.visibilityState === 'hidden') {
        void this.forceFlush();
      }
    };
    document.addEventListener(
      'visibilitychange',
      this.#visibilityChangeListener
    );
  }
}
