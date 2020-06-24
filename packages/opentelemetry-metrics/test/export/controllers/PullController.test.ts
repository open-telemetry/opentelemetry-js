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
import { PullController, Meter, CounterMetric } from '../../../src';
import { NoopLogger } from '@opentelemetry/core';

describe('PullController', () => {
  describe('constructor', () => {
    it('should construct an instance without any options', () => {
      const controller = new PullController();
      assert.ok(controller instanceof PullController);
    });

    it('should construct an instance with logger', () => {
      const controller = new PullController({
        logger: new NoopLogger(),
      });
      assert.ok(controller instanceof PullController);
    });
  });

  describe('getMeter', () => {
    it('should return an instance of Meter', () => {
      const meter = new PullController().getMeter('test-pull-controller');
      assert.ok(meter instanceof Meter);
    });

    it('should propagate resources', () => {
      const controller = new PullController();
      const meter = controller.getMeter('test-meter-provider');
      const counter = meter.createCounter('test-counter') as CounterMetric;
      assert.strictEqual((meter as any)._resource, controller.resource);
      assert.strictEqual(counter.resource, controller.resource);
    });

    it('should return the meter with default version without a version option', () => {
      const controller = new PullController();
      const meter1 = controller.getMeter('default');
      const meter2 = controller.getMeter('default', '*');
      assert.deepEqual(meter1, meter2);
    });

    it('should return the same Meter instance with same name & version', () => {
      const controller = new PullController();
      const meter1 = controller.getMeter('meter1', 'ver1');
      const meter2 = controller.getMeter('meter1', 'ver1');
      assert.deepEqual(meter1, meter2);
    });

    it('should return different Meter instance with different name or version', () => {
      const controller = new PullController();

      const meter1 = controller.getMeter('meter1', 'ver1');
      const meter2 = controller.getMeter('meter1');
      assert.notEqual(meter1, meter2);

      const meter3 = controller.getMeter('meter2', 'ver2');
      const meter4 = controller.getMeter('meter3', 'ver2');
      assert.notEqual(meter3, meter4);
    });
  });
});
