/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import type {
  ConfigurationModel,
  ExperimentalGeneralInstrumentationConfigModel,
  ExperimentalInstrumentationConfigModel,
} from '../src';
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
    const node =
      provider.getInstrumentationConfig() as ExperimentalInstrumentationConfigModel;
    assert.deepStrictEqual(Object.keys(node), ['general', 'js']);
  });

  it('returns a single instrumentation node by name', () => {
    const provider = createConfigProvider(model);
    const http = provider.getInstrumentationConfig(
      '@opentelemetry/instrumentation-http'
    ) as any;
    assert.strictEqual(typeof http, 'object');
    assert.strictEqual(http.enabled, false);
    assert.strictEqual(http.server_name, 'example');
  });

  it('returns the general block', () => {
    const provider = createConfigProvider(model);
    const general =
      provider.getGeneralInstrumentationConfig() as ExperimentalGeneralInstrumentationConfigModel;
    const headers = general?.http?.client?.request_captured_headers;
    assert.deepStrictEqual(headers, ['content-type']);
  });

  it('returns empty ConfigProperties for an instrumentation scope name with no config node', () => {
    const provider = createConfigProvider(model);
    const config = provider.getInstrumentationConfig('no-config-for-instr');
    assert.deepStrictEqual(config, {});
  });

  it('returns empty ConfigProperties when the node is absent', () => {
    const provider = createConfigProvider({} as ConfigurationModel);
    assert.deepStrictEqual(provider.getInstrumentationConfig(), {});
    assert.deepStrictEqual(provider.getInstrumentationConfig('aName'), {});
    assert.deepStrictEqual(provider.getGeneralInstrumentationConfig(), {});
  });

  it('treats a non-mapping instrumentation node as absent', function () {
    const provider = createConfigProvider({
      'instrumentation/development': {
        js: {
          '@otel/a-string': 'oops',
          '@otel/an-array': ['oops'],
          '@otel/a-null': null,
        },
      },
    } as unknown as ConfigurationModel);

    assert.deepStrictEqual(
      provider.getInstrumentationConfig('@otel/a-string'),
      {}
    );
    assert.deepStrictEqual(
      provider.getInstrumentationConfig('@otel/an-array'),
      {}
    );
    assert.deepStrictEqual(
      provider.getInstrumentationConfig('@otel/a-null'),
      {}
    );
  });

  it('treats a non-mapping general node as absent', function () {
    const provider = createConfigProvider({
      'instrumentation/development': { general: 'oops' },
    } as unknown as ConfigurationModel);

    assert.deepStrictEqual(provider.getGeneralInstrumentationConfig(), {});
  });
});
