/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Context } from '@opentelemetry/api';
import { LogRecord, SeverityNumber } from './LogRecord';

export interface Logger {
  /**
   * Emit a log record. This method should only be used by log appenders.
   *
   * @param logRecord
   */
  emit(logRecord: LogRecord): void;

  /**
   * Will a log record with the given details get emitted?
   * This can be used to avoid expensive calculation of log record data.   
   */
  enabled(options?: {
    context?: Context;
    severityNumber?: SeverityNumber;
    eventName?: string;
  }): boolean;
}
