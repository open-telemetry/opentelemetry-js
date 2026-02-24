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
import * as sinon from 'sinon';
import * as path from 'path';
import {
  Instrumentation,
  InstrumentationNodeModuleDefinition,
  InstrumentationNodeModuleFile,
  createInstrumentation,
} from '../../src';
import { InstrumentationDelegate } from '../../src/types';

// const MODULE_NAME = 'test-module';
// const MODULE_FILE_NAME = 'test-module-file';
const MODULE_VERSION = '0.1.0';
const WILDCARD_VERSION = '*';
// const MODULE_DIR = '/random/dir';
const CORE_MODULE = 'dns';

const instrFromPartialDelegate = (
  delegate: Partial<InstrumentationDelegate>
): Instrumentation => {
  const defaultDelegate = {
    name: 'test-instr',
    version: '0.0.1',
    setConfig() {},
    getConfig() {
      return {};
    },
    setDiag() {},
    init() {},
  };

  return createInstrumentation(
    { ...defaultDelegate, ...delegate } as InstrumentationDelegate,
    {}
  );
};

describe('createInstrumentation', function () {
  let instrumentation: Instrumentation;
  let modulePatchSpy: sinon.SinonSpy;
  let moduleUnpatchSpy: sinon.SinonSpy;
  const patchFn = (exp: any) => {
    exp.__patched = true;
    return exp;
  };
  const unpatchFn = (exp: any) => {
    exp.__patched = false;
    return exp;
  };

  describe('instrumenting core modules', function () {
    beforeEach(() => {
      modulePatchSpy = sinon.spy(patchFn);
      moduleUnpatchSpy = sinon.spy(unpatchFn);
      instrumentation = instrFromPartialDelegate({
        init() {
          return [
            new InstrumentationNodeModuleDefinition(
              CORE_MODULE,
              [WILDCARD_VERSION],
              modulePatchSpy,
              moduleUnpatchSpy
            ),
          ];
        },
      });
    });

    it('should not patch a core module if disabled', function () {
      instrumentation.disable();
      const modExports: any = require(CORE_MODULE);
      assert.strictEqual(typeof modExports.lookup, 'function');
      assert.strictEqual(modExports.__patched, undefined);
      sinon.assert.notCalled(modulePatchSpy);
    });

    it('should patch a core module if enabled', function () {
      const modExports: any = require(CORE_MODULE);
      assert.strictEqual(typeof modExports.lookup, 'function');
      assert.strictEqual(modExports.__patched, true);
      sinon.assert.called(modulePatchSpy);
    });
  });

  describe('when module version not available', function () {
    // For all of these cases, there is no indication of the actual module version,
    // so we require there to be a wildcard supported version.

    beforeEach(() => {
      modulePatchSpy = sinon.spy(patchFn);
      // Make sure tests are not getting cached results
      Object.keys(require.cache).forEach(k => {
        if (k.includes('test-version-not-available')) {
          delete require.cache[k];
        }
      });
    });

    describe('and patching a module', function () {
      it('should not patch if the instrumentation has no wildcard version', function () {
        instrumentation = instrFromPartialDelegate({
          init() {
            return [
              new InstrumentationNodeModuleDefinition(
                'test-version-not-available',
                [`^${MODULE_VERSION}`],
                modulePatchSpy,
                moduleUnpatchSpy
              ),
            ];
          },
        });
        const modExports = require('test-version-not-available');
        assert.strictEqual(modExports.foo, 'bar');
        sinon.assert.notCalled(modulePatchSpy);
      });

      it('should patch if the instrumentation has a wildcard version', function () {
        instrumentation = instrFromPartialDelegate({
          init() {
            return [
              new InstrumentationNodeModuleDefinition(
                'test-version-not-available',
                [`^${MODULE_VERSION}`, WILDCARD_VERSION],
                modulePatchSpy,
                moduleUnpatchSpy
              ),
            ];
          },
        });
        const modExports = require('test-version-not-available');
        assert.strictEqual(modExports.foo, 'bar');
        sinon.assert.called(modulePatchSpy);
      });
    });

    describe('and patching module files', function () {
      let filePatchSpy: sinon.SinonSpy;
      let fileUnpatchSpy: sinon.SinonSpy;

      beforeEach(() => {
        filePatchSpy = sinon.stub().callsFake(patchFn);
        fileUnpatchSpy = sinon.stub().callsFake(unpatchFn);
      });

      it('should not patch if the instrumentation has no wildcard version', function () {
        instrumentation = instrFromPartialDelegate({
          init() {
            return [
              new InstrumentationNodeModuleDefinition(
                'test-version-not-available',
                [`^${MODULE_VERSION}`],
                modulePatchSpy,
                moduleUnpatchSpy,
                [
                  new InstrumentationNodeModuleFile(
                    'test-version-not-available/lib/baz.js',
                    [`^${MODULE_VERSION}`],
                    filePatchSpy,
                    fileUnpatchSpy
                  ),
                ]
              ),
            ];
          },
        });
        const modExports = require('test-version-not-available');
        assert.strictEqual(modExports.foo, 'bar');
        sinon.assert.notCalled(modulePatchSpy);
        sinon.assert.notCalled(filePatchSpy);
      });

      it('should patch if the instrumentation has a wildcard version', function () {
        instrumentation = instrFromPartialDelegate({
          init() {
            return [
              new InstrumentationNodeModuleDefinition(
                'test-version-not-available',
                [`^${MODULE_VERSION}`, WILDCARD_VERSION],
                modulePatchSpy,
                moduleUnpatchSpy,
                [
                  new InstrumentationNodeModuleFile(
                    'test-version-not-available/lib/baz.js',
                    [`^${MODULE_VERSION}`, WILDCARD_VERSION],
                    filePatchSpy,
                    fileUnpatchSpy
                  ),
                ]
              ),
            ];
          },
        });
        const modExports = require('test-version-not-available');
        assert.strictEqual(modExports.foo, 'bar');
        sinon.assert.called(modulePatchSpy);
        sinon.assert.called(filePatchSpy);
      });
    });
  });

  describe('enable/disable', function () {
    it('should work with a normal module', function () {
      modulePatchSpy = sinon.spy(patchFn);
      moduleUnpatchSpy = sinon.spy(unpatchFn);
      instrumentation = instrFromPartialDelegate({
        init() {
          return [
            new InstrumentationNodeModuleDefinition(
              'crypto',
              [WILDCARD_VERSION],
              modulePatchSpy,
              moduleUnpatchSpy
            ),
          ];
        },
      });
      const exportsPatched = require('crypto');
      assert.equal(exportsPatched.__patched, true, 'after enable');
      instrumentation.disable();
      assert.equal(exportsPatched.__patched, false, 'after disable');
      instrumentation.enable();
      assert.equal(exportsPatched.__patched, true, 'after re-enable');
    });

    it('should work with a absolute path module', function () {
      const moduleName = 'absolutePathTestFixture';
      const fileName = path.join(__dirname, 'fixtures', `${moduleName}.js`);
      modulePatchSpy = sinon.spy(patchFn);
      moduleUnpatchSpy = sinon.spy(unpatchFn);
      instrumentation = instrFromPartialDelegate({
        init() {
          return [
            new InstrumentationNodeModuleDefinition(
              fileName,
              ['*'],
              undefined,
              undefined,
              [
                new InstrumentationNodeModuleFile(
                  moduleName,
                  ['*'],
                  modulePatchSpy,
                  moduleUnpatchSpy
                ),
              ]
            ),
          ];
        },
      });
      const exportsPatched = require(fileName);
      assert.equal(exportsPatched.__patched, true, 'after enable');
      instrumentation.disable();
      assert.equal(exportsPatched.__patched, false, 'after disable');
      instrumentation.enable();
      assert.equal(exportsPatched.__patched, true, 'after re-enable');
    });
  });
});
