/*!
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

import { NoopLogger } from '@opentelemetry/core';
import * as assert from 'assert';
import { BasicMeterRegistry, Meter } from '../src';

describe('BasicMeterRegistry', () => {
  describe('constructor', () => {
    it('should construct an instance without any options', () => {
      const registry = new BasicMeterRegistry();
      assert.ok(registry instanceof BasicMeterRegistry);
    });

    it('should construct an instance with logger', () => {
      const registry = new BasicMeterRegistry({
        logger: new NoopLogger(),
      });
      assert.ok(registry instanceof BasicMeterRegistry);
    });
  });

  describe('getMeter', () => {
    it('should return an instance of Meter', () => {
      const meter = new BasicMeterRegistry().getMeter();
      assert.ok(meter instanceof Meter);
    });

    it('should return the meter with default name and version without any options', () => {
      const registry = new BasicMeterRegistry();
      const meter1 = registry.getMeter();
      const meter2 = registry.getMeter('default', '*');
      assert.deepEqual(meter1, meter2);
    });

    it('should return the same Meter instance with same name & version', () => {
      const registry = new BasicMeterRegistry();
      const meter1 = registry.getMeter('meter1', 'ver1');
      const meter2 = registry.getMeter('meter1', 'ver1');
      assert.deepEqual(meter1, meter2);
    });

    it('should return different Meter instance with different name or version', () => {
      const registry = new BasicMeterRegistry();

      const meter1 = registry.getMeter('meter1', 'ver1');
      const meter2 = registry.getMeter('meter1');
      assert.notEqual(meter1, meter2);

      const meter3 = registry.getMeter('meter2', 'ver2');
      const meter4 = registry.getMeter('meter3', 'ver2');
      assert.notEqual(meter3, meter4);
    });
  });
});
