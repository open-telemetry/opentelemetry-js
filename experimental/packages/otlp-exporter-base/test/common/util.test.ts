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
import * as sinon from 'sinon';
import { diag } from '@opentelemetry/api';
import {
  parseHeaders,
  appendResourcePathToUrl,
  appendRootPathToUrlIfNeeded,
  parseRetryAfterToMills,
} from '../../src/util';

describe('utils', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('parseHeaders', () => {
    it('should ignore undefined headers', () => {
      // Need to stub/spy on the underlying logger as the "diag" instance is global
      const spyWarn = sinon.stub(diag, 'warn');
      const headers: Partial<Record<string, unknown>> = {
        foo1: undefined,
        foo2: 'bar',
        foo3: 1,
      };
      const result = parseHeaders(headers);
      assert.deepStrictEqual(result, {
        foo2: 'bar',
        foo3: '1',
      });
      const args = spyWarn.args[0];
      assert.strictEqual(
        args[0],
        'Header "foo1" has wrong value and will be ignored'
      );
    });

    it('should parse undefined', () => {
      const result = parseHeaders(undefined);
      assert.deepStrictEqual(result, {});
    });
  });

  // only invoked with general endpoint (not signal specific endpoint)
  describe('appendResourcePathToUrl - general http endpoint', () => {
    it('should append resource path when missing', () => {
      const url = 'http://foo.bar/';
      const resourcePath = 'v1/traces';

      const finalUrl = appendResourcePathToUrl(url, resourcePath);
      assert.strictEqual(finalUrl, url + resourcePath);
    });
    it('should append root path and resource path when missing', () => {
      const url = 'http://foo.bar';
      const resourcePath = 'v1/traces';

      const finalUrl = appendResourcePathToUrl(url, resourcePath);
      assert.strictEqual(finalUrl, url + '/' + resourcePath);
    });
    it('should append resourse path even when url already contains path ', () => {
      const url = 'http://foo.bar/v1/traces';
      const resourcePath = 'v1/traces';

      const finalUrl = appendResourcePathToUrl(url, resourcePath);
      assert.strictEqual(finalUrl, url + '/' + resourcePath);
    });
  });

  // only invoked with signal specific endpoint
  describe('appendRootPathToUrlIfNeeded - specifc signal http endpoint', () => {
    it('should append root path when missing', () => {
      const url = 'http://foo.bar';

      const finalUrl = appendRootPathToUrlIfNeeded(url);
      assert.strictEqual(finalUrl, url + '/');
    });
    it('should not append root path and return same url', () => {
      const url = 'http://foo.bar/';

      const finalUrl = appendRootPathToUrlIfNeeded(url);
      assert.strictEqual(finalUrl, url);
    });
    it('should not append root path when url contains resource path', () => {
      {
        const url = 'http://foo.bar/v1/traces';

        const finalUrl = appendRootPathToUrlIfNeeded(url);
        assert.strictEqual(finalUrl, url);
      }
      {
        const url = 'https://endpoint/something';

        const finalUrl = appendRootPathToUrlIfNeeded(url);
        assert.strictEqual(finalUrl, url);
      }
    });

    it('should not change string when url is not parseable', () => {
      const url = 'this is not a URL';

      const finalUrl = appendRootPathToUrlIfNeeded(url);
      assert.strictEqual(finalUrl, url);
    });
  });
});

describe('parseRetryAfterToMills', () => {
  // now: 2023-01-20T00:00:00.000Z
  const tests = [
    [null, -1],
    // duration
    ['-100', -1],
    ['1000', 1000 * 1000],
    // future timestamp
    ['Fri, 20 Jan 2023 00:00:01 GMT', 1000],
    // Past timestamp
    ['Fri, 19 Jan 2023 23:59:59 GMT', 0],
  ] as [string | null, number][];

  afterEach(() => {
    sinon.restore();
  });

  for (const [value, expect] of tests) {
    it(`test ${value}`, () => {
      sinon.useFakeTimers({
        now: new Date('2023-01-20T00:00:00.000Z'),
      });
      assert.strictEqual(parseRetryAfterToMills(value), expect);
    });
  }
});
