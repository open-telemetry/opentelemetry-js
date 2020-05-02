/*!
 * Copyright 2020, OpenTelemetry Authors
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

import * as api from '@opentelemetry/api';
import { setActiveSpan } from '@opentelemetry/core';
import {
  BasicTracerProvider,
  Tracer,
  TracerConfig,
} from '@opentelemetry/tracing';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';

/**
 * This class represents a nodejs-specific tracer.
 */
export class NodeTracer extends Tracer {
  /**
   * Constructs a new NodeTracer instance.
   */
  constructor(config: TracerConfig, _tracerProvider: BasicTracerProvider) {
    super(config, _tracerProvider);
  }

  async withSpanAsync<
    T extends Promise<any>,
    U extends (...args: unknown[]) => T
  >(span: api.Span, fn: U): Promise<T> {
    // @ts-ignore
    const contextManager = api.context._getContextManager();
    if (contextManager instanceof AsyncHooksContextManager) {
      return contextManager.withAsync(
        setActiveSpan(api.context.active(), span),
        fn
      );
    } else {
      this.logger.warn(
        `Using withAsync without AsyncHookContextManager doesn't work, please refer to`
      );
      return fn();
    }
  }
}
