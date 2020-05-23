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

type UnPromisify<T> = T extends Promise<infer U> ? U : T;

/**
 * This class represents a nodejs-specific tracer.
 */
export class NodeTracer extends Tracer {
  /**
   * Execute the provided function with the given span set in the current context.
   *
   * **NOTE**: This function is experimental, refer to to
   *  https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-node#withspanasync
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async withSpanAsync<
    T extends () => Promise<any>,
    U = UnPromisify<ReturnType<T>>
  >(span: api.Span, fn: T): Promise<U> {
    const contextManager = api.context.getContextManager();
    if (contextManager instanceof AsyncHooksContextManager) {
      return await contextManager.withAsync(
        setActiveSpan(api.context.active(), span),
        fn
      );
    } else {
      this.logger.warn(
        "Using withAsync without AsyncHookContextManager doesn't work, please refer to https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-node#withspanasync"
      );
      return await fn();
    }
  }
}
