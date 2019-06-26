/**
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as assert from 'assert';
import { AsyncHooksContextManager } from '../src';

describe('AsyncHooksContextManager()', () => {
  let contextManager: AsyncHooksContextManager;

  it('AsyncHooksContextManager should implements ContextManager', () => {
    assert(
      typeof AsyncHooksContextManager.prototype.wrapEmitter === 'function'
    );
    assert(
      typeof AsyncHooksContextManager.prototype.wrapFunction === 'function'
    );
    assert(
      typeof AsyncHooksContextManager.prototype.getCurrentContext === 'function'
    );
  });

  it('AsyncHooksContextManager should construct without error', () => {
    assert.doesNotThrow(() => {
      contextManager = new AsyncHooksContextManager();
    });
  });

  it('AsyncHooksContextManager should set current context and retrieve after sync op', () => {
    contextManager.getCurrentContext().span = 1;
    assert(contextManager.getCurrentContext().span === 1);
  });

  it('AsyncHooksContextManager should set context and retrieve it across async op', () => {
    contextManager.getCurrentContext().span = 2;
    setTimeout(() => {
      assert(contextManager.getCurrentContext().span === 3);
    }, 100);
    contextManager.getCurrentContext().span = 3;
  });
});
