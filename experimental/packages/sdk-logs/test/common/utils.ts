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
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_INSTANCE_ID } from '@opentelemetry/semantic-conventions';

export const validAttributes = {
  string: 'string',
  number: 0,
  bool: true,
  'array<string>': ['str1', 'str2'],
  'array<number>': [1, 2],
  'array<bool>': [true, false],
  object: { bar: 'foo' },
};

export const invalidAttributes = {
  // invalid attribute empty object
  object: {},
  // invalid attribute inhomogeneous array
  'non-homogeneous-array': [0, ''],
  // This empty length attribute should not be set
  '': 'empty-key',
};

/**
 * Compare two Service Resource values. Since the value for service.instance.id can be a randomUUID, the function checks if the size of the value matches the size of a randomUUID and removes it from the object, otherwise leave for comparison.
 * @param serviceResourceA
 * @param serviceResourceB
 */
export const assertServiceResource = (
  serviceResourceA: Resource,
  serviceResourceB: Resource
) => {
  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const instanceIDAisUUID =
    serviceResourceA.attributes[SEMRESATTRS_SERVICE_INSTANCE_ID] != null &&
    UUID_REGEX.test(
      serviceResourceA.attributes[SEMRESATTRS_SERVICE_INSTANCE_ID].toString()
    );
  const instanceIDBisUUID =
    serviceResourceB.attributes[SEMRESATTRS_SERVICE_INSTANCE_ID] != null &&
    UUID_REGEX.test(
      serviceResourceB.attributes[SEMRESATTRS_SERVICE_INSTANCE_ID].toString()
    );
  if (instanceIDAisUUID && instanceIDBisUUID) {
    delete serviceResourceA.attributes[SEMRESATTRS_SERVICE_INSTANCE_ID];
    delete serviceResourceB.attributes[SEMRESATTRS_SERVICE_INSTANCE_ID];
  }

  assert.deepStrictEqual(serviceResourceA, serviceResourceB);
};
