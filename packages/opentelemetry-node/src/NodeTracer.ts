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

import * as api from '@opentelemetry/api';
import { setActiveSpan } from '@opentelemetry/core';
import { Tracer } from '@opentelemetry/tracing';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';

/**
 * This class represents a nodejs-specific tracer.
 */
export class NodeTracer extends Tracer {
  /**
   * Execute the provided function with the given span in the current context.
   *
   * **NOTE**: This function is experimental, refer to to
   *  https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-node#withspanasync
   */
  async withSpanAsync<T extends any, U extends () => Promise<T>>(
    span: api.Span,
    fn: U
  ): Promise<void> {
    const contextManager = api.context.getContextManager();
    if (contextManager instanceof AsyncHooksContextManager) {
      await contextManager.withAsync(
        setActiveSpan(api.context.active(), span),
        fn
      );
    } else {
      this.logger.warn(
        `Using withAsync without AsyncHookContextManager doesn't work, please refer to https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-node#withspanasync`
      );
      await fn();
    }
  }
}
