/**
 * Copyright 2019, OpenTelemetry Authors
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
import * as url from 'url';
import { CanonicalCode } from '@opentelemetry/types';
import { RequestOptions } from 'https';
import { IgnoreMatcher } from '../src/types';
import { Utils } from '../src/utils';

describe('Utils', () => {
  describe('parseResponseStatus()', () => {
    it('should return UNKNOWN code by default', () => {
      const status = Utils.parseResponseStatus(
        (undefined as unknown) as number
      );
      assert.deepStrictEqual(status, { code: CanonicalCode.UNKNOWN });
    });

    it('should return OK for Success HTTP status code', () => {
      for (let index = 200; index < 400; index++) {
        const status = Utils.parseResponseStatus(index);
        assert.deepStrictEqual(status, { code: CanonicalCode.OK });
      }
    });

    it('should not return OK for Bad HTTP status code', () => {
      for (let index = 400; index <= 504; index++) {
        const status = Utils.parseResponseStatus(index);
        assert.notStrictEqual(status.code, CanonicalCode.OK);
      }
    });
  });
  describe('hasExpectHeader()', () => {
    it('should throw if no option', () => {
      try {
        Utils.hasExpectHeader('' as RequestOptions);
        assert.fail();
      } catch (ignore) {}
    });

    it('should not throw if no headers', () => {
      const result = Utils.hasExpectHeader({} as RequestOptions);
      assert.strictEqual(result, false);
    });

    it('should return true on Expect', () => {
      const result = Utils.hasExpectHeader({
        headers: { Expect: 1 },
      } as RequestOptions);
      assert.strictEqual(result, true);
    });
  });

  describe('getIncomingOptions()', () => {
    it('should get options object', () => {
      const options = Object.assign(
        { headers: { Expect: '100-continue' } },
        url.parse('http://google.fr/')
      );
      const result = Utils.getIncomingOptions(options);
      assert.strictEqual(result.hostname, 'google.fr');
      assert.strictEqual(result.headers!.Expect, options.headers.Expect);
      assert.strictEqual(result.protocol, 'http:');
      assert.strictEqual(result.path, '/');
      assert.strictEqual((result as url.URL).pathname, '/');
    });
  });

  describe('getRequestInfo()', () => {
    it('should get options object', () => {
      const result = Utils.getRequestInfo('http://google.fr/');
      assert.strictEqual(result.optionsParsed.hostname, 'google.fr');
      assert.strictEqual(result.optionsParsed.protocol, 'http:');
      assert.strictEqual(result.optionsParsed.path, '/');
      assert.strictEqual(result.pathname, '/');
    });
  });

  describe('satisfiesPattern()', () => {
    it('string pattern', () => {
      const answer1 = Utils.satisfiesPattern('/test/1', {}, '/test/1');
      assert.strictEqual(answer1, true);
      const answer2 = Utils.satisfiesPattern('/test/1', {}, '/test/11');
      assert.strictEqual(answer2, false);
    });

    it('regex pattern', () => {
      const answer1 = Utils.satisfiesPattern('/TeSt/1', {}, /\/test/i);
      assert.strictEqual(answer1, true);
      const answer2 = Utils.satisfiesPattern('/2/tEst/1', {}, /\/test/);
      assert.strictEqual(answer2, false);
    });

    it('should throw if type is unknown', () => {
      try {
        Utils.satisfiesPattern(
          '/TeSt/1',
          {},
          (true as unknown) as IgnoreMatcher<{}>
        );
        assert.fail();
      } catch (error) {
        assert.strictEqual(error instanceof TypeError, true);
      }
    });

    it('function pattern', () => {
      const answer1 = Utils.satisfiesPattern(
        '/test/home',
        { headers: {} },
        (url: string, req: { headers: unknown }) =>
          req.headers && url === '/test/home'
      );
      assert.strictEqual(answer1, true);
      const answer2 = Utils.satisfiesPattern(
        '/test/home',
        { headers: {} },
        (url: string, req: { headers: unknown }) => url !== '/test/home'
      );
      assert.strictEqual(answer2, false);
    });
  });

  describe('isIgnored()', () => {
    beforeEach(() => {
      Utils.satisfiesPattern = sinon.spy();
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should call isSatisfyPattern, n match', () => {
      const answer1 = Utils.isIgnored('/test/1', {}, ['/test/11']);
      assert.strictEqual(answer1, false);
      assert.strictEqual(
        (Utils.satisfiesPattern as sinon.SinonSpy).callCount,
        1
      );
    });

    it('should call isSatisfyPattern, match', () => {
      const answer1 = Utils.isIgnored('/test/1', {}, ['/test/11']);
      assert.strictEqual(answer1, false);
      assert.strictEqual(
        (Utils.satisfiesPattern as sinon.SinonSpy).callCount,
        1
      );
    });

    it('should not call isSatisfyPattern', () => {
      Utils.isIgnored('/test/1', {}, []);
      assert.strictEqual(
        (Utils.satisfiesPattern as sinon.SinonSpy).callCount,
        0
      );
    });

    it('should return false on empty list', () => {
      const answer1 = Utils.isIgnored('/test/1', {}, []);
      assert.strictEqual(answer1, false);
    });

    it('should not throw and return false when list is undefined', () => {
      const answer2 = Utils.isIgnored('/test/1', {}, undefined);
      assert.strictEqual(answer2, false);
    });
  });
});
