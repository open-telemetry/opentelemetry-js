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

import * as sinon from 'sinon';
import * as assert from 'assert';

import { diag } from '@opentelemetry/api';
import * as grpc from '@grpc/grpc-js';
import { validateAndNormalizeUrl, configureCompression, GrpcCompressionAlgorithm, configureSecurity, useSecureConnection, DEFAULT_COLLECTOR_URL } from '../src/util';
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base';

// Tests added to detect breakage released in #2130
describe('validateAndNormalizeUrl()', () => {
  const tests = [
    {
      name: 'bare hostname should return same value',
      input: 'api.datacat.io',
      expected: 'api.datacat.io',
    },
    {
      name: 'host:port should return same value',
      input: 'api.datacat.io:1234',
      expected: 'api.datacat.io:1234',
    },
    {
      name: 'https://host:port should trim off protocol',
      input: 'https://api.datacat.io:1234',
      expected: 'api.datacat.io:1234',
    },
    {
      name: 'bad protocol should warn but return host:port',
      input: 'badproto://api.datacat.io:1234',
      expected: 'api.datacat.io:1234',
      warn: 'URL protocol should be http(s)://. Using http://.',
    },
    {
      name: 'path on end of url should warn but return host:port',
      input: 'http://api.datacat.io:1234/a/b/c',
      expected: 'api.datacat.io:1234',
      warn: 'URL path should not be set when using grpc, the path part of the URL will be ignored.',
    },
    {
      name: ':// in path should not be used for protocol even if protocol not specified',
      input: 'api.datacat.io/a/b://c',
      expected: 'api.datacat.io',
      warn: 'URL path should not be set when using grpc, the path part of the URL will be ignored.',
    },
    {
      name: ':// in path is valid when a protocol is specified',
      input: 'http://api.datacat.io/a/b://c',
      expected: 'api.datacat.io',
      warn: 'URL path should not be set when using grpc, the path part of the URL will be ignored.',
    },
  ];
  tests.forEach(test => {
    it(test.name, () => {
      const diagWarn = sinon.stub(diag, 'warn');
      try {
        assert.strictEqual(validateAndNormalizeUrl(test.input), (test.expected));
        if (test.warn) {
          sinon.assert.calledWith(diagWarn, test.warn);
        } else {
          sinon.assert.notCalled(diagWarn);
        }
      } finally {
        diagWarn.restore();
      }
    });
  });
});

describe('utils - configureSecurity', () => {
  const envSource = process.env;
  it('should return insecure channel when using all defaults', () => {
    const credentials = configureSecurity(undefined, DEFAULT_COLLECTOR_URL);
    assert.ok(credentials._isSecure() === false);
  });
  it('should return user defined channel credentials', () => {
    const userDefinedCredentials = grpc.credentials.createSsl();
    const credentials = configureSecurity(userDefinedCredentials, 'http://foo.bar');

    assert.ok(userDefinedCredentials === credentials);
    assert.ok(credentials._isSecure() === true);
  });
  it('should return secure channel when endpoint contains https scheme - no matter insecure env settings,', () => {
    envSource.OTEL_EXPORTER_OTLP_TRACES_INSECURE='true';
    const credentials = configureSecurity(undefined, 'https://foo.bar');
    assert.ok(credentials._isSecure() === true);
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_INSECURE;
  });

  it('should return insecure channel when endpoint contains http scheme and no insecure env settings', () => {
    const credentials = configureSecurity(undefined, 'http://foo.bar');
    assert.ok(credentials._isSecure() === false);
  });
  it('should return secure channel when endpoint does not contain scheme and no insecure env settings', () => {
    const credentials = configureSecurity(undefined, 'foo.bar');
    assert.ok(credentials._isSecure() === true);
  });
  it('should return insecure channel when endpoint contains http scheme and insecure env set to false', () => {
    envSource.OTEL_EXPORTER_OTLP_TRACES_INSECURE='false';
    const credentials = configureSecurity(undefined, 'http://foo.bar');
    assert.ok(credentials._isSecure() === false);
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_INSECURE;
  });
  it('should return insecure channel when endpoint contains http scheme and insecure env set to true', () => {
    envSource.OTEL_EXPORTER_OTLP_INSECURE='true';
    const credentials = configureSecurity(undefined, 'http://localhost');
    assert.ok(credentials._isSecure() === false);
    delete envSource.OTEL_EXPORTER_OTLP_INSECURE;
  });
  it('should return secure channel when endpoint does not contain scheme and insecure env set to false', () => {
    envSource.OTEL_EXPORTER_OTLP_TRACES_INSECURE='false';
    const credentials = configureSecurity(undefined, 'foo.bar');
    assert.ok(credentials._isSecure() === true);
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_INSECURE;
  });
  it('should return insecure channel when endpoint does not contain scheme and insecure env set to true', () => {
    envSource.OTEL_EXPORTER_OTLP_INSECURE='true';
    const credentials = configureSecurity(undefined, 'foo.bar');
    assert.ok(credentials._isSecure() === false);
    delete envSource.OTEL_EXPORTER_OTLP_INSECURE;
  });
});

describe('useSecureConnection', () => {
  const envSource = process.env;
  it('should return secure connection using all credentials', () => {
    envSource.OTEL_EXPORTER_OTLP_CERTIFICATE='./test/certs/ca.crt';
    envSource.OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY='./test/certs/client.key';
    envSource.OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE='./test/certs/client.crt';

    const credentials = useSecureConnection();
    assert.ok(credentials._isSecure() === true);

    delete envSource.OTEL_EXPORTER_OTLP_CERTIFICATE;
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY;
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE;
  });
  it('should return secure connection using only root certificate', () => {
    envSource.OTEL_EXPORTER_OTLP_CERTIFICATE='./test/certs/ca.crt';
    const credentials = useSecureConnection();
    assert.ok(credentials._isSecure() === true);
    delete envSource.OTEL_EXPORTER_OTLP_CERTIFICATE;
  });
  it('should warn user when file cannot be read and use default root certificate', () => {
    envSource.OTEL_EXPORTER_OTLP_CERTIFICATE='./wrongpath/test/certs/ca.crt';
    const diagWarn = sinon.stub(diag, 'warn');
    const credentials = useSecureConnection();
    const args = diagWarn.args[0];

    assert.strictEqual(args[0], 'Failed to read root certificate file');
    sinon.assert.calledOnce(diagWarn);
    assert.ok(credentials._isSecure() === true);

    delete envSource.OTEL_EXPORTER_OTLP_CERTIFICATE;
    diagWarn.restore();
  });
});

describe('configureCompression', () => {
  const envSource = process.env;
  it('should return none for compression', () => {
    const compression = CompressionAlgorithm.NONE;
    assert.strictEqual(configureCompression(compression), GrpcCompressionAlgorithm.NONE);
  });
  it('should return gzip compression defined via env', () => {
    envSource.OTEL_EXPORTER_OTLP_TRACES_COMPRESSION = 'gzip';
    assert.strictEqual(configureCompression(undefined),GrpcCompressionAlgorithm.GZIP);
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_COMPRESSION;
  });
  it('should return none for compression defined via env', () => {
    envSource.OTEL_EXPORTER_OTLP_TRACES_COMPRESSION = 'none';
    assert.strictEqual(configureCompression(undefined),GrpcCompressionAlgorithm.NONE);
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_COMPRESSION;
  });
  it('should return none for compression when no compression is set', () => {
    assert.strictEqual(configureCompression(undefined),GrpcCompressionAlgorithm.NONE);
  });
});
