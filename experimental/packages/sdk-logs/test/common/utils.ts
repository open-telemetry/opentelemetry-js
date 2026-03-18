/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export const validAttributes = {
  string: 'string',
  number: 0,
  bool: true,
  'array<string>': ['str1', 'str2'],
  'array<number>': [1, 2],
  'array<bool>': [true, false],
  object: { bar: 'foo' },
  'empty-object': {},
  'non-homogeneous-array': [0, ''],
};

export const invalidAttributes = {
  // This empty length attribute should not be set
  '': 'empty-key',
};
