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
import * as path from 'path';
import { NodePluginManager } from '../src';

const INSTALLED_PLUGINS_PATH = path.join(
  __dirname,
  'instrumentation',
  'node_modules'
);

describe('NodePluginManager', () => {
  let nodePluginManager: NodePluginManager;
  before(() => {
    module.paths.push(INSTALLED_PLUGINS_PATH);
  });

  afterEach(() => {
    // clear require cache
    Object.keys(require.cache).forEach(key => delete require.cache[key]);
  });

  describe('constructor', () => {
    it('should load a merge of user configured and default plugins and implictly enable non-default plugins', () => {
      nodePluginManager = new NodePluginManager({
        plugins: {
          'simple-module': {
            path: '@opentelemetry/plugin-simple-module',
          },
          'supported-module': {
            path: '@opentelemetry/plugin-supported-module',
            enhancedDatabaseReporting: false,
            ignoreMethods: [],
            ignoreUrls: [],
          },
          'random-module': {
            enabled: false,
            path: '@opentelemetry/random-module',
          },
          http: {
            path: '@opentelemetry/plugin-http-module',
          },
        },
      });
      const plugins = nodePluginManager['_pluginLoader']['_plugins'];
      assert.strictEqual(plugins.length, 0);
      require('simple-module');
      assert.strictEqual(plugins.length, 1);
      require('supported-module');
      assert.strictEqual(plugins.length, 2);
      require('random-module');
      assert.strictEqual(plugins.length, 2);
      require('http');
      assert.strictEqual(plugins.length, 3);
    });
  });
});

describe('mergePlugins', () => {
  const defaultPlugins = {
    module1: {
      enabled: true,
      path: 'testpath',
    },
    module2: {
      enabled: true,
      path: 'testpath2',
    },
    module3: {
      enabled: true,
      path: 'testpath3',
    },
  };

  const userPlugins = {
    module2: {
      path: 'userpath',
    },
    module3: {
      enabled: false,
    },
    nonDefaultModule: {
      path: 'userpath2',
    },
  };

  const nodePluginManager = new NodePluginManager();

  const mergedPlugins = nodePluginManager['_mergePlugins'](
    defaultPlugins,
    userPlugins
  );

  it('should merge user and default configs', () => {
    assert.equal(mergedPlugins.module1.enabled, true);
    assert.equal(mergedPlugins.module1.path, 'testpath');
    assert.equal(mergedPlugins.module2.enabled, true);
    assert.equal(mergedPlugins.module2.path, 'userpath');
    assert.equal(mergedPlugins.module3.enabled, false);
    assert.equal(mergedPlugins.nonDefaultModule.enabled, true);
    assert.equal(mergedPlugins.nonDefaultModule.path, 'userpath2');
  });

  it('should should not mangle default config', () => {
    assert.equal(defaultPlugins.module2.path, 'testpath2');
    assert.equal(defaultPlugins.module3.enabled, true);
    assert.equal(defaultPlugins.module3.path, 'testpath3');
  });
});
