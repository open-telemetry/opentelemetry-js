/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Simple Node.js v8 compatibility smoke test. Intentionally avoids dependencies
 * so that we can keep updating tooling used for unit and integration tests.
 *
 * Intended to be run directly with node node8-compat.js
 */

const assert = require('assert');

const GLOBAL_API_SYMBOL = Symbol.for('opentelemetry.js.api.1');

function clearGlobal() {
  delete global[GLOBAL_API_SYMBOL];
}

function freshApi() {
  // Evict every cached module so each call returns a brand-new instance.
  Object.keys(require.cache).forEach(function (key) {
    delete require.cache[key];
  });
  return require('../../dist/index.cjs');
}

// Test 1: test global registration (the global used must exist)
clearGlobal();
const api = freshApi();

// this will throw or return false if registration fails.
const result = api.diag.setLogger(
  new api.DiagConsoleLogger(),
  api.DiagLogLevel.ALL
);
assert.strictEqual(
  result,
  true,
  'Test 1 failed: diag.setLogger should return true'
);

// Test 2: test that multiple loads share the same global state (e.g. logger)
clearGlobal();

const api1 = freshApi();
const api2 = freshApi(); // fresh load – different module object, same _global

const infoMessages = [];
const sharedLogger = {
  error: function () {},
  warn: function () {},
  info: function (msg) {
    infoMessages.push(msg);
  },
  debug: function () {},
  verbose: function () {},
};

const ok = api1.diag.setLogger(sharedLogger, api1.DiagLogLevel.ALL);
assert.strictEqual(
  ok,
  true,
  'Test 2 setup failed: api1.diag.setLogger should return true'
);

api2.diag.info('shared-state-check');
assert.strictEqual(
  infoMessages.length,
  1,
  'Test 2 failed: api2 should forward logs to the logger registered via api1'
);
assert.strictEqual(
  infoMessages[0],
  'shared-state-check',
  'Test 2 failed: unexpected log message received'
);

// clean-up
clearGlobal();
