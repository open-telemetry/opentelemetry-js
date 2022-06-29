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
import { ValueType } from '@opentelemetry/api-metrics';
import { MetricStorage } from '../../src/state/MetricStorage';
import { HrTime } from '@opentelemetry/api';
import { MetricCollectorHandle } from '../../src/state/MetricCollector';
import { MetricData, InstrumentDescriptor, InstrumentType } from '../../src';
import { Maybe } from '../../src/utils';
import * as api from '@opentelemetry/api';
import * as assert from 'assert';
import * as sinon from 'sinon';
import {
  getDescriptionResolutionRecipe,
  getTypeConflictResolutionRecipe, getUnitConflictResolutionRecipe,
  getValueTypeConflictResolutionRecipe
} from '../../src/view/RegistrationConflicts';

class TestMetricStorage extends MetricStorage {
  collect(collector: MetricCollectorHandle,
    collectors: MetricCollectorHandle[],
    collectionTime: HrTime,
  ): Maybe<MetricData> {
    return undefined;
  }
}

describe('MetricStorageRegistry', () => {
  let spyLoggerWarn: sinon.SinonStub<[message: string, ...args: unknown[]], void>;

  beforeEach(() => {
    spyLoggerWarn = sinon.stub(api.diag, 'warn');
  });

  afterEach(() => {
    sinon.restore();
  });

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
      const registeredStorages = registry.getStorages();

      // returned the same storage
      assert.strictEqual(registeredStorage, storage);
      // registered the actual storage
      assert.deepStrictEqual([storage], registeredStorages);
      // no warning logs written
      assert.strictEqual(spyLoggerWarn.args.length, 0);
    });

    function testConflictingRegistration(existingDescriptor: InstrumentDescriptor,
      otherDescriptor: InstrumentDescriptor,
      expectedLog: string) {
      const registry = new MetricStorageRegistry();

      const storage = new TestMetricStorage(existingDescriptor);
      const otherStorage = new TestMetricStorage(otherDescriptor);

      assert.strictEqual(registry.register(storage), storage);
      assert.strictEqual(registry.register(otherStorage), otherStorage);
      const registeredStorages = registry.getStorages();

      // registered both storages
      assert.deepStrictEqual([storage, otherStorage], registeredStorages);
      // warned
      assertLogCalledOnce();
      assertFirstLogContains(expectedLog);
    }

    it('warn when instrument with same name and different type is already registered', () => {
      const existingDescriptor = {
        name: 'instrument',
        type: InstrumentType.COUNTER,
        description: 'description',
        unit: '1',
        valueType: ValueType.DOUBLE
      };

      const otherDescriptor = {
        name: 'instrument',
        type: InstrumentType.UP_DOWN_COUNTER,
        description: 'description',
        unit: '1',
        valueType: ValueType.DOUBLE
      };

      testConflictingRegistration(existingDescriptor,
        otherDescriptor,
        getTypeConflictResolutionRecipe(existingDescriptor, otherDescriptor));
    });

    it('warn when instrument with same name and different value type is already registered', () => {
      const existingDescriptor = {
        name: 'instrument',
        type: InstrumentType.COUNTER,
        description: 'description',
        unit: '1',
        valueType: ValueType.DOUBLE
      };

      const otherDescriptor = {
        name: 'instrument',
        type: InstrumentType.COUNTER,
        description: 'description',
        unit: '1',
        valueType: ValueType.INT
      };

      testConflictingRegistration(existingDescriptor,
        otherDescriptor,
        getValueTypeConflictResolutionRecipe(existingDescriptor, otherDescriptor));
    });

    it('warn when instrument with same name and different unit is already registered', () => {
      const existingDescriptor = {
        name: 'instrument',
        type: InstrumentType.COUNTER,
        description: 'description',
        unit: '1',
        valueType: ValueType.DOUBLE
      };

      const otherDescriptor = {
        name: 'instrument',
        type: InstrumentType.COUNTER,
        description: 'description',
        unit: 'ms',
        valueType: ValueType.DOUBLE
      };

      testConflictingRegistration(existingDescriptor,
        otherDescriptor,
        getUnitConflictResolutionRecipe(existingDescriptor, otherDescriptor));
    });

    it('warn when instrument with same name and different description is already registered', () => {
      const existingDescriptor = {
        name: 'instrument',
        type: InstrumentType.COUNTER,
        description: 'description',
        unit: '1',
        valueType: ValueType.DOUBLE
      };

      const otherDescriptor = {
        name: 'instrument',
        type: InstrumentType.COUNTER,
        description: 'longer description',
        unit: '1',
        valueType: ValueType.DOUBLE
      };

      const registry = new MetricStorageRegistry();

      const storage = new TestMetricStorage(existingDescriptor);
      const otherStorage = new TestMetricStorage(otherDescriptor);

      // returns the first registered storage.
      assert.strictEqual(registry.register(storage), storage);
      // returns the original storage
      assert.strictEqual(registry.register(otherStorage), storage);
      // original storage now has the updated (longer) description.
      assert.strictEqual(otherStorage.getInstrumentDescriptor().description, otherDescriptor.description);

      const registeredStorages = registry.getStorages();

      // only the original storage has been added
      assert.deepStrictEqual([storage], registeredStorages);
      // log called exactly once
      assertLogCalledOnce();
      // added resolution recipe to the log
      assertFirstLogContains(getDescriptionResolutionRecipe(existingDescriptor, otherDescriptor));
    });

    it('should return the existing instrument if a compatible async instrument is already registered', () => {
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

      assert.strictEqual(registry.register(storage), storage);
      assert.strictEqual(registry.register(otherStorage), storage);
      const registeredStorages = registry.getStorages();

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
      const registeredStorages = registry.getStorages();

      // returned undefined
      assert.strictEqual(previouslyRegisteredStorage, storage);
      // registered the actual storage, but not more than that.
      assert.deepStrictEqual([storage], registeredStorages);
    });

    function assertLogCalledOnce() {
      assert.strictEqual(spyLoggerWarn.args.length, 1);
    }

    function assertFirstLogContains(expectedString: string) {
      assert.ok(spyLoggerWarn.args[0].includes(expectedString), 'Logs did not include: ' + expectedString);
    }
  });
});
