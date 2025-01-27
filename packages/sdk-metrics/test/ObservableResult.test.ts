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

import { ValueType } from '@opentelemetry/api';
import * as assert from 'assert';
import { InstrumentType } from '../src';
import { ObservableInstrument } from '../src/Instruments';
import {
  BatchObservableResultImpl,
  ObservableResultImpl,
} from '../src/ObservableResult';
import { ObservableRegistry } from '../src/state/ObservableRegistry';
import {
  commonAttributes,
  commonValues,
  defaultInstrumentDescriptor,
} from './util';

describe('ObservableResultImpl', () => {
  describe('observe', () => {
    it('should observe common values', () => {
      const observableResult = new ObservableResultImpl(
        'instrument_name',
        ValueType.DOUBLE
      );
      for (const value of commonValues) {
        for (const attributes of commonAttributes) {
          observableResult.observe(value, attributes);
        }
      }
    });

    it('should deduplicate observations', () => {
      const observableResult = new ObservableResultImpl(
        'instrument_name',
        ValueType.DOUBLE
      );
      observableResult.observe(1, {});
      observableResult.observe(2, {});

      assert.strictEqual(observableResult._buffer.size, 1);
      assert.ok(observableResult._buffer.has({}));
      assert.strictEqual(observableResult._buffer.get({}), 2);
    });

    it('should trunc value if ValueType is INT', () => {
      const observableResult = new ObservableResultImpl(
        'instrument_name',
        ValueType.INT
      );
      observableResult.observe(1.1, {});
      // should ignore non-finite/non-number values.
      observableResult.observe(Infinity, {});
      observableResult.observe(-Infinity, {});
      observableResult.observe(NaN, {});

      assert.strictEqual(observableResult._buffer.get({}), 1);
    });

    it('should ignore non-number values', () => {
      const observableResult = new ObservableResultImpl('test', ValueType.INT);
      observableResult.observe('1' as any, {});

      assert.strictEqual(observableResult._buffer.get({}), undefined);
    });
  });
});

describe('BatchObservableResultImpl', () => {
  describe('observe', () => {
    it('should observe common values', () => {
      const observableResult = new BatchObservableResultImpl();
      const observable = new ObservableInstrument(
        defaultInstrumentDescriptor,
        [],
        new ObservableRegistry()
      );
      for (const value of commonValues) {
        for (const attributes of commonAttributes) {
          observableResult.observe(observable, value, attributes);
        }
      }
    });

    it('should deduplicate observations', () => {
      const observableResult = new BatchObservableResultImpl();
      const observableRegistry = new ObservableRegistry();
      const observable1 = new ObservableInstrument(
        defaultInstrumentDescriptor,
        [],
        observableRegistry
      );
      const observable2 = new ObservableInstrument(
        defaultInstrumentDescriptor,
        [],
        observableRegistry
      );
      observableResult.observe(observable1, 1, {});
      observableResult.observe(observable1, 2, {});
      observableResult.observe(observable2, 4, {});

      assert.strictEqual(observableResult._buffer.size, 2);
      assert.ok(observableResult._buffer.has(observable1));
      assert.ok(observableResult._buffer.has(observable2));

      const observable1Buffer = observableResult._buffer.get(observable1);
      const observable2Buffer = observableResult._buffer.get(observable2);
      assert.strictEqual(observable1Buffer?.get({}), 2);
      assert.strictEqual(observable2Buffer?.get({}), 4);
    });

    it('should trunc value if ValueType is INT', () => {
      const observableResult = new BatchObservableResultImpl();
      const observable = new ObservableInstrument(
        {
          name: 'test',
          description: '',
          type: InstrumentType.COUNTER,
          unit: '',
          valueType: ValueType.INT,
          advice: {},
        },
        [],
        new ObservableRegistry()
      );

      observableResult.observe(observable, 1.1, {});
      // should ignore non-finite/non-number values.
      observableResult.observe(observable, Infinity, {});
      observableResult.observe(observable, -Infinity, {});
      observableResult.observe(observable, NaN, {});
      assert.strictEqual(observableResult._buffer.get(observable)?.get({}), 1);
    });

    it('should ignore invalid values', () => {
      const observableResult = new BatchObservableResultImpl();
      const observable = new ObservableInstrument(
        {
          name: 'test',
          description: '',
          type: InstrumentType.COUNTER,
          unit: '',
          valueType: ValueType.INT,
          advice: {},
        },
        [],
        new ObservableRegistry()
      );

      observableResult.observe(observable, '1' as any, {});
      observableResult.observe(/** invalid observable */ {} as any, 1, {});
      assert.strictEqual(
        observableResult._buffer.get(observable)!.get({}),
        undefined
      );
      assert.strictEqual(observableResult._buffer.size, 1);
    });
  });
});
