/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { ObservableInstrument } from '../../src/Instruments';
import { ObservableRegistry } from '../../src/state/ObservableRegistry';
import { defaultInstrumentDescriptor } from '../util';

describe('ObservableRegistry', () => {
  const callback1 = () => {};
  const callback2 = () => {};
  let observableRegistry: ObservableRegistry;
  let instrument1: ObservableInstrument;
  let instrument2: ObservableInstrument;

  beforeEach(() => {
    observableRegistry = new ObservableRegistry();
    instrument1 = new ObservableInstrument(
      defaultInstrumentDescriptor,
      [],
      observableRegistry
    );
    instrument2 = new ObservableInstrument(
      defaultInstrumentDescriptor,
      [],
      observableRegistry
    );
  });

  describe('addCallback', () => {
    it('should add multiple callbacks for one instrument', () => {
      observableRegistry.addCallback(callback1, instrument1);
      observableRegistry.addCallback(callback2, instrument1);

      assert.strictEqual(observableRegistry['_callbacks'].length, 2);
      assert.strictEqual(
        observableRegistry['_callbacks'][0].callback,
        callback1
      );
      assert.strictEqual(
        observableRegistry['_callbacks'][0].instrument,
        instrument1
      );

      assert.strictEqual(
        observableRegistry['_callbacks'][1].callback,
        callback2
      );
      assert.strictEqual(
        observableRegistry['_callbacks'][1].instrument,
        instrument1
      );
    });

    it('should not add duplicated callbacks', () => {
      observableRegistry.addCallback(callback1, instrument1);
      observableRegistry.addCallback(callback1, instrument1);

      assert.strictEqual(observableRegistry['_callbacks'].length, 1);
      assert.strictEqual(
        observableRegistry['_callbacks'][0].callback,
        callback1
      );
      assert.strictEqual(
        observableRegistry['_callbacks'][0].instrument,
        instrument1
      );
    });
  });

  describe('removeCallback', () => {
    it('should remove callback with instrument', () => {
      observableRegistry.addCallback(callback1, instrument1);
      observableRegistry.addCallback(callback2, instrument1);
      observableRegistry.addCallback(callback1, instrument2);
      observableRegistry.addCallback(callback2, instrument2);
      assert.strictEqual(observableRegistry['_callbacks'].length, 4);

      // remove (callback1, instrument1)
      observableRegistry.removeCallback(callback1, instrument1);
      observableRegistry.removeCallback(callback1, instrument1);
      assert.strictEqual(observableRegistry['_callbacks'].length, 3);
    });
  });

  describe('addBatchCallback', () => {
    it('should add callback with associated instruments', () => {
      observableRegistry.addBatchCallback(callback1, [instrument1]);
      observableRegistry.addBatchCallback(callback2, [instrument1]);

      // duplicated pairs.
      observableRegistry.addBatchCallback(callback1, [
        instrument1,
        instrument2,
      ]);
      observableRegistry.addBatchCallback(callback1, [
        instrument1,
        instrument2,
      ]);

      assert.strictEqual(observableRegistry['_batchCallbacks'].length, 3);
    });

    it('should ignore callback without associated instruments', () => {
      observableRegistry.addBatchCallback(callback1, []);
      // eslint-disable-next-line no-sparse-arrays
      observableRegistry.addBatchCallback(callback1, [
        1 /* hole */,
        ,
        undefined,
        2,
      ] as unknown as ObservableInstrument[]);

      assert.strictEqual(observableRegistry['_batchCallbacks'].length, 0);
    });
  });

  describe('removeBatchCallback', () => {
    it('should remove callback with associated instruments', () => {
      observableRegistry.addBatchCallback(callback1, [instrument1]);
      observableRegistry.addBatchCallback(callback2, [instrument1]);
      observableRegistry.addBatchCallback(callback1, [
        instrument1,
        instrument2,
      ]);
      assert.strictEqual(observableRegistry['_batchCallbacks'].length, 3);

      observableRegistry.removeBatchCallback(callback1, [instrument1]);
      assert.strictEqual(observableRegistry['_batchCallbacks'].length, 2);

      // remove twice
      observableRegistry.removeBatchCallback(callback1, [
        instrument1,
        instrument2,
      ]);
      observableRegistry.removeBatchCallback(callback1, [
        instrument1,
        instrument2,
      ]);
      assert.strictEqual(observableRegistry['_batchCallbacks'].length, 1);
    });
  });
});
