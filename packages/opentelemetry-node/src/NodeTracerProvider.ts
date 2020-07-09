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

import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import {
  BasicTracerProvider,
  SDKRegistrationConfig,
} from '@opentelemetry/tracing';
import { TracerConfig } from '@opentelemetry/tracing';

/**
 * Register this TracerProvider for use with the OpenTelemetry API.
 * Undefined values may be replaced with defaults, and
 * null values will be skipped.
 *
 * @param config Configuration object for SDK registration
 */
export class NodeTracerProvider extends BasicTracerProvider {
  /**
   * Constructs a new Tracer instance.
   */
  constructor(config: TracerConfig = {}) {
    super(config);
  }

  register(config: SDKRegistrationConfig = {}) {
    if (config.contextManager === undefined) {
      config.contextManager = new AsyncHooksContextManager();
      config.contextManager.enable();
    }

    super.register(config);
  }
}
