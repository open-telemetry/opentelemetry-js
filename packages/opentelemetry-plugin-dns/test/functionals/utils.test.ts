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

import { NoopLogger } from '@opentelemetry/core';
import { BasicTracerProvider, Span } from '@opentelemetry/tracing';
import { CanonicalCode, SpanKind } from '@opentelemetry/api';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { AttributeNames } from '../../src/enums/AttributeNames';
import { IgnoreMatcher } from '../../src/types';
import * as utils from '../../src/utils';

describe('Utility', () => {
  describe('parseResponseStatus()', () => {
    it('should return UNKNOWN code by default', () => {
      [(undefined as unknown) as string, '', 'DSHKJSAD'].forEach(code => {
        const status = utils.parseErrorCode(code);
        assert.deepStrictEqual(status, { code: CanonicalCode.UNKNOWN });
      });
    });
  });

  describe('satisfiesPattern()', () => {
    it('string pattern', () => {
      const answer1 = utils.satisfiesPattern('localhost', 'localhost');
      assert.strictEqual(answer1, true);
      const answer2 = utils.satisfiesPattern('hostname', 'localhost');
      assert.strictEqual(answer2, false);
    });

    it('regex pattern', () => {
      const answer1 = utils.satisfiesPattern('LocalHost', /localhost/i);
      assert.strictEqual(answer1, true);
      const answer2 = utils.satisfiesPattern('Montreal.ca', /montreal.ca/);
      assert.strictEqual(answer2, false);
    });

    it('should throw if type is unknown', () => {
      try {
        utils.satisfiesPattern(
          'google.com',
          (true as unknown) as IgnoreMatcher
        );
        assert.fail();
      } catch (error) {
        assert.strictEqual(error instanceof TypeError, true);
      }
    });

    it('function pattern', () => {
      const answer1 = utils.satisfiesPattern(
        'montreal.ca',
        (url: string) => url === 'montreal.ca'
      );
      assert.strictEqual(answer1, true);
      const answer2 = utils.satisfiesPattern(
        'montreal.ca',
        (url: string) => url !== 'montreal.ca'
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
      const answer1 = utils.isIgnored('localhost', ['test']);
      assert.strictEqual(answer1, false);
      assert.strictEqual(
        (utils.satisfiesPattern as sinon.SinonSpy).callCount,
        1
      );
    });

    it('should call isSatisfyPattern, match for function', () => {
      satisfiesPatternStub.restore();
      const answer1 = utils.isIgnored('api.montreal.ca', [
        url => url.endsWith('montreal.ca'),
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
            'test',
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
          'test',
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
      utils.isIgnored('test', []);
      assert.strictEqual(
        (utils.satisfiesPattern as sinon.SinonSpy).callCount,
        0
      );
    });

    it('should return false on empty list', () => {
      const answer1 = utils.isIgnored('test', []);
      assert.strictEqual(answer1, false);
    });

    it('should not throw and return false when list is undefined', () => {
      const answer2 = utils.isIgnored('test', undefined);
      assert.strictEqual(answer2, false);
    });
  });

  describe('setError()', () => {
    it('should have error attributes', () => {
      const errorMessage = 'test error';
      const span = new Span(
        new BasicTracerProvider().getTracer('default'),
        'test',
        { spanId: '', traceId: '' },
        SpanKind.INTERNAL
      );
      utils.setError(new Error(errorMessage), span, process.versions.node);
      const attributes = span.toReadableSpan().attributes;
      assert.strictEqual(
        attributes[AttributeNames.DNS_ERROR_MESSAGE],
        errorMessage
      );
      assert.ok(attributes[AttributeNames.DNS_ERROR_NAME]);
    });
  });
});
