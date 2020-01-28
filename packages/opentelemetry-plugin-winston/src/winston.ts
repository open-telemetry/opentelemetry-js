/*!
 * Copyright 2019, OpenTelemetry Authors
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
import * as semver from 'semver';
import * as shimmer from 'shimmer';
import * as winston from 'winston';
import { BasePlugin } from '@opentelemetry/core';
import { WinstonChunk } from './types';
import { addTraceToChunk, processArgs } from './utils';
import { VERSION } from './version';

/**
 * Winston instrumentation plugin for Open Telemetry
 */
export class WinstonPlugin extends BasePlugin<any> {
  readonly component: string;
  readonly supportedVersions = ['>=1 <4'];
  private _loggers: winston.Logger[] = [];

  constructor(readonly moduleName: string, readonly version: string) {
    super(`@opentelemetry/plugin-${moduleName}`, version);
    this.component = this.moduleName;
    this._config = {};
  }

  /**
   * Patching createLogger function for winston version 3
   */
  private _patchCreateLoggerV3() {
    return (
      original: any
    ): ((this: winston.Logger, ...args: any[]) => winston.Logger) => {
      const plugin = this;
      return function createLoggerPatched(
        this: winston.Logger,
        ...args: any[]
      ): winston.Logger {
        const logger: winston.Logger = original.apply(this, args);
        plugin._loggers.push(logger);
        shimmer.wrap(logger, 'write', plugin._patchLoggerWriteV3());
        return logger;
      };
    };
  }

  /**
   * Patching log function for winston version 1 & 2
   */
  private _patchLogV2() {
    return (original: any): ((this: any, ...args: any[]) => any) => {
      const plugin = this;
      return function logPatched(this: any, ...args: any[]): any {
        const span = plugin._tracer.getCurrentSpan();
        if (span) {
          args = processArgs(args, span);
        }
        return original.apply(this, args);
      };
    };
  }

  /**
   * Patching logger.write function for winston version 3
   */
  private _patchLoggerWriteV3() {
    return (original: {
      (
        chunk: any,
        encoding?: string | undefined,
        cb?: ((error: Error | null | undefined) => void) | undefined
      ): boolean;
      (
        chunk: any,
        cb?: ((error: Error | null | undefined) => void) | undefined
      ): boolean;
    }) => {
      const plugin = this;
      return function createLoggerWritePatched(this: any, ...args: any) {
        const span = plugin._tracer.getCurrentSpan();
        if (span) {
          const chunk: WinstonChunk = args[0];
          args[0] = addTraceToChunk(chunk, span);
        }
        return original.apply(this, args);
      };
    };
  }

  /**
   * implements patch function
   */
  protected patch() {
    if (semver.satisfies(this._moduleExports.version, '>=3.0.0')) {
      shimmer.wrap(
        this._moduleExports,
        'createLogger',
        this._patchCreateLoggerV3()
      );
    }
    if (semver.satisfies(this._moduleExports.version, '1 - 2')) {
      shimmer.wrap(
        this._moduleExports.Logger.prototype,
        'log',
        this._patchLogV2()
      );
    }
    return this._moduleExports;
  }

  /**
   * implements unpatch function
   */
  protected unpatch(): void {
    this._logger.debug(
      'removing patch from %s@%s',
      this.moduleName,
      this.version
    );

    if (semver.satisfies(this._moduleExports.version, '>=3.0.0')) {
      shimmer.unwrap(this._moduleExports, 'createLogger');
      this._loggers.forEach((logger: winston.Logger) => {
        shimmer.unwrap(logger, 'write');
      });
      this._loggers = [];
    }
    if (semver.satisfies(this._moduleExports.version, '1 - 2')) {
      shimmer.unwrap(this._moduleExports.Logger.prototype, 'log');
    }
  }
}

export const plugin = new WinstonPlugin('winston', VERSION);
