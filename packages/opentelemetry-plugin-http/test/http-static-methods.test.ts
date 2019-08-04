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
import { CanonicalCode } from '@opentelemetry/types';
import { HttpPlugin } from '../src/http';

describe.only('Static HttpPlugin methods', () => {
  describe('parseResponseStatus()', () => {

    it('should return UNKNOWN code by default', () => {
      const status = HttpPlugin.parseResponseStatus(undefined as any);
      assert.deepStrictEqual(status, { code: CanonicalCode.UNKNOWN });
    });

    it('should return OK for Success HTTP status code', () => {
      for (let index = 200; index < 400; index++) {
        const status = HttpPlugin.parseResponseStatus(index);
        assert.deepStrictEqual(status, { code: CanonicalCode.OK });
      }
    });

    it('should not return OK for Bad HTTP status code', () => {
      for (let index = 400; index <= 504; index++) {
        const status = HttpPlugin.parseResponseStatus(index);
        assert.notStrictEqual(status.code, CanonicalCode.OK);
      }
    });
  });
  describe('hasExpectHeader()', () => {
    it('should throw if no option', () => {
      try {
        HttpPlugin.hasExpectHeader(undefined as any);
        assert.fail()
      } catch (ignore) {}
    });

    it('should not throw if no headers', () => {
      const result = HttpPlugin.hasExpectHeader({} as any);
      assert.strictEqual(result, false);
    });

    it('should return true on Expect', () => {
      const result = HttpPlugin.hasExpectHeader({ headers: { Expect: {} } } as any);
      assert.strictEqual(result, true);
    });

  });
  describe('isSatisfyPattern()', () => {

    it('string pattern', () => {
      const answer1 = HttpPlugin.isSatisfyPattern('/test/1', {}, '/test/1');
      assert.strictEqual(answer1, true);
      const answer2 = HttpPlugin.isSatisfyPattern('/test/1', {}, '/test/11');
      assert.strictEqual(answer2, false);
    });

    it('regex pattern', () => {
      const answer1 = HttpPlugin.isSatisfyPattern('/TeSt/1', {}, /\/test/i);
      assert.strictEqual(answer1, true);
      const answer2 = HttpPlugin.isSatisfyPattern('/2/tEst/1', {}, /\/test/);
      assert.strictEqual(answer2, false);
    });

    it('should throw if type is unknown', () => {

      try {
        HttpPlugin.isSatisfyPattern('/TeSt/1', {}, true as any);
        assert.fail()
      } catch (error) {
        assert.strictEqual(error instanceof TypeError, true);
      }
    });


    it('function pattern', () => {
      const answer1 = HttpPlugin.isSatisfyPattern('/test/home', { headers: {}}, (url: string, req: { headers: any }) => req.headers && url === '/test/home');
      assert.strictEqual(answer1, true);
      const answer2 = HttpPlugin.isSatisfyPattern('/test/home', { headers: {}}, (url: string, req: { headers: any }) => url !== '/test/home');
      assert.strictEqual(answer2, false);
    });
  });

  describe('isIgnored()', () => {

    beforeEach(() => {
      HttpPlugin.isSatisfyPattern = sinon.spy();
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should call isSatisfyPattern, n match', () => {
      const answer1 = HttpPlugin.isIgnored('/test/1', {}, ['/test/11']);
      assert.strictEqual(answer1, false);
      assert.strictEqual((HttpPlugin.isSatisfyPattern as sinon.SinonSpy).callCount, 1);
    });

    it('should call isSatisfyPattern, match', () => {
      const answer1 = HttpPlugin.isIgnored('/test/1', {}, ['/test/11']);
      assert.strictEqual(answer1, false);
      assert.strictEqual((HttpPlugin.isSatisfyPattern as sinon.SinonSpy).callCount, 1);
    });

    it('should not call isSatisfyPattern', () => {
      HttpPlugin.isIgnored('/test/1', {}, []);
      assert.strictEqual((HttpPlugin.isSatisfyPattern as sinon.SinonSpy).callCount, 0);
    });

    it('should return false on empty list', () => {
      const answer1 = HttpPlugin.isIgnored('/test/1', {}, []);
      assert.strictEqual(answer1, false);
    });

    it('should not throw and return false when list is undefined', () => {
      const answer2 = HttpPlugin.isIgnored('/test/1', {}, undefined);
      assert.strictEqual(answer2, false);
    });
  });
});
