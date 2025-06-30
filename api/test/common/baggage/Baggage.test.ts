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
import {
  context,
  ROOT_CONTEXT,
  propagation,
  baggageEntryMetadataFromString,
} from '../../../src';

describe('Baggage', function () {
  describe('create', function () {
    it('should create an empty bag', function () {
      const bag = propagation.createBaggage();

      assert.deepStrictEqual(bag.getAllEntries(), []);
    });

    it('should create a bag with entries', function () {
      const meta = baggageEntryMetadataFromString('opaque string');
      const bag = propagation.createBaggage({
        key1: { value: 'value1' },
        key2: { value: 'value2', metadata: meta },
      });

      assert.deepStrictEqual(bag.getAllEntries(), [
        ['key1', { value: 'value1' }],
        ['key2', { value: 'value2', metadata: meta }],
      ]);
    });
  });

  describe('get', function () {
    it('should not allow modification of returned entries', function () {
      const bag = propagation
        .createBaggage()
        .setEntry('key', { value: 'value' });

      const entry = bag.getEntry('key');
      assert.ok(entry);
      if (entry) {
        entry.value = 'mutated';
      }

      assert.strictEqual(bag.getEntry('key')?.value, 'value');
    });
  });

  describe('set', function () {
    it('should create a new bag when an entry is added', function () {
      const bag = propagation.createBaggage();

      const bag2 = bag.setEntry('key', { value: 'value' });

      assert.notStrictEqual(bag, bag2);
      assert.deepStrictEqual(bag.getAllEntries(), []);
      assert.deepStrictEqual(bag2.getAllEntries(), [
        ['key', { value: 'value' }],
      ]);
    });
  });

  describe('remove', function () {
    it('should create a new bag when an entry is removed', function () {
      const bag = propagation.createBaggage({
        key: { value: 'value' },
      });

      const bag2 = bag.removeEntry('key');

      assert.deepStrictEqual(bag.getAllEntries(), [
        ['key', { value: 'value' }],
      ]);

      assert.deepStrictEqual(bag2.getAllEntries(), []);
    });

    it('should create an empty bag multiple keys are removed', function () {
      const bag = propagation.createBaggage({
        key: { value: 'value' },
        key1: { value: 'value1' },
        key2: { value: 'value2' },
      });

      const bag2 = bag.removeEntries('key', 'key1');

      assert.deepStrictEqual(bag.getAllEntries(), [
        ['key', { value: 'value' }],
        ['key1', { value: 'value1' }],
        ['key2', { value: 'value2' }],
      ]);

      assert.deepStrictEqual(bag2.getAllEntries(), [
        ['key2', { value: 'value2' }],
      ]);
    });

    it('should create an empty bag when it cleared', function () {
      const bag = propagation.createBaggage({
        key: { value: 'value' },
        key1: { value: 'value1' },
      });

      const bag2 = bag.clear();

      assert.deepStrictEqual(bag.getAllEntries(), [
        ['key', { value: 'value' }],
        ['key1', { value: 'value1' }],
      ]);

      assert.deepStrictEqual(bag2.getAllEntries(), []);
    });
  });

  describe('context', function () {
    it('should set and get a baggage from a context', function () {
      const bag = propagation.createBaggage();

      const ctx = propagation.setBaggage(ROOT_CONTEXT, bag);

      assert.strictEqual(bag, propagation.getBaggage(ctx));
    });

    it('should get the current baggage', function () {
      const entries = {
        banana: { value: 'boats' },
      };
      const bag = propagation.createBaggage(entries);
      const ctx = propagation.setBaggage(ROOT_CONTEXT, bag);

      context.setGlobalContextManager({
        active: () => ctx,
        disable: () => {},
      } as any);

      assert.strictEqual(bag, propagation.getActiveBaggage());

      context.disable();
    });
  });

  describe('metadata', function () {
    it('should create an opaque object which returns the string unchanged', function () {
      const meta = baggageEntryMetadataFromString('this is a string');

      assert.strictEqual(meta.toString(), 'this is a string');
    });

    it('should return an empty string if input is invalid', function () {
      //@ts-expect-error only accepts string values
      const meta = baggageEntryMetadataFromString(1);

      assert.strictEqual(meta.toString(), '');
    });

    it('should retain metadata', function () {
      const bag = propagation.createBaggage({
        key: {
          value: 'value',
          metadata: baggageEntryMetadataFromString('meta'),
        },
      });

      assert.deepStrictEqual(bag.getEntry('key')?.metadata?.toString(), 'meta');
    });
  });
});
