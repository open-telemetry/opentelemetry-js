/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { InstrumentationBase } from '../../src/platform/browser';

class TestInstrumentation extends InstrumentationBase {
  override enable() {
    this._enabled = true;
  }
  override disable() {
    this._enabled = false;
  }
  init() {}
}

class UntrackedInstrumentation extends InstrumentationBase {
  override enable() {}
  override disable() {}
  init() {}
}

describe('InstrumentationBase#isEnabled (browser)', function () {
  it('is true after construction with the default config', function () {
    const instrumentation = new TestInstrumentation('test', '1.0.0', {});
    assert.strictEqual(instrumentation.isEnabled(), true);
  });

  it('is false when constructed with enabled: false', function () {
    const instrumentation = new TestInstrumentation('test', '1.0.0', {
      enabled: false,
    });
    assert.strictEqual(instrumentation.isEnabled(), false);
  });

  it('follows the _enabled flag set by enable() and disable()', function () {
    const instrumentation = new TestInstrumentation('test', '1.0.0', {
      enabled: false,
    });
    instrumentation.enable();
    assert.strictEqual(instrumentation.isEnabled(), true);
    instrumentation.disable();
    assert.strictEqual(instrumentation.isEnabled(), false);
  });

  it('is false for a subclass that never sets _enabled', function () {
    const instrumentation = new UntrackedInstrumentation('test', '1.0.0', {});
    assert.strictEqual(instrumentation.isEnabled(), false);
  });

  it('keeps enable() and disable() on the prototype', function () {
    const instrumentation = new TestInstrumentation('test', '1.0.0', {});
    assert.ok(!Object.hasOwn(instrumentation, 'enable'));
    assert.ok(!Object.hasOwn(instrumentation, 'disable'));
  });
});
