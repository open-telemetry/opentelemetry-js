/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { InstrumentationBase } from '../../src/platform/browser';

// Module-level counters: the base constructor calls enable() before a
// subclass class field would be initialized, so a field would reset to 0.
let enableCalls = 0;
let disableCalls = 0;

class TestInstrumentation extends InstrumentationBase {
  override enable() {
    enableCalls++;
  }
  override disable() {
    disableCalls++;
  }
  init() {}
}

describe('InstrumentationBase#isEnabled (browser)', function () {
  beforeEach(function () {
    enableCalls = 0;
    disableCalls = 0;
  });

  it('is true after construction with the default config', function () {
    const instrumentation = new TestInstrumentation('test', '1.0.0', {});
    assert.strictEqual(instrumentation.isEnabled(), true);
    assert.strictEqual(enableCalls, 1);
  });

  it('is false when constructed with enabled: false', function () {
    const instrumentation = new TestInstrumentation('test', '1.0.0', {
      enabled: false,
    });
    assert.strictEqual(instrumentation.isEnabled(), false);
    assert.strictEqual(enableCalls, 0);
  });

  it('follows enable() and disable() while still calling the subclass', function () {
    const instrumentation = new TestInstrumentation('test', '1.0.0', {
      enabled: false,
    });
    instrumentation.enable();
    assert.strictEqual(instrumentation.isEnabled(), true);
    assert.strictEqual(enableCalls, 1);
    instrumentation.disable();
    assert.strictEqual(instrumentation.isEnabled(), false);
    assert.strictEqual(disableCalls, 1);
  });
});
