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
import { InstrumentationBase } from '../../src';
import {
  InstrumentationNodeModuleDefinition,
  InstrumentationModuleDefinition,
  InstrumentationNodeModuleFile,
} from '../../src/';

const MODULE_NAME = 'test-module';
const MODULE_FILE_NAME = 'test-module-file';
const MODULE_VERSION = '0.1.0';
const WILDCARD_VERSION = '*';
const MODULE_DIR = '/random/dir';
const CORE_MODULE = 'random_core';

class TestInstrumentation extends InstrumentationBase {
  constructor() {
    super(MODULE_NAME, MODULE_VERSION, {});
  }

  init() {}
}

describe('InstrumentationBase', function () {
  describe('_onRequire - core module', function () {
    let instrumentation: TestInstrumentation;
    let modulePatchSpy: sinon.SinonSpy;
    beforeEach(() => {
      instrumentation = new TestInstrumentation();
      modulePatchSpy = sinon.spy();
    });

    describe('AND module is not enabled', function () {
      it('should not patch the module', function () {
        // @ts-expect-error access internal property for testing
        instrumentation._enabled = false;
        const moduleExports = {};
        const instrumentationModule = {
          name: CORE_MODULE,
          patch: modulePatchSpy as unknown,
        } as InstrumentationModuleDefinition;

        // @ts-expect-error access internal property for testing
        instrumentation._onRequire<unknown>(
          instrumentationModule,
          moduleExports,
          CORE_MODULE,
          undefined
        );

        assert.strictEqual(instrumentationModule.moduleExports, moduleExports);
        sinon.assert.notCalled(modulePatchSpy);
      });
    });

    describe('AND module is enabled', function () {
      it('should patch the module', function () {
        // @ts-expect-error access internal property for testing
        instrumentation._enabled = true;
        const moduleExports = {};
        const instrumentationModule = {
          name: CORE_MODULE,
          patch: modulePatchSpy as unknown,
        } as InstrumentationModuleDefinition;

        // @ts-expect-error access internal property for testing
        instrumentation._onRequire<unknown>(
          instrumentationModule,
          moduleExports,
          CORE_MODULE,
          undefined
        );

        assert.strictEqual(instrumentationModule.moduleExports, moduleExports);
        sinon.assert.calledOnceWithExactly(modulePatchSpy, moduleExports);
      });
    });
  });

  describe('_onRequire - module version is not available', function () {
    // For all of these cases, there is no indication of the actual module version,
    // so we require there to be a wildcard supported version.

    let instrumentation: TestInstrumentation;
    let modulePatchSpy: sinon.SinonSpy;

    beforeEach(() => {
      instrumentation = new TestInstrumentation();
      // @ts-expect-error access internal property for testing
      instrumentation._enabled = true;
      modulePatchSpy = sinon.spy();
    });

    describe('when patching a module', function () {
      describe('AND there is no wildcard supported version', function () {
        it('should not patch module', function () {
          const moduleExports = {};
          const instrumentationModule = {
            supportedVersions: [`^${MODULE_VERSION}`],
            name: MODULE_NAME,
            patch: modulePatchSpy as unknown,
          } as InstrumentationModuleDefinition;

          // @ts-expect-error access internal property for testing
          instrumentation._onRequire<unknown>(
            instrumentationModule,
            moduleExports,
            MODULE_NAME,
            MODULE_DIR
          );

          assert.strictEqual(instrumentationModule.moduleVersion, undefined);
          assert.strictEqual(instrumentationModule.moduleExports, undefined);
          sinon.assert.notCalled(modulePatchSpy);
        });
      });

      describe('AND there is a wildcard supported version', function () {
        it('should patch module', function () {
          const moduleExports = {};
          const instrumentationModule = {
            supportedVersions: [`^${MODULE_VERSION}`, WILDCARD_VERSION],
            name: MODULE_NAME,
            patch: modulePatchSpy as unknown,
          } as InstrumentationModuleDefinition;

          // @ts-expect-error access internal property for testing
          instrumentation._onRequire<unknown>(
            instrumentationModule,
            moduleExports,
            MODULE_NAME,
            MODULE_DIR
          );

          assert.strictEqual(instrumentationModule.moduleVersion, undefined);
          assert.strictEqual(
            instrumentationModule.moduleExports,
            moduleExports
          );
          sinon.assert.calledOnceWithExactly(
            modulePatchSpy,
            moduleExports,
            undefined
          );
        });
      });
    });

    describe('when patching module files', function () {
      let filePatchSpy: sinon.SinonSpy;

      beforeEach(() => {
        filePatchSpy = sinon.stub().callsFake(exports => exports);
      });

      describe('AND there is no wildcard supported version', function () {
        it('should not patch module file', function () {
          const moduleExports = {};
          const supportedVersions = [`^${MODULE_VERSION}`];
          const instrumentationModule = {
            supportedVersions,
            name: MODULE_NAME,
            patch: modulePatchSpy as unknown,
            files: [
              {
                name: MODULE_FILE_NAME,
                supportedVersions,
                patch: filePatchSpy as unknown,
              },
            ],
          } as InstrumentationModuleDefinition;

          // @ts-expect-error access internal property for testing
          instrumentation._onRequire<unknown>(
            instrumentationModule,
            moduleExports,
            MODULE_FILE_NAME,
            MODULE_DIR
          );

          assert.strictEqual(instrumentationModule.moduleVersion, undefined);
          assert.strictEqual(instrumentationModule.moduleExports, undefined);
          sinon.assert.notCalled(modulePatchSpy);
          sinon.assert.notCalled(filePatchSpy);
        });
      });

      describe('AND there is a wildcard supported version', function () {
        it('should patch module file', function () {
          const moduleExports = {};
          const supportedVersions = [`^${MODULE_VERSION}`, WILDCARD_VERSION];
          const instrumentationModule = {
            supportedVersions,
            name: MODULE_NAME,
            patch: modulePatchSpy as unknown,
            files: [
              {
                name: MODULE_FILE_NAME,
                supportedVersions,
                patch: filePatchSpy as unknown,
              },
            ],
          } as InstrumentationModuleDefinition;

          // @ts-expect-error access internal property for testing
          instrumentation._onRequire<unknown>(
            instrumentationModule,
            moduleExports,
            MODULE_FILE_NAME,
            MODULE_DIR
          );

          assert.strictEqual(instrumentationModule.moduleVersion, undefined);
          assert.strictEqual(
            instrumentationModule.files[0].moduleExports,
            moduleExports
          );
          sinon.assert.notCalled(modulePatchSpy);
          sinon.assert.calledOnceWithExactly(
            filePatchSpy,
            moduleExports,
            undefined
          );
        });
      });

      describe('AND there is multiple patches for the same file', function () {
        it('should patch the same file twice', function () {
          const moduleExports = {};
          const supportedVersions = [`^${MODULE_VERSION}`, WILDCARD_VERSION];
          const instrumentationModule = {
            supportedVersions,
            name: MODULE_NAME,
            patch: modulePatchSpy as unknown,
            files: [
              {
                name: MODULE_FILE_NAME,
                supportedVersions,
                patch: filePatchSpy as unknown,
              },
              {
                name: MODULE_FILE_NAME,
                supportedVersions,
                patch: filePatchSpy as unknown,
              },
            ],
          } as InstrumentationModuleDefinition;

          // @ts-expect-error access internal property for testing
          instrumentation._onRequire<unknown>(
            instrumentationModule,
            moduleExports,
            MODULE_FILE_NAME,
            MODULE_DIR
          );

          assert.strictEqual(instrumentationModule.moduleVersion, undefined);
          assert.strictEqual(
            instrumentationModule.files[0].moduleExports,
            moduleExports
          );
          assert.strictEqual(
            instrumentationModule.files[1].moduleExports,
            moduleExports
          );
          sinon.assert.notCalled(modulePatchSpy);
          sinon.assert.calledTwice(filePatchSpy);
        });
      });
    });
  });

  describe('enable/disable', function () {
    describe('AND a normal module name', function () {
      type Exports = Record<string, unknown>;
      type ExportsPatched = Exports & { __patched?: boolean };
      const moduleName = 'net';
      class TestInstrumentation extends InstrumentationBase {
        constructor() {
          super('@opentelemetry/instrumentation-net-test', '0.0.0', {
            enabled: false,
          });
        }
        init(): InstrumentationNodeModuleDefinition[] {
          return [
            new InstrumentationNodeModuleDefinition(
              moduleName,
              ['*'],
              (exports: ExportsPatched) => {
                exports.__patched = true;
                return exports;
              },
              (exports: ExportsPatched) => {
                exports.__patched = false;
                return exports;
              }
            ),
          ];
        }
      }

      const instrumentation = new TestInstrumentation();

      it('should patch the module', function () {
        instrumentation.enable();
        const exportsPatched = require(moduleName);
        assert.equal(exportsPatched.__patched, true, 'after enable');
        instrumentation.disable();
        assert.equal(exportsPatched.__patched, false, 'after disable');
        instrumentation.enable();
        assert.equal(exportsPatched.__patched, true, 'after re-enable');
      });
    });

    describe('AND an absolute path module name', function () {
      type Exports = Record<string, unknown>;
      type ExportsPatched = Exports & { __patched?: boolean };
      const moduleName = 'absolutePathTestFixture';
      const fileName = path.join(__dirname, 'fixtures', `${moduleName}.js`);
      class TestInstrumentation extends InstrumentationBase {
        constructor() {
          super('@opentelemetry/instrumentation-absolute-path-test', '0.0.0', {
            enabled: false,
          });
        }
        init(): InstrumentationNodeModuleDefinition[] {
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
                  (exports: ExportsPatched) => {
                    exports.__patched = true;
                    return exports;
                  },
                  (exports?: ExportsPatched) => {
                    if (exports) exports.__patched = false;
                    return exports;
                  }
                ),
              ]
            ),
          ];
        }
      }

      const instrumentation = new TestInstrumentation();

      it('should patch the module', function () {
        instrumentation.enable();
        const exportsPatched = require(fileName);
        assert.equal(exportsPatched.__patched, true, 'after enable');
        instrumentation.disable();
        assert.equal(exportsPatched.__patched, false, 'after disable');
        instrumentation.enable();
        assert.equal(exportsPatched.__patched, true, 'after re-enable');
      });
    });
  });
});
