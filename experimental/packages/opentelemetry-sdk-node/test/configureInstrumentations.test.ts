/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import { diag, DiagLogLevel } from '@opentelemetry/api';
import { InstrumentationBase } from '@opentelemetry/instrumentation';
import type {
  InstrumentationConfig,
  DeclarativeConfigProperties,
} from '@opentelemetry/instrumentation';
import type { ConfigurationModel } from '@opentelemetry/configuration';
import { configureInstrumentations } from '../src/utils';

interface HttpishConfig extends InstrumentationConfig {
  serverName?: string;
  capturedHeaders?: string[];
}

const HTTP = '@opentelemetry/instrumentation-http';

class FakeInstrumentation extends InstrumentationBase<HttpishConfig> {
  constructor(name: string, config: HttpishConfig = {}) {
    super(name, '1.0.0', config);
  }
  init() {}
}

// Maps a snake_case key from its own block and one key from general, to exercise
// the override path and confirm the wiring passes both blocks through.
class ReaderInstrumentation extends InstrumentationBase<HttpishConfig> {
  constructor(name: string, config: HttpishConfig = {}) {
    super(name, '1.0.0', config);
  }
  init() {}
  protected override readDeclarativeConfig(
    own: DeclarativeConfigProperties,
    general: DeclarativeConfigProperties
  ): Partial<HttpishConfig> {
    return {
      enabled: own.getBoolean('enabled'),
      serverName: own.getString('server_name'),
      capturedHeaders: general.getStringArray('captured_headers'),
    };
  }
}

function configWith(
  js: Record<string, object>,
  general?: Record<string, unknown>
): ConfigurationModel {
  return {
    disabled: false,
    log_level: 'info',
    'instrumentation/development': { js, general },
  } as ConfigurationModel;
}

describe('configureInstrumentations', function () {
  let warn: sinon.SinonStub;

  beforeEach(function () {
    warn = sinon.stub();
    diag.setLogger(
      {
        verbose: () => {},
        debug: () => {},
        info: () => {},
        warn,
        error: () => {},
      },
      DiagLogLevel.WARN
    );
  });

  afterEach(function () {
    diag.disable();
    sinon.restore();
  });

  it('returns all instrumentations when there is no instrumentation/development config', function () {
    const inst = new FakeInstrumentation(HTTP);
    assert.deepStrictEqual(
      configureInstrumentations({} as ConfigurationModel, [inst]),
      [inst]
    );
  });

  it('leaves an instrumentation with no matching block untouched', function () {
    const inst = new FakeInstrumentation(HTTP);
    const disableSpy = sinon.spy(inst, 'disable');
    const toRegister = configureInstrumentations(
      configWith({ '@opentelemetry/instrumentation-express': {} }),
      [inst]
    );
    assert.deepStrictEqual(toRegister, [inst]);
    sinon.assert.notCalled(disableSpy);
  });

  it('disables and drops an instrumentation set enabled: false', function () {
    const inst = new FakeInstrumentation(HTTP);
    const toRegister = configureInstrumentations(
      configWith({ [HTTP]: { enabled: false } }),
      [inst]
    );
    assert.deepStrictEqual(toRegister, []);
    assert.strictEqual(inst.getConfig().enabled, false);
  });

  it('enables an instrumentation set enabled: true that was constructed disabled', function () {
    const inst = new FakeInstrumentation(HTTP, { enabled: false });
    const toRegister = configureInstrumentations(
      configWith({ [HTTP]: { enabled: true } }),
      [inst]
    );
    assert.deepStrictEqual(toRegister, [inst]);
    assert.strictEqual(inst.getConfig().enabled, true);
  });

  it('default reader ignores and warns about keys it does not read', function () {
    const inst = new FakeInstrumentation(HTTP);
    configureInstrumentations(configWith({ [HTTP]: { server_name: 'x' } }), [
      inst,
    ]);
    assert.strictEqual(inst.getConfig().serverName, undefined);
    sinon.assert.calledOnce(warn);
    assert.match(warn.firstCall.args.join(' '), /not supported.*server_name/);
  });

  it('applies fields mapped by an overridden reader', function () {
    const inst = new ReaderInstrumentation(HTTP);
    const toRegister = configureInstrumentations(
      configWith({ [HTTP]: { server_name: 'my-server' } }),
      [inst]
    );
    assert.deepStrictEqual(toRegister, [inst]);
    assert.strictEqual(inst.getConfig().serverName, 'my-server');
    sinon.assert.notCalled(warn);
  });

  it('passes the general block to the reader', function () {
    const inst = new ReaderInstrumentation(HTTP);
    configureInstrumentations(
      configWith({ [HTTP]: {} }, { captured_headers: ['x-req-id'] }),
      [inst]
    );
    assert.deepStrictEqual(inst.getConfig().capturedHeaders, ['x-req-id']);
  });
});
