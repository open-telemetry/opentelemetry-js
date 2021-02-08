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

import {
  AsyncHooksContextManager,
  AsyncLocalStorageContextManager,
} from '@opentelemetry/context-async-hooks';
import {
  BasicTracerProvider,
  SDKRegistrationConfig,
} from '@opentelemetry/tracing';
import * as semver from 'semver';
import { NodeTracerConfig } from './config';

/**
 * Register this TracerProvider for use with the OpenTelemetry API.
 * Undefined values may be replaced with defaults, and
 * null values will be skipped.
 *
 * @param config Configuration object for SDK registration
 */
export class NodeTracerProvider extends BasicTracerProvider {
  constructor(config: NodeTracerConfig = {}) {
    super(config);
    if (config.plugins) {
      console.warn(
        'plugins options was removed, please use' +
          ' "registerInstrumentations" to load plugins'
      );
    }
  }

  register(config: SDKRegistrationConfig = {}) {
    if (config.contextManager === undefined) {
      const ContextManager = semver.gte(process.version, '14.8.0')
        ? AsyncLocalStorageContextManager
        : AsyncHooksContextManager;
      config.contextManager = new ContextManager();
      config.contextManager.enable();
    }

    super.register(config);
  }
}
