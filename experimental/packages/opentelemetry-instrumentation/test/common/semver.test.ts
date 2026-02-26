/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/*
 * These tests are adapted from semver's tests for `semver.satisfies()`.
 * https://github.com/npm/node-semver/blob/868d4bbe3d318c52544f38d5f9977a1103e924c2/test/functions/satisfies.js
 * License:
 *
 * The ISC License
 *
 * Copyright (c) Isaac Z. Schlueter and Contributors
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR
 * IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

import * as assert from 'assert';

import { satisfies, SatisfiesOptions } from '../../src/semver';

const rangeInclude = require('./third-party/node-semver/range-include.js');
const rangeExclude = require('./third-party/node-semver/range-exclude.js');

describe('SemVer', function () {
  describe('satisfies', function () {
    function isOptionsSupported(options: any): boolean {
      // We don't support
      // - boolean typed options
      // - 'loose' option parameter
      if (options && (typeof options === 'boolean' || options.loose)) {
        return false;
      }
      return true;
    }

    it('when range is included', function () {
      rangeInclude.forEach(([range, ver, options]: [string, string, any]) => {
        if (!isOptionsSupported(options)) {
          return;
        }
        assert.ok(
          satisfies(ver, range, options),
          `${range} satisfied by ${ver}`
        );
      });
    });
    it('when range is not included', function () {
      rangeExclude.forEach(([range, ver, options]: [string, string, any]) => {
        if (!isOptionsSupported(options)) {
          return;
        }
        assert.ok(
          !satisfies(ver, range, options as SatisfiesOptions),
          `${range} not satisfied by ${ver}`
        );
      });
    });
    it('invalid ranges never satisfied (but do not throw)', function () {
      const cases = [
        ['blerg', '1.2.3'],
        ['git+https://user:password0123@github.com/foo', '123.0.0', true],
        ['^1.2.3', '2.0.0-pre'],
        ['0.x', undefined],
        ['*', undefined],
      ];
      cases.forEach(([range, ver]) => {
        assert.ok(
          !satisfies(ver as any, range as any),
          `${range} not satisfied because invalid`
        );
      });
    });
  });
});
