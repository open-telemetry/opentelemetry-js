/**
 * Browser stub for Node's assert module.
 * Re-exports Chai's assert API which is already bundled with Vitest.
 * This avoids needing vite-plugin-node-polyfills just for assert.
 */
import { assert } from 'chai';

// Named exports matching Node's assert API
export const {
  ok,
  fail,
  strictEqual,
  notStrictEqual,
  deepStrictEqual,
  deepEqual,
  notDeepEqual,
  equal,
  notEqual,
  throws,
  doesNotThrow,
  ifError,
  match,
  doesNotMatch,
} = assert;

// Chai's notDeepEqual is equivalent to Node's notDeepStrictEqual
export const notDeepStrictEqual = assert.notDeepEqual;

/**
 * Assert that a promise rejects.
 * Implements Node.js assert.rejects() API.
 */
export async function rejects(asyncFn, error, message) {
  let threw = false;
  let actualError;
  try {
    await (typeof asyncFn === 'function' ? asyncFn() : asyncFn);
  } catch (e) {
    threw = true;
    actualError = e;
  }
  if (!threw) {
    assert.fail(message || 'Expected promise to reject');
  }
  if (error) {
    if (error instanceof RegExp) {
      assert.match(String(actualError?.message || actualError), error, message);
    } else if (typeof error === 'function') {
      if (error.prototype !== undefined) {
        assert.instanceOf(actualError, error, message);
      } else {
        error(actualError);
      }
    } else if (typeof error === 'object') {
      for (const key of Object.keys(error)) {
        assert.deepEqual(actualError[key], error[key], message);
      }
    }
  }
}

/**
 * Assert that a promise does not reject.
 * Implements Node.js assert.doesNotReject() API.
 */
export async function doesNotReject(asyncFn, error, message) {
  try {
    await (typeof asyncFn === 'function' ? asyncFn() : asyncFn);
  } catch (e) {
    assert.fail(message || `Promise rejected unexpectedly: ${e}`);
  }
}

// Default export must be callable: `assert(value)` delegates to `assert.ok(value)`
function assertFn(value, message) {
  assert.ok(value, message);
}

Object.assign(assertFn, assert, {
  rejects,
  doesNotReject,
  notDeepStrictEqual: assert.notDeepEqual,
});

// Default export for: import assert from 'assert'
export default assertFn;
