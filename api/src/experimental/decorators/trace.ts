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
  Context,
  Span,
  SpanStatusCode,
  Tracer,
  Exception,
  SpanOptions,
} from '../../';

/**
 * Cast an arbitrary exception value to {@link Exception} type.
 */
function asException(e: unknown): Exception {
  if (typeof e === 'object' && e !== null && 'message' in e) {
    return e as Exception;
  }
  if (typeof e === 'string') {
    return e;
  }
  return `${e}`;
}

function onException(e: Exception, span: Span) {
  span.recordException(e);
  span.setStatus({
    code: SpanStatusCode.ERROR,
  });
}

export class TraceDecoratorAPI {
  private static _instance?: TraceDecoratorAPI;

  /** Empty private constructor prevents end users from constructing a new instance of the API */
  private constructor() {}

  /** Get the singleton instance of the TraceDecoratorAPI API */
  public static getInstance(): TraceDecoratorAPI {
    if (!this._instance) {
      this._instance = new TraceDecoratorAPI();
    }

    return this._instance;
  }

  public startActiveSpan = startActiveSpan;
}

/**
 * Decorator to trace a class method with {@link Tracer.startActiveSpan}.
 */
function startActiveSpan(
  tracer: Tracer,
  name?: string,
  options?: SpanOptions,
  context?: Context
) {
  return (
    originalMethod: Function, // eslint-disable-line @typescript-eslint/no-unsafe-function-type
    decContext: ClassMethodDecoratorContext
  ) => {
    const methodName = String(decContext.name);
    let spanName = name;
    if (name === undefined) {
      spanName = methodName;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      decContext.addInitializer(function init(this: any) {
        spanName = `${this.constructor.name}.${methodName}`;
      });
    }

    function replacementMethod(this: unknown, ...args: unknown[]) {
      // Force positional arguments on `startActiveSpan`.
      return tracer.startActiveSpan(spanName!, options!, context!, span => {
        try {
          const ret = originalMethod.apply(this, args);
          if (typeof ret?.then === 'function') {
            // If the originalMethod is an async function, attach span handler to
            // the returned promise.
            return ret.then(
              (val: unknown) => {
                span.end();
                return val;
              },
              (e: unknown) => {
                onException(asException(e), span);
                span.end();
                throw e;
              }
            );
          } else {
            // Only end the span if the originalMethod is not an async function.
            span.end();
          }
          return ret;
        } catch (e) {
          onException(asException(e), span);
          span.end();
          throw e;
        }
      });
    }
    Object.defineProperty(replacementMethod, 'name', { value: methodName });

    return replacementMethod;
  };
}
