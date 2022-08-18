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
import { LogProcessor } from './LogProcessor';
import { LogEmitterConfig } from './LoggerConfig';
import { Logger } from './Logger';

export class LoggerProvider implements api.LoggerProvider {
  readonly processors: LogProcessor[] = [];
  readonly resource: Resource;

  constructor(config: LogEmitterConfig) {
    this.resource = config.resource || Resource.empty();
    this.resource = Resource.default().merge(this.resource);
  }

  getLogger(name: string, version?: string | undefined, options?: api.LoggerOptions | undefined): api.Logger {
    const instrumentationLibrary = {
      name: name,
      version: version
    }
    return new Logger(this.resource, instrumentationLibrary, this);
  }

  addLogProcessor(logProcessor: LogProcessor): void {
    this.processors.push(logProcessor);
  }
}
