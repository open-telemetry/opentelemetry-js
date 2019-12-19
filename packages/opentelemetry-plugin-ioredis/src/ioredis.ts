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
import * as ioredisTypes from 'ioredis';
import * as shimmer from 'shimmer';
import { traceConnection, traceSendCommand } from './utils';

export class IORedisPlugin extends BasePlugin<typeof ioredisTypes> {
  static readonly COMPONENT = 'ioredis';
  static readonly DB_TYPE = 'redis';
  readonly supportedVersions = ['^2.0.0'];

  constructor(readonly moduleName: string) {
    super();
  }

  protected patch(): typeof ioredisTypes {
    this._logger.debug('Patching ioredis.prototype.sendCommand');
    shimmer.wrap(
      this._moduleExports.prototype,
      'sendCommand',
      this._patchSendCommand()
    );

    this._logger.debug('patching ioredis.prototype.connect');
    shimmer.wrap(
      this._moduleExports.prototype,
      'connect',
      this._patchConnection()
    );

    return this._moduleExports.prototype;
  }

  protected unpatch(): void {
    if (this._moduleExports) {
      shimmer.unwrap(this._moduleExports.prototype, 'sendCommand');
      shimmer.unwrap(this._moduleExports.prototype, 'connect');
    }
  }

  /**
   * Patch send command internal to trace requests
   */
  private _patchSendCommand() {
    const tracer = this._tracer;
    return (original: Function) => {
      return traceSendCommand(tracer, original);
    };
  }

  private _patchConnection() {
    const tracer = this._tracer;
    return (original: Function) => {
      return traceConnection(tracer, original);
    };
  }
}

export const plugin = new IORedisPlugin(IORedisPlugin.COMPONENT);
