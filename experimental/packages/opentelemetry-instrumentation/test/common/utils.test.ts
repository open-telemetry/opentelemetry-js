/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import {
  isWrapped,
  safeExecuteInTheMiddle,
  safeExecuteInTheMiddleAsync,
} from '../../src';

describe('isWrapped', function () {
  describe('when function is wrapped', function () {
    it('should return true', function () {
      const obj: any = {
        wrapMe: function () {},
      };
      obj.wrapMe.__original = function () {};
      obj.wrapMe.__unwrap = function () {};
      obj.wrapMe.__wrapped = true;

      assert.deepStrictEqual(isWrapped(obj.wrapMe), true);
    });
  });
  describe('when function is NOT wrapped', function () {
    it('should return false', function () {
      const obj: any = {
        wrapMe: function () {},
      };
      obj.wrapMe.__unwrap = function () {};
      obj.wrapMe.__wrapped = true;

      assert.deepStrictEqual(isWrapped(obj.wrapMe), false);
    });
  });
});

describe('safeExecuteInTheMiddle', function () {
  it('should not throw error', function () {
    safeExecuteInTheMiddle(
      () => {
        return 'foo';
      },
      err => {
        assert.deepStrictEqual(err, undefined);
      },
      true
    );
  });
  it('should throw error', function () {
    const error = new Error('test');
    try {
      safeExecuteInTheMiddle(
        () => {
          throw error;
        },
        err => {
          assert.deepStrictEqual(error, err);
        }
      );
    } catch (err) {
      assert.deepStrictEqual(error, err);
    }
  });
  it('should return result', function () {
    const result = safeExecuteInTheMiddle(
      () => {
        return 1;
      },
      (err, result) => {
        assert.deepStrictEqual(err, undefined);
        assert.deepStrictEqual(result, 1);
      }
    );
    assert.deepStrictEqual(result, 1);
  });
});

describe('safeExecuteInTheMiddleAsync', function () {
  it('should not throw error', function (done) {
    safeExecuteInTheMiddleAsync(
      async () => {
        await new Promise(res => setTimeout(res, 1));
        return 'foo';
      },
      err => {
        assert.deepStrictEqual(err, undefined);
        done();
      },
      true
    );
  });
  it('should throw error', async function () {
    const error = new Error('test');
    try {
      await safeExecuteInTheMiddleAsync(
        async () => {
          await new Promise(res => setTimeout(res, 1));
          throw error;
        },
        err => {
          assert.deepStrictEqual(error, err);
        }
      );
    } catch (err) {
      assert.deepStrictEqual(error, err);
    }
  });
  it('should return result', async function () {
    const result = await safeExecuteInTheMiddleAsync(
      async () => {
        await new Promise(res => setTimeout(res, 1));
        return 1;
      },
      (err, result) => {
        assert.deepStrictEqual(err, undefined);
        assert.deepStrictEqual(result, 1);
      }
    );
    assert.deepStrictEqual(result, 1);
  });
  it('should wait for the error', async function () {
    const result = await Promise.race([
      safeExecuteInTheMiddleAsync(
        () => 1,
        async () => {
          await new Promise(res => setTimeout(res, 100));
        }
      ),
      new Promise(res => setTimeout(() => res('waited'), 10)),
    ]);

    assert.deepStrictEqual(result, 'waited');
  });
});
