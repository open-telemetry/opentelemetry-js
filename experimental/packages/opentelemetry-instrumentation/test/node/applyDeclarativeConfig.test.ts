/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import { diag, DiagLogLevel } from '@opentelemetry/api';
import { InstrumentationBase } from '../../src';
import type {
  InstrumentationConfig,
  DeclarativeConfigProperties,
} from '../../src';

interface TestConfig extends InstrumentationConfig {
  maxQueryLength?: number;
  redactedQueryParams?: string[];
}

class TestInstrumentation extends InstrumentationBase<TestConfig> {
  constructor(config: TestConfig = {}) {
    super('test-instrumentation', '1.0.0', config);
  }
  init() {}
}

// Overrides the reader to map a snake_case key through the typed accessor.
class ReaderInstrumentation extends InstrumentationBase<TestConfig> {
  constructor(config: TestConfig = {}) {
    super('reader-instrumentation', '1.0.0', config);
  }
  init() {}
  protected override readDeclarativeConfig(
    own: DeclarativeConfigProperties
  ): Partial<TestConfig> {
    return {
      enabled: own.getBoolean('enabled'),
      maxQueryLength: own.getNumber('max_query_length'),
    };
  }
}

// A reader that throws, to check the base isolates instrumentation bugs.
class ThrowingReaderInstrumentation extends InstrumentationBase<TestConfig> {
  constructor(config: TestConfig = {}) {
    super('throwing-instrumentation', '1.0.0', config);
  }
  init() {}
  protected override readDeclarativeConfig(): Partial<TestConfig> {
    throw new Error('boom');
  }
}

// Descends into a nested block, so the base's unread-key warning must recurse.
class NestedReaderInstrumentation extends InstrumentationBase<TestConfig> {
  constructor(config: TestConfig = {}) {
    super('nested-instrumentation', '1.0.0', config);
  }
  init() {}
  protected override readDeclarativeConfig(
    own: DeclarativeConfigProperties
  ): Partial<TestConfig> {
    own.getStructured('headers')?.getStringArray('request');
    return {};
  }
}

describe('InstrumentationBase declarative config', function () {
  let warn: sinon.SinonStub;
  let error: sinon.SinonStub;

  beforeEach(function () {
    warn = sinon.stub();
    error = sinon.stub();
    diag.setLogger(
      {
        verbose: () => {},
        debug: () => {},
        info: () => {},
        warn,
        error,
      },
      DiagLogLevel.WARN
    );
  });

  afterEach(function () {
    diag.disable();
    sinon.restore();
  });

  describe('default reader', function () {
    it('applies enabled from the block', function () {
      const instr = new TestInstrumentation({ enabled: true });
      instr.applyDeclarativeConfig({ enabled: false });
      assert.strictEqual(instr.getConfig().enabled, false);
    });

    it('keeps the existing value when enabled is absent', function () {
      const instr = new TestInstrumentation({ enabled: false });
      instr.applyDeclarativeConfig({});
      assert.strictEqual(instr.getConfig().enabled, false);
    });

    it('ignores a non-boolean enabled and keeps the existing value', function () {
      const instr = new TestInstrumentation({ enabled: true });
      instr.applyDeclarativeConfig({ enabled: 'yes' as unknown as boolean });
      assert.strictEqual(instr.getConfig().enabled, true);
    });

    it('warns about keys it has no reader for', function () {
      const instr = new TestInstrumentation();
      instr.applyDeclarativeConfig({ enabled: true, max_query_length: 100 });
      sinon.assert.calledOnce(warn);
      assert.match(
        warn.firstCall.args.join(' '),
        /not supported.*max_query_length/
      );
    });

    it('does not warn when only enabled is present', function () {
      const instr = new TestInstrumentation();
      instr.applyDeclarativeConfig({ enabled: true });
      sinon.assert.notCalled(warn);
    });

    it('does not clobber other config fields', function () {
      const instr = new TestInstrumentation({
        enabled: true,
        maxQueryLength: 50,
      });
      instr.applyDeclarativeConfig({ enabled: false });
      assert.strictEqual(instr.getConfig().enabled, false);
      assert.strictEqual(instr.getConfig().maxQueryLength, 50);
    });
  });

  describe('overridden reader', function () {
    it('applies mapped fields and leaves unset fields at their default', function () {
      const instr = new ReaderInstrumentation({
        enabled: true,
        redactedQueryParams: ['token'],
      });
      instr.applyDeclarativeConfig({ enabled: false, max_query_length: 200 });
      const config = instr.getConfig();
      assert.strictEqual(config.enabled, false);
      assert.strictEqual(config.maxQueryLength, 200);
      assert.deepStrictEqual(config.redactedQueryParams, ['token']);
    });

    it('keeps the default when the mapped key is absent', function () {
      const instr = new ReaderInstrumentation({ maxQueryLength: 50 });
      instr.applyDeclarativeConfig({ enabled: true });
      assert.strictEqual(instr.getConfig().maxQueryLength, 50);
    });

    it('does not warn for keys the override consumes', function () {
      const instr = new ReaderInstrumentation();
      instr.applyDeclarativeConfig({ max_query_length: 200 });
      sinon.assert.notCalled(warn);
    });

    it('warns "unrecognized" for a key the reader skips', function () {
      const instr = new ReaderInstrumentation();
      instr.applyDeclarativeConfig({ bogus_key: 1 });
      sinon.assert.calledOnce(warn);
      const message = warn.firstCall.args.join(' ');
      assert.match(message, /unrecognized.*bogus_key/);
      assert.doesNotMatch(message, /not supported/);
    });

    it('surfaces a nested unread key', function () {
      const instr = new NestedReaderInstrumentation();
      instr.applyDeclarativeConfig({ headers: { request: ['x'], typo: 1 } });
      sinon.assert.calledOnce(warn);
      assert.match(
        warn.firstCall.args.join(' '),
        /unrecognized.*headers\.typo/
      );
    });
  });

  describe('reader that throws', function () {
    it('is caught and logged, leaving the config unchanged', function () {
      const instr = new ThrowingReaderInstrumentation({ maxQueryLength: 50 });
      assert.doesNotThrow(() =>
        instr.applyDeclarativeConfig({ enabled: false, max_query_length: 200 })
      );
      sinon.assert.calledOnce(error);
      // Config is untouched: the throw aborts before setConfig.
      assert.strictEqual(instr.getConfig().enabled, true);
      assert.strictEqual(instr.getConfig().maxQueryLength, 50);
    });
  });
});
