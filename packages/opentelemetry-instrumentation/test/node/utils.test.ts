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

import { NoopLogger } from '@opentelemetry/api';
import * as assert from 'assert';
import * as path from 'path';
import * as utils from '../../src/platform/node/old/utils';

const INSTALLED_PLUGINS_PATH = path.join(__dirname, 'node_modules');
const TEST_MODULES: Array<{ name: string; version: string | null }> = [
  {
    name: 'simple-module',
    version: '0.1.0',
  },
  {
    name: 'nonexistent-module',
    version: null,
  },
  {
    name: 'http',
    version: null,
  },
];

describe('Instrumentation#utils', () => {
  const logger = new NoopLogger();

  before(() => {
    utils.searchPathForTest(INSTALLED_PLUGINS_PATH);
  });

  describe('getPackageVersion', () => {
    TEST_MODULES.forEach(testCase => {
      it(`should return ${testCase.version} for ${testCase.name}`, () => {
        assert.strictEqual(
          utils.getPackageVersion(logger, testCase.name),
          testCase.version
        );
      });
    });
  });
  describe('isSupportedVersion', () => {
    const version = '1.0.1';

    it('should return true when supportedVersions is not defined', () => {
      assert.strictEqual(utils.isSupportedVersion('1.0.0', undefined), true);
    });

    [
      ['1.X'],
      [version],
      ['1.X.X', '3.X.X'],
      ['^1.0.0'],
      ['~1.0.0', '^0.1.0'],
      ['*'],
      ['>1.0.0'],
      [],
    ].forEach(supportedVersion => {
      it(`should return true when version is equal to ${version} and supportedVersions is equal to ${supportedVersion}`, () => {
        assert.strictEqual(
          utils.isSupportedVersion(version, supportedVersion),
          true
        );
      });
    });

    [['0.X'], ['0.1.0'], ['0.X.X'], ['^0.1.0'], ['1.0.0'], ['<1.0.0']].forEach(
      supportedVersion => {
        it(`should return false when version is equal to ${version} and supportedVersions is equal to ${supportedVersion}`, () => {
          assert.strictEqual(
            utils.isSupportedVersion(version, supportedVersion),
            false
          );
        });
      }
    );

    it("should return false when version is equal to null and supportedVersions is equal to '*'", () => {
      assert.strictEqual(utils.isSupportedVersion(null as any, ['*']), false);
    });
  });
});
