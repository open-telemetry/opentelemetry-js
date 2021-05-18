/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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

  public debug(...args: any[]): void {
    return logProxy('debug', this._namespace, args);
  }

  public error(...args: any[]): void {
    return logProxy('error', this._namespace, args);
  }

  public info(...args: any[]): void {
    return logProxy('info', this._namespace, args);
  }

  public warn(...args: any[]): void {
    return logProxy('warn', this._namespace, args);
  }

  public verbose(...args: any[]): void {
    return logProxy('verbose', this._namespace, args);
  }
}

function logProxy(
  funcName: keyof DiagLogger,
  namespace: string,
  args: any
): void {
  const logger = getGlobal('diag');
  // shortcut if logger not set
  if (!logger) {
    return;
  }

  args.unshift(namespace);
  return logger[funcName].apply(logger, args);
}
