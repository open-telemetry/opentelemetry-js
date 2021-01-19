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

import { NOOP_TRACER_PROVIDER } from '@opentelemetry/api';
import { NOOP_METER_PROVIDER } from '@opentelemetry/api-metrics';
import * as assert from 'assert';
import * as path from 'path';
import * as sinon from 'sinon';
import { registerInstrumentations } from '../../src';
import {
  Plugins,
  searchPathForTest,
} from '../../src/platform/node/old/PluginLoader';

const INSTALLED_PLUGINS_PATH = path.join(__dirname, 'node_modules');

const httpPlugin: Plugins = {
  http: {
    enabled: true,
    path: '@opentelemetry/plugin-http-module',
    ignoreMethods: [],
    ignoreUrls: [],
  },
};

describe('autoLoader', () => {
  let sandbox: sinon.SinonSandbox;
  let unload: Function | undefined;
  before(() => {
    module.paths.push(INSTALLED_PLUGINS_PATH);
    searchPathForTest(INSTALLED_PLUGINS_PATH);
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sandbox.restore();
    Object.keys(require.cache).forEach(key => delete require.cache[key]);
    if (typeof unload === 'function') {
      unload();
      unload = undefined;
    }
  });

  describe('registerInstrumentations', () => {
    describe('Old Plugins', () => {
      let enableSpy: sinon.SinonSpy;
      const tracerProvider = NOOP_TRACER_PROVIDER;
      const meterProvider = NOOP_METER_PROVIDER;
      beforeEach(() => {
        // eslint-disable-next-line node/no-extraneous-require
        const simpleModule = require('@opentelemetry/plugin-simple-module')
          .plugin;
        enableSpy = sandbox.spy(simpleModule, 'enable');
        unload = registerInstrumentations({
          instrumentations: [
            {
              plugins: {
                ...httpPlugin,
                'simple-module': { enabled: true, plugin: simpleModule },
              },
            },
          ],
          tracerProvider,
          meterProvider,
        });
      });
      afterEach(() => {
        Object.keys(require.cache).forEach(key => delete require.cache[key]);
        if (typeof unload === 'function') {
          unload();
          unload = undefined;
        }
      });

      it('should enable a required plugin', () => {
        // eslint-disable-next-line node/no-extraneous-require
        const simpleModule = require('simple-module');
        assert.ok(simpleModule);
        assert.strictEqual(enableSpy.callCount, 1);
      });

      it('should set TracerProvider', () => {
        // eslint-disable-next-line node/no-extraneous-require
        const simpleModule = require('simple-module');
        assert.ok(simpleModule);
        assert.ok(enableSpy.lastCall.args[1] === tracerProvider);
      });
    });
  });
});
