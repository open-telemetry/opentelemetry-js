/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from '@opentelemetry/api';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { InstrumentationScope } from '@opentelemetry/core';
import { LogRecordProcessor } from '../LogRecordProcessor';
import { ReadableLogRecord } from './ReadableLogRecord';

export class NoopLogRecordProcessor implements LogRecordProcessor {
  public forceFlush(): Promise<void> {
    return Promise.resolve();
  }

  public onEmit(_logRecord: ReadableLogRecord, _context: Context): void {}

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
