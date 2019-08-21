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

/**
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// mongodb.Server type is deprecated so every use trigger a lint error
/* tslint:disable:deprecation */

import { BasePlugin } from '@opentelemetry/core';
import { Span, SpanKind, CanonicalCode } from '@opentelemetry/types';
import * as mongodb from 'mongodb';
import * as shimmer from 'shimmer';

type Func<T> = (...args: unknown[]) => T;
type MongoDB = typeof mongodb;
interface MongoInternalCommand {
  findandmodify: boolean;
  createIndexes: boolean;
  count: boolean;
  ismaster: boolean;
}

/** MongoDB instrumentation plugin for OpenTelemetry */
export class MongoDBPlugin extends BasePlugin<MongoDB> {
  private readonly _SERVER_METHODS = ['insert', 'update', 'remove', 'command'];
  private readonly _CURSOR_METHODS = ['_next', 'next'];

  protected readonly _supportedVersions = ['>=2 <3'];

  constructor(readonly moduleName: string) {
    super();
  }

  /**
   * Patches MongoDB operations.
   */
  protected patch() {
    this._logger.debug('Patched MongoDB');

    if (this._moduleExports.Server) {
      for (const fn of this._SERVER_METHODS) {
        this._logger.debug(`patching mongodb-core.Server.prototype.${fn}`);
        shimmer.wrap(
          this._moduleExports.Server.prototype,
          // Forced to ignore due to incomplete typings
          // tslint:disable-next-line:ban-ts-ignore
          // @ts-ignore
          fn,
          this._getPatchCommand(fn)
        );
      }
    }

    if (this._moduleExports.Cursor) {
      this._logger.debug(
        'patching mongodb-core.Cursor.prototype functions:',
        this._CURSOR_METHODS
      );
      shimmer.massWrap(
        [this._moduleExports.Cursor.prototype],
        this._CURSOR_METHODS as never[],
        // tslint:disable-next-line:no-any
        this._getPatchCursor() as any
      );
    }

    return this._moduleExports;
  }

  /** Unpatches all MongoDB patched functions. */
  unpatch(): void {
    shimmer.massUnwrap([this._moduleExports.Server.prototype], this
      ._SERVER_METHODS as never[]);
    shimmer.massUnwrap([this._moduleExports.Cursor.prototype], this
      ._CURSOR_METHODS as never[]);
  }

  /** Creates spans for Command operations */
  private _getPatchCommand(operationName: string) {
    const plugin = this;
    return (original: Func<mongodb.Server>) => {
      return function patchedServerCommand(
        this: mongodb.Server,
        ns: string,
        command: MongoInternalCommand,
        options: {} | Function,
        callback: Func<unknown>
      ): mongodb.Server {
        const currentSpan = plugin._tracer.getCurrentSpan();
        // @ts-ignore
        const resultHandler =
          typeof options === 'function' ? options : callback;
        if (
          currentSpan === null ||
          typeof resultHandler !== 'function' ||
          typeof command !== 'object'
        ) {
          return original.apply(this, (arguments as unknown) as unknown[]);
        }
        let type: string;
        if (command.createIndexes !== undefined) {
          type = 'createIndexes';
        } else if (command.findandmodify !== undefined) {
          type = 'findAndModify';
        } else if (command.ismaster !== undefined) {
          type = 'isMaster';
        } else if (command.count !== undefined) {
          type = 'count';
        } else {
          type = operationName;
        }

        const span = plugin._tracer.startSpan(`mongodb.${type}`, {
          parent: currentSpan,
          kind: SpanKind.CLIENT,
        });
        span.setAttribute('db', ns);
        if (typeof options === 'function') {
          return original.call(
            this,
            ns,
            command,
            plugin._patchEnd(span, options as Func<unknown>)
          );
        } else {
          return original.call(
            this,
            ns,
            command,
            options,
            plugin._patchEnd(span, callback)
          );
        }
      };
    };
  }

  /** Creates spans for Cursor operations */
  private _getPatchCursor() {
    const plugin = this;
    return (original: Func<mongodb.Cursor>) => {
      return function patchedCursorCommand(
        this: { ns: string },
        ...args: unknown[]
      ): mongodb.Cursor {
        const currentSpan = plugin._tracer.getCurrentSpan();
        const resultHandler = args[0] as Func<unknown> | undefined;
        if (currentSpan === null || resultHandler === undefined) {
          return original.apply(this, (arguments as unknown) as unknown[]);
        }
        const span = plugin._tracer.startSpan(`mongodb.cursor`, {
          parent: currentSpan,
          kind: SpanKind.CLIENT,
        });

        return original.call(this, plugin._patchEnd(span, resultHandler));
      };
    };
  }

  /**
   * Ends a created span.
   * @param span The created span to end.
   * @param resultHandler A callback function.
   */
  private _patchEnd(span: Span, resultHandler: Func<unknown>): Function {
    return function patchedEnd(this: {}, ...args: unknown[]) {
      const error = args[0];
      if (error instanceof Error) {
        span.setStatus({
          code: CanonicalCode.UNKNOWN,
          message: error.message,
        });
      }
      span.end();
      return resultHandler.apply(this, (arguments as unknown) as unknown[]);
    };
  }
}

export const plugin = new MongoDBPlugin('mongodb-core');
