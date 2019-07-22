/**
 * Copyright 2019, OpenTelemetry Authors
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
import * as utils from '../../src/instrumentation/utils';
import { NoopLogger } from '@opentelemetry/core';

const INSTALLED_PLUGINS_PATH = `${__dirname}/node_modules`;
const TEST_MODULES: Array<{
  name: string;
  version: string | null;
}> = [
  {
    name: 'small-number',
    version: '10.2.0',
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

  describe('defaultPackageName', () => {
    it('should return package name with default scope and a prefix', () => {
      assert.strictEqual(
        utils.defaultPackageName('http'),
        '@opentelemetry/instrumentation-http'
      );
      assert.strictEqual(
        utils.defaultPackageName('simple-module'),
        '@opentelemetry/instrumentation-simple-module'
      );
    });
  });

  describe('getPackageVersion', () => {
    it('should handle when undefined basedir', () => {
      assert.strictEqual(utils.getPackageVersion(logger), null);
    });

    TEST_MODULES.forEach(testCase => {
      it(`should return ${testCase.version} for ${testCase.name}`, () => {
        assert.strictEqual(
          utils.getPackageVersion(logger, testCase.name),
          testCase.version
        );
      });
    });
  });
});
