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
import * as utils from '../../src/utils';
import * as http from 'http';
import { Span, BasicTracer } from '@opentelemetry/tracer-basic';
import { AttributeNames } from '../../src';
import { NoopLogger } from '@opentelemetry/core';

describe('Utility', () => {
  describe('parseResponseStatus()', () => {
    it('should return UNKNOWN code by default', () => {
      const status = utils.parseResponseStatus(
        (undefined as unknown) as number
      );
      assert.deepStrictEqual(status, { code: CanonicalCode.UNKNOWN });
    });

    it('should return OK for Success HTTP status code', () => {
      for (let index = 200; index < 400; index++) {
        const status = utils.parseResponseStatus(index);
        assert.deepStrictEqual(status, { code: CanonicalCode.OK });
      }
    });

    it('should not return OK for Bad HTTP status code', () => {
      for (let index = 400; index <= 504; index++) {
        const status = utils.parseResponseStatus(index);
        assert.notStrictEqual(status.code, CanonicalCode.OK);
      }
    });
  });
  describe('hasExpectHeader()', () => {
    it('should throw if no option', () => {
      try {
        utils.hasExpectHeader('' as http.RequestOptions);
        assert.fail();
      } catch (ignore) {}
    });

    it('should not throw if no headers', () => {
      const result = utils.hasExpectHeader({} as http.RequestOptions);
      assert.strictEqual(result, false);
    });

    it('should return true on Expect (no case sensitive)', () => {
      for (const headers of [{ Expect: 1 }, { expect: 1 }, { ExPect: 1 }]) {
        const result = utils.hasExpectHeader({
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
        const result = utils.getRequestInfo(param);
        assert.strictEqual(result.optionsParsed.hostname, 'google.fr');
        assert.strictEqual(result.optionsParsed.protocol, 'http:');
        assert.strictEqual(result.optionsParsed.path, '/');
        assert.strictEqual(result.pathname, '/');
      }
    });
  });

  describe('satisfiesPattern()', () => {
    it('string pattern', () => {
      const answer1 = utils.satisfiesPattern('/test/1', '/test/1');
      assert.strictEqual(answer1, true);
      const answer2 = utils.satisfiesPattern('/test/1', '/test/11');
      assert.strictEqual(answer2, false);
    });

    it('regex pattern', () => {
      const answer1 = utils.satisfiesPattern('/TeSt/1', /\/test/i);
      assert.strictEqual(answer1, true);
      const answer2 = utils.satisfiesPattern('/2/tEst/1', /\/test/);
      assert.strictEqual(answer2, false);
    });

    it('should throw if type is unknown', () => {
      try {
        utils.satisfiesPattern('/TeSt/1', (true as unknown) as IgnoreMatcher);
        assert.fail();
      } catch (error) {
        assert.strictEqual(error instanceof TypeError, true);
      }
    });

    it('function pattern', () => {
      const answer1 = utils.satisfiesPattern(
        '/test/home',
        (url: string) => url === '/test/home'
      );
      assert.strictEqual(answer1, true);
      const answer2 = utils.satisfiesPattern(
        '/test/home',
        (url: string) => url !== '/test/home'
      );
      assert.strictEqual(answer2, false);
    });
  });

  describe('isIgnored()', () => {
    let satisfiesPatternStub: sinon.SinonSpy<[string, IgnoreMatcher], boolean>;
    beforeEach(() => {
      satisfiesPatternStub = sinon.spy(utils, 'satisfiesPattern');
    });

    afterEach(() => {
      satisfiesPatternStub.restore();
    });

    it('should call isSatisfyPattern, n match', () => {
      const answer1 = utils.isIgnored('/test/1', ['/test/11']);
      assert.strictEqual(answer1, false);
      assert.strictEqual(
        (utils.satisfiesPattern as sinon.SinonSpy).callCount,
        1
      );
    });

    it('should call isSatisfyPattern, match for function', () => {
      satisfiesPatternStub.restore();
      const answer1 = utils.isIgnored('/test/1', [
        url => url.endsWith('/test/1'),
      ]);
      assert.strictEqual(answer1, true);
    });

    it('should not re-throw when function throws an exception', () => {
      satisfiesPatternStub.restore();
      const log = new NoopLogger();
      const onException = (e: Error) => {
        log.error('error', e);
      };
      for (const callback of [undefined, onException]) {
        assert.doesNotThrow(() =>
          utils.isIgnored(
            '/test/1',
            [
              url => {
                throw new Error('test');
              },
            ],
            callback
          )
        );
      }
    });

    it('should call onException when function throws an exception', () => {
      satisfiesPatternStub.restore();
      const onException = sinon.spy();
      assert.doesNotThrow(() =>
        utils.isIgnored(
          '/test/1',
          [
            url => {
              throw new Error('test');
            },
          ],
          onException
        )
      );
      assert.strictEqual((onException as sinon.SinonSpy).callCount, 1);
    });

    it('should not call isSatisfyPattern', () => {
      utils.isIgnored('/test/1', []);
      assert.strictEqual(
        (utils.satisfiesPattern as sinon.SinonSpy).callCount,
        0
      );
    });

    it('should return false on empty list', () => {
      const answer1 = utils.isIgnored('/test/1', []);
      assert.strictEqual(answer1, false);
    });

    it('should not throw and return false when list is undefined', () => {
      const answer2 = utils.isIgnored('/test/1', undefined);
      assert.strictEqual(answer2, false);
    });
  });

  describe('getAbsoluteUrl()', () => {
    it('should return absolute url with localhost', () => {
      const path = '/test/1';
      const result = utils.getAbsoluteUrl(url.parse(path), {});
      assert.strictEqual(result, `http://localhost${path}`);
    });
    it('should return absolute url', () => {
      const absUrl = 'http://www.google/test/1?query=1';
      const result = utils.getAbsoluteUrl(url.parse(absUrl), {});
      assert.strictEqual(result, absUrl);
    });
    it('should return default url', () => {
      const result = utils.getAbsoluteUrl(null, {});
      assert.strictEqual(result, 'http://localhost/');
    });
    it("{ path: '/helloworld', port: 8080 } should return http://localhost:8080/helloworld", () => {
      const result = utils.getAbsoluteUrl(
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
      utils.setSpanOnError(span, req);
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
        utils.setSpanWithError(span, new Error(errorMessage), obj as any);
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
      { headers: { [utils.OT_REQUEST_HEADER]: 0 } },
      { headers: { [utils.OT_REQUEST_HEADER]: false } },
    ].forEach(options => {
      it(`should return false with the following value: ${JSON.stringify(
        options
      )}`, () => {
        /* tslint:disable-next-line:no-any */
        assert.strictEqual(utils.isOpenTelemetryRequest(options as any), false);
      });
    });
    for (const options of [
      { headers: { [utils.OT_REQUEST_HEADER]: 1 } },
      { headers: { [utils.OT_REQUEST_HEADER]: true } },
    ]) {
      it(`should return true with the following value: ${JSON.stringify(
        options
      )}`, () => {
        /* tslint:disable-next-line:no-any */
        assert.strictEqual(utils.isOpenTelemetryRequest(options as any), true);
      });
    }
  });

  describe('isValidOptionsType()', () => {
    ['', false, true, 1, 0, []].forEach(options => {
      it(`should return false with the following value: ${JSON.stringify(
        options
      )}`, () => {
        assert.strictEqual(utils.isValidOptionsType(options), false);
      });
    });
    for (const options of ['url', url.parse('http://url.com'), {}]) {
      it(`should return true with the following value: ${JSON.stringify(
        options
      )}`, () => {
        assert.strictEqual(utils.isValidOptionsType(options), true);
      });
    }
  });
});
