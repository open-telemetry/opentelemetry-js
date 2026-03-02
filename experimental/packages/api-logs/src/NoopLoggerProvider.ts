/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { LoggerProvider } from './types/LoggerProvider';
import { Logger } from './types/Logger';
import { LoggerOptions } from './types/LoggerOptions';
import { NoopLogger } from './NoopLogger';

export class NoopLoggerProvider implements LoggerProvider {
  getLogger(
    _name: string,
    _version?: string | undefined,
    _options?: LoggerOptions | undefined
  ): Logger {
    return new NoopLogger();
  }
}

export const NOOP_LOGGER_PROVIDER = new NoopLoggerProvider();
