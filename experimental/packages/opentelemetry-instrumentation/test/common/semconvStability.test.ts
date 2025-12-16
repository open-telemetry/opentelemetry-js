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

import { inspect } from 'util';
import * as assert from 'assert';
import { SemconvStability, semconvStabilityFromStr } from '../../src';

describe('SemconvStability', function () {
  it('should have correct bitwise flag values', function () {
    // STABLE is 0x1
    assert.strictEqual(SemconvStability.STABLE, 0x1);

    // OLD is 0x2
    assert.strictEqual(SemconvStability.OLD, 0x2);

    // DUPLICATE is 0x3 (STABLE | OLD)
    assert.strictEqual(SemconvStability.DUPLICATE, 0x3);
    assert.strictEqual(
      SemconvStability.DUPLICATE & SemconvStability.STABLE,
      SemconvStability.STABLE
    );
    assert.strictEqual(
      SemconvStability.DUPLICATE & SemconvStability.OLD,
      SemconvStability.OLD
    );

    // LATEST_EXPERIMENTAL is 0x5 (0x4 | STABLE)
    assert.strictEqual(SemconvStability.LATEST_EXPERIMENTAL, 0x5);
    assert.strictEqual(
      SemconvStability.LATEST_EXPERIMENTAL & SemconvStability.STABLE,
      SemconvStability.STABLE
    );
    assert.strictEqual(
      SemconvStability.LATEST_EXPERIMENTAL & SemconvStability.OLD,
      0
    );
  });
});

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

    // LATEST_EXPERIMENTAL tests for http namespace
    {
      namespace: 'http',
      str: 'http_latest_exerimental',
      expected: SemconvStability.LATEST_EXPERIMENTAL,
    },
    {
      namespace: 'http',
      str: 'HTTP_latest_exerimental',
      expected: SemconvStability.LATEST_EXPERIMENTAL,
    },
    {
      namespace: 'http',
      str: ', http_latest_exerimental,bar',
      expected: SemconvStability.LATEST_EXPERIMENTAL,
    },
    {
      namespace: 'http',
      str: ', http_latest_exerimental\t ,blah',
      expected: SemconvStability.LATEST_EXPERIMENTAL,
    },
    // LATEST_EXPERIMENTAL takes precedence over DUPLICATE
    {
      namespace: 'http',
      str: 'http/dup,http_latest_exerimental',
      expected: SemconvStability.LATEST_EXPERIMENTAL,
    },
    {
      namespace: 'http',
      str: 'http_latest_exerimental,http/dup',
      expected: SemconvStability.LATEST_EXPERIMENTAL,
    },
    // LATEST_EXPERIMENTAL takes precedence over STABLE
    {
      namespace: 'http',
      str: 'http,http_latest_exerimental',
      expected: SemconvStability.LATEST_EXPERIMENTAL,
    },
    {
      namespace: 'http',
      str: 'http_latest_exerimental,http',
      expected: SemconvStability.LATEST_EXPERIMENTAL,
    },

    // LATEST_EXPERIMENTAL tests for database namespace
    {
      namespace: 'database',
      str: 'database_latest_exerimental',
      expected: SemconvStability.LATEST_EXPERIMENTAL,
    },
    {
      namespace: 'database',
      str: 'DATABASE_latest_exerimental',
      expected: SemconvStability.LATEST_EXPERIMENTAL,
    },
    {
      namespace: 'database',
      str: ', database_latest_exerimental,bar',
      expected: SemconvStability.LATEST_EXPERIMENTAL,
    },
    {
      namespace: 'database',
      str: ', database_latest_exerimental\t ,blah',
      expected: SemconvStability.LATEST_EXPERIMENTAL,
    },
    // LATEST_EXPERIMENTAL takes precedence over DUPLICATE
    {
      namespace: 'database',
      str: 'database/dup,database_latest_exerimental',
      expected: SemconvStability.LATEST_EXPERIMENTAL,
    },
    {
      namespace: 'database',
      str: 'database_latest_exerimental,database/dup',
      expected: SemconvStability.LATEST_EXPERIMENTAL,
    },
    // LATEST_EXPERIMENTAL takes precedence over STABLE
    {
      namespace: 'database',
      str: 'database,database_latest_exerimental',
      expected: SemconvStability.LATEST_EXPERIMENTAL,
    },
    {
      namespace: 'database',
      str: 'database_latest_exerimental,database',
      expected: SemconvStability.LATEST_EXPERIMENTAL,
    },

    // Namespace isolation: http_latest_exerimental doesn't affect database namespace
    {
      namespace: 'database',
      str: 'http_latest_exerimental',
      expected: SemconvStability.OLD,
    },
    {
      namespace: 'http',
      str: 'database_latest_exerimental',
      expected: SemconvStability.OLD,
    },
    // Mixed namespaces: only the matching namespace applies
    {
      namespace: 'http',
      str: 'database,http_latest_exerimental',
      expected: SemconvStability.LATEST_EXPERIMENTAL,
    },
    {
      namespace: 'database',
      str: 'http_latest_exerimental,database/dup',
      expected: SemconvStability.DUPLICATE,
    },
  ];
  for (const { namespace, str, expected } of table) {
    it(`str: ${inspect(str)}`, function () {
      assert.strictEqual(semconvStabilityFromStr(namespace, str), expected);
    });
  }
});
