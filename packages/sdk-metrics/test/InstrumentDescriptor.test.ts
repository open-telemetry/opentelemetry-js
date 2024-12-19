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
  createInstrumentDescriptor,
  InstrumentDescriptor,
  isValidName,
  isDescriptorCompatibleWith,
} from '../src/InstrumentDescriptor';
import { InstrumentType } from '../src';
import { invalidNames, validNames } from './util';
import { ValueType } from '@opentelemetry/api';

describe('InstrumentDescriptor', () => {
  describe('createInstrumentDescriptor', () => {
    for (const val of [null, undefined]) {
      it(`should interpret an empty unit value as a blank string (${val})`, () => {
        const result = createInstrumentDescriptor(
          'example',
          InstrumentType.COUNTER,
          {
            unit: val as any,
          }
        );
        assert.strictEqual(result.unit, '');
      });
    }
  });

  describe('isDescriptorCompatibleWith', () => {
    const tests: [
      string,
      boolean,
      InstrumentDescriptor,
      InstrumentDescriptor,
    ][] = [
      [
        'Compatible with identical descriptors',
        true,
        {
          name: 'foo',
          description: 'any descriptions',
          unit: 'kB',
          type: InstrumentType.COUNTER,
          valueType: ValueType.DOUBLE,
          advice: {},
        },
        {
          name: 'foo',
          description: 'any descriptions',
          unit: 'kB',
          type: InstrumentType.COUNTER,
          valueType: ValueType.DOUBLE,
          advice: {},
        },
      ],
      [
        'Compatible with case-insensitive names',
        true,
        {
          name: 'foo',
          description: '',
          unit: '',
          type: InstrumentType.COUNTER,
          valueType: ValueType.DOUBLE,
          advice: {},
        },
        {
          name: 'FoO',
          description: '',
          unit: '',
          type: InstrumentType.COUNTER,
          valueType: ValueType.DOUBLE,
          advice: {},
        },
      ],
      [
        'Compatible with different advice options',
        true,
        {
          name: 'foo',
          description: '',
          unit: '',
          type: InstrumentType.COUNTER,
          valueType: ValueType.DOUBLE,
          advice: {
            explicitBucketBoundaries: [4, 5, 6],
          },
        },
        {
          name: 'FoO',
          description: '',
          unit: '',
          type: InstrumentType.COUNTER,
          valueType: ValueType.DOUBLE,
          advice: {
            explicitBucketBoundaries: [1, 2, 3],
          },
        },
      ],
      [
        'Compatible with empty advice options',
        true,
        {
          name: 'foo',
          description: '',
          unit: '',
          type: InstrumentType.COUNTER,
          valueType: ValueType.DOUBLE,
          advice: {},
        },
        {
          name: 'FoO',
          description: '',
          unit: '',
          type: InstrumentType.COUNTER,
          valueType: ValueType.DOUBLE,
          advice: {
            explicitBucketBoundaries: [1, 2, 3],
          },
        },
      ],
      [
        'Incompatible with different names',
        false,
        {
          name: 'foo',
          description: '',
          unit: '',
          type: InstrumentType.COUNTER,
          valueType: ValueType.DOUBLE,
          advice: {},
        },
        {
          name: 'foobar',
          description: '',
          unit: '',
          type: InstrumentType.COUNTER,
          valueType: ValueType.DOUBLE,
          advice: {},
        },
      ],
      [
        'Incompatible with case-sensitive units',
        false,
        {
          name: 'foo',
          description: '',
          unit: 'kB',
          type: InstrumentType.COUNTER,
          valueType: ValueType.DOUBLE,
          advice: {},
        },
        {
          name: 'foo',
          description: '',
          unit: 'kb',
          type: InstrumentType.COUNTER,
          valueType: ValueType.DOUBLE,
          advice: {},
        },
      ],
    ];
    for (const test of tests) {
      it(test[0], () => {
        assert.ok(isDescriptorCompatibleWith(test[2], test[3]) === test[1]);
      });
    }
  });

  describe('isValidName', () => {
    it('should validate names', () => {
      for (const invalidName of invalidNames) {
        assert.ok(
          !isValidName(invalidName),
          `${invalidName} should be invalid`
        );
      }
      for (const validName of validNames) {
        assert.ok(isValidName(validName), `${validName} should be valid`);
      }
    });
  });
});
