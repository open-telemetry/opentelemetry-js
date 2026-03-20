/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Context } from '@opentelemetry/api';
import type { LogRecordProcessor } from '../LogRecordProcessor';
import type { ReadableLogRecord } from './ReadableLogRecord';

export class NoopLogRecordProcessor implements LogRecordProcessor {
  forceFlush(): Promise<void> {
    return Promise.resolve();
  }

  onEmit(_logRecord: ReadableLogRecord, _context: Context): void {}

  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}
