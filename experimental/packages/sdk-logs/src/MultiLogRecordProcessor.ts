/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { InstrumentationScope } from '@opentelemetry/core';
import { callWithTimeout } from '@opentelemetry/core';
import type { Context } from '@opentelemetry/api';
import type { LogRecordProcessor } from './LogRecordProcessor';
import type { ReadWriteLogRecord } from './export/ReadWriteLogRecord';
import type { SeverityNumber } from '@opentelemetry/api-logs';
import type { ForceFlushOptions } from './types';

/**
 * Implementation of the {@link LogRecordProcessor} that simply forwards all
 * received events to a list of {@link LogRecordProcessor}s.
 */
export class MultiLogRecordProcessor implements LogRecordProcessor {
  public readonly processors: LogRecordProcessor[];
  constructor(processors: LogRecordProcessor[]) {
    this.processors = processors;
  }

  public async forceFlush(options?: ForceFlushOptions): Promise<void> {
    const timeout = options?.timeoutMillis ?? 30000;
    await Promise.all(
      this.processors.map(processor =>
        callWithTimeout(processor.forceFlush(), timeout)
      )
    );
  }

  public onEmit(logRecord: ReadWriteLogRecord, context?: Context): void {
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
