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
  InstrumentationNodeModuleFile,
} from '../../build/index.mjs';
import * as exported from 'test-esm-module';
import * as exportedAbsolute from './esm/test.mjs';

import path from 'path';
import url from 'url';

const TEST_DIR_NAME = path.dirname(url.fileURLToPath(import.meta.url));

class TestInstrumentationWrapFn extends InstrumentationBase {
  constructor(config) {
    super('test-esm-instrumentation', '0.0.1', config);
  }
  init() {
    return new InstrumentationNodeModuleDefinition(
      'test-esm-module',
      ['*'],
      moduleExports => {
        const wrapRetval = this._wrap(moduleExports, 'testFunction', () => {
          return function wrappedTestFunction() {
            return 'patched';
          };
        });
        assert.strictEqual(typeof wrapRetval, 'function');
        assert.strictEqual(
          wrapRetval.name,
          'wrappedTestFunction',
          '_wrap(..., "testFunction", ...) return value is the wrapped function'
        );
        return moduleExports;
      },
      moduleExports => {
        this._unwrap(moduleExports, 'testFunction');
        return moduleExports;
      }
    );
  }
}

class TestInstrumentationMasswrapFn extends InstrumentationBase {
  constructor(config) {
    super('test-esm-instrumentation', '0.0.1', config);
  }
  init() {
    return new InstrumentationNodeModuleDefinition(
      'test-esm-module',
      ['*'],
      moduleExports => {
        this._massWrap(
          [moduleExports],
          ['testFunction', 'secondTestFunction'],
          () => {
            return () => 'patched';
          }
        );
        return moduleExports;
      },
      moduleExports => {
        this._massUnwrap(
          [moduleExports],
          ['testFunction', 'secondTestFunction']
        );
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

class TestAbsoluteFileInstrumentationPatchFn extends InstrumentationBase {
  constructor(config) {
    super('test-esm-instrumentation', '0.0.1', config);
  }
  init() {
    return new InstrumentationNodeModuleDefinition(
      path.join(TEST_DIR_NAME, '/esm/test.mjs'),
      ['*'],
      undefined,
      undefined,
      [
        new InstrumentationNodeModuleFile(
          'test',
          ['*'],
          moduleExports => {
            const wrapRetval = this._wrap(moduleExports, 'testFunction', () => {
              return function wrappedTestFunction() {
                return 'patched';
              };
            });
            assert.strictEqual(typeof wrapRetval, 'function');
            assert.strictEqual(
              wrapRetval.name,
              'wrappedTestFunction',
              '_wrap(..., "testFunction", ...) return value is the wrapped function'
            );
            return moduleExports;
          },
          moduleExports => {
            this._unwrap(moduleExports, 'testFunction');
            return moduleExports;
          }
        ),
      ]
    );
  }
}

describe('when loading esm module', function () {
  const instrumentationWrap = new TestInstrumentationWrapFn({
    enabled: false,
  });

  it('should patch module file directly', async function () {
    const instrumentation = new TestInstrumentationSimple({
      enabled: false,
    });
    instrumentation.enable();
    assert.deepEqual(exported.testConstant, 43);
  });

  it('should patch a module with the wrap function', async function () {
    instrumentationWrap.enable();
    assert.deepEqual(exported.testFunction(), 'patched');
  });

  it('should unwrap a patched function', async function () {
    // Test skipped due to https://github.com/nodejs/import-in-the-middle/pull/153 breaking unwrap functionality
    this.skip();
    instrumentationWrap.enable();
    // disable to trigger unwrap
    instrumentationWrap.disable();
    assert.deepEqual(exported.testFunction(), 'original');
  });

  it('should wrap multiple functions with masswrap', function () {
    const instrumentation = new TestInstrumentationMasswrapFn({
      enabled: false,
    });

    instrumentation.enable();
    assert.deepEqual(exported.testFunction(), 'patched');
    assert.deepEqual(exported.secondTestFunction(), 'patched');
  });

  it('should unwrap multiple functions with massunwrap', async function () {
    // Test skipped due to https://github.com/nodejs/import-in-the-middle/pull/153 breaking unwrap functionality
    this.skip();
    const instrumentation = new TestInstrumentationMasswrapFn({
      enabled: false,
    });

    instrumentation.enable();
    instrumentation.disable();
    assert.deepEqual(exported.testFunction(), 'original');
    assert.deepEqual(exported.secondTestFunction(), 'original');
  });

  it('should patch function from a file with absolute path', async function () {
    const instrumentation = new TestAbsoluteFileInstrumentationPatchFn({
      enabled: false,
    });
    instrumentation.enable();
    assert.deepEqual(exportedAbsolute.testFunction(), 'patched');
  });

  it('should unwrap a patched function from a file with absolute path', async function () {
    // Test skipped due to https://github.com/nodejs/import-in-the-middle/pull/153 breaking unwrap functionality
    this.skip();
    const instrumentation = new TestAbsoluteFileInstrumentationPatchFn({
      enabled: false,
    });

    instrumentation.enable();
    // disable to trigger unwrap
    instrumentation.disable();
    assert.deepEqual(exported.testFunction(), 'original');
  });
});
