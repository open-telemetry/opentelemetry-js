/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import {
  createAllowListAttributesProcessor,
  createNoopAttributesProcessor,
} from '../../src/view/AttributesProcessor';
import { InstrumentType, AggregationType } from '../../src';
import { DEFAULT_AGGREGATION } from '../../src/view/Aggregation';
import { View } from '../../src/view/View';

describe('View', () => {
  describe('constructor', () => {
    it('should construct default view with no view arguments provided', () => {
      {
        const view = new View({ instrumentName: '*' });
        assert.strictEqual(view.name, undefined);
        assert.strictEqual(view.description, undefined);
        assert.strictEqual(view.aggregation, DEFAULT_AGGREGATION);
        assert.strictEqual(
          view.attributesProcessor,
          createNoopAttributesProcessor()
        );
      }
      {
        const view = new View({ meterName: '*' });
        assert.strictEqual(view.name, undefined);
        assert.strictEqual(view.description, undefined);
        assert.strictEqual(view.aggregation, DEFAULT_AGGREGATION);
        assert.strictEqual(
          view.attributesProcessor,
          createNoopAttributesProcessor()
        );
      }
    });

    it('without at least one selector option should throw', () => {
      // would do nothing
      assert.throws(() => new View({}));
      // would implicitly rename all instruments to 'name'
      assert.throws(() => new View({ name: 'name' }));
      // would implicitly drop all attribute keys on all instruments except 'key'
      assert.throws(
        () =>
          new View({
            attributesProcessors: [createAllowListAttributesProcessor(['key'])],
          })
      );
      // would implicitly rename all instruments to description
      assert.throws(() => new View({ description: 'description' }));
      // would implicitly change all instruments to use histogram aggregation
      assert.throws(
        () =>
          new View({
            aggregation: {
              type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
              options: { boundaries: [1, 100] },
            },
          })
      );
    });

    it('with named view and no instrument selector should throw', () => {
      assert.throws(
        () =>
          new View({
            name: 'named-view',
          })
      );
    });

    it('with named view and instrument wildcard should throw', () => {
      // Throws with wildcard character only.
      assert.throws(
        () =>
          new View({
            name: 'renamed-instrument',
            instrumentName: '*',
          })
      );

      // Throws with wildcard character in instrument name.
      assert.throws(
        () =>
          new View({
            name: 'renamed-instrument',
            instrumentName: 'instrument.name.*',
          })
      );
    });

    it('with named view and instrument type selector should throw', () => {
      assert.throws(
        () =>
          new View({
            name: 'renamed-instrument',
            instrumentType: InstrumentType.COUNTER,
          })
      );
    });
  });
});
