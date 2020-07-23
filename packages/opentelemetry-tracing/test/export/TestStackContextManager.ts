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

import { ContextManager, Context } from '@opentelemetry/context-base';

/**
 * A test-only ContextManager that uses an in-memory stack to keep track of
 * the active context.
 *
 * This is not intended for advanced or asynchronous use cases.
 */
export class TestStackContextManager implements ContextManager {
  private _contextStack: Context[] = [];

  active(): Context {
    return this._contextStack[this._contextStack.length - 1] ?? Context.ROOT_CONTEXT;
  }

  with<T extends (...args: unknown[]) => ReturnType<T>>(context: Context, fn: T): ReturnType<T> {
    this._contextStack.push(context);
    try {
      return fn();
    }
    finally {
      this._contextStack.pop();
    }
  }

  bind<T>(target: T, context?: Context): T {
    throw new Error("Method not implemented.");
  }

  enable(): this {
    return this;
  }

  disable(): this {
    return this;
  }
}
