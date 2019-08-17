/**
 * Copyright 2018, OpenCensus Authors
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

import { BasePlugin, NoopLogger } from '@opentelemetry/core';
import {
  Span,
  SpanKind,
  Logger,
  Tracer,
  CanonicalCode,
} from '@opentelemetry/types';
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

/** MongoDB instrumentation plugin for Opencensus */
export class MongoDBPlugin extends BasePlugin<MongoDB> {
  private readonly SERVER_FNS = ['insert', 'update', 'remove', 'auth'];
  private readonly CURSOR_FNS_FIRST = ['_find', '_getmore'];
  protected _logger!: Logger;
  protected readonly _tracer!: Tracer;

  constructor(public moduleName: string) {
    super();
    // TODO: remove this once a logger will be passed
    // https://github.com/open-telemetry/opentelemetry-js/issues/193
    this._logger = new NoopLogger();
  }

  /**
   * Patches MongoDB operations.
   */
  protected patch() {
    this._logger.debug('Patched MongoDB');

    if (this._moduleExports.Server) {
      this._logger.debug('patching mongodb-core.Server.prototype.command');
      shimmer.wrap(
        this._moduleExports.Server.prototype,
        'command' as never,
        // tslint:disable-next-line:no-any
        this.getPatchCommand() as any
      );
      this._logger.debug(
        'patching mongodb-core.Server.prototype functions:',
        this.SERVER_FNS
      );
      shimmer.massWrap(
        [this._moduleExports.Server.prototype],
        this.SERVER_FNS as never[],
        // tslint:disable-next-line:no-any
        this.getPatchQuery() as any
      );
    }

    if (this._moduleExports.Cursor) {
      this._logger.debug(
        'patching mongodb-core.Cursor.prototype functions:',
        this.CURSOR_FNS_FIRST
      );
      shimmer.massWrap(
        [this._moduleExports.Cursor.prototype],
        this.CURSOR_FNS_FIRST as never[],
        // tslint:disable-next-line:no-any
        this.getPatchCursor() as any
      );
    }

    return this._moduleExports;
  }

  /** Unpatches all MongoDB patched functions. */
  unpatch(): void {
    shimmer.unwrap(this._moduleExports.Server.prototype, 'command' as never);
    shimmer.massUnwrap([this._moduleExports.Server.prototype], this
      .SERVER_FNS as never[]);
    shimmer.massUnwrap([this._moduleExports.Cursor.prototype], this
      .CURSOR_FNS_FIRST as never[]);
  }

  /** Creates spans for Command operations */
  private getPatchCommand() {
    const plugin = this;
    return (original: Func<mongodb.Server>) => {
      return function(
        this: mongodb.Server,
        ns: string,
        command: MongoInternalCommand,
        options: {} | Function,
        callback: Func<unknown>
      ): mongodb.Server {
        const currentSpan = plugin._tracer.getCurrentSpan();
        if (currentSpan === null) {
          return original.apply(this, (arguments as unknown) as unknown[]);
        }
        const resultHandler =
          typeof options === 'function' ? options : callback;
        if (typeof resultHandler !== 'function') {
          return original.apply(this, (arguments as unknown) as unknown[]);
        }
        if (typeof command !== 'object') {
          return original.apply(this, (arguments as unknown) as unknown[]);
        }
        let type: string;
        if (command.createIndexes) {
          type = 'createIndexes';
        } else if (command.findandmodify) {
          type = 'findAndModify';
        } else if (command.ismaster) {
          type = 'isMaster';
        } else if (command.count) {
          type = 'count';
        } else {
          type = 'command';
        }

        const span = plugin._tracer.startSpan(`${ns}.${type}`, {
          parent: currentSpan,
          kind: SpanKind.CLIENT,
        });
        if (typeof options === 'function') {
          return original.call(
            this,
            ns,
            command,
            plugin.patchEnd(span, options as Func<unknown>)
          );
        } else {
          return original.call(
            this,
            ns,
            command,
            options,
            plugin.patchEnd(span, callback)
          );
        }
      };
    };
  }

  /** Creates spans for Query operations */
  private getPatchQuery() {
    const plugin = this;
    return (original: Func<mongodb.Server>) => {
      return function(
        this: mongodb.Server,
        ns: string,
        command: MongoInternalCommand,
        options: {},
        callback: Func<unknown>
      ): mongodb.Server {
        const currentSpan = plugin._tracer.getCurrentSpan();
        if (currentSpan === null) {
          return original.apply(this, (arguments as unknown) as unknown[]);
        }
        const resultHandler =
          typeof options === 'function' ? options : callback;
        if (typeof resultHandler !== 'function') {
          return original.apply(this, (arguments as unknown) as unknown[]);
        }
        const span = plugin._tracer.startSpan(`${ns}.query`, {
          kind: SpanKind.CLIENT,
          parent: currentSpan,
        });
        if (typeof options === 'function') {
          return original.call(
            this,
            ns,
            command,
            plugin.patchEnd(span, options as Func<unknown>)
          );
        } else {
          return original.call(
            this,
            ns,
            command,
            options,
            plugin.patchEnd(span, callback)
          );
        }
      };
    };
  }

  /** Creates spans for Cursor operations */
  private getPatchCursor() {
    const plugin = this;
    return (original: Func<mongodb.Cursor>) => {
      return function(
        this: { ns: string },
        ...args: unknown[]
      ): mongodb.Cursor {
        const currentSpan = plugin._tracer.getCurrentSpan();
        if (currentSpan === null) {
          return original.apply(this, (arguments as unknown) as unknown[]);
        }
        const resultHandler = args[0] as Func<unknown> | undefined;
        if (resultHandler === undefined) {
          return original.apply(this, (arguments as unknown) as unknown[]);
        }
        const span = plugin._tracer.startSpan(`${this.ns}.cursor`, {
          parent: currentSpan,
          kind: SpanKind.CLIENT,
        });
        return original.call(this, plugin.patchEnd(span, resultHandler));
      };
    };
  }

  /**
   * Ends a created span.
   * @param span The created span to end.
   * @param resultHandler A callback function.
   */
  patchEnd(span: Span, resultHandler: Func<unknown>): Function {
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

const plugin = new MongoDBPlugin('mongodb');
export { plugin };
