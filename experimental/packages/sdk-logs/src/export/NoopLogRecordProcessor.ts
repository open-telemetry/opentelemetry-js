/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { InstrumentationScope } from '@opentelemetry/core';
import type { Context } from '@opentelemetry/api';
import type { LogRecordProcessor } from '../LogRecordProcessor';
import type { SdkLogRecord } from '../export/SdkLogRecord';
import type { SeverityNumber } from '@opentelemetry/api-logs';

export class NoopLogRecordProcessor implements LogRecordProcessor {
  public forceFlush(): Promise<void> {
    return Promise.resolve();
  }

  public onEmit(_logRecord: SdkLogRecord, _context: Context): void {}

  public shutdown(): Promise<void> {
    return Promise.resolve();
  }

  public enabled(_options: {
    context: Context;
    instrumentationScope: InstrumentationScope;
    severityNumber?: SeverityNumber;
    eventName?: string;
  }): boolean {
    return false;
  }
}
