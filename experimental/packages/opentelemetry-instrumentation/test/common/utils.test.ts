/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import {
  isWrapped,
  readConfigProperties,
  safeExecuteInTheMiddle,
  safeExecuteInTheMiddleAsync,
} from '../../src';
import type { ConfigProvider } from '@opentelemetry/api-config';

describe('isWrapped', function () {
  describe('when function is wrapped', function () {
    it('should return true', function () {
      const obj: any = {
        wrapMe: function () {},
      };
      obj.wrapMe.__original = function () {};
      obj.wrapMe.__unwrap = function () {};
      obj.wrapMe.__wrapped = true;

      assert.deepStrictEqual(isWrapped(obj.wrapMe), true);
    });
  });
  describe('when function is NOT wrapped', function () {
    it('should return false', function () {
      const obj: any = {
        wrapMe: function () {},
      };
      obj.wrapMe.__unwrap = function () {};
      obj.wrapMe.__wrapped = true;

      assert.deepStrictEqual(isWrapped(obj.wrapMe), false);
    });
  });
});

describe('safeExecuteInTheMiddle', function () {
  it('should not throw error', function () {
    safeExecuteInTheMiddle(
      () => {
        return 'foo';
      },
      err => {
        assert.deepStrictEqual(err, undefined);
      },
      true
    );
  });
  it('should throw error', function () {
    const error = new Error('test');
    try {
      safeExecuteInTheMiddle(
        () => {
          throw error;
        },
        err => {
          assert.deepStrictEqual(error, err);
        }
      );
    } catch (err) {
      assert.deepStrictEqual(error, err);
    }
  });
  it('should return result', function () {
    const result = safeExecuteInTheMiddle(
      () => {
        return 1;
      },
      (err, result) => {
        assert.deepStrictEqual(err, undefined);
        assert.deepStrictEqual(result, 1);
      }
    );
    assert.deepStrictEqual(result, 1);
  });
});

describe('safeExecuteInTheMiddleAsync', function () {
  it('should not throw error', function (done) {
    safeExecuteInTheMiddleAsync(
      async () => {
        await new Promise(res => setTimeout(res, 1));
        return 'foo';
      },
      err => {
        assert.deepStrictEqual(err, undefined);
        done();
      },
      true
    );
  });
  it('should throw error', async function () {
    const error = new Error('test');
    try {
      await safeExecuteInTheMiddleAsync(
        async () => {
          await new Promise(res => setTimeout(res, 1));
          throw error;
        },
        err => {
          assert.deepStrictEqual(error, err);
        }
      );
    } catch (err) {
      assert.deepStrictEqual(error, err);
    }
  });
  it('should return result', async function () {
    const result = await safeExecuteInTheMiddleAsync(
      async () => {
        await new Promise(res => setTimeout(res, 1));
        return 1;
      },
      (err, result) => {
        assert.deepStrictEqual(err, undefined);
        assert.deepStrictEqual(result, 1);
      }
    );
    assert.deepStrictEqual(result, 1);
  });
  it('should wait for the error', async function () {
    const result = await Promise.race([
      safeExecuteInTheMiddleAsync(
        () => 1,
        async () => {
          await new Promise(res => setTimeout(res, 100));
        }
      ),
      new Promise(res => setTimeout(() => res('waited'), 10)),
    ]);

    assert.deepStrictEqual(result, 'waited');
  });
});

