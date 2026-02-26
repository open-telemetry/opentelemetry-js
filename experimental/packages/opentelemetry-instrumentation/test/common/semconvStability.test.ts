/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { inspect } from 'util';
import * as assert from 'assert';
import { SemconvStability, semconvStabilityFromStr } from '../../src';

describe('semconvStabilityFromStr', function () {
  const table = [
    { namespace: 'http', str: undefined, expected: SemconvStability.OLD },
    { namespace: 'http', str: '', expected: SemconvStability.OLD },
    { namespace: 'http', str: 'http', expected: SemconvStability.STABLE },
    {
      namespace: 'http',
      str: 'http/dup',
      expected: SemconvStability.DUPLICATE,
    },
    {
      namespace: 'http',
      str: ', http/dup,bar',
      expected: SemconvStability.DUPLICATE,
    },
    {
      namespace: 'http',
      str: ', http/dup\t ,blah',
      expected: SemconvStability.DUPLICATE,
    },
    { namespace: 'http', str: 'database', expected: SemconvStability.OLD },
    {
      namespace: 'http',
      str: 'just,bogus,values',
      expected: SemconvStability.OLD,
    },

    { namespace: 'database', str: undefined, expected: SemconvStability.OLD },
    { namespace: 'database', str: '', expected: SemconvStability.OLD },
    {
      namespace: 'database',
      str: 'database',
      expected: SemconvStability.STABLE,
    },
    {
      namespace: 'database',
      str: 'database/dup',
      expected: SemconvStability.DUPLICATE,
    },
    {
      namespace: 'database',
      str: ', database/dup,bar',
      expected: SemconvStability.DUPLICATE,
    },
    {
      namespace: 'database',
      str: ', database/dup\t ,blah',
      expected: SemconvStability.DUPLICATE,
    },
    { namespace: 'database', str: 'http', expected: SemconvStability.OLD },
    {
      namespace: 'database',
      str: 'just,bogus,values',
      expected: SemconvStability.OLD,
    },
  ];
  for (const { namespace, str, expected } of table) {
    it(`str: ${inspect(str)}`, function () {
      assert.strictEqual(semconvStabilityFromStr(namespace, str), expected);
    });
  }
});
