/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import * as path from 'path';
import { InstrumentationBase } from '../../src';
import type { InstrumentationModuleDefinition } from '../../src/';
import {
  InstrumentationNodeModuleDefinition,
  InstrumentationNodeModuleFile,
} from '../../src/';

const MODULE_NAME = 'test-module';
const MODULE_VERSION = '0.1.0';
const WILDCARD_VERSION = '*';
const NO_VERSION_MODULE = 'test-no-version-module';
const NO_VERSION_FILE = `${NO_VERSION_MODULE}/lib/file.js`;

type Patchable = Record<string, unknown> & { __patched?: boolean };

const passThrough = <T>(moduleExports: T): T => moduleExports;

// Dropping the require.cache entry makes require-in-the-middle run its hooks again.
function requireFresh<T>(id: string): T {
  delete require.cache[require.resolve(id)];
  return require(id);
}

function createInstrumentation(
  definition: InstrumentationModuleDefinition
): InstrumentationBase {
  class TestInstrumentation extends InstrumentationBase {
    constructor() {
      super(MODULE_NAME, MODULE_VERSION, { enabled: false });
    }

    init() {
      return definition;
    }
  }
  return new TestInstrumentation();
}

describe('InstrumentationBase', function () {
  describe('require hook - core module', function () {
    let instrumentation: InstrumentationBase;
    afterEach(() => instrumentation.disable());

    // Each test needs a core module not yet required through the shared hook, which caches it.
    it('should not patch a core module required while disabled', function () {
      const patchSpy = sinon.spy(passThrough);
      const definition: InstrumentationModuleDefinition =
        new InstrumentationNodeModuleDefinition('dgram', ['*'], patchSpy);
      instrumentation = createInstrumentation(definition);
      instrumentation.enable();
      instrumentation.disable();

      const moduleExports = require('dgram');

      assert.strictEqual(definition.moduleExports, moduleExports);
      sinon.assert.notCalled(patchSpy);
    });

    it('should patch a core module required while enabled', function () {
      const patchSpy = sinon.spy(passThrough);
      const definition: InstrumentationModuleDefinition =
        new InstrumentationNodeModuleDefinition(
          'trace_events',
          ['*'],
          patchSpy
        );
      instrumentation = createInstrumentation(definition);
      instrumentation.enable();

      const moduleExports = require('trace_events');

      assert.strictEqual(definition.moduleExports, moduleExports);
      sinon.assert.calledOnceWithExactly(patchSpy, moduleExports);
    });
  });

  describe('require hook - module version is not available', function () {
    // The fixture package.json has no version, so only a wildcard supported version matches.
    let instrumentation: InstrumentationBase;
    let modulePatchSpy: sinon.SinonSpy;
    let filePatchSpy: sinon.SinonSpy;

    beforeEach(() => {
      modulePatchSpy = sinon.spy(passThrough);
      filePatchSpy = sinon.spy(passThrough);
    });
    afterEach(() => instrumentation.disable());

    function enableFor(definition: InstrumentationModuleDefinition): void {
      instrumentation = createInstrumentation(definition);
      instrumentation.enable();
    }

    function fileDefinition(
      supportedVersions: string[],
      fileCount: number
    ): InstrumentationModuleDefinition {
      const files = Array.from(
        { length: fileCount },
        () =>
          new InstrumentationNodeModuleFile(
            NO_VERSION_FILE,
            supportedVersions,
            filePatchSpy,
            () => {}
          )
      );
      return new InstrumentationNodeModuleDefinition(
        NO_VERSION_MODULE,
        supportedVersions,
        modulePatchSpy,
        undefined,
        files
      );
    }

    describe('when patching a module', function () {
      describe('AND there is no wildcard supported version', function () {
        it('should not patch module', function () {
          const definition: InstrumentationModuleDefinition =
            new InstrumentationNodeModuleDefinition(
              NO_VERSION_MODULE,
              [`^${MODULE_VERSION}`],
              modulePatchSpy
            );
          enableFor(definition);

          requireFresh(NO_VERSION_MODULE);

          assert.strictEqual(definition.moduleVersion, undefined);
          assert.strictEqual(definition.moduleExports, undefined);
          sinon.assert.notCalled(modulePatchSpy);
        });
      });

      describe('AND there is a wildcard supported version', function () {
        it('should patch module', function () {
          const definition: InstrumentationModuleDefinition =
            new InstrumentationNodeModuleDefinition(
              NO_VERSION_MODULE,
              [`^${MODULE_VERSION}`, WILDCARD_VERSION],
              modulePatchSpy
            );
          enableFor(definition);

          const moduleExports = requireFresh(NO_VERSION_MODULE);

          assert.strictEqual(definition.moduleVersion, undefined);
          assert.strictEqual(definition.moduleExports, moduleExports);
          sinon.assert.calledOnceWithExactly(
            modulePatchSpy,
            moduleExports,
            undefined
          );
        });
      });
    });

    describe('when patching module files', function () {
      describe('AND there is no wildcard supported version', function () {
        it('should not patch module file', function () {
          const definition = fileDefinition([`^${MODULE_VERSION}`], 1);
          enableFor(definition);

          requireFresh(NO_VERSION_FILE);

          assert.strictEqual(definition.moduleVersion, undefined);
          assert.strictEqual(definition.files[0].moduleExports, undefined);
          sinon.assert.notCalled(modulePatchSpy);
          sinon.assert.notCalled(filePatchSpy);
        });
      });

      describe('AND there is a wildcard supported version', function () {
        it('should patch module file', function () {
          const definition = fileDefinition(
            [`^${MODULE_VERSION}`, WILDCARD_VERSION],
            1
          );
          enableFor(definition);

          const moduleExports = requireFresh(NO_VERSION_FILE);

          assert.strictEqual(definition.moduleVersion, undefined);
          assert.strictEqual(definition.files[0].moduleExports, moduleExports);
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
          const definition = fileDefinition(
            [`^${MODULE_VERSION}`, WILDCARD_VERSION],
            2
          );
          enableFor(definition);

          const moduleExports = requireFresh(NO_VERSION_FILE);

          assert.strictEqual(definition.moduleVersion, undefined);
          assert.strictEqual(definition.files[0].moduleExports, moduleExports);
          assert.strictEqual(definition.files[1].moduleExports, moduleExports);
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

  describe('subclass with fields named like base internals', function () {
    class FieldNameInstrumentation extends InstrumentationBase {
      _enabled = 'subclass-enabled';
      _modules = ['subclass-modules'];

      constructor() {
        super('@opentelemetry/instrumentation-field-name-test', '0.0.0', {
          enabled: false,
        });
      }

      init() {
        return new InstrumentationNodeModuleDefinition(
          NO_VERSION_MODULE,
          ['*'],
          (exports: Patchable) => {
            exports.__patched = true;
            return exports;
          },
          (exports: Patchable) => {
            exports.__patched = false;
            return exports;
          }
        );
      }
    }

    it('should compile and keep the base state separate', function () {
      const instrumentation = new FieldNameInstrumentation();
      assert.strictEqual(instrumentation.isEnabled(), false);

      instrumentation.enable();
      assert.strictEqual(instrumentation.isEnabled(), true);
      const exports = requireFresh<Patchable>(NO_VERSION_MODULE);
      assert.strictEqual(exports.__patched, true, 'after enable');

      instrumentation.disable();
      assert.strictEqual(instrumentation.isEnabled(), false);
      assert.strictEqual(exports.__patched, false, 'after disable');

      assert.strictEqual(instrumentation._enabled, 'subclass-enabled');
      assert.deepStrictEqual(instrumentation._modules, ['subclass-modules']);
    });
  });
});
