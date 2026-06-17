/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { BufferConfig } from '../../../types';
import { BatchLogRecordProcessorBase } from '../../../export/BatchLogRecordProcessorBase';

export class BatchLogRecordProcessor extends BatchLogRecordProcessorBase<BufferConfig> {
  protected onShutdown(): void {}
}
