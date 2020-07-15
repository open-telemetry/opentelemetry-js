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
import { PushController, MeterProvider } from '../../../src';

describe('PushController', () => {
  describe('constructor', () => {
    it('should construct an instance with a meter provider', () => {
      const controller = new PushController(new MeterProvider());
      assert.ok(controller instanceof PushController);
    });
  });

  describe('shutdown', () => {
    it('should shutdown without errors', () => {
      const controller = new PushController(new MeterProvider());
      controller.shutdown();
    });
  });

  describe('collect', () => {
    let clock: sinon.SinonFakeTimers;
    beforeEach(() => {
      clock = sinon.useFakeTimers();
    });
    afterEach(() => {
      clock.restore();
    });
    it('should collect on tick', () => {
      const meterProvider = new MeterProvider();
      const stub = sinon.stub(meterProvider, 'collect');

      const controller = new PushController(meterProvider, { interval: 1000 });
      clock.tick(1000);
      assert.strictEqual(stub.callCount, 1);

      clock.tick(2000);
      assert.strictEqual(stub.callCount, 3);

      controller.shutdown();
    });
  });
});
