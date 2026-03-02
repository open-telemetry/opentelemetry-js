/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchSpanProcessorBase } from '../../../export/BatchSpanProcessorBase';
import { BufferConfig } from '../../../types';

export class BatchSpanProcessor extends BatchSpanProcessorBase<BufferConfig> {
  protected onShutdown(): void {}
}
