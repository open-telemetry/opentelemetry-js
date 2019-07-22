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
import { PluginLoader } from '../../src/instrumentation/PluginLoader';
import { NoopTracer } from '@opentelemetry/core';

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

const clearRequireCache = () => {
  Object.keys(require.cache).forEach(key => delete require.cache[key]);
};

describe('PluginLoader', () => {
  const tracer = new NoopTracer();

  before(() => {
    //module.paths.push(INSTALLED_PLUGINS_PATH);
    //PluginLoader.searchPathForTest = INSTALLED_PLUGINS_PATH;
  });

  afterEach(() => {
    clearRequireCache();
  });

  it('sanity check', () => {
    // Ensure that module fixtures contain values that we expect.
    const simpleModule = require(TEST_MODULES[0].name);
    assert.strictEqual(simpleModule.name, TEST_MODULES[0].name);
    assert.strictEqual(simpleModule.value, 0);
    assert.throws(() => require(TEST_MODULES[1].name));
  });

  // it('', () => {
  //   const loader = new PluginLoader(tracer, logger);
  //   loader.patch(TEST_MODULES.map(testCase => testCase.name));
  // });
});
