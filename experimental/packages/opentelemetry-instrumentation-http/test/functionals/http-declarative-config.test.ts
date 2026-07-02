/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import { diag, DiagLogLevel } from '@opentelemetry/api';
import { config, createConfigProperties } from '@opentelemetry/api-config';
import type {
  ConfigProperties,
  ConfigProvider,
} from '@opentelemetry/api-config';
import { HttpInstrumentation } from '../../src/http';

// Register a global provider that serves `block` as the http instrumentation's
// own config.
function setHttpDeclarativeConfig(block: Record<string, unknown>): void {
  const provider: ConfigProvider = {
    getInstrumentationConfig(name?: string): ConfigProperties {
      return createConfigProperties(
        name === '@opentelemetry/instrumentation-http' ? block : undefined
      );
    },
    getGeneralInstrumentationConfig: () => createConfigProperties(undefined),
  };
  config.setGlobalConfigProvider(provider);
}

describe('HttpInstrumentation declarative config', function () {
  let warn: sinon.SinonStub;
  const created: HttpInstrumentation[] = [];
  function makeInstrumentation(
    config?: ConstructorParameters<typeof HttpInstrumentation>[0]
  ): HttpInstrumentation {
    const instrumentation = new HttpInstrumentation(config);
    created.push(instrumentation);
    return instrumentation;
  }

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
    created.forEach(instrumentation => instrumentation.disable());
    created.length = 0;
    config.disable();
    diag.disable();
    sinon.restore();
  });

  it('maps snake_case keys to config fields in the constructor', function () {
    setHttpDeclarativeConfig({
      require_parent_for_outgoing_spans: true,
      server_name: 'my-server',
      redacted_query_params: ['token', 'sig'],
      enable_synthetic_source_detection: true,
    });
    const config = makeInstrumentation().getConfig();

    assert.strictEqual(config.requireParentforOutgoingSpans, true);
    assert.strictEqual(config.serverName, 'my-server');
    assert.deepStrictEqual(config.redactedQueryParams, ['token', 'sig']);
    assert.strictEqual(config.enableSyntheticSourceDetection, true);
    sinon.assert.notCalled(warn);
  });

  it('does not read enabled (handled by the SDK registry)', function () {
    setHttpDeclarativeConfig({ enabled: false, server_name: 'x' });
    const instrumentation = makeInstrumentation();

    assert.strictEqual(instrumentation.getConfig().serverName, 'x');
    sinon.assert.notCalled(warn);
  });

  it('leaves unset fields at their constructor value', function () {
    setHttpDeclarativeConfig({ require_parent_for_incoming_spans: true });
    const config = makeInstrumentation({ serverName: 'keep-me' }).getConfig();

    assert.strictEqual(config.requireParentforIncomingSpans, true);
    assert.strictEqual(config.serverName, 'keep-me');
  });

  it('warns about an unrecognized key', function () {
    setHttpDeclarativeConfig({ server_name: 'x', not_a_real_key: true });
    const instrumentation = makeInstrumentation();

    assert.strictEqual(instrumentation.getConfig().serverName, 'x');
    sinon.assert.calledOnce(warn);
    assert.match(warn.firstCall.args.join(' '), /unrecognized.*not_a_real_key/);
  });

  it('warns on a type mismatch and keeps the default', function () {
    setHttpDeclarativeConfig({ require_parent_for_outgoing_spans: 'yes' });
    const instrumentation = makeInstrumentation();

    assert.strictEqual(
      instrumentation.getConfig().requireParentforOutgoingSpans,
      undefined
    );
    sinon.assert.calledOnce(warn);
    assert.match(
      warn.firstCall.args.join(' '),
      /require_parent_for_outgoing_spans.*expected boolean/
    );
  });
});
