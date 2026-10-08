/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as sinon from 'sinon';
import * as assert from 'assert';
import type * as https from 'https';
import {
  convertLegacyHttpOptions,
  convertLegacyHttpOptionsWithoutEnv,
} from '../../../src/configuration/convert-legacy-node-http-options';
import { registerMockDiagLogger } from '../../common/test-utils';

describe('convertLegacyHttpOptions', function () {
  afterEach(function () {
    sinon.restore();
  });

  it('should warn when used with metadata', function () {
    const { warn } = registerMockDiagLogger();

    convertLegacyHttpOptions(
      { metadata: { foo: 'bar' } } as any,
      'SIGNAL',
      'v1/signal',
      {}
    );

    sinon.assert.calledOnceWithExactly(
      warn,
      'Metadata cannot be set when using http'
    );
  });

  it('should keep agent factory as-is', function () {
    // act
    const factory = () => null!;
    const options = convertLegacyHttpOptions(
      { httpAgentOptions: factory },
      'SIGNAL',
      'v1/signal',
      {}
    );

    // assert
    assert.strictEqual(options.agentFactory, factory);
  });

  it('should keep specific keepAlive', async () => {
    // act
    const options = convertLegacyHttpOptions(
      {
        keepAlive: true,
      },
      'SIGNAL',
      'v1/signal',
      {}
    );
    const agent = (await options.agentFactory('https:')) as https.Agent;

    // assert
    assert.ok(agent.options.keepAlive);
  });

  it('should set keepAlive on AgentOptions when not explicitly set in AgentOptions but set in config', async () => {
    // act
    const options = convertLegacyHttpOptions(
      {
        keepAlive: true,
        httpAgentOptions: {
          // set anything so that we can check that it's still there once options have been merged
          port: 1234,
        },
      },
      'SIGNAL',
      'v1/signal',
      {}
    );
    const agent = (await options.agentFactory('https:')) as https.Agent;

    // assert
    assert.ok(agent.options.keepAlive);
    assert.strictEqual(agent.options.port, 1234);
  });

  it('should pass along header factory as-is', async function () {
    const headers = { foo: 'bar' };
    const options = convertLegacyHttpOptions(
      {
        headers: async () => headers,
      },
      'SIGNAL',
      'v1/signal',
      {}
    );

    // act
    const initialHeaders = await options.headers();
    headers.foo = 'baz';
    const laterHeaders = await options.headers();

    // assert
    assert.deepStrictEqual(initialHeaders, { foo: 'bar' });
    assert.deepStrictEqual(laterHeaders, { foo: 'baz' });
  });
});

describe('convertLegacyHttpOptionsWithoutEnv', function () {
  afterEach(function () {
    delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    delete process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;
    delete process.env.OTEL_EXPORTER_OTLP_HEADERS;
    delete process.env.OTEL_EXPORTER_OTLP_TIMEOUT;
    delete process.env.OTEL_EXPORTER_OTLP_COMPRESSION;
    sinon.restore();
  });

  it('should warn when used with metadata', function () {
    const { warn } = registerMockDiagLogger();

    convertLegacyHttpOptionsWithoutEnv(
      { metadata: { foo: 'bar' } } as any,
      'v1/signal',
      {}
    );

    sinon.assert.calledOnceWithExactly(
      warn,
      'Metadata cannot be set when using http'
    );
  });

  it('should not use the endpoint from the environment', function () {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://env.example:4318';
    process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT =
      'http://traces.env.example:4318';

    // control: the environment-aware conversion does use the environment
    assert.strictEqual(
      convertLegacyHttpOptions({}, 'TRACES', 'v1/traces', {}).url,
      'http://traces.env.example:4318/'
    );

    const options = convertLegacyHttpOptionsWithoutEnv({}, 'v1/traces', {});
    assert.strictEqual(options.url, 'http://localhost:4318/v1/traces');
  });

  it('should not use timeout or compression from the environment', function () {
    process.env.OTEL_EXPORTER_OTLP_TIMEOUT = '15000';
    process.env.OTEL_EXPORTER_OTLP_COMPRESSION = 'gzip';

    // control: the environment-aware conversion does use the environment
    const fromEnv = convertLegacyHttpOptions({}, 'TRACES', 'v1/traces', {});
    assert.strictEqual(fromEnv.timeoutMillis, 15000);
    assert.strictEqual(fromEnv.compression, 'gzip');

    const options = convertLegacyHttpOptionsWithoutEnv({}, 'v1/traces', {});
    assert.strictEqual(options.timeoutMillis, 10000);
    assert.strictEqual(options.compression, 'none');
  });

  it('should not use headers from the environment', async function () {
    process.env.OTEL_EXPORTER_OTLP_HEADERS = 'foo=bar';

    // control: the environment-aware conversion does use the environment
    const fromEnv = convertLegacyHttpOptions({}, 'TRACES', 'v1/traces', {});
    assert.deepStrictEqual(await fromEnv.headers(), { foo: 'bar' });

    const options = convertLegacyHttpOptionsWithoutEnv({}, 'v1/traces', {
      'Content-Type': 'application/json',
    });
    assert.deepStrictEqual(await options.headers(), {
      'Content-Type': 'application/json',
    });
  });

  it('should use user-provided configuration even when the environment is set', async function () {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://env.example:4318';
    process.env.OTEL_EXPORTER_OTLP_TIMEOUT = '15000';

    const options = convertLegacyHttpOptionsWithoutEnv(
      {
        url: 'http://user.example:4318/v1/traces',
        timeoutMillis: 1234,
        headers: { foo: 'user' },
      },
      'v1/traces',
      {}
    );

    assert.strictEqual(options.url, 'http://user.example:4318/v1/traces');
    assert.strictEqual(options.timeoutMillis, 1234);
    assert.deepStrictEqual(await options.headers(), { foo: 'user' });
  });
});
