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

import { MetricStorageRegistry } from '../../src/state/MetricStorageRegistry';
import { InstrumentType } from '../../src/Instruments';
import { ValueType } from '@opentelemetry/api-metrics-wip';
import { MetricStorage } from '../../src/state/MetricStorage';
import { HrTime } from '@opentelemetry/api';
import { InstrumentationLibrary } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { MetricData } from '../../src/export/MetricData';
import { MetricCollectorHandle } from '../../src/state/MetricCollector';
import { InstrumentDescriptor } from '../../src/InstrumentDescriptor';
import { Maybe } from '../../src/utils';
import * as assert from 'assert';


class TestMetricStorage implements MetricStorage {
  constructor(readonly _descriptor: InstrumentDescriptor) {
  }

  collect(collector: MetricCollectorHandle,
          collectors: MetricCollectorHandle[],
          resource: Resource,
          instrumentationLibrary: InstrumentationLibrary,
          sdkStartTime: HrTime,
          collectionTime: HrTime,
  ): Promise<Maybe<MetricData>> {
    return Promise.resolve(undefined);
  }

  getInstrumentDescriptor(): InstrumentDescriptor {
    return this._descriptor;
  }
}

describe('MetricStorageRegistry', () => {
  describe('register', () => {
    it('should register MetricStorage if it does not exist', () => {
      const registry = new MetricStorageRegistry();
      const storage = new TestMetricStorage({
        name: 'instrument',
        type: InstrumentType.COUNTER,
        description: 'description',
        unit: '1',
        valueType: ValueType.DOUBLE
      });

      const registeredStorage = registry.register(storage);
      const registeredStorages = Array.from(registry.getStorages());

      // returned the same storage
      assert.strictEqual(registeredStorage, storage);
      // registered the actual storage
      assert.deepStrictEqual([storage], registeredStorages);
    });

    it('should not register when incompatible instrument is already registered', () => {
      const registry = new MetricStorageRegistry();
      const storage = new TestMetricStorage({
        name: 'instrument',
        type: InstrumentType.COUNTER,
        description: 'description',
        unit: '1',
        valueType: ValueType.DOUBLE
      });

      const otherStorage = new TestMetricStorage({
        name: 'instrument',
        type: InstrumentType.UP_DOWN_COUNTER,
        description: 'description',
        unit: '1',
        valueType: ValueType.DOUBLE
      });

      registry.register(storage);
      const failedRegisteredStorage = registry.register(otherStorage);
      const registeredStorages = Array.from(registry.getStorages());

      // returned undefined
      assert.strictEqual(failedRegisteredStorage, undefined);
      // registered the actual storage, but not more than that.
      assert.deepStrictEqual([storage], registeredStorages);
    });

    it('should not register when compatible async instrument is already registered', () => {
      const registry = new MetricStorageRegistry();
      const descriptor = {
        name: 'instrument',
        type: InstrumentType.OBSERVABLE_COUNTER,
        description: 'description',
        unit: '1',
        valueType: ValueType.DOUBLE
      };

      const storage = new TestMetricStorage(descriptor);
      const otherStorage = new TestMetricStorage(descriptor);

      registry.register(storage);
      const failedRegisteredStorage = registry.register(otherStorage);
      const registeredStorages = Array.from(registry.getStorages());

      // returned undefined
      assert.strictEqual(failedRegisteredStorage, undefined);
      // registered the actual storage, but not more than that.
      assert.deepStrictEqual([storage], registeredStorages);
    });

    it('should return the existing instrument if a compatible sync instrument is already registered', () => {
      const registry = new MetricStorageRegistry();
      const descriptor = {
        name: 'instrument',
        type: InstrumentType.COUNTER,
        description: 'description',
        unit: '1',
        valueType: ValueType.DOUBLE
      };

      const storage = new TestMetricStorage(descriptor);
      const otherStorage = new TestMetricStorage(descriptor);

      registry.register(storage);
      const previouslyRegisteredStorage = registry.register(otherStorage);
      const registeredStorages = Array.from(registry.getStorages());

      // returned undefined
      assert.strictEqual(previouslyRegisteredStorage, storage);
      // registered the actual storage, but not more than that.
      assert.deepStrictEqual([storage], registeredStorages);
    });
  });
});