describe('readConfigProperties', function () {
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
    const config = readConfigProperties({
      configProvider: provider({
        '@otel/test': { server_name: 'srv', require_parent: true },
      }),
      instrumentationName: '@otel/test',
      instrumentationProps: [
        ['server_name', 'string', 'serverName'],
        ['require_parent', 'boolean', 'requireParent'],
      ],
      diag,
    });
    assert.deepStrictEqual(config, { serverName: 'srv', requireParent: true });
    assert.deepStrictEqual(warnings, []);
  });

  it('omits keys absent from the config', function () {
    const config = readConfigProperties({
      configProvider: provider({ '@otel/test': {} }),
      instrumentationName: '@otel/test',
      instrumentationProps: [['server_name', 'string', 'serverName']],
      diag,
    });
    assert.deepStrictEqual(config, {});
    assert.deepStrictEqual(warnings, []);
  });

  it('warns and skips on a type mismatch', function () {
    const config = readConfigProperties({
      configProvider: provider({ '@otel/test': { server_name: 42 } }),
      instrumentationName: '@otel/test',
      instrumentationProps: [['server_name', 'string', 'serverName']],
      diag,
    });
    assert.deepStrictEqual(config, {});
    assert.strictEqual(warnings.length, 1);
    assert.match(warnings[0], /expected "string", got "number"/);
  });

  it('reads a dotted source path and writes a dotted target path', function () {
    const config = readConfigProperties({
      configProvider: provider(
        {},
        { http: { client: { request_captured_headers: ['a', 'b'] } } }
      ),
      generalProps: [
        [
          'http.client.request_captured_headers',
          'string[]',
          'headersToSpanAttributes.client.requestHeaders',
        ],
      ],
      diag,
    });
    assert.deepStrictEqual(config, {
      headersToSpanAttributes: { client: { requestHeaders: ['a', 'b'] } },
    });
    assert.deepStrictEqual(warnings, []);
  });

  it('warns about own-block keys no mapping consumed', function () {
    readConfigProperties({
      configProvider: provider({
        '@otel/test': { server_name: 'srv', typo_key: 1 },
      }),
      instrumentationName: '@otel/test',
      instrumentationProps: [['server_name', 'string', 'serverName']],
      diag,
    });
    assert.strictEqual(warnings.length, 1);
    assert.match(warnings[0], /unhandled.*typo_key/);
  });

  it('warns on an unsupported type tag', function () {
    const config = readConfigProperties({
      configProvider: provider({ '@otel/test': { port: 8080 } }),
      instrumentationName: '@otel/test',
      instrumentationProps: [['port', 'bogus', 'port']],
      diag,
    });
    assert.deepStrictEqual(config, {});
    assert.strictEqual(warnings.length, 1);
    assert.match(warnings[0], /unsupported declarative config type "bogus"/);
  });

  it('warns when the target path is not walkable', function () {
    const config = readConfigProperties({
      configProvider: provider({
        '@otel/test': { a: 'one', b: 'two' },
      }),
      instrumentationName: '@otel/test',
      // 'serverName' is set to a string first, so 'serverName.nested' cannot be
      // walked.
      instrumentationProps: [
        ['a', 'string', 'serverName'],
        ['b', 'string', 'serverName.nested'],
      ],
      diag,
    });
    assert.deepStrictEqual(config, { serverName: 'one' });
    assert.strictEqual(warnings.length, 1);
    assert.match(warnings[0], /invalid target path "serverName.nested"/);
  });

  it('treats an explicit null as unset, without warning', function () {
    const config = readConfigProperties({
      configProvider: provider({
        '@otel/test': { server_name: null, require_parent: null },
      }),
      instrumentationName: '@otel/test',
      instrumentationProps: [
        ['server_name', 'string', 'serverName'],
        ['require_parent', 'boolean', 'requireParent'],
      ],
      diag,
    });
    assert.deepStrictEqual(config, {});
    assert.deepStrictEqual(warnings, []);
  });

  it('treats an explicit null in the general block as unset', function () {
    const config = readConfigProperties({
      configProvider: provider(
        {},
        { http: { client: { request_captured_headers: null } } }
      ),
      generalProps: [
        [
          'http.client.request_captured_headers',
          'string[]',
          'headersToSpanAttributes.client.requestHeaders',
        ],
      ],
      diag,
    });
    assert.deepStrictEqual(config, {});
    assert.deepStrictEqual(warnings, []);
  });

  it('does not report general-block keys outside its declared domains', function () {
    readConfigProperties({
      configProvider: provider(
        {},
        {
          http: { client: { request_captured_headers: ['a'] } },
          db: { statement_sanitizer: true },
        }
      ),
      instrumentationName: '@otel/test',
      instrumentationProps: [],
      generalProps: [
        [
          'http.client.request_captured_headers',
          'string[]',
          'headersToSpanAttributes.client.requestHeaders',
        ],
      ],
      generalDomains: ['http'],
      diag,
    });
    assert.deepStrictEqual(warnings, []);
  });

  it('reports unmapped keys inside its declared general domains', function () {
    readConfigProperties({
      configProvider: provider(
        {},
        {
          http: { client: { known_methods: ['GET'] } },
          db: { statement_sanitizer: true },
        }
      ),
      instrumentationName: '@otel/test',
      instrumentationProps: [],
      generalProps: [],
      generalDomains: ['http'],
      diag,
    });
    assert.strictEqual(warnings.length, 1);
    assert.match(warnings[0], /unhandled.*http\.client\.known_methods/);
    assert.doesNotMatch(warnings[0], /statement_sanitizer/);
  });

  it('reports no general-block keys when no domains are declared', function () {
    readConfigProperties({
      configProvider: provider({}, { db: { statement_sanitizer: true } }),
      instrumentationName: '@otel/test',
      instrumentationProps: [],
      generalProps: [],
      diag,
    });
    assert.deepStrictEqual(warnings, []);
  });

  it('maps number, number[] and boolean[] properties', function () {
    const config = readConfigProperties({
      configProvider: provider({
        '@otel/test': {
          max_len: 128,
          ports: [80, 443],
          flags: [true, false],
        },
      }),
      instrumentationName: '@otel/test',
      instrumentationProps: [
        ['max_len', 'number', 'maxLen'],
        ['ports', 'number[]', 'ports'],
        ['flags', 'boolean[]', 'flags'],
      ],
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
    const config = readConfigProperties({
      configProvider: provider({ '@otel/test': { max_len: NaN } }),
      instrumentationName: '@otel/test',
      instrumentationProps: [['max_len', 'number', 'maxLen']],
      diag,
    });
    assert.deepStrictEqual(config, {});
    assert.strictEqual(warnings.length, 1);
    assert.match(warnings[0], /expected "number", got "number"/);
  });

  it('warns when an array element has the wrong type', function () {
    const config = readConfigProperties({
      configProvider: provider({
        '@otel/test': { ports: [80, '443'], flags: [true, 1] },
      }),
      instrumentationName: '@otel/test',
      instrumentationProps: [
        ['ports', 'number[]', 'ports'],
        ['flags', 'boolean[]', 'flags'],
      ],
      diag,
    });
    assert.deepStrictEqual(config, {});
    assert.strictEqual(warnings.length, 2);
    assert.match(warnings[0], /expected array of numbers/);
    assert.match(warnings[1], /expected array of booleans/);
  });

  it('keeps sibling branches of the current config when merging nested targets', function () {
    const config = readConfigProperties({
      configProvider: provider(
        {},
        { http: { client: { request_captured_headers: ['from-yaml'] } } }
      ),
      generalProps: [
        [
          'http.client.request_captured_headers',
          'string[]',
          'headersToSpanAttributes.client.requestHeaders',
        ],
      ],
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
    readConfigProperties({
      configProvider: provider(
        {},
        { http: { client: { request_captured_headers: ['a'] } } }
      ),
      generalProps: [
        [
          'http.client.request_captured_headers',
          'string[]',
          'headersToSpanAttributes.client.requestHeaders',
        ],
      ],
      currentConfig,
      diag,
    });
    assert.deepStrictEqual(currentConfig, {
      headersToSpanAttributes: { server: { requestHeaders: ['keep'] } },
    });
  });

  it('returns an empty object when nothing is declared', function () {
    const config = readConfigProperties({
      configProvider: provider({ '@otel/test': { server_name: 'srv' } }),
      diag,
    });
    assert.deepStrictEqual(config, {});
  });
});
