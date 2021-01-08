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

import { NOOP_METER_PROVIDER, NOOP_TRACER_PROVIDER } from '@opentelemetry/api';
import * as assert from 'assert';
import * as sinon from 'sinon';

import { registerInstrumentations } from '../../src';

import { OldClassPlugin } from '../../src/types_plugin_only';

class WebPlugin implements OldClassPlugin {
  moduleName = 'WebPlugin';
  enable() {}
  disable() {}
}

describe('autoLoader', () => {
  let sandbox: sinon.SinonSandbox;
  let unload: Function | undefined;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sandbox.restore();
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
      let webPlugin: WebPlugin;
      beforeEach(() => {
        webPlugin = new WebPlugin();
        enableSpy = sandbox.spy(webPlugin, 'enable');
        unload = registerInstrumentations({
          instrumentations: [webPlugin],
          tracerProvider,
          meterProvider,
        });
      });
      afterEach(() => {
        if (typeof unload === 'function') {
          unload();
          unload = undefined;
        }
      });

      it('should enable a required plugin', () => {
        assert.strictEqual(enableSpy.callCount, 1);
      });

      it('should set TracerProvider', () => {
        assert.ok(enableSpy.lastCall.args[1] === tracerProvider);
      });
    });
  });
});
