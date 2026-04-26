/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { buildExceptionCauseChain } from '../../src/common/exception';

describe('exception', () => {
  describe('#buildExceptionCauseChain', () => {
    it('should return empty string when cause is undefined', () => {
      assert.strictEqual(buildExceptionCauseChain(undefined), '');
    });

    it('should return empty string when cause is null', () => {
      assert.strictEqual(buildExceptionCauseChain(null), '');
    });

    it('should return empty string when cause is a primitive', () => {
      assert.strictEqual(buildExceptionCauseChain('string cause'), '');
      assert.strictEqual(buildExceptionCauseChain(42), '');
    });

    it('should append cause stack when cause has a stack', () => {
      const cause = new Error('inner error');
      cause.stack = 'Error: inner error\n    at inner:1:1';
      const result = buildExceptionCauseChain(cause);
      assert.strictEqual(
        result,
        '\nCaused by: Error: inner error\n    at inner:1:1'
      );
    });

    it('should skip cause silently when cause has no stack', () => {
      const cause = { message: 'no stack here' };
      const result = buildExceptionCauseChain(cause);
      assert.strictEqual(result, '');
    });

    it('should walk a multi-level cause chain', () => {
      const root = new Error('root');
      root.stack = 'Error: root\n    at root:1:1';

      const mid = new Error('mid');
      mid.stack = 'Error: mid\n    at mid:1:1';
      (mid as any).cause = root;

      const result = buildExceptionCauseChain(mid);
      assert.strictEqual(
        result,
        '\nCaused by: Error: mid\n    at mid:1:1\nCaused by: Error: root\n    at root:1:1'
      );
    });

    it('should terminate on circular cause references without infinite loop', () => {
      const a: any = new Error('a');
      a.stack = 'Error: a\n    at a:1:1';
      const b: any = new Error('b');
      b.stack = 'Error: b\n    at b:1:1';
      a.cause = b;
      b.cause = a;

      const result = buildExceptionCauseChain(a);
      assert.strictEqual(
        result,
        '\nCaused by: Error: a\n    at a:1:1\nCaused by: Error: b\n    at b:1:1'
      );
    });
  });
});
