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
import { HrTime } from '@opentelemetry/api';
import * as assert from 'assert';

export interface SimpleTestObject {
  readonly propString: string;
  readonly propNumber: number;
  readonly propArray: number[];
}

export interface ComplexTestObject {
  readonly propString: string;
  readonly propNumber: number;
  readonly propFunction: () => SimpleTestObject;
  readonly propOptional?: string;
  readonly propTime: HrTime;
  readonly propObject: SimpleTestObject;
  readonly propArray: SimpleTestObject[];
  readonly propBoolean: boolean;
}

export const mockedComplexTestObject: ComplexTestObject = {
  propArray: [
    {
      propArray: [1, 2, 3],
      propNumber: 42,
      propString: 'this is a string.',
    },
    {
      propArray: [3, 2, 1],
      propNumber: 3,
      propString: 'this is a second string.',
    },
  ],
  propBoolean: true,
  propFunction: () => {
    return {
      propArray: [30, 20, 10],
      propNumber: 24,
      propString: 'created by function',
    };
  },
  propObject: {
    propArray: [4, 3, 77],
    propNumber: 44,
    propString: 'this is a string that is part of propObject.',
  },
  propNumber: 12,
  propOptional: undefined,
  propString: 'this is just a string in a complex test object.',
  propTime: [12, 455],
};

export function ensureHeadersContain(
  actual: { [key: string]: string },
  expected: { [key: string]: string }
) {
  Object.entries(expected).forEach(([k, v]) => {
    assert.strictEqual(
      v,
      actual[k],
      `Expected ${actual} to contain ${k}: ${v}`
    );
  });
}
