/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchSpanProcessorBase } from '../../../export/BatchSpanProcessorBase';
import type { BatchSpanProcessorOptions } from '../../../types';

export class BatchSpanProcessor extends BatchSpanProcessorBase<BatchSpanProcessorOptions> {
  protected onShutdown(): void {}
}
