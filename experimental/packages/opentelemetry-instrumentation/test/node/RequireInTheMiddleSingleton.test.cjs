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

const assert = require('assert');
const sinon = require('sinon');
const path = require('path');
const {
  RequireInTheMiddleSingleton,
} = require('../../build/src/platform/node/RequireInTheMiddleSingleton');

const requireInTheMiddleSingleton = RequireInTheMiddleSingleton.getInstance();

const makeOnRequiresStub = label =>
  sinon.stub().callsFake(exports => {
    exports.__ritmOnRequires ??= [];
    exports.__ritmOnRequires.push(label);
    return exports;
  });

describe('RequireInTheMiddleSingleton', () => {
  describe('register', () => {
    const onRequireVmStub = makeOnRequiresStub('vm');
    const onRequireFsPromisesStub = makeOnRequiresStub('fs-promises');
    const onRequireCodecovStub = makeOnRequiresStub('codecov');
    const onRequireCodecovLibStub = makeOnRequiresStub('codecov-lib');
    const onRequireCpxStub = makeOnRequiresStub('test-non-core-module');
    const onRequireCpxLibStub = makeOnRequiresStub('test-non-core-module-lib');

    before(() => {
      requireInTheMiddleSingleton.register('vm', onRequireVmStub);
      requireInTheMiddleSingleton.register(
        'fs/promises',
        onRequireFsPromisesStub
      );
      requireInTheMiddleSingleton.register('codecov', onRequireCodecovStub);
      requireInTheMiddleSingleton.register(
        'codecov/lib/codecov.js',
        onRequireCodecovLibStub
      );
      requireInTheMiddleSingleton.register(
        'test-non-core-module',
        onRequireCpxStub
      );
      requireInTheMiddleSingleton.register(
        'test-non-core-module/lib/copy-sync.js',
        onRequireCpxLibStub
      );
    });

    beforeEach(() => {
      onRequireVmStub.resetHistory();
      onRequireFsPromisesStub.resetHistory();
      onRequireCodecovStub.resetHistory();
      onRequireCodecovLibStub.resetHistory();
      onRequireCpxStub.resetHistory();
      onRequireCpxLibStub.resetHistory();
    });

    it('should return a hooked object', () => {
      const moduleName = 'm';
      const onRequire = makeOnRequiresStub('m');
      const hooked = requireInTheMiddleSingleton.register(
        moduleName,
        onRequire
      );
      assert.deepStrictEqual(hooked, { moduleName, onRequire });
    });

    describe('core module', () => {
      describe('AND module name matches', () => {
        it('should call `onRequire`', () => {
          const exports = require('vm');
          assert.deepStrictEqual(exports.__ritmOnRequires, ['vm']);
          sinon.assert.calledOnceWithExactly(
            onRequireVmStub,
            exports,
            'vm',
            undefined
          );
          sinon.assert.notCalled(onRequireFsPromisesStub);
        });
      });
      describe('AND module name does not match', () => {
        it('should not call `onRequire`', () => {
          const exports = require('crypto');
          assert.equal(exports.__ritmOnRequires, undefined);
          sinon.assert.notCalled(onRequireVmStub);
        });
      });
    });

    describe('core module with sub-path', () => {
      describe('AND module name matches', () => {
        it('should call `onRequire`', () => {
          const exports = require('fs/promises');
          assert.deepStrictEqual(exports.__ritmOnRequires, ['fs-promises']);
          sinon.assert.calledOnceWithExactly(
            onRequireFsPromisesStub,
            exports,
            'fs/promises',
            undefined
          );
          sinon.assert.notCalled(onRequireVmStub);
        });
      });
    });

    describe('non-core module', () => {
      describe('AND module name matches', () => {
        const baseDir = path.normalize(
          path.dirname(require.resolve('codecov'))
        );
        const modulePath = path.normalize(
          path.join('codecov', 'lib', 'codecov.js')
        );
        it('should call `onRequire`', () => {
          const exports = require('codecov');
          assert.deepStrictEqual(exports.__ritmOnRequires, ['codecov']);
          sinon.assert.calledWithExactly(
            onRequireCodecovStub,
            exports,
            'codecov',
            baseDir
          );
          sinon.assert.calledWithMatch(
            onRequireCodecovStub,
            { __ritmOnRequires: ['codecov', 'codecov-lib'] },
            modulePath,
            baseDir
          );
          sinon.assert.calledWithMatch(
            onRequireCodecovLibStub,
            { __ritmOnRequires: ['codecov', 'codecov-lib'] },
            modulePath,
            baseDir
          );
        }).timeout(30000);
      });
    });

    describe('non-core module with sub-path', () => {
      describe('AND module name matches', () => {
        const baseDir = path.normalize(
          path.resolve(
            path.dirname(require.resolve('test-non-core-module')),
            '..'
          )
        );
        const modulePath = path.normalize(
          path.join('test-non-core-module', 'lib', 'copy-sync.js')
        );
        it('should call `onRequire`', () => {
          const exports = require('test-non-core-module/lib/copy-sync');
          assert.deepStrictEqual(exports.__ritmOnRequires, [
            'test-non-core-module',
            'test-non-core-module-lib',
          ]);
          sinon.assert.calledWithMatch(
            onRequireCpxStub,
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
            onRequireCpxStub,
            exports,
            modulePath,
            baseDir
          );
          sinon.assert.calledWithExactly(
            onRequireCpxLibStub,
            exports,
            modulePath,
            baseDir
          );
        }).timeout(30000);
      });
    });
  });
});
