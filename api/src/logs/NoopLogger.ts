/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Logger } from './types/Logger';
import type { LogRecord } from './types/LogRecord';

export class NoopLogger implements Logger {
  emit(_logRecord: LogRecord): void {}
  enabled(): boolean {
    return false;
  }
}

export const NOOP_LOGGER = new NoopLogger();

/**
 * Create a no-op Logger
 */
export function createNoopLogger(): Logger {
  return NOOP_LOGGER;
}
