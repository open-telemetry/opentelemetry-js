/*!
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
import { CanonicalCode, Attributes, SpanKind } from '@opentelemetry/types';
import { NoopScopeManager } from '@opentelemetry/scope-base';
import { IgnoreMatcher } from '../../src/types';
import { Utils } from '../../src/utils';
import * as http from 'http';
import { Span, BasicTracer } from '@opentelemetry/tracer-basic';
import { AttributeNames } from '../../src';

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
        Utils.hasExpectHeader('' as http.RequestOptions);
        assert.fail();
      } catch (ignore) {}
    });

    it('should not throw if no headers', () => {
      const result = Utils.hasExpectHeader({} as http.RequestOptions);
      assert.strictEqual(result, false);
    });

    it('should return true on Expect (no case sensitive)', () => {
      for (const headers of [{ Expect: 1 }, { expect: 1 }, { ExPect: 1 }]) {
        const result = Utils.hasExpectHeader({
          headers,
        } as http.RequestOptions);
        assert.strictEqual(result, true);
      }
    });
  });

  describe('getRequestInfo()', () => {
    it('should get options object', () => {
      const webUrl = 'http://google.fr/';
      const urlParsed = url.parse(webUrl);
      const urlParsedWithoutPathname = {
        ...urlParsed,
        pathname: undefined,
      };
      for (const param of [webUrl, urlParsed, urlParsedWithoutPathname]) {
        const result = Utils.getRequestInfo(param);
        assert.strictEqual(result.optionsParsed.hostname, 'google.fr');
        assert.strictEqual(result.optionsParsed.protocol, 'http:');
        assert.strictEqual(result.optionsParsed.path, '/');
        assert.strictEqual(result.pathname, '/');
      }
    });
  });

  describe('satisfiesPattern()', () => {
    it('string pattern', () => {
      const answer1 = Utils.satisfiesPattern('/test/1', '/test/1');
      assert.strictEqual(answer1, true);
      const answer2 = Utils.satisfiesPattern('/test/1', '/test/11');
      assert.strictEqual(answer2, false);
    });

    it('regex pattern', () => {
      const answer1 = Utils.satisfiesPattern('/TeSt/1', /\/test/i);
      assert.strictEqual(answer1, true);
      const answer2 = Utils.satisfiesPattern('/2/tEst/1', /\/test/);
      assert.strictEqual(answer2, false);
    });

    it('should throw if type is unknown', () => {
      try {
        Utils.satisfiesPattern('/TeSt/1', (true as unknown) as IgnoreMatcher);
        assert.fail();
      } catch (error) {
        assert.strictEqual(error instanceof TypeError, true);
      }
    });

    it('function pattern', () => {
      const answer1 = Utils.satisfiesPattern(
        '/test/home',
        (url: string) => url === '/test/home'
      );
      assert.strictEqual(answer1, true);
      const answer2 = Utils.satisfiesPattern(
        '/test/home',
        (url: string) => url !== '/test/home'
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
      const answer1 = Utils.isIgnored('/test/1', ['/test/11']);
      assert.strictEqual(answer1, false);
      assert.strictEqual(
        (Utils.satisfiesPattern as sinon.SinonSpy).callCount,
        1
      );
    });

    it('should call isSatisfyPattern, match', () => {
      const answer1 = Utils.isIgnored('/test/1', ['/test/11']);
      assert.strictEqual(answer1, false);
      assert.strictEqual(
        (Utils.satisfiesPattern as sinon.SinonSpy).callCount,
        1
      );
    });

    it('should not call isSatisfyPattern', () => {
      Utils.isIgnored('/test/1', []);
      assert.strictEqual(
        (Utils.satisfiesPattern as sinon.SinonSpy).callCount,
        0
      );
    });

    it('should return false on empty list', () => {
      const answer1 = Utils.isIgnored('/test/1', []);
      assert.strictEqual(answer1, false);
    });

    it('should not throw and return false when list is undefined', () => {
      const answer2 = Utils.isIgnored('/test/1', undefined);
      assert.strictEqual(answer2, false);
    });
  });

  describe('getAbsoluteUrl()', () => {
    it('should return absolute url with localhost', () => {
      const path = '/test/1';
      const result = Utils.getAbsoluteUrl(url.parse(path), {});
      assert.strictEqual(result, `http://localhost${path}`);
    });
    it('should return absolute url', () => {
      const absUrl = 'http://www.google/test/1?query=1';
      const result = Utils.getAbsoluteUrl(url.parse(absUrl), {});
      assert.strictEqual(result, absUrl);
    });
    it('should return default url', () => {
      const result = Utils.getAbsoluteUrl(null, {});
      assert.strictEqual(result, 'http://localhost/');
    });
    it("{ path: '/helloworld', port: 8080 } should return http://localhost:8080/helloworld", () => {
      const result = Utils.getAbsoluteUrl(
        { path: '/helloworld', port: 8080 },
        {}
      );
      assert.strictEqual(result, 'http://localhost:8080/helloworld');
    });
  });
  describe('setSpanOnError()', () => {
    it('should call span methods when we get an error event', done => {
      /* tslint:disable-next-line:no-any */
      const span: any = {
        setAttributes: (obj: Attributes) => {},
        setStatus: (status: unknown) => {},
        end: () => {},
      };
      sinon.spy(span, 'setAttributes');
      sinon.spy(span, 'setStatus');
      sinon.spy(span, 'end');
      const req = http.get('http://noop');
      Utils.setSpanOnError(span, req);
      req.on('error', () => {
        assert.strictEqual(span.setAttributes.callCount, 1);
        assert.strictEqual(span.setStatus.callCount, 1);
        assert.strictEqual(span.end.callCount, 1);
        done();
      });
    });
  });

  describe('setSpanWithError()', () => {
    it('should have error attributes', () => {
      const errorMessage = 'test error';
      for (const obj of [undefined, { statusCode: 400 }]) {
        const span = new Span(
          new BasicTracer({
            scopeManager: new NoopScopeManager(),
          }),
          'test',
          { spanId: '', traceId: '' },
          SpanKind.INTERNAL
        );
        /* tslint:disable-next-line:no-any */
        Utils.setSpanWithError(span, new Error(errorMessage), obj as any);
        const attributes = span.toReadableSpan().attributes;
        assert.strictEqual(
          attributes[AttributeNames.HTTP_ERROR_MESSAGE],
          errorMessage
        );
        assert.ok(attributes[AttributeNames.HTTP_ERROR_NAME]);
      }
    });
  });
  describe('isOpenTelemetryRequest()', () => {
    [
      {},
      { headers: {} },
      url.parse('http://url.com'),
      { headers: { [Utils.OT_REQUEST_HEADER]: 0 } },
      { headers: { [Utils.OT_REQUEST_HEADER]: false } },
    ].forEach(options => {
      it(`should return false with the following value: ${JSON.stringify(
        options
      )}`, () => {
        /* tslint:disable-next-line:no-any */
        assert.strictEqual(Utils.isOpenTelemetryRequest(options as any), false);
      });
    });
    for (const options of [
      { headers: { [Utils.OT_REQUEST_HEADER]: 1 } },
      { headers: { [Utils.OT_REQUEST_HEADER]: true } },
    ]) {
      it(`should return true with the following value: ${JSON.stringify(
        options
      )}`, () => {
        /* tslint:disable-next-line:no-any */
        assert.strictEqual(Utils.isOpenTelemetryRequest(options as any), true);
      });
    }
  });

  describe('isValidOptionsType()', () => {
    ['', false, true, 1, 0, []].forEach(options => {
      it(`should return false with the following value: ${JSON.stringify(
        options
      )}`, () => {
        assert.strictEqual(Utils.isValidOptionsType(options), false);
      });
    });
    for (const options of ['url', url.parse('http://url.com'), {}]) {
      it(`should return true with the following value: ${JSON.stringify(
        options
      )}`, () => {
        assert.strictEqual(Utils.isValidOptionsType(options), true);
      });
    }
  });
});
