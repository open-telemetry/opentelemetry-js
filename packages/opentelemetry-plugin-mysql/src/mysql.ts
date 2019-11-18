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

import { BasePlugin } from '@opentelemetry/core';
import { CanonicalCode, Span, SpanKind } from '@opentelemetry/types';
import * as mysqlTypes from 'mysql';
import * as shimmer from 'shimmer';
import { AttributeNames } from './enums';
import { getConnectionAttributes, getSpanName } from './utils';

export class MysqlPlugin extends BasePlugin<typeof mysqlTypes> {
  moduleName = 'mysql';
  static COMPONENT = 'mysql';
  static DB_TYPE = 'sql';

  static COMMON_ATTRIBUTES = {
    [AttributeNames.COMPONENT]: MysqlPlugin.COMPONENT,
    [AttributeNames.DB_TYPE]: MysqlPlugin.DB_TYPE,
    [AttributeNames.PEER_SERVICE]: MysqlPlugin.COMPONENT,
  };

  protected patch(): typeof mysqlTypes {
    shimmer.wrap(
      this._moduleExports,
      'createConnection',
      this._patchCreateConnection() as any
    );

    shimmer.wrap(
      this._moduleExports,
      'createPool',
      this._patchCreatePool() as any
    );

    shimmer.wrap(
      this._moduleExports,
      'createPoolCluster',
      this._patchCreatePoolCluster() as any
    );

    return this._moduleExports;
  }

  protected unpatch(): void {
    shimmer.unwrap(this._moduleExports, 'createConnection');
    shimmer.unwrap(this._moduleExports, 'createPool');
    shimmer.unwrap(this._moduleExports, 'createPoolCluster');
  }

  // global export function
  private _patchCreateConnection() {
    return (originalCreateConnection: typeof mysqlTypes.createConnection) => {
      const plugin = this;
      plugin._logger.debug('MysqlPlugin#patch: patched mysql createConnection');

      return function createConnection(
        _connectionUri: string | mysqlTypes.ConnectionConfig
      ) {
        //@ts-ignore
        const originalResult = originalCreateConnection(...arguments);

        shimmer.wrap(
          originalResult,
          'query',
          plugin._patchQuery(originalResult) as any
        );

        return originalResult;
      };
    };
  }

  // global export function
  private _patchCreatePool() {
    return (originalCreatePool: typeof mysqlTypes.createPool) => {
      const plugin = this;
      plugin._logger.debug('MysqlPlugin#patch: patched mysql createPool');
      return function createPool(_config: string | mysqlTypes.PoolConfig) {
        //@ts-ignore
        const pool = originalCreatePool(...arguments);

        shimmer.wrap(pool, 'query', plugin._patchQuery(pool));
        shimmer.wrap(pool, 'getConnection', plugin._patchGetConnection(pool));

        return pool;
      };
    };
  }

  // global export function
  private _patchCreatePoolCluster() {
    return (originalCreatePoolCluster: typeof mysqlTypes.createPoolCluster) => {
      const plugin = this;
      plugin._logger.debug(
        'MysqlPlugin#patch: patched mysql createPoolCluster'
      );
      return function createPool(_config: string | mysqlTypes.PoolConfig) {
        //@ts-ignore
        const cluster = originalCreatePoolCluster(...arguments);

        shimmer.wrap(
          cluster,
          'getConnection',
          plugin._patchGetConnection(cluster)
        );

        return cluster;
      };
    };
  }

  // method on cluster or pool
  private _patchGetConnection(pool: mysqlTypes.Pool | mysqlTypes.PoolCluster) {
    return (originalGetConnection: Function) => {
      const plugin = this;
      plugin._logger.debug(
        'MysqlPlugin#patch: patched mysql pool getConnection'
      );
      return function getConnection(
        arg1?: unknown,
        arg2?: unknown,
        arg3?: unknown
      ) {
        if (arguments.length === 1 && typeof arg1 === 'function') {
          const patchFn = plugin._getConnectionCallbackPatchFn(arg1);
          return originalGetConnection.call(pool, patchFn);
        }
        if (arguments.length === 2 && typeof arg2 === 'function') {
          const patchFn = plugin._getConnectionCallbackPatchFn(arg2);
          return originalGetConnection.call(pool, arg1, patchFn);
        }
        if (arguments.length === 3 && typeof arg3 === 'function') {
          const patchFn = plugin._getConnectionCallbackPatchFn(arg3);
          return originalGetConnection.call(pool, arg1, arg2, patchFn);
        }

        return originalGetConnection.apply(pool, arguments);
      };
    };
  }

  private _getConnectionCallbackPatchFn(cb: Function) {
    return function() {
      if (arguments[1]) {
        shimmer.wrap(arguments[1], 'query', plugin._patchQuery(arguments[1]));
      }
      if (typeof cb === 'function') {
        cb(...arguments);
      }
    };
  }

  private _patchQuery(connection: mysqlTypes.Connection | mysqlTypes.Pool) {
    return (originalQuery: Function): mysqlTypes.QueryFunction => {
      const plugin = this;
      plugin._logger.debug('MysqlPlugin: patched mysql query');

      // TODO handle query function overloads
      return function query(
        query: string | mysqlTypes.Query | mysqlTypes.QueryOptions,
        _valuesOrCallback?: string[] | mysqlTypes.queryCallback,
        _callback?: mysqlTypes.queryCallback
      ) {
        const spanName = getSpanName(query);

        const span = plugin._tracer.startSpan(spanName, {
          parent: plugin._tracer.getCurrentSpan() || undefined,
          kind: SpanKind.CLIENT,
          attributes: {
            ...MysqlPlugin.COMMON_ATTRIBUTES,
            ...getConnectionAttributes(connection.config),
          },
        });

        if (typeof arguments[0] === 'string') {
          if (arguments.length === 1) {
            const streamableQuery: mysqlTypes.Query = originalQuery.apply(
              connection,
              arguments
            );

            return streamableQuery
              .on('error', err =>
                span.setStatus({
                  code: CanonicalCode.UNKNOWN,
                  message: err.message,
                })
              )
              .on('end', () => {
                span.end();
              });
          }

          if (typeof arguments[1] === 'function') {
            shimmer.wrap(arguments, 1, plugin._patchCallbackQuery(span));
          } else if (typeof arguments[2] === 'function') {
            shimmer.wrap(arguments, 2, plugin._patchCallbackQuery(span));
          }

          return originalQuery.apply(connection, arguments);
        }
      };
    };
  }

  private _patchCallbackQuery(span: Span): (original: any) => any {
    return (originalCallback: mysqlTypes.queryCallback) => {
      return function(
        err: mysqlTypes.MysqlError | null,
        results?: any,
        fields?: mysqlTypes.FieldInfo[]
      ) {
        if (err) {
          span.setStatus({
            code: CanonicalCode.UNKNOWN,
            message: err.message,
          });
        }
        span.end();
        originalCallback(err, results, fields);
      };
    };
  }
}

export const plugin = new MysqlPlugin();
