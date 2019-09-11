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

import { NoopLogger, NoopTracer } from '@opentelemetry/core';
import * as assert from 'assert';
import * as path from 'path';
import {
  HookState,
  PluginLoader,
  searchPathForTest,
  Plugins,
} from '../../src/instrumentation/PluginLoader';

const INSTALLED_PLUGINS_PATH = path.join(__dirname, 'node_modules');

const simplePlugins: Plugins = {
  'simple-module': {
    enabled: true,
    path: '@opentelemetry/plugin-simple-module',
    ignoreMethods: [],
    ignoreUrls: [],
  },
};

const disablePlugins: Plugins = {
  'simple-module': {
    enabled: false,
    path: '@opentelemetry/plugin-simple-module',
  },
  nonexistent: {
    enabled: false,
    path: '@opentelemetry/plugin-nonexistent-module',
  },
};

const nonexistentPlugins: Plugins = {
  nonexistent: {
    enabled: true,
    path: '@opentelemetry/plugin-nonexistent-module',
  },
};

const missingPathPlugins: Plugins = {
  'simple-module': {
    enabled: true,
  },
  nonexistent: {
    enabled: true,
  },
};

const supportedVersionPlugins: Plugins = {
  'supported-module': {
    enabled: true,
    path: '@opentelemetry/plugin-supported-module',
  },
};

const notSupportedVersionPlugins: Plugins = {
  'notsupported-module': {
    enabled: true,
    path: 'notsupported-module',
  },
};

describe('PluginLoader', () => {
  const tracer = new NoopTracer();
  const logger = new NoopLogger();

  before(() => {
    module.paths.push(INSTALLED_PLUGINS_PATH);
    searchPathForTest(INSTALLED_PLUGINS_PATH);
  });

  afterEach(() => {
    // clear require cache
    Object.keys(require.cache).forEach(key => delete require.cache[key]);
  });

  describe('.state()', () => {
    it('returns UNINITIALIZED when first called', () => {
      const pluginLoader = new PluginLoader(tracer, logger);
      assert.strictEqual(pluginLoader['_hookState'], HookState.UNINITIALIZED);
    });

    it('transitions from UNINITIALIZED to ENABLED', () => {
      const pluginLoader = new PluginLoader(tracer, logger);
      pluginLoader.load(simplePlugins);
      assert.strictEqual(pluginLoader['_hookState'], HookState.ENABLED);
      pluginLoader.unload();
    });

    it('transitions from ENABLED to DISABLED', () => {
      const pluginLoader = new PluginLoader(tracer, logger);
      pluginLoader.load(simplePlugins).unload();
      assert.strictEqual(pluginLoader['_hookState'], HookState.DISABLED);
    });
  });

  describe('.load()', () => {
    it('sanity check', () => {
      // Ensure that module fixtures contain values that we expect.
      const simpleModule = require('simple-module');
      const simpleModule001 = require('supported-module');
      const simpleModule100 = require('notsupported-module');

      assert.strictEqual(simpleModule.name(), 'simple-module');
      assert.strictEqual(simpleModule001.name(), 'supported-module');
      assert.strictEqual(simpleModule100.name(), 'notsupported-module');

      assert.strictEqual(simpleModule.value(), 0);
      assert.strictEqual(simpleModule001.value(), 0);
      assert.strictEqual(simpleModule100.value(), 0);

      assert.throws(() => require('nonexistent-module'));
    });

    it('should load a plugin and patch the target modules', () => {
      const pluginLoader = new PluginLoader(tracer, logger);
      assert.strictEqual(pluginLoader['_plugins'].length, 0);
      pluginLoader.load(simplePlugins);
      // The hook is only called the first time the module is loaded.
      const simpleModule = require('simple-module');
      assert.strictEqual(pluginLoader['_plugins'].length, 1);
      assert.strictEqual(simpleModule.value(), 1);
      assert.strictEqual(simpleModule.name(), 'patched-simple-module');
      pluginLoader.unload();
    });
    // @TODO: simplify this test once we can load module with custom path
    it('should not load the plugin when supported versions does not match', () => {
      const pluginLoader = new PluginLoader(tracer, logger);
      assert.strictEqual(pluginLoader['_plugins'].length, 0);
      pluginLoader.load(notSupportedVersionPlugins);
      // The hook is only called the first time the module is loaded.
      require('notsupported-module');
      assert.strictEqual(pluginLoader['_plugins'].length, 0);
      pluginLoader.unload();
    });
    // @TODO: simplify this test once we can load module with custom path
    it('should load a plugin and patch the target modules when supported versions match', () => {
      const pluginLoader = new PluginLoader(tracer, logger);
      assert.strictEqual(pluginLoader['_plugins'].length, 0);
      pluginLoader.load(supportedVersionPlugins);
      // The hook is only called the first time the module is loaded.
      const simpleModule = require('supported-module');
      assert.strictEqual(pluginLoader['_plugins'].length, 1);
      assert.strictEqual(simpleModule.value(), 1);
      assert.strictEqual(simpleModule.name(), 'patched-supported-module');
      pluginLoader.unload();
    });

    it('should not load a plugin when value is false', () => {
      const pluginLoader = new PluginLoader(tracer, logger);
      assert.strictEqual(pluginLoader['_plugins'].length, 0);
      pluginLoader.load(disablePlugins);
      const simpleModule = require('simple-module');
      assert.strictEqual(pluginLoader['_plugins'].length, 0);
      assert.strictEqual(simpleModule.value(), 0);
      assert.strictEqual(simpleModule.name(), 'simple-module');
      pluginLoader.unload();
    });

    it('should not load a plugin when value is true but path is missing', () => {
      const pluginLoader = new PluginLoader(tracer, logger);
      assert.strictEqual(pluginLoader['_plugins'].length, 0);
      pluginLoader.load(missingPathPlugins);
      const simpleModule = require('simple-module');
      assert.strictEqual(pluginLoader['_plugins'].length, 0);
      assert.strictEqual(simpleModule.value(), 0);
      assert.strictEqual(simpleModule.name(), 'simple-module');
      pluginLoader.unload();
    });

    it('should not load a non existing plugin', () => {
      const pluginLoader = new PluginLoader(tracer, logger);
      assert.strictEqual(pluginLoader['_plugins'].length, 0);
      pluginLoader.load(nonexistentPlugins);
      assert.strictEqual(pluginLoader['_plugins'].length, 0);
      pluginLoader.unload();
    });

    it(`doesn't patch modules for which plugins aren't specified`, () => {
      const pluginLoader = new PluginLoader(tracer, logger);
      pluginLoader.load({});
      assert.strictEqual(require('simple-module').value(), 0);
      pluginLoader.unload();
    });
  });

  describe('.unload()', () => {
    it('should unload the plugins and unpatch the target module when unloads', () => {
      const pluginLoader = new PluginLoader(tracer, logger);
      assert.strictEqual(pluginLoader['_plugins'].length, 0);
      pluginLoader.load(simplePlugins);
      // The hook is only called the first time the module is loaded.
      const simpleModule = require('simple-module');
      assert.strictEqual(pluginLoader['_plugins'].length, 1);
      assert.strictEqual(simpleModule.value(), 1);
      assert.strictEqual(simpleModule.name(), 'patched-simple-module');
      pluginLoader.unload();
      assert.strictEqual(pluginLoader['_plugins'].length, 0);
      assert.strictEqual(simpleModule.name(), 'simple-module');
      assert.strictEqual(simpleModule.value(), 0);
    });
  });
});
