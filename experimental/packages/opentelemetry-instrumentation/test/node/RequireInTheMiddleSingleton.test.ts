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

describe('RequireInTheMiddleSingleton', () => {
  describe('register', () => {
    const onRequireFsStub = makeOnRequiresStub('fs');
    const onRequireFsPromisesStub = makeOnRequiresStub('fs-promises');
    const onRequireCodecovStub = makeOnRequiresStub('codecov');
    const onRequireCodecovLibStub = makeOnRequiresStub('codecov-lib');
    const onRequireCpxStub = makeOnRequiresStub('cpx2');
    const onRequireCpxLibStub = makeOnRequiresStub('cpx2-lib');

    before(() => {
      requireInTheMiddleSingleton.register('fs', onRequireFsStub);
      requireInTheMiddleSingleton.register(
        'fs/promises',
        onRequireFsPromisesStub
      );
      requireInTheMiddleSingleton.register('codecov', onRequireCodecovStub);
      requireInTheMiddleSingleton.register(
        'codecov/lib/codecov.js',
        onRequireCodecovLibStub
      );
      requireInTheMiddleSingleton.register('cpx2', onRequireCpxStub);
      requireInTheMiddleSingleton.register(
        'cpx2/lib/copy-sync.js',
        onRequireCpxLibStub
      );
    });

    beforeEach(() => {
      onRequireFsStub.resetHistory();
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
      describe('AND module name does not match', () => {
        it('should not call `onRequire`', () => {
          const exports = require('crypto');
          assert.equal(exports.__ritmOnRequires, undefined);
          sinon.assert.notCalled(onRequireFsStub);
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
          sinon.assert.notCalled(onRequireFsStub);
        });
      });
    });

    describe('non-core module', () => {
      describe('AND module name matches', () => {
        const baseDir = path.dirname(require.resolve('codecov'));
        const modulePath = path.join('codecov', 'lib', 'codecov.js');
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
        const baseDir = path.resolve(
          path.dirname(require.resolve('cpx2')),
          '..'
        );
        const modulePath = path.join('cpx2', 'lib', 'copy-sync.js');
        it('should call `onRequire`', () => {
          const exports = require('cpx2/lib/copy-sync');
          assert.deepStrictEqual(exports.__ritmOnRequires, [
            'cpx2',
            'cpx2-lib',
          ]);
          sinon.assert.calledWithMatch(
            onRequireCpxStub,
            { __ritmOnRequires: ['cpx2', 'cpx2-lib'] },
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
