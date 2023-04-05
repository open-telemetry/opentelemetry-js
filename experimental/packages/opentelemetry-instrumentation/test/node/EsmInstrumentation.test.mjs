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
import * as exported from 'test-esm-module';

class TestInstrumentationWrapFn extends InstrumentationBase {
  constructor(config) {
    super('test-esm-instrumentation', '0.0.1', config);
  }
  init() {
    console.log('test-esm-instrumentation initialized!');
    return new InstrumentationNodeModuleDefinition(
      'test-esm-module',
      ['*'],
      moduleExports => {
        this._wrap(moduleExports, 'testFunction', () => {
          return () => 'patched';
        });
        return moduleExports;
      },
      moduleExports => {
        this._unwrap(moduleExports, 'testFunction');
        return moduleExports;
      }
    );
  }
}

class TestInstrumentationSimple extends InstrumentationBase {
  constructor(config) {
    super('test-esm-instrumentation', '0.0.1', config);
  }
  init() {
    console.log('test-esm-instrumentation initialized!');
    return new InstrumentationNodeModuleDefinition(
      'test-esm-module',
      ['*'],
      moduleExports => {
        moduleExports.testConstant = 43;
        return moduleExports;
      }
    );
  }
}
describe('when loading esm module', () => {
  const instrumentationWrap = new TestInstrumentationWrapFn({
    enabled: false,
  });

  it('should patch module file directly', async () => {
    const instrumentation = new TestInstrumentationSimple({
      enabled: false,
    });
    instrumentation.enable();
    assert.deepEqual(exported.testConstant, 43);
  });

  it('should patch a module with the wrap function', async () => {
    instrumentationWrap.enable();
    assert.deepEqual(exported.testFunction(), 'patched');
  });

  it('should unwrap a patched function', async () => {
    // disable to trigger unwrap
    const exported = await import('test-esm-module');
    instrumentationWrap.enable();
    instrumentationWrap.disable();
    assert.deepEqual(exported.testFunction(), 'original');
  });
});
