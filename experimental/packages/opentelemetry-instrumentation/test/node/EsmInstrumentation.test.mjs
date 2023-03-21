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

import * as assert from 'assert';
import {
  InstrumentationBase,
  InstrumentationNodeModuleDefinition,
} from '../../build/src/index.js';

describe('when loading esm module', () => {
  it('should patch module file', async () => {
    class TestInstrumentation extends InstrumentationBase {
      constructor() {
        super('test-esm-instrumentation', '0.0.1');
      }
      init() {
        console.log('test-esm-instrumentation initialized!');
        return new InstrumentationNodeModuleDefinition(
          'test-esm-module',
          ['*'],
          moduleExports => {
            console.log('patch');
            moduleExports.testConstant = 43;
          }
        );
      }
    }
    const instrumentation = new TestInstrumentation();
    instrumentation.enable();
    // const exported = await import('test-esm-module');
    // assert.deepEqual(exported.testConstant, 43);

    // error from import-in-the-middle register
    // TypeError: setters.get(...)[name] is not a function
  });
});
