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
import {
  getStringFromEnv,
  getNumberFromEnv,
  getStringListFromEnv,
  getBooleanFromEnv,
} from '../../src';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { diag } from '@opentelemetry/api';

describe('environment utility functions', function () {
  describe('getStringFromEnv', function () {
    afterEach(function () {
      delete process.env.FOO;
    });

    it('should treat empty string as undefined', function () {
      process.env.FOO = '';
      assert.strictEqual(getStringFromEnv('FOO'), undefined);
      process.env.FOO = '   ';
      assert.strictEqual(getStringFromEnv('FOO'), undefined);
    });

    it('should treat not defined as undefined', function () {
      delete process.env.FOO;
      assert.strictEqual(getStringFromEnv('FOO'), undefined);
    });

    it('should not trim extra whitespace', function () {
      process.env.FOO = 'test-string  ';
      assert.strictEqual(getStringFromEnv('FOO'), 'test-string  ');
      process.env.FOO = '  test-string';
      assert.strictEqual(getStringFromEnv('FOO'), '  test-string');
      process.env.FOO = '  test-string   ';
      assert.strictEqual(getStringFromEnv('FOO'), '  test-string   ');
    });

    it('should extract string from env var', function () {
      process.env.FOO = 'test-string';
      assert.strictEqual(getStringFromEnv('FOO'), 'test-string');
    });

    it('should retain casing', function () {
      process.env.FOO = 'TeSt StRINg';
      assert.strictEqual(getStringFromEnv('FOO'), 'TeSt StRINg');
    });
  });

  describe('getNumberFromEnv', function () {
    afterEach(function () {
      delete process.env.FOO;
      sinon.restore();
    });

    it('should treat empty string as undefined', function () {
      process.env.FOO = '';
      assert.strictEqual(getNumberFromEnv('FOO'), undefined);
      process.env.FOO = '   ';
      assert.strictEqual(getNumberFromEnv('FOO'), undefined);
    });

    it('should treat not defined as undefined', function () {
      delete process.env.FOO;
      assert.strictEqual(getNumberFromEnv('FOO'), undefined);
    });

    it('should trim extra whitespace', function () {
      process.env.FOO = '1.234  ';
      assert.strictEqual(getNumberFromEnv('FOO'), 1.234);
      process.env.FOO = '  1.234';
      assert.strictEqual(getNumberFromEnv('FOO'), 1.234);
      process.env.FOO = '  1.234   ';
      assert.strictEqual(getNumberFromEnv('FOO'), 1.234);
    });

    it('should extract integer from env var', function () {
      process.env.FOO = String(42);
      assert.strictEqual(getNumberFromEnv('FOO'), 42);
    });

    it('should extract double from env var', function () {
      process.env.FOO = String(1.234);
      assert.strictEqual(getNumberFromEnv('FOO'), 1.234);
    });

    it('should extract infinity from env var', function () {
      process.env.FOO = String(Infinity);
      assert.strictEqual(getNumberFromEnv('FOO'), Infinity);
    });

    it('should treat NaN as undefined', function () {
      process.env.FOO = String(NaN);
      assert.strictEqual(getNumberFromEnv('FOO'), undefined);
    });

    it('should ignore bogus data and warn', function () {
      const warnStub = sinon.stub(diag, 'warn');
      process.env.FOO = 'forty-two';
      assert.strictEqual(getNumberFromEnv('FOO'), undefined);
      sinon.assert.calledOnceWithMatch(warnStub, 'Unknown value');
    });
  });

  describe('getStringListFromEnv', function () {
    afterEach(function () {
      delete process.env.FOO;
    });

    it('should treat empty string as undefined', function () {
      process.env.FOO = '';
      assert.strictEqual(getStringListFromEnv('FOO'), undefined);
    });

    it('should treat not defined as undefined', function () {
      delete process.env.FOO;
      assert.strictEqual(getStringListFromEnv('FOO'), undefined);
    });

    it('should trim extra whitespace', function () {
      process.env.FOO = '  foo, bar,   ';
      assert.deepStrictEqual(getStringListFromEnv('FOO'), ['foo', 'bar']);
    });

    it('should extract list from env var', function () {
      process.env.FOO = 'foo,bar,baz';
      assert.deepStrictEqual(getStringListFromEnv('FOO'), [
        'foo',
        'bar',
        'baz',
      ]);
    });

    it('should skip empty entries', function () {
      process.env.FOO = '  ,undefined,,null, ,empty,';
      assert.deepStrictEqual(getStringListFromEnv('FOO'), [
        'undefined',
        'null',
        'empty',
      ]);
    });

    it('should retain casing', function () {
      process.env.FOO = 'fOo,BaR';
      assert.deepStrictEqual(getStringListFromEnv('FOO'), ['fOo', 'BaR']);
    });
  });

  describe('getBooleanFromEnv', function () {
    afterEach(function () {
      delete process.env.FOO;
      sinon.restore();
    });

    it('should treat empty string as false', function () {
      process.env.FOO = '';
      assert.strictEqual(getBooleanFromEnv('FOO'), false);

      process.env.FOO = '  ';
      assert.strictEqual(getBooleanFromEnv('FOO'), false);
    });

    it('should treat not defined as false', function () {
      delete process.env.FOO;
      assert.strictEqual(getBooleanFromEnv('FOO'), false);
    });

    it('should trim extra whitespace', function () {
      process.env.FOO = '  true';
      assert.strictEqual(getBooleanFromEnv('FOO'), true);
      process.env.FOO = 'false   ';
      assert.strictEqual(getBooleanFromEnv('FOO'), false);
      process.env.FOO = ' true ';
      assert.strictEqual(getBooleanFromEnv('FOO'), true);
    });

    it('should ignore casing', function () {
      process.env.FOO = 'tRUe';
      assert.strictEqual(getBooleanFromEnv('FOO'), true);
      process.env.FOO = 'TRUE';
      assert.strictEqual(getBooleanFromEnv('FOO'), true);
      process.env.FOO = 'FaLsE';
      assert.strictEqual(getBooleanFromEnv('FOO'), false);
    });

    it('should ignore bogus data and warn', function () {
      const warnStub = sinon.stub(diag, 'warn');
      process.env.FOO = 'trueFALSE';
      assert.strictEqual(getBooleanFromEnv('FOO'), false);
      sinon.assert.calledOnceWithMatch(warnStub, 'Unknown value');
    });
  });
});
