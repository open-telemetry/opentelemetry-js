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
import { diag, ValueType } from '@opentelemetry/api';
import { MetricStorage } from '../../src/state/MetricStorage';
import { HrTime } from '@opentelemetry/api';
import { MetricCollectorHandle } from '../../src/state/MetricCollector';
import { MetricData, InstrumentType } from '../../src';
import { Maybe } from '../../src/utils';
import * as assert from 'assert';
import * as sinon from 'sinon';
import {
  getDescriptionResolutionRecipe,
  getTypeConflictResolutionRecipe,
  getUnitConflictResolutionRecipe,
  getValueTypeConflictResolutionRecipe,
} from '../../src/view/RegistrationConflicts';
import { InstrumentDescriptor } from '../../src/InstrumentDescriptor';

class TestMetricStorage extends MetricStorage {
  collect(
    collector: MetricCollectorHandle,
    collectionTime: HrTime
  ): Maybe<MetricData> {
    return undefined;
  }
}

describe('MetricStorageRegistry', () => {
  let spyLoggerWarn: sinon.SinonStub<
    [message: string, ...args: unknown[]],
    void
  >;

  beforeEach(() => {
    spyLoggerWarn = sinon.stub(diag, 'warn');
  });

  afterEach(() => {
    sinon.restore();
  });

  const collectorHandle: MetricCollectorHandle = {
    selectAggregationTemporality: () => {
      throw new Error('should not be invoked');
    },
    selectCardinalityLimit: () => {
      throw new Error('should not be invoked');
    },
  };
  const collectorHandle2: MetricCollectorHandle = {
    selectAggregationTemporality: () => {
      throw new Error('should not be invoked');
    },
    selectCardinalityLimit: () => {
      throw new Error('should not be invoked');
    },
  };

  describe('register', () => {
    it('should register MetricStorage', () => {
      const registry = new MetricStorageRegistry();
      const storage = new TestMetricStorage({
        name: 'instrument',
        type: InstrumentType.COUNTER,
        description: 'description',
        unit: '1',
        valueType: ValueType.DOUBLE,
        advice: {},
      });

      registry.register(storage);
      const registeredStorages = registry.getStorages(collectorHandle);

      // registered the storage.
      assert.deepStrictEqual([storage], registeredStorages);
    });
  });

  describe('registerForCollector', () => {
    it('should register MetricStorage for each collector', () => {
      const registry = new MetricStorageRegistry();
      const storage = new TestMetricStorage({
        name: 'instrument',
        type: InstrumentType.COUNTER,
        description: 'description',
        unit: '1',
        valueType: ValueType.DOUBLE,
        advice: {},
      });
      const storage2 = new TestMetricStorage({
        name: 'instrument2',
        type: InstrumentType.COUNTER,
        description: 'description',
        unit: '1',
        valueType: ValueType.DOUBLE,
        advice: {},
      });

      registry.registerForCollector(collectorHandle, storage);
      registry.registerForCollector(collectorHandle2, storage);
      registry.registerForCollector(collectorHandle2, storage2);

      assert.deepStrictEqual(registry.getStorages(collectorHandle), [storage]);
      assert.deepStrictEqual(registry.getStorages(collectorHandle2), [
        storage,
        storage2,
      ]);
    });
  });

  describe('findOrUpdateCompatibleStorage', () => {
    function testConflictingRegistration(
      existingDescriptor: InstrumentDescriptor,
      otherDescriptor: InstrumentDescriptor,
      expectedLog: string
    ) {
      const registry = new MetricStorageRegistry();

      const storage = new TestMetricStorage(existingDescriptor);
      const otherStorage = new TestMetricStorage(otherDescriptor);

      assert.strictEqual(
        registry.findOrUpdateCompatibleStorage(existingDescriptor),
        null
      );
      registry.register(storage);
      assertLogNotCalled();

      assert.strictEqual(
        registry.findOrUpdateCompatibleStorage(otherDescriptor),
        null
      );
      // warned
      assertLogCalledOnce();
      assertFirstLogContains(expectedLog);
      registry.register(otherStorage);

      // registered both storages
      const registeredStorages = registry.getStorages(collectorHandle);
      assert.deepStrictEqual([storage, otherStorage], registeredStorages);
    }

    it('warn when instrument with same name and different type is already registered', () => {
      const existingDescriptor = {
        name: 'instrument',
        type: InstrumentType.COUNTER,
        description: 'description',
        unit: '1',
        valueType: ValueType.DOUBLE,
        advice: {},
      };

      const otherDescriptor = {
        name: 'instrument',
        type: InstrumentType.UP_DOWN_COUNTER,
        description: 'description',
        unit: '1',
        valueType: ValueType.DOUBLE,
        advice: {},
      };

      testConflictingRegistration(
        existingDescriptor,
        otherDescriptor,
        getTypeConflictResolutionRecipe(existingDescriptor, otherDescriptor)
      );
    });

    it('warn when instrument with same name and different value type is already registered', () => {
      const existingDescriptor = {
        name: 'instrument',
        type: InstrumentType.COUNTER,
        description: 'description',
        unit: '1',
        valueType: ValueType.DOUBLE,
        advice: {},
      };

      const otherDescriptor = {
        name: 'instrument',
        type: InstrumentType.COUNTER,
        description: 'description',
        unit: '1',
        valueType: ValueType.INT,
        advice: {},
      };

      testConflictingRegistration(
        existingDescriptor,
        otherDescriptor,
        getValueTypeConflictResolutionRecipe(
          existingDescriptor,
          otherDescriptor
        )
      );
    });

    it('warn when instrument with same name and different unit is already registered', () => {
      const existingDescriptor = {
        name: 'instrument',
        type: InstrumentType.COUNTER,
        description: 'description',
        unit: '1',
        valueType: ValueType.DOUBLE,
        advice: {},
      };

      const otherDescriptor = {
        name: 'instrument',
        type: InstrumentType.COUNTER,
        description: 'description',
        unit: 'ms',
        valueType: ValueType.DOUBLE,
        advice: {},
      };

      testConflictingRegistration(
        existingDescriptor,
        otherDescriptor,
        getUnitConflictResolutionRecipe(existingDescriptor, otherDescriptor)
      );
    });

    it('warn when instrument with same name and different description is already registered', () => {
      const existingDescriptor = {
        name: 'instrument',
        type: InstrumentType.COUNTER,
        description: 'description',
        unit: '1',
        valueType: ValueType.DOUBLE,
        advice: {},
      };

      const otherDescriptor = {
        name: 'instrument',
        type: InstrumentType.COUNTER,
        description: 'longer description',
        unit: '1',
        valueType: ValueType.DOUBLE,
        advice: {},
      };

      const registry = new MetricStorageRegistry();

      const storage = new TestMetricStorage(existingDescriptor);
      const otherStorage = new TestMetricStorage(otherDescriptor);

      // register the first storage.
      assert.strictEqual(
        registry.findOrUpdateCompatibleStorage(existingDescriptor),
        null
      );
      registry.register(storage);
      // register the second storage.
      assert.strictEqual(
        registry.findOrUpdateCompatibleStorage(otherDescriptor),
        storage
      );
      // original storage now has the updated (longer) description.
      assert.strictEqual(
        otherStorage.getInstrumentDescriptor().description,
        otherDescriptor.description
      );

      // log called exactly once
      assertLogCalledOnce();
      // added resolution recipe to the log
      assertFirstLogContains(
        getDescriptionResolutionRecipe(existingDescriptor, otherDescriptor)
      );
    });

    it('should return the existing instrument if a compatible async instrument is already registered', () => {
      const registry = new MetricStorageRegistry();
      const descriptor = {
        name: 'instrument',
        type: InstrumentType.OBSERVABLE_COUNTER,
        description: 'description',
        unit: '1',
        valueType: ValueType.DOUBLE,
        advice: {},
      };

      const storage = new TestMetricStorage(descriptor);

      registry.register(storage);
      assert.strictEqual(
        registry.findOrUpdateCompatibleStorage(descriptor),
        storage
      );
    });

    it('should return the existing instrument if a compatible sync instrument is already registered', () => {
      const registry = new MetricStorageRegistry();
      const descriptor = {
        name: 'instrument',
        type: InstrumentType.COUNTER,
        description: 'description',
        unit: '1',
        valueType: ValueType.DOUBLE,
        advice: {},
      };

      const storage = new TestMetricStorage(descriptor);

      registry.register(storage);
      assert.strictEqual(
        registry.findOrUpdateCompatibleStorage(descriptor),
        storage
      );
    });

    function assertLogNotCalled() {
      assert.strictEqual(spyLoggerWarn.args.length, 0);
    }

    function assertLogCalledOnce() {
      assert.strictEqual(spyLoggerWarn.args.length, 1);
    }

    function assertFirstLogContains(expectedString: string) {
      assert.ok(
        spyLoggerWarn.args[0].includes(expectedString),
        'Logs did not include: ' + expectedString
      );
    }
  });

  describe('findOrUpdateCompatibleCollectorStorage', () => {
    it('register conflicting metric storages for collector', () => {
      const existingDescriptor = {
        name: 'instrument',
        type: InstrumentType.COUNTER,
        description: 'description',
        unit: '1',
        valueType: ValueType.DOUBLE,
        advice: {},
      };

      const otherDescriptor = {
        name: 'instrument',
        type: InstrumentType.UP_DOWN_COUNTER,
        description: 'description',
        unit: '1',
        valueType: ValueType.DOUBLE,
        advice: {},
      };

      const registry = new MetricStorageRegistry();

      const storage = new TestMetricStorage(existingDescriptor);
      const otherStorage = new TestMetricStorage(otherDescriptor);

      assert.strictEqual(
        registry.findOrUpdateCompatibleCollectorStorage(
          collectorHandle,
          existingDescriptor
        ),
        null
      );
      registry.registerForCollector(collectorHandle, storage);

      // Should not return an existing metric storage.
      assert.strictEqual(
        registry.findOrUpdateCompatibleCollectorStorage(
          collectorHandle,
          otherDescriptor
        ),
        null
      );
      registry.registerForCollector(collectorHandle, otherStorage);

      // registered both storages
      const registeredStorages = registry.getStorages(collectorHandle);
      assert.deepStrictEqual([storage, otherStorage], registeredStorages);
    });

    it('register the same metric storage for each collector', () => {
      const descriptor = {
        name: 'instrument',
        type: InstrumentType.COUNTER,
        description: 'description',
        unit: '1',
        valueType: ValueType.DOUBLE,
        advice: {},
      };
      const registry = new MetricStorageRegistry();

      const storage = new TestMetricStorage(descriptor);

      assert.strictEqual(
        registry.findOrUpdateCompatibleCollectorStorage(
          collectorHandle,
          descriptor
        ),
        null
      );
      registry.registerForCollector(collectorHandle, storage);

      assert.strictEqual(
        registry.findOrUpdateCompatibleCollectorStorage(
          collectorHandle2,
          descriptor
        ),
        null
      );
      registry.registerForCollector(collectorHandle2, storage);

      // registered the storage for each collector
      assert.deepStrictEqual(registry.getStorages(collectorHandle), [storage]);
      assert.strictEqual(
        registry.findOrUpdateCompatibleCollectorStorage(
          collectorHandle,
          descriptor
        ),
        storage
      );

      assert.deepStrictEqual(registry.getStorages(collectorHandle2), [storage]);
      assert.strictEqual(
        registry.findOrUpdateCompatibleCollectorStorage(
          collectorHandle2,
          descriptor
        ),
        storage
      );
    });
  });
});
