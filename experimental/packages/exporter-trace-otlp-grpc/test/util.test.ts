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
import { validateAndNormalizeUrl, configureSecurity, configureCompression } from '../src/util';
import * as grpc from '@grpc/grpc-js';
import { CompressionAlgorithm} from '../src/types';
import { DEFAULT_COLLECTOR_URL } from '../src/OTLPTraceExporter';

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
      name: 'grpc://host:port should trim off protocol',
      input: 'grpc://api.datacat.io:1234',
      expected: 'api.datacat.io:1234',
    },
    {
      name: 'bad protocol should warn but return host:port',
      input: 'badproto://api.datacat.io:1234',
      expected: 'api.datacat.io:1234',
      warn: 'URL protocol should be http(s):// or grpc(s)://. Using grpc://.',
    },
    {
      name: 'path on end of url should warn but return host:port',
      input: 'grpc://api.datacat.io:1234/a/b/c',
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
      input: 'grpc://api.datacat.io/a/b://c',
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
  // 1
  it.only('should return insecure channel when using all defaults', () => {
    const credentials = configureSecurity(undefined, DEFAULT_COLLECTOR_URL);
    assert.ok(credentials._isSecure() === false);
  });
  // 2
  it('should return user defined channel credentials', () => {
    const userDefinedCredentials = grpc.credentials.createSsl();
    const credentials = configureSecurity(userDefinedCredentials, 'http://foo.bar');
    assert.ok(userDefinedCredentials === credentials);
    assert.ok(credentials._isSecure() === true);
  });
  // 3
  it('should return secure channel when endpoint contains https scheme - no matter insecure env settings,', () => {
    envSource.OTEL_EXPORTER_OTLP_TRACES_INSECURE='true';
    const credentials = configureSecurity(undefined, 'https://foo.bar');
    assert.ok(credentials._isSecure() === true);
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_INSECURE;
  });
  // 4
  it('should return insecure channel when endpoint contains http scheme and no insecure env settings', () => {
    const credentials = configureSecurity(undefined, 'http://foo.bar');
    assert.ok(credentials._isSecure() === false);
  });
  // 5
  it('should return secure channel when endpoint does not contain scheme and no insecure env settings', () => {
    const credentials = configureSecurity(undefined, 'foo.bar');
    assert.ok(credentials._isSecure() === true);
  });
  // 6
  it('should return insecure channel when endpoint contains http scheme and insecure env set to false', () => {
    envSource.OTEL_EXPORTER_OTLP_TRACES_INSECURE='false';
    const credentials = configureSecurity(undefined, 'http://foo.bar');
    assert.ok(credentials._isSecure() === false);
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_INSECURE;
  });
  // 7
  it('should return insecure channel when endpoint contains http scheme and insecure env set to true', () => {
    envSource.OTEL_EXPORTER_OTLP_INSECURE='true';
    const credentials = configureSecurity(undefined, 'http://localhost');
    assert.ok(credentials._isSecure() === false);
    delete envSource.OTEL_EXPORTER_OTLP_INSECURE;
  });
  // 8
  it('should return secure channel when endpoint does not contain scheme and insecure env set to false', () => {
    envSource.OTEL_EXPORTER_OTLP_TRACES_INSECURE='false';
    const credentials = configureSecurity(undefined, 'foo.bar');
    assert.ok(credentials._isSecure() === true);
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_INSECURE;
  });
  // 9
  it('should return insecure channel when endpoint does not contain scheme and insecure env set to true', () => {
    envSource.OTEL_EXPORTER_OTLP_INSECURE='true';
    const credentials = configureSecurity(undefined, 'foo.bar');
    assert.ok(credentials._isSecure() === false);
    delete envSource.OTEL_EXPORTER_OTLP_INSECURE;
  });
});

describe('configureCompression', () => {
  const envSource = process.env;
  it('should return none for compression', () => {
    const compression = CompressionAlgorithm.NONE;
    assert.strictEqual(configureCompression(compression), CompressionAlgorithm.NONE);
  });
  it('should return gzip compression defined via env', () => {
    envSource.OTEL_EXPORTER_OTLP_TRACES_COMPRESSION = 'gzip';
    assert.strictEqual(configureCompression(undefined),CompressionAlgorithm.GZIP);
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_COMPRESSION;
  });
  it('should return none for compression defined via env', () => {
    envSource.OTEL_EXPORTER_OTLP_TRACES_COMPRESSION = 'none';
    assert.strictEqual(configureCompression(undefined),CompressionAlgorithm.NONE);
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_COMPRESSION;
  });
  it('should return none for compression when no compression is set', () => {
    assert.strictEqual(configureCompression(undefined),CompressionAlgorithm.NONE);
  });
});
