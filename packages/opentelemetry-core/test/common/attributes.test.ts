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

import { diag } from '@opentelemetry/api';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import * as assert from 'assert';
import * as sinon from 'sinon';
import {
  isAttributeValue,
  sanitizeAttribute,
  sanitizeAttributes,
} from '../../src/common/attributes';

describe('attributes', () => {
  const warnStub = sinon.fake();

  beforeEach(() => {
    diag.setLogger({
      warn: warnStub,
    } as any);

    // diag.warn is used when the logger is set
    warnStub.resetHistory();
  });

  describe('#isAttributeValue', () => {
    it('should allow primitive values', () => {
      assert.ok(isAttributeValue(0));
      assert.ok(isAttributeValue(true));
      assert.ok(isAttributeValue('str'));
    });

    it('should allow nullish values', () => {
      assert.ok(isAttributeValue(null));
      assert.ok(isAttributeValue(undefined));
      // @ts-expect-error verify that no arg works
      assert.ok(isAttributeValue());
    });

    it('should not allow objects', () => {
      assert.ok(!isAttributeValue({}));
    });

    it('should allow homogeneous arrays', () => {
      assert.ok(isAttributeValue([]));
      assert.ok(isAttributeValue([0, 1, 2]));
      assert.ok(isAttributeValue([true, false, true]));
      assert.ok(isAttributeValue(['str1', 'str2', 'str3']));
    });

    it('should allow homogeneous arrays with null values', () => {
      assert.ok(isAttributeValue([null]));
      assert.ok(isAttributeValue([0, null, 2]));
      assert.ok(isAttributeValue([true, null, true]));
      assert.ok(isAttributeValue(['str1', undefined, 'str3']));
    });

    it('should not allow heterogeneous arrays', () => {
      assert.ok(!isAttributeValue([0, false, 2]));
      assert.ok(!isAttributeValue([true, 'false', true]));
      assert.ok(!isAttributeValue(['str1', 2, 'str3']));
    });

    it('should not allow arrays of objects or nested arrays', () => {
      assert.ok(!isAttributeValue([{}]));
      assert.ok(!isAttributeValue([[]]));
    });
  });
  describe('#sanitize', () => {
    it('should remove invalid fields', () => {
      const attributes = sanitizeAttributes({
        str: 'string',
        num: 0,
        bool: false,
        object: {},
        arrStr: ['str1', null, 'str2'],
        arrNum: [0, null, 1],
        arrBool: [false, undefined, true],
        mixedArr: [0, false],
      });

      assert.deepStrictEqual(attributes, {
        str: 'string',
        num: 0,
        bool: false,
        arrStr: ['str1', null, 'str2'],
        arrNum: [0, null, 1],
        arrBool: [false, undefined, true],
      });
    });

    it('should copy the input', () => {
      const inp = {
        str: 'unmodified',
        arr: ['unmodified'],
      };

      const attributes = sanitizeAttributes(inp);

      inp.str = 'modified';
      inp.arr[0] = 'modified';

      assert.strictEqual(attributes.str, 'unmodified');
      assert.ok(Array.isArray(attributes.arr));
      assert.strictEqual(attributes.arr[0], 'unmodified');
    });

    describe('value sanitizers', () => {
      describe('http.url', () => {
        it('should remove username and password from the url', () => {
          const out = sanitizeAttribute(
            SemanticAttributes.HTTP_URL,
            'http://user:pass@host:9000/path?query#fragment'
          );

          assert.strictEqual(out, 'http://host:9000/path?query#fragment');
          assert.ok(warnStub.notCalled, 'should not log warning');
        });

        it('should return the same url', () => {
          const out = sanitizeAttribute(
            SemanticAttributes.HTTP_URL,
            'http://host:9000/path?query#fragment'
          );

          assert.strictEqual(out, 'http://host:9000/path?query#fragment');
          assert.ok(warnStub.notCalled, 'should not log warning');
        });

        it('should return the input string when the value is not a valid url', () => {
          const out = sanitizeAttribute(
            SemanticAttributes.HTTP_URL,
            'invalid url'
          );

          assert.strictEqual(out, 'invalid url');
          assert.ok(
            warnStub.calledWithExactly(
              `Invalid attribute value set for key: ${SemanticAttributes.HTTP_URL}. Unable to sanitize invalid URL.`
            )
          );
        });

        it('should return the input when the value is a number', () => {
          const out = sanitizeAttribute(SemanticAttributes.HTTP_URL, 27);

          assert.strictEqual(out, 27);
          assert.ok(
            warnStub.calledWithExactly(
              `Invalid attribute value set for key: ${SemanticAttributes.HTTP_URL}. Unable to sanitize number value.`
            )
          );
        });

        it('should return the input when the value is boolean', () => {
          const out = sanitizeAttribute(SemanticAttributes.HTTP_URL, false);

          assert.strictEqual(out, false);
          assert.ok(
            warnStub.calledWithExactly(
              `Invalid attribute value set for key: ${SemanticAttributes.HTTP_URL}. Unable to sanitize boolean value.`
            )
          );
        });

        it('should return the input when an array is supplied', () => {
          const out = sanitizeAttribute(SemanticAttributes.HTTP_URL, [
            'http://host/path?query#fragment',
          ]);

          assert.deepStrictEqual(out, ['http://host/path?query#fragment']);
          assert.ok(
            warnStub.calledWithExactly(
              `Invalid attribute value set for key: ${SemanticAttributes.HTTP_URL}. Unable to sanitize array value.`
            )
          );
        });
      });
    });
  });
});
