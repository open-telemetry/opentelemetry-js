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

import * as assert from 'assert';
import * as sinon from 'sinon';
import { BasicTracerConfig } from '@opentelemetry/tracing';
import { StackScopeManager } from '../src/StackScopeManager';
import { WebTracer } from '../src/WebTracer';

describe('WebTracer', () => {
  let tracer: WebTracer;
  describe('constructor', () => {
    let defaultOptions: BasicTracerConfig;

    beforeEach(() => {
      defaultOptions = {
        scopeManager: new StackScopeManager(),
      };
    });

    it('should construct an instance with required only options', () => {
      tracer = new WebTracer(Object.assign({}, defaultOptions));
      assert.ok(tracer instanceof WebTracer);
    });

    it('should enable the scope manager', () => {
      let options: BasicTracerConfig;
      const scopeManager = new StackScopeManager();
      options = { scopeManager };

      const spy = sinon.spy(scopeManager, 'enable');
      tracer = new WebTracer(options);

      assert.ok(spy.calledOnce === true);
    });

    it('should work without default scope manager', () => {
      assert.doesNotThrow(() => {
        tracer = new WebTracer({});
      });
    });
  });
});
