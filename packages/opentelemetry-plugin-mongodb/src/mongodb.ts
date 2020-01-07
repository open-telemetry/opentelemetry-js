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

// mongodb.Server type is deprecated so every use trigger a lint error
/* tslint:disable:deprecation */

import { BasePlugin } from '@opentelemetry/core';
import { Span, SpanKind, CanonicalCode } from '@opentelemetry/types';
import {
  Func,
  MongoInternalCommand,
  MongoInternalTopology,
  AttributeNames,
  MongodbCommandType,
} from './types';
import * as mongodb from 'mongodb';
import * as shimmer from 'shimmer';

/** MongoDBCore instrumentation plugin for OpenTelemetry */
export class MongoDBPlugin extends BasePlugin<typeof mongodb> {
  private readonly _SERVER_METHODS = ['insert', 'update', 'remove', 'command'];
  private readonly _CURSOR_METHODS = ['_next', 'next'];

  private readonly _COMPONENT = 'mongodb';
  private readonly _DB_TYPE = 'mongodb';

  readonly supportedVersions = ['>=2 <4'];

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
        this._logger.debug(`patching mongodb.Server.prototype.${fn}`);
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
        'patching mongodb.Cursor.prototype functions:',
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
    shimmer.massUnwrap(
      [this._moduleExports.Server.prototype],
      this._SERVER_METHODS as never[]
    );
    shimmer.massUnwrap(
      [this._moduleExports.Cursor.prototype],
      this._CURSOR_METHODS as never[]
    );
  }

  /** Creates spans for Command operations */
  private _getPatchCommand(operationName: string) {
    const plugin = this;
    return (original: Func<mongodb.Server>) => {
      return function patchedServerCommand(
        this: mongodb.Server,
        ns: string,
        commands: MongoInternalCommand[] | MongoInternalCommand,
        options: {} | Function,
        callback: Function
      ): mongodb.Server {
        const currentSpan = plugin._tracer.getCurrentSpan();
        const resultHandler =
          typeof options === 'function' ? options : callback;
        if (
          currentSpan === undefined ||
          typeof resultHandler !== 'function' ||
          typeof commands !== 'object'
        ) {
          return original.apply(this, (arguments as unknown) as unknown[]);
        }
        const command = commands instanceof Array ? commands[0] : commands;
        const commandType = plugin._getCommandType(command);
        const type =
          commandType === MongodbCommandType.UNKNOWN
            ? operationName
            : commandType;
        const span = plugin._tracer.startSpan(`mongodb.${type}`, {
          parent: currentSpan,
          kind: SpanKind.CLIENT,
        });
        plugin._populateAttributes(
          span,
          ns,
          command,
          this as MongoInternalTopology
        );
        return original.call(
          this,
          ns,
          commands,
          plugin._patchEnd(span, resultHandler)
        );
      };
    };
  }

  /**
   * Get the mongodb command type from the object.
   * @param command Internal mongodb command object
   */
  private _getCommandType(command: MongoInternalCommand): MongodbCommandType {
    if (command.createIndexes !== undefined) {
      return MongodbCommandType.CREATE_INDEXES;
    } else if (command.findandmodify !== undefined) {
      return MongodbCommandType.FIND_AND_MODIFY;
    } else if (command.ismaster !== undefined) {
      return MongodbCommandType.IS_MASTER;
    } else if (command.count !== undefined) {
      return MongodbCommandType.COUNT;
    } else {
      return MongodbCommandType.UNKNOWN;
    }
  }

  /**
   * Populate span's attributes by fetching related metadata from the context
   * @param span span to add attributes to
   * @param ns mongodb namespace
   * @param command mongodb internal representation of a command
   * @param topology mongodb internal representation of the network topology
   */
  private _populateAttributes(
    span: Span,
    ns: string,
    command: MongoInternalCommand,
    topology: MongoInternalTopology
  ) {
    // add network attributes to determine the remote server
    if (topology && topology.s) {
      span.setAttributes({
        [AttributeNames.PEER_HOSTNAME]: `${topology.s.options?.host ??
          topology.s.host}`,
        [AttributeNames.PEER_PORT]: `${topology.s.options?.port ??
          topology.s.port}`,
      });
    }
    // add database related attributes
    span.setAttributes({
      [AttributeNames.DB_INSTANCE]: `${ns}`,
      [AttributeNames.DB_TYPE]: this._DB_TYPE,
      [AttributeNames.COMPONENT]: this._COMPONENT,
    });

    if (command === undefined) return;
    const query = Object.keys(command.query ?? command.q ?? command).reduce(
      (obj, key) => {
        obj[key] = '?';
        return obj;
      },
      {} as { [key: string]: string }
    );
    span.setAttribute('db.statement', JSON.stringify(query));
  }

  /** Creates spans for Cursor operations */
  private _getPatchCursor() {
    const plugin = this;
    return (original: Func<mongodb.Cursor>) => {
      return function patchedCursorCommand(
        this: {
          ns: string;
          cmd: MongoInternalCommand;
          topology: MongoInternalTopology;
        },
        ...args: unknown[]
      ): mongodb.Cursor {
        const currentSpan = plugin._tracer.getCurrentSpan();
        const resultHandler = args[0];
        if (currentSpan === undefined || typeof resultHandler !== 'function') {
          return original.apply(this, args);
        }
        const span = plugin._tracer.startSpan(`mongodb.query`, {
          parent: currentSpan,
          kind: SpanKind.CLIENT,
        });
        plugin._populateAttributes(span, this.ns, this.cmd, this.topology);

        return original.call(this, plugin._patchEnd(span, resultHandler));
      };
    };
  }

  /**
   * Ends a created span.
   * @param span The created span to end.
   * @param resultHandler A callback function.
   */
  private _patchEnd(span: Span, resultHandler: Function): Function {
    return function patchedEnd(this: {}, ...args: unknown[]) {
      const error = args[0];
      if (error instanceof Error) {
        span.setStatus({
          code: CanonicalCode.UNKNOWN,
          message: error.message,
        });
      } else {
        span.setStatus({
          code: CanonicalCode.OK,
        });
      }
      span.end();
      return resultHandler.apply(this, args);
    };
  }
}

export const plugin = new MongoDBPlugin('mongodb');
