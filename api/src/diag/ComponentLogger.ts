/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { getGlobal } from '../internal/global-utils';
import { ComponentLoggerOptions, DiagLogger } from './types';

/**
 * Component Logger which is meant to be used as part of any component which
 * will add automatically additional namespace in front of the log message.
 * It will then forward all message to global diag logger
 * @example
 * const cLogger = diag.createComponentLogger({ namespace: '@opentelemetry/instrumentation-http' });
 * cLogger.debug('test');
 * // @opentelemetry/instrumentation-http test
 */
export class DiagComponentLogger implements DiagLogger {
  private _namespace: string;

  constructor(props: ComponentLoggerOptions) {
    this._namespace = props.namespace || 'DiagComponentLogger';
  }

  public debug(...args: unknown[]): void {
    return logProxy('debug', this._namespace, args);
  }

  public error(...args: unknown[]): void {
    return logProxy('error', this._namespace, args);
  }

  public info(...args: unknown[]): void {
    return logProxy('info', this._namespace, args);
  }

  public warn(...args: unknown[]): void {
    return logProxy('warn', this._namespace, args);
  }

  public verbose(...args: unknown[]): void {
    return logProxy('verbose', this._namespace, args);
  }
}

function logProxy(
  funcName: keyof DiagLogger,
  namespace: string,
  args: unknown[]
): void {
  const logger = getGlobal('diag');
  // shortcut if logger not set
  if (!logger) {
    return;
  }

  return logger[funcName](namespace, ...args);
}
