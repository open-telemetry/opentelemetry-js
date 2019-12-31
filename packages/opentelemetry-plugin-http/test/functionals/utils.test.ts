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

import { NoopScopeManager } from '@opentelemetry/scope-base';
import { BasicTracer, Span } from '@opentelemetry/tracing';
import { CanonicalCode, SpanKind } from '@opentelemetry/types';
import * as assert from 'assert';
import * as http from 'http';
import * as url from 'url';
import { AttributeNames } from '../../src';
import * as utils from '../../src/utils';

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
      const webUrl = 'http://u:p@google.fr/aPath?qu=ry';
      const urlParsed = url.parse(webUrl);
      const urlParsedWithoutPathname = {
        ...urlParsed,
        pathname: undefined,
      };
      const whatWgUrl = new url.URL(webUrl);
      for (const param of [
        webUrl,
        urlParsed,
        urlParsedWithoutPathname,
        whatWgUrl,
      ]) {
        const result = utils.getRequestInfo(param);
        assert.strictEqual(result.optionsParsed.hostname, 'google.fr');
        assert.strictEqual(result.optionsParsed.protocol, 'http:');
        assert.strictEqual(result.optionsParsed.path, '/aPath?qu=ry');
        assert.strictEqual(result.pathname, '/aPath');
        assert.strictEqual(result.origin, 'http://google.fr');
      }
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
