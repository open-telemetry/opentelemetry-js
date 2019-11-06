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
import { SpanKind } from '@opentelemetry/types';
import { AttributeNames } from './enums';
import * as shimmer from 'shimmer';
import * as pgPoolTypes from 'pg-pool';
import * as pgTypes from 'pg';
import { 
    PostgresPoolPluginOptions,
    PgPoolCallback
 } from './types';

export class PostgresPoolPlugin extends BasePlugin<typeof pgPoolTypes> {
    protected _config: PostgresPoolPluginOptions;

    static readonly COMPONENT = 'pg-pool';

    readonly supportedVersions = ['^2.0.7'];

    constructor(readonly moduleName: string) {
        super();
        this._config = {};
      }

    protected patch(): typeof pgPoolTypes {
        if (this._moduleExports.prototype.connect) {
            shimmer.wrap(
                this._moduleExports.prototype,
                'connect',
                this._getPoolConnectPatch() as never
            )
        }
        return this._moduleExports;
    }

    protected unpatch(): void {
        if (this._moduleExports.prototype.connect) {
            shimmer.unwrap(this._moduleExports.prototype, 'connect');
        }
    }

    private _getPoolConnectPatch() {
        const plugin = this;
        return (originalConnect: typeof pgPoolTypes.prototype.connect) => {
            plugin._logger.debug(
                `Patching ${PostgresPoolPlugin.COMPONENT}.prototype.connect`
            );
            return function connect(
                this: pgPoolTypes<pgTypes.Client>, 
                callback?: PgPoolCallback
            ) {
                // setup span
                const span = plugin._tracer.startSpan(
                    `${PostgresPoolPlugin.COMPONENT}.connect`,
                    {
                        kind: SpanKind.CLIENT,
                        parent: plugin._tracer.getCurrentSpan() || undefined,
                        attributes: {
                            [AttributeNames.COMPONENT]: PostgresPoolPlugin.COMPONENT
                        }
                    }
                );

                if (callback) {
                    callback = plugin._tracer.bind(callback);
                }
                
                const connectResult: unknown = originalConnect.call(this, callback as never);

                // No callback was provided, return a promise instead
                if (connectResult instanceof Promise) {
                    const connectResultPromise = connectResult as Promise<unknown>;
                    return plugin._tracer.bind(
                        connectResultPromise
                            .then((result: any) => {
                                // Resturn a pass-along promise which ends the span and then goes to user's orig resolvers
                                return new Promise((resolve, _) => {
                                    span.end();
                                    resolve(result);
                                  });
                                })
                                .catch((error: Error) => {
                                  return new Promise((_, reject) => {
                                    span.end();
                                    reject(error);
                                  });
                                })
                    );
                }

                // Else a callback was provided, so just return the result
                span.end();
                return connectResult;
            }
        }
    }
}

export const plugin = new PostgresPoolPlugin(PostgresPoolPlugin.COMPONENT);