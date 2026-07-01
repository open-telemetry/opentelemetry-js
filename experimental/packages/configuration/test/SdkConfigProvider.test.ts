/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import type { ConfigurationModel } from '../src';
import { createConfigProvider } from '../src/SdkConfigProvider';

const model: ConfigurationModel = {
  'instrumentation/development': {
    general: {
      http: {
        client: {
          request_captured_headers: ['content-type'],
        },
      },
    },
    js: {
      '@opentelemetry/instrumentation-http': {
        enabled: false,
        server_name: 'example',
      },
    },
  },
} as ConfigurationModel;

describe('SdkConfigProvider', () => {
  it('exposes the whole instrumentation/development node', () => {
    const provider = createConfigProvider(model);
    const node = provider.getInstrumentationConfig();
    assert.deepStrictEqual(node.getPropertyKeys().sort(), ['general', 'js']);
  });

  it('reads a single instrumentation block by name', () => {
    const provider = createConfigProvider(model);
    const http = provider.getInstrumentationConfig(
      '@opentelemetry/instrumentation-http'
    );
    assert.strictEqual(http.getBoolean('enabled'), false);
    assert.strictEqual(http.getString('server_name'), 'example');
  });

  it('reads the general block', () => {
    const provider = createConfigProvider(model);
    const headers = provider
      .getGeneralInstrumentationConfig()
      .getStructured('http')
      ?.getStructured('client')
      ?.getStringArray('request_captured_headers');
    assert.deepStrictEqual(headers, ['content-type']);
  });

  it('returns an empty accessor for an unknown instrumentation', () => {
    const provider = createConfigProvider(model);
    const unknown = provider.getInstrumentationConfig('does-not-exist');
    assert.deepStrictEqual(unknown.getPropertyKeys(), []);
    assert.strictEqual(unknown.getBoolean('enabled'), undefined);
  });

  it('returns empty accessors when the node is absent', () => {
    const provider = createConfigProvider({} as ConfigurationModel);
    assert.deepStrictEqual(
      provider.getInstrumentationConfig().getPropertyKeys(),
      []
    );
    assert.deepStrictEqual(
      provider.getInstrumentationConfig('anything').getPropertyKeys(),
      []
    );
    assert.deepStrictEqual(
      provider.getGeneralInstrumentationConfig().getPropertyKeys(),
      []
    );
  });
});
