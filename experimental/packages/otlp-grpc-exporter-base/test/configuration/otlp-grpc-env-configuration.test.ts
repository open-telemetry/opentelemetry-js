/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as assert from 'assert';
import * as fs from 'fs';
import * as sinon from 'sinon';

import { getOtlpGrpcConfigurationFromEnv } from '../../src/configuration/otlp-grpc-env-configuration';
import {
  createInsecureCredentials,
  createSslCredentials,
} from '../../src/grpc-exporter-transport';
import { diag } from '@opentelemetry/api';

describe('getOtlpGrpcConfigurationFromEnvironment', function () {
  describe('metadata', function () {
    afterEach(function () {
      delete process.env.OTEL_EXPORTER_OTLP_HEADERS;
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_HEADERS;
    });

    it('remains unset if env vars are not set', function () {
      // ensure both are not set
      delete process.env.OTEL_EXPORTER_OTLP_HEADERS;
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_HEADERS;

      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      assert.strictEqual(config.metadata, undefined);
    });

    it('remains unset if env vars are set to empty string', function () {
      process.env.OTEL_EXPORTER_OTLP_HEADERS = '';
      process.env.OTEL_EXPORTER_OTLP_METRICS_HEADERS = '';

      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      assert.strictEqual(config.metadata, undefined);
    });

    it('remains unset if non-specific env var is set to empty string, specific is undefined', function () {
      process.env.OTEL_EXPORTER_OTLP_HEADERS = '';

      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      assert.strictEqual(config.metadata, undefined);
    });

    it('remains unset if non-specific env var is a list of empty strings, specific is undefined', function () {
      process.env.OTEL_EXPORTER_OTLP_HEADERS = ',  ,  ,  ';

      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      assert.strictEqual(config.metadata, undefined);
    });

    it('remains unset if specific env var is set to empty string, non-specific is undefined', function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_HEADERS = '';

      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      assert.strictEqual(config.metadata, undefined);
    });

    it('remains unset if specific env var is a list of empty strings, non-specific is undefined', function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_HEADERS = ',  ,  ,  ';

      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      assert.strictEqual(config.metadata, undefined);
    });

    it('merges metadata instead of overriding', function () {
      process.env.OTEL_EXPORTER_OTLP_HEADERS =
        'foo=foo-non-specific,bar=bar-non-specific';
      process.env.OTEL_EXPORTER_OTLP_METRICS_HEADERS =
        'foo=foo-specific,baz=baz-specific';

      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      assert.deepEqual(config.metadata?.().getMap(), {
        foo: 'foo-specific', // does not use specific if the user has set something
        bar: 'bar-non-specific', // uses non-specific if there is nothing specific set
        baz: 'baz-specific', // does not drop user-set metadata if there is no non-specific key for it
      });
    });

    it('allows non-specific only metadata', function () {
      process.env.OTEL_EXPORTER_OTLP_HEADERS =
        'foo=foo-non-specific,bar=bar-non-specific';

      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      assert.deepEqual(config.metadata?.().getMap(), {
        foo: 'foo-non-specific',
        bar: 'bar-non-specific',
      });
    });

    it('allows specific only metadata', function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_HEADERS =
        'foo=foo-specific,baz=baz-specific';

      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      assert.deepEqual(config.metadata?.().getMap(), {
        foo: 'foo-specific',
        baz: 'baz-specific',
      });
    });
  });

  describe('url', function () {
    afterEach(function () {
      delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT;
      sinon.restore();
    });

    it('should override non-signal specific exporter url with specific url', function () {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://example.test/';
      process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT =
        'http://metrics.example.test/';
      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      assert.strictEqual(
        config.url,
        process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT
      );
    });

    it('should use non-specific url defined in env', function () {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://example.test/';
      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      assert.strictEqual(config.url, process.env.OTEL_EXPORTER_OTLP_ENDPOINT);
    });

    it('should use specific url defined in env', function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = 'http://example.test/';
      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      assert.strictEqual(
        config.url,
        process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT
      );
    });

    it('should keep non-specific url as-is when no protocol is given', function () {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'example.test';
      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      assert.strictEqual(config.url, process.env.OTEL_EXPORTER_OTLP_ENDPOINT);
    });

    it('should keep specific url as-is when no protocol is given', function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = 'example.test';
      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      assert.strictEqual(
        config.url,
        process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT
      );
    });

    it('should not drop any protocol that is unknown with non-specific url', function () {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'foo://example.test';
      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      assert.strictEqual(config.url, process.env.OTEL_EXPORTER_OTLP_ENDPOINT);
    });

    it('should not drop any protocol that is unknown with specific url', function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = 'foo://example.test';
      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      assert.strictEqual(
        config.url,
        process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT
      );
    });

    it('should keep https protocol with non-specific url', function () {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'https://example.test';
      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      assert.strictEqual(config.url, process.env.OTEL_EXPORTER_OTLP_ENDPOINT);
    });

    it('should keep https protocol with specific url', function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = 'https://example.test';
      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      assert.strictEqual(
        config.url,
        process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT
      );
    });

    it('should trim non-specific url', function () {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = '   http://example.test:4317  ';
      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      assert.strictEqual(config.url, 'http://example.test:4317');
    });

    it('should trim specific url', function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT =
        '   http://example.test:4317  ';
      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      assert.strictEqual(config.url, 'http://example.test:4317');
    });

    it('should treat empty non-specific url as undefined', function () {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = '';
      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      assert.strictEqual(config.url, undefined);
    });

    it('should treat empty specific url as undefined', function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = '';
      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      assert.strictEqual(config.url, undefined);
    });

    it('should treat space-only non-specific url as undefined', function () {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = '   ';
      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      assert.strictEqual(config.url, undefined);
    });

    it('should treat space-only specific url as undefined', function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = '   ';
      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      assert.strictEqual(config.url, undefined);
    });
  });

  describe('credentials', function () {
    afterEach(function () {
      delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT;
      delete process.env.OTEL_EXPORTER_OTLP_INSECURE;
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_INSECURE;
      delete process.env.OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE;
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_CLIENT_CERTIFICATE;
      delete process.env.OTEL_EXPORTER_OTLP_CLIENT_KEY;
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_CLIENT_KEY;
      delete process.env.OTEL_EXPORTER_OTLP_CERTIFICATE;
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_CERTIFICATE;
      sinon.restore();
    });

    it('should select insecure credentials on http protocol', function () {
      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      const credentials = config.credentials?.('http://example.test:4317')();

      assert.deepStrictEqual(credentials, createInsecureCredentials());
    });

    it('should select secure credentials on https protocol', function () {
      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      const credentials = config.credentials?.('https://example.test:4317')();

      assert.deepStrictEqual(credentials, createSslCredentials());
    });

    it('should select secure credentials on https protocol even when insecure env var is set to true', function () {
      // From the spec:
      // "Insecure: This option only applies to OTLP/gRPC when an endpoint is provided without the http or https scheme"

      // arrange
      const expectedCredentials = createSslCredentials(
        Buffer.from(fs.readFileSync('./test/certs/ca.crt')),
        Buffer.from(fs.readFileSync('./test/certs/client.key')),
        Buffer.from(fs.readFileSync('./test/certs/client.crt'))
      );
      process.env.OTEL_EXPORTER_OTLP_INSECURE = 'true';
      process.env.OTEL_EXPORTER_OTLP_METRICS_INSECURE = 'true';
      process.env.OTEL_EXPORTER_OTLP_CERTIFICATE = './test/certs/ca.crt';
      process.env.OTEL_EXPORTER_OTLP_CLIENT_KEY = './test/certs/client.key';
      process.env.OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE =
        './test/certs/client.crt';

      // act
      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      const credentials = config.credentials?.('https://example.test:4317')();

      // assert
      assert.deepStrictEqual(credentials, expectedCredentials);
    });

    it('should select insecure credentials on http protocol even when insecure env var is set to false', function () {
      // From the spec:
      // "Insecure: This option only applies to OTLP/gRPC when an endpoint is provided without the http or https scheme"

      process.env.OTEL_EXPORTER_OTLP_INSECURE = 'false';
      process.env.OTEL_EXPORTER_OTLP_METRICS_INSECURE = 'false';
      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      const credentials = config.credentials?.('http://example.test:4317')();

      assert.deepStrictEqual(credentials, createInsecureCredentials());
    });

    it('should select insecure credentials on http protocol even when insecure env var is set to true', function () {
      // From the spec:
      // "Insecure: This option only applies to OTLP/gRPC when an endpoint is provided without the http or https scheme"

      process.env.OTEL_EXPORTER_OTLP_INSECURE = 'true';
      process.env.OTEL_EXPORTER_OTLP_METRICS_INSECURE = 'true';
      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      const credentials = config.credentials?.('example.test:4317')();

      assert.deepStrictEqual(credentials, createInsecureCredentials());
    });

    it('should select insecure credentials on no protocol when insecure env var is set to true', function () {
      // From the spec:
      // "Insecure: This option only applies to OTLP/gRPC when an endpoint is provided without the http or https scheme"

      process.env.OTEL_EXPORTER_OTLP_INSECURE = 'true';
      process.env.OTEL_EXPORTER_OTLP_METRICS_INSECURE = 'true';
      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      const credentials = config.credentials?.('example.test:4317')();

      assert.deepStrictEqual(credentials, createInsecureCredentials());
    });

    it('should select non-specific secure credentials on no protocol when insecure env var is set to false', function () {
      // From the spec:
      // "Insecure: This option only applies to OTLP/gRPC when an endpoint is provided without the http or https scheme"

      // arrange
      const expectedCredentials = createSslCredentials(
        Buffer.from(fs.readFileSync('./test/certs/ca.crt')),
        Buffer.from(fs.readFileSync('./test/certs/client.key')),
        Buffer.from(fs.readFileSync('./test/certs/client.crt'))
      );
      process.env.OTEL_EXPORTER_OTLP_INSECURE = 'false';
      process.env.OTEL_EXPORTER_OTLP_METRICS_INSECURE = 'false';
      process.env.OTEL_EXPORTER_OTLP_CERTIFICATE = './test/certs/ca.crt';
      process.env.OTEL_EXPORTER_OTLP_CLIENT_KEY = './test/certs/client.key';
      process.env.OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE =
        './test/certs/client.crt';

      // act
      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      const credentials = config.credentials?.('example.test:4317')();

      // assert
      assert.deepStrictEqual(credentials, expectedCredentials);
    });

    it('should select specific secure credentials on no protocol when insecure env var is set to false', function () {
      // From the spec:
      // "Insecure: This option only applies to OTLP/gRPC when an endpoint is provided without the http or https scheme"

      // arrange
      const expectedCredentials = createSslCredentials(
        Buffer.from(fs.readFileSync('./test/certs/ca.crt')),
        Buffer.from(fs.readFileSync('./test/certs/client.key')),
        Buffer.from(fs.readFileSync('./test/certs/client.crt'))
      );
      process.env.OTEL_EXPORTER_OTLP_METRICS_INSECURE = 'false';
      process.env.OTEL_EXPORTER_OTLP_METRICS_CERTIFICATE =
        './test/certs/ca.crt';
      process.env.OTEL_EXPORTER_OTLP_METRICS_CLIENT_KEY =
        './test/certs/client.key';
      process.env.OTEL_EXPORTER_OTLP_METRICS_CLIENT_CERTIFICATE =
        './test/certs/client.crt';

      // act
      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      const credentials = config.credentials?.('example.test:4317')();

      // assert
      assert.deepStrictEqual(credentials, expectedCredentials);
    });

    it('should warn when client key is missing but client cert is there', function () {
      // arrange
      const spyLoggerWarn = sinon.stub(diag, 'warn');
      const expectedCredentials = createSslCredentials(
        Buffer.from(fs.readFileSync('./test/certs/ca.crt')),
        undefined,
        undefined
      );

      process.env.OTEL_EXPORTER_OTLP_CERTIFICATE = './test/certs/ca.crt';
      // OTEL_EXPORTER_OTLP_CLIENT_KEY not set
      process.env.OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE =
        './test/certs/client.crt';

      // act
      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      const credentials = config.credentials?.('example.test:4317')();

      // assert
      sinon.assert.calledOnceWithExactly(
        spyLoggerWarn,
        'Client key and certificate must both be provided, but one was missing - attempting to create credentials from just the root certificate'
      );
      assert.deepStrictEqual(credentials, expectedCredentials);
    });

    it('should warn when client cert is missing but client key is there', function () {
      // arrange
      const spyLoggerWarn = sinon.stub(diag, 'warn');
      const expectedCredentials = createSslCredentials(
        Buffer.from(fs.readFileSync('./test/certs/ca.crt')),
        undefined,
        undefined
      );

      process.env.OTEL_EXPORTER_OTLP_CERTIFICATE = './test/certs/ca.crt';
      process.env.OTEL_EXPORTER_OTLP_CLIENT_KEY = './test/certs/client.key';
      // OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE not set

      // act
      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      const credentials = config.credentials?.('example.test:4317')();

      // assert
      sinon.assert.calledOnceWithExactly(
        spyLoggerWarn,
        'Client key and certificate must both be provided, but one was missing - attempting to create credentials from just the root certificate'
      );
      assert.deepStrictEqual(credentials, expectedCredentials);
    });

    it('should not warn when root certificate is missing', function () {
      // arrange
      const spyLoggerWarn = sinon.stub(diag, 'warn');
      const expectedCredentials = createSslCredentials(
        undefined,
        Buffer.from(fs.readFileSync('./test/certs/client.key')),
        Buffer.from(fs.readFileSync('./test/certs/client.crt'))
      );

      // OTEL_EXPORTER_OTLP_CERTIFICATE not set
      process.env.OTEL_EXPORTER_OTLP_CLIENT_KEY = './test/certs/client.key';
      process.env.OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE =
        './test/certs/client.crt';

      // act
      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      const credentials = config.credentials?.('example.test:4317')();

      // assert
      sinon.assert.notCalled(spyLoggerWarn);
      assert.deepStrictEqual(credentials, expectedCredentials);
    });

    it('should warn when files are not accessible', function () {
      // arrange
      const spyLoggerWarn = sinon.stub(diag, 'warn');
      const expectedCredentials = createSslCredentials();

      // OTEL_EXPORTER_OTLP_CERTIFICATE not set
      process.env.OTEL_EXPORTER_OTLP_CLIENT_KEY = './test/certs/client.key';
      process.env.OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE =
        './test/certs/client.crt';

      process.env.OTEL_EXPORTER_OTLP_CERTIFICATE =
        './test/certs/non-existent-ca.crt';
      process.env.OTEL_EXPORTER_OTLP_CLIENT_KEY =
        './test/certs/non-existent-client.key';
      process.env.OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE =
        './test/certs/non-existent-client.crt';

      // act
      const config = getOtlpGrpcConfigurationFromEnv('METRICS');
      const credentials = config.credentials?.('example.test:4317')();

      // assert
      sinon.assert.callCount(spyLoggerWarn, 3);
      sinon.assert.calledWithExactly(
        spyLoggerWarn,
        'Failed to read root certificate file'
      );
      sinon.assert.calledWithExactly(
        spyLoggerWarn,
        'Failed to read client certificate private key file'
      );
      sinon.assert.calledWithExactly(
        spyLoggerWarn,
        'Failed to read client certificate chain file'
      );
      assert.deepStrictEqual(credentials, expectedCredentials);
    });
  });
});
