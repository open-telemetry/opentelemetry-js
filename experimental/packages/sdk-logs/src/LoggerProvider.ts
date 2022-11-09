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

import * as api from '@opentelemetry/api-logs';
import { Resource } from '@opentelemetry/resources';
import { LogRecordProcessor } from './LogRecordProcessor';
import { Logger } from './Logger';
import { ForceFlushOptions, LoggerProviderOptions, ShutdownOptions } from './types';
import { diag } from '@opentelemetry/api';

export class LoggerProvider implements api.LoggerProvider {
  readonly processors: LogRecordProcessor[] = [];
  readonly resource: Resource;
  private _shutdown = false;

  constructor(options: LoggerProviderOptions) {
    this.resource = options.resource || Resource.empty();
    this.resource = Resource.default().merge(this.resource);
  }

  getLogger(name: string, version?: string | undefined, options?: api.LoggerOptions | undefined): api.Logger {
    const instrumentationScope = {
      name: name,
      version: version
    }
    return new Logger(this.resource, instrumentationScope, this);
  }

  /**
   * Adds a new {@link LoggerProcessors} to this tracer.
   * @param spanProcessor the new SpanProcessor to be added.
   */
  addLogProcessor(logProcessor: LogRecordProcessor): void {
    this.processors.push(logProcessor);
  }

  /**
   * Flush all buffered data and shut down the LoggerProvider and all registered
   * LogProcessors.
   *
   * Returns a promise which is resolved when all flushes are complete.
   */
  async shutdown(options?: ShutdownOptions): Promise<void> {
    if (this._shutdown) {
      return;
    }

    this._shutdown = true;

    await Promise.all(this.processors.map(processor => {
      return processor.shutdown(options);
    }));
  }
  
    /**
     * Notifies all registered LoggerProcessors to flush any buffered data.
     *
     * Returns a promise which is resolved when all flushes are complete.
     */
    async forceFlush(options?: ForceFlushOptions): Promise<void> {
      // do not flush after shutdown
      if (this._shutdown) {
        diag.warn('invalid attempt to force flush after LoggerProvider shutdown');
        return;
      }
  
      await Promise.all(this.processors.map(processor => {
        return processor.forceFlush(options);
      }));
    }
}
