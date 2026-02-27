/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { callWithTimeout, InstrumentationScope } from '@opentelemetry/core';
import type { Context } from '@opentelemetry/api';
import type { LogRecordProcessor } from './LogRecordProcessor';
import type { SdkLogRecord } from './export/SdkLogRecord';
import { SeverityNumber } from '@opentelemetry/api-logs';

/**
 * Implementation of the {@link LogRecordProcessor} that simply forwards all
 * received events to a list of {@link LogRecordProcessor}s.
 */
export class MultiLogRecordProcessor implements LogRecordProcessor {
  public readonly processors: LogRecordProcessor[];
  public readonly forceFlushTimeoutMillis: number;
  constructor(
    processors: LogRecordProcessor[],
    forceFlushTimeoutMillis: number
  ) {
    this.processors = processors;
    this.forceFlushTimeoutMillis = forceFlushTimeoutMillis;
  }

  public async forceFlush(): Promise<void> {
    const timeout = this.forceFlushTimeoutMillis;
    await Promise.all(
      this.processors.map(processor =>
        callWithTimeout(processor.forceFlush(), timeout)
      )
    );
  }

  public onEmit(logRecord: SdkLogRecord, context?: Context): void {
    this.processors.forEach(processors =>
      processors.onEmit(logRecord, context)
    );
  }

  public async shutdown(): Promise<void> {
    await Promise.all(this.processors.map(processor => processor.shutdown()));
  }

  public enabled(options: {
    context: Context;
    instrumentationScope: InstrumentationScope;
    severityNumber?: SeverityNumber;
    eventName?: string;
  }): boolean {
    for (const processor of this.processors) {
      if (!processor.enabled || processor.enabled(options)) {
        return true;
      }
    }
    return false;
  }
}
