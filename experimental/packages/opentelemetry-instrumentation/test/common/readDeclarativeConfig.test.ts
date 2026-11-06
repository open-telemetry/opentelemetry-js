/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { readDeclarativeConfig } from '../../src';
import type { ConfigProvider } from '@opentelemetry/api-config';

interface TestCfg {
  serverName?: string;
  requireParent?: boolean;
  maxLen?: number;
  ports?: number[];
  flags?: boolean[];
  headersToSpanAttributes?: {
    client?: { requestHeaders?: string[]; responseHeaders?: string[] };
    server?: { requestHeaders?: string[]; responseHeaders?: string[] };
  };
}

describe('readDeclarativeConfig', function () {
  let warnings: string[];
  const diag = {
    verbose: () => {},
    debug: () => {},
    info: () => {},
    warn: (m: string) => warnings.push(m),
    error: () => {},
  };

  // A provider over in-memory blocks. `own` is keyed by instrumentation name.
  function provider(
    own: Record<string, Record<string, unknown>> = {},
    general: Record<string, unknown> = {}
  ): ConfigProvider {
    return {
      getInstrumentationConfig: (name?: string) =>
        name === undefined ? { js: own, general } : (own[name] ?? {}),
      getGeneralInstrumentationConfig: () => general,
    };
  }

  beforeEach(function () {
    warnings = [];
  });

  it('maps own-block keys onto config fields', function () {
    const config = readDeclarativeConfig({
      configProvider: provider({
        '@otel/test': { server_name: 'srv', require_parent: true },
      }),
      instrumentationName: '@otel/test',
      reader: (own): Partial<TestCfg> => ({
        serverName: own.getString('server_name'),
        requireParent: own.getBoolean('require_parent'),
      }),
      diag,
    });
    assert.deepStrictEqual(config, { serverName: 'srv', requireParent: true });
    assert.deepStrictEqual(warnings, []);
  });

  it('omits keys absent from the config', function () {
    const config = readDeclarativeConfig({
      configProvider: provider({ '@otel/test': {} }),
      instrumentationName: '@otel/test',
      reader: (own): Partial<TestCfg> => ({
        serverName: own.getString('server_name'),
      }),
      diag,
    });
    assert.deepStrictEqual(config, {});
    assert.deepStrictEqual(warnings, []);
  });

  it('warns and skips on a type mismatch', function () {
    const config = readDeclarativeConfig({
      configProvider: provider({ '@otel/test': { server_name: 42 } }),
      instrumentationName: '@otel/test',
      reader: (own): Partial<TestCfg> => ({
        serverName: own.getString('server_name'),
      }),
      diag,
    });
    assert.deepStrictEqual(config, {});
    assert.strictEqual(warnings.length, 1);
    assert.match(warnings[0], /expected "string", got "number"/);
  });

  it('reads a dotted source path into a nested field', function () {
    const config = readDeclarativeConfig({
      configProvider: provider(
        {},
        { http: { client: { request_captured_headers: ['a', 'b'] } } }
      ),
      instrumentationName: '@otel/test',
      reader: (_own, general): Partial<TestCfg> => ({
        headersToSpanAttributes: {
          client: {
            requestHeaders: general.getStringArray(
              'http.client.request_captured_headers'
            ),
          },
        },
      }),
      diag,
    });
    assert.deepStrictEqual(config, {
      headersToSpanAttributes: { client: { requestHeaders: ['a', 'b'] } },
    });
    assert.deepStrictEqual(warnings, []);
  });

  it('warns about own-block keys the reader did not read', function () {
    readDeclarativeConfig({
      configProvider: provider({
        '@otel/test': { server_name: 'srv', typo_key: 1 },
      }),
      instrumentationName: '@otel/test',
      reader: (own): Partial<TestCfg> => ({
        serverName: own.getString('server_name'),
      }),
      diag,
    });
    assert.strictEqual(warnings.length, 1);
    assert.match(warnings[0], /unhandled.*typo_key/);
  });

  it('treats an explicit null as unset, without warning', function () {
    const config = readDeclarativeConfig({
      configProvider: provider({
        '@otel/test': { server_name: null, require_parent: null },
      }),
      instrumentationName: '@otel/test',
      reader: (own): Partial<TestCfg> => ({
        serverName: own.getString('server_name'),
        requireParent: own.getBoolean('require_parent'),
      }),
      diag,
    });
    assert.deepStrictEqual(config, {});
    assert.deepStrictEqual(warnings, []);
  });

  it('treats an explicit null in the general block as unset', function () {
    const config = readDeclarativeConfig({
      configProvider: provider(
        {},
        { http: { client: { request_captured_headers: null } } }
      ),
      instrumentationName: '@otel/test',
      reader: (_own, general): Partial<TestCfg> => ({
        headersToSpanAttributes: {
          client: {
            requestHeaders: general.getStringArray(
              'http.client.request_captured_headers'
            ),
          },
        },
      }),
      diag,
    });
    assert.deepStrictEqual(config, {});
    assert.deepStrictEqual(warnings, []);
  });

  it('does not report general-block keys outside its declared domains', function () {
    readDeclarativeConfig({
      configProvider: provider(
        {},
        {
          http: { client: { request_captured_headers: ['a'] } },
          db: { statement_sanitizer: true },
        }
      ),
      instrumentationName: '@otel/test',
      generalDomains: ['http'],
      reader: (_own, general): Partial<TestCfg> => ({
        headersToSpanAttributes: {
          client: {
            requestHeaders: general.getStringArray(
              'http.client.request_captured_headers'
            ),
          },
        },
      }),
      diag,
    });
    assert.deepStrictEqual(warnings, []);
  });

  it('reports unmapped keys inside its declared general domains', function () {
    readDeclarativeConfig({
      configProvider: provider(
        {},
        {
          http: { client: { known_methods: ['GET'] } },
          db: { statement_sanitizer: true },
        }
      ),
      instrumentationName: '@otel/test',
      generalDomains: ['http'],
      reader: (): Partial<TestCfg> => ({}),
      diag,
    });
    assert.strictEqual(warnings.length, 1);
    assert.match(warnings[0], /unhandled.*http\.client\.known_methods/);
    assert.doesNotMatch(warnings[0], /statement_sanitizer/);
  });

  it('reports no general-block keys when no domains are declared', function () {
    readDeclarativeConfig({
      configProvider: provider({}, { db: { statement_sanitizer: true } }),
      instrumentationName: '@otel/test',
      reader: (): Partial<TestCfg> => ({}),
      diag,
    });
    assert.deepStrictEqual(warnings, []);
  });

  it('maps number, number[] and boolean[] properties', function () {
    const config = readDeclarativeConfig({
      configProvider: provider({
        '@otel/test': {
          max_len: 128,
          ports: [80, 443],
          flags: [true, false],
        },
      }),
      instrumentationName: '@otel/test',
      reader: (own): Partial<TestCfg> => ({
        maxLen: own.getNumber('max_len'),
        ports: own.getNumberArray('ports'),
        flags: own.getBooleanArray('flags'),
      }),
      diag,
    });
    assert.deepStrictEqual(config, {
      maxLen: 128,
      ports: [80, 443],
      flags: [true, false],
    });
    assert.deepStrictEqual(warnings, []);
  });

  it('rejects NaN for number properties', function () {
    const config = readDeclarativeConfig({
      configProvider: provider({ '@otel/test': { max_len: NaN } }),
      instrumentationName: '@otel/test',
      reader: (own): Partial<TestCfg> => ({
        maxLen: own.getNumber('max_len'),
      }),
      diag,
    });
    assert.deepStrictEqual(config, {});
    assert.strictEqual(warnings.length, 1);
    assert.match(warnings[0], /expected "number", got "number"/);
  });

  it('warns when an array element has the wrong type', function () {
    const config = readDeclarativeConfig({
      configProvider: provider({
        '@otel/test': { ports: [80, '443'], flags: [true, 1] },
      }),
      instrumentationName: '@otel/test',
      reader: (own): Partial<TestCfg> => ({
        ports: own.getNumberArray('ports'),
        flags: own.getBooleanArray('flags'),
      }),
      diag,
    });
    assert.deepStrictEqual(config, {});
    assert.strictEqual(warnings.length, 2);
    assert.match(warnings[0], /expected array of numbers/);
    assert.match(warnings[1], /expected array of booleans/);
  });

  it('keeps sibling branches of the current config when merging nested fields', function () {
    const config = readDeclarativeConfig({
      configProvider: provider(
        {},
        { http: { client: { request_captured_headers: ['from-yaml'] } } }
      ),
      instrumentationName: '@otel/test',
      reader: (_own, general): Partial<TestCfg> => ({
        headersToSpanAttributes: {
          client: {
            requestHeaders: general.getStringArray(
              'http.client.request_captured_headers'
            ),
          },
        },
      }),
      currentConfig: {
        headersToSpanAttributes: {
          client: { responseHeaders: ['in-code-resp'] },
          server: { requestHeaders: ['in-code-server'] },
        },
      },
      diag,
    });
    assert.deepStrictEqual(config, {
      headersToSpanAttributes: {
        client: {
          responseHeaders: ['in-code-resp'],
          requestHeaders: ['from-yaml'],
        },
        server: { requestHeaders: ['in-code-server'] },
      },
    });
  });

  it('does not mutate the current config while merging', function () {
    const currentConfig = {
      headersToSpanAttributes: { server: { requestHeaders: ['keep'] } },
    };
    readDeclarativeConfig({
      configProvider: provider(
        {},
        { http: { client: { request_captured_headers: ['a'] } } }
      ),
      instrumentationName: '@otel/test',
      reader: (_own, general): Partial<TestCfg> => ({
        headersToSpanAttributes: {
          client: {
            requestHeaders: general.getStringArray(
              'http.client.request_captured_headers'
            ),
          },
        },
      }),
      currentConfig,
      diag,
    });
    assert.deepStrictEqual(currentConfig, {
      headersToSpanAttributes: { server: { requestHeaders: ['keep'] } },
    });
  });

  it('catches a throwing reader and warns, without applying config', function () {
    const config = readDeclarativeConfig({
      configProvider: provider({ '@otel/test': { server_name: 'srv' } }),
      instrumentationName: '@otel/test',
      reader: (): Partial<TestCfg> => {
        throw new Error('boom');
      },
      diag,
    });
    assert.deepStrictEqual(config, {});
    assert.strictEqual(warnings.length, 1);
    assert.match(warnings[0], /error reading declarative config.*boom/);
  });

  it('returns an empty object when nothing is declared', function () {
    const config = readDeclarativeConfig({
      configProvider: provider({}, {}),
      instrumentationName: '@otel/test',
      reader: (own): Partial<TestCfg> => ({
        serverName: own.getString('server_name'),
      }),
      diag,
    });
    assert.deepStrictEqual(config, {});
    assert.deepStrictEqual(warnings, []);
  });
});
