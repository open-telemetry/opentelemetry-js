/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';

import {
  convertLegacyOtlpGrpcOptions,
  convertLegacyOtlpGrpcOptionsWithoutEnv,
} from '../../src/configuration/convert-legacy-otlp-grpc-options';
import {
  createInsecureCredentials,
  createSslCredentials,
} from '../../src/grpc-exporter-transport';

describe('convertLegacyOtlpGrpcOptionsWithoutEnv', function () {
  afterEach(function () {
    delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    delete process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;
    delete process.env.OTEL_EXPORTER_OTLP_HEADERS;
    delete process.env.OTEL_EXPORTER_OTLP_TIMEOUT;
    delete process.env.OTEL_EXPORTER_OTLP_INSECURE;
  });

  it('should not use the endpoint from the environment', function () {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://env.example:4317';
    process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT =
      'http://traces.env.example:4317';

    // control: the environment-aware conversion does use the environment
    assert.strictEqual(
      convertLegacyOtlpGrpcOptions({}, 'TRACES').url,
      'traces.env.example:4317'
    );

    const options = convertLegacyOtlpGrpcOptionsWithoutEnv({});
    assert.strictEqual(options.url, 'localhost:4317');
  });

  it('should not use timeout from the environment', function () {
    process.env.OTEL_EXPORTER_OTLP_TIMEOUT = '15000';

    // control: the environment-aware conversion does use the environment
    assert.strictEqual(
      convertLegacyOtlpGrpcOptions({}, 'TRACES').timeoutMillis,
      15000
    );

    const options = convertLegacyOtlpGrpcOptionsWithoutEnv({});
    assert.strictEqual(options.timeoutMillis, 10000);
  });

  it('should not use headers from the environment as metadata', function () {
    process.env.OTEL_EXPORTER_OTLP_HEADERS = 'foo=bar';

    // control: the environment-aware conversion does use the environment
    assert.deepStrictEqual(
      convertLegacyOtlpGrpcOptions({}, 'TRACES').metadata().getMap(),
      { foo: 'bar' }
    );

    const options = convertLegacyOtlpGrpcOptionsWithoutEnv({});
    assert.deepStrictEqual(options.metadata().getMap(), {});
  });

  it('should not use credential settings from the environment', function () {
    process.env.OTEL_EXPORTER_OTLP_INSECURE = 'true';

    // control: the environment-aware conversion does use the environment
    assert.deepStrictEqual(
      convertLegacyOtlpGrpcOptions(
        { url: 'example.test:4317' },
        'TRACES'
      ).credentials(),
      createInsecureCredentials()
    );

    // without the environment, a scheme-less URL uses secure credentials
    const options = convertLegacyOtlpGrpcOptionsWithoutEnv({
      url: 'example.test:4317',
    });
    assert.deepStrictEqual(options.credentials(), createSslCredentials());
  });

  it('should use user-provided configuration even when the environment is set', function () {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://env.example:4317';
    process.env.OTEL_EXPORTER_OTLP_TIMEOUT = '15000';

    const options = convertLegacyOtlpGrpcOptionsWithoutEnv({
      url: 'http://user.example:4317',
      timeoutMillis: 1234,
    });

    assert.strictEqual(options.url, 'user.example:4317');
    assert.strictEqual(options.timeoutMillis, 1234);
    assert.deepStrictEqual(options.credentials(), createInsecureCredentials());
  });
});
