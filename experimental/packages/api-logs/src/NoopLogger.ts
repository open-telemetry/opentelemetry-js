/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Logger } from './types/Logger';
import { LogRecord } from './types/LogRecord';

export class NoopLogger implements Logger {
  emit(_logRecord: LogRecord): void {}
  enabled(): boolean {
    return false;
  }
}

export const NOOP_LOGGER = new NoopLogger();
