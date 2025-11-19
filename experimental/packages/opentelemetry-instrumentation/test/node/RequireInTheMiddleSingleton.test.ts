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
import type { OnRequireFn } from 'require-in-the-middle';
import { RequireInTheMiddleSingleton } from '../../src/platform/node/RequireInTheMiddleSingleton';

const requireInTheMiddleSingleton = RequireInTheMiddleSingleton.getInstance();

type AugmentedExports = {
  __ritmOnRequires?: string[];
};

const makeOnRequiresStub = (label: string): sinon.SinonStub =>
  sinon.stub().callsFake(((exports: AugmentedExports) => {
    exports.__ritmOnRequires ??= [];
    exports.__ritmOnRequires.push(label);
    return exports;
  }) as OnRequireFn);

describe('RequireInTheMiddleSingleton', function () {
  describe('register', function () {
    const onRequireFsStub = makeOnRequiresStub('fs');
    const onRequireFsPromisesStub = makeOnRequiresStub('fs-promises');
    const onRequireNonCoreModuleStub = makeOnRequiresStub(
      'test-non-core-module'
    );
    const onRequireNonCoreModuleLibStub = makeOnRequiresStub(
      'test-non-core-module-lib'
    );

    before(function () {
      requireInTheMiddleSingleton.register('fs', onRequireFsStub);
      requireInTheMiddleSingleton.register(
        'fs/promises',
        onRequireFsPromisesStub
      );
      requireInTheMiddleSingleton.register(
        'test-non-core-module',
        onRequireNonCoreModuleStub
      );
      requireInTheMiddleSingleton.register(
        'test-non-core-module/lib/copy-sync.js',
        onRequireNonCoreModuleLibStub
      );
    });

    afterEach(function () {
      // delete cached modules to allow re-require
      delete require.cache[require.resolve('fs/promises')];
      delete require.cache[require.resolve('test-non-core-module')];
      delete require.cache[
        require.resolve('test-non-core-module/lib/copy-sync')
      ];

      // reset stubs
      onRequireFsStub.resetHistory();
      onRequireFsPromisesStub.resetHistory();
      onRequireNonCoreModuleStub.resetHistory();
      onRequireNonCoreModuleLibStub.resetHistory();
    });

    it('should return a hooked object', function () {
      const moduleName = 'm';
      const onRequire = makeOnRequiresStub('m');
      const hooked = requireInTheMiddleSingleton.register(
        moduleName,
        onRequire
      );
      assert.deepStrictEqual(hooked, { moduleName, onRequire });
    });

    describe('core module', function () {
      describe('AND module name matches', function () {
        it('should call `onRequire`', function () {
          const exports = require('fs');
          assert.deepStrictEqual(exports.__ritmOnRequires, ['fs']);
          sinon.assert.calledOnceWithExactly(
            onRequireFsStub,
            exports,
            'fs',
            undefined
          );
          sinon.assert.notCalled(onRequireFsPromisesStub);
        });
      });
      describe('AND module name does not match', function () {
        it('should not call `onRequire`', function () {
          const exports = require('crypto');
          assert.equal(exports.__ritmOnRequires, undefined);
          sinon.assert.notCalled(onRequireFsStub);
        });
      });
    });

    describe('core module with sub-path', function () {
      describe('AND module name matches', function () {
        it('should call `onRequire`', function () {
          const exports = require('fs/promises');
          assert.deepStrictEqual(exports.__ritmOnRequires, ['fs-promises']);
          sinon.assert.calledOnceWithExactly(
            onRequireFsPromisesStub,
            exports,
            'fs/promises',
            undefined
          );
          sinon.assert.notCalled(onRequireFsStub);
        });
      });
    });

    describe('non-core module', function () {
      describe('AND module name matches', function () {
        const baseDir = path.normalize(
          path.resolve(
            path.dirname(require.resolve('test-non-core-module')),
            '..'
          )
        );
        const modulePath = path.normalize(
          path.join('test-non-core-module', 'lib', 'copy-sync.js')
        );
        it('should call `onRequire`', function () {
          const exports = require('test-non-core-module');
          assert.deepStrictEqual(exports.__ritmOnRequires, [
            'test-non-core-module',
          ]);
          sinon.assert.calledWithExactly(
            onRequireNonCoreModuleStub,
            exports,
            'test-non-core-module',
            baseDir
          );
          sinon.assert.calledWithMatch(
            onRequireNonCoreModuleStub,
            {
              __ritmOnRequires: [
                'test-non-core-module',
                'test-non-core-module-lib',
              ],
            },
            modulePath,
            baseDir
          );
          sinon.assert.calledWithMatch(
            onRequireNonCoreModuleLibStub,
            {
              __ritmOnRequires: [
                'test-non-core-module',
                'test-non-core-module-lib',
              ],
            },
            modulePath,
            baseDir
          );
        }).timeout(30000);
      });
    });

    describe('non-core module with sub-path (deep require)', function () {
      describe('AND module name matches', function () {
        const baseDir = path.normalize(
          path.resolve(
            path.dirname(require.resolve('test-non-core-module')),
            '..'
          )
        );
        const modulePath = path.normalize(
          path.join('test-non-core-module', 'lib', 'copy-sync.js')
        );
        it('should call `onRequire`', function () {
          const exports = require('test-non-core-module/lib/copy-sync');
          assert.deepStrictEqual(exports.__ritmOnRequires, [
            'test-non-core-module',
            'test-non-core-module-lib',
          ]);
          sinon.assert.calledWithMatch(
            onRequireNonCoreModuleStub,
            {
              __ritmOnRequires: [
                'test-non-core-module',
                'test-non-core-module-lib',
              ],
            },
            modulePath,
            baseDir
          );
          sinon.assert.calledWithExactly(
            onRequireNonCoreModuleStub,
            exports,
            modulePath,
            baseDir
          );
          sinon.assert.calledWithExactly(
            onRequireNonCoreModuleLibStub,
            exports,
            modulePath,
            baseDir
          );
        }).timeout(30000);
      });
    });
  });
});
