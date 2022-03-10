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
import { validateAndNormalizeUrl, configureSecurity } from '../src/util';
import * as grpc from '@grpc/grpc-js';

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
  it('should return insecure channel when default channel credendianls are used and endpoint with any or no scheme', () => {
    const credentials = configureSecurity(undefined);
    assert.ok(credentials._isSecure() === false);
  });
  it('should return user defined channel credentials no matter what scheme the endpoint contains', () => {
    const userDefinedCredentials = grpc.credentials.createSsl();
    const credentials = configureSecurity(userDefinedCredentials);

    assert.ok(userDefinedCredentials === credentials);
    assert.ok(credentials._isSecure() === true);
  });
  // env var tests
  it('should return credentials defined programatically instead of credentials defined via env var', () => {
    const userDefinedCredentials = grpc.credentials.createInsecure();
    envSource.OTEL_EXPORTER_OTLP_TRACES_INSECURE='false';
    const credentials = configureSecurity(userDefinedCredentials);

    assert.ok(userDefinedCredentials === credentials);
    assert.ok(credentials._isSecure() === false);
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_INSECURE;
  });
  it('should return credentials defined via env var when credentials are not set programatically', () => {
    envSource.OTEL_EXPORTER_OTLP_TRACES_INSECURE='true';
    const credentials = configureSecurity(undefined);

    assert.ok(credentials._isSecure() === false);
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_INSECURE;
  });
  it('should return credentials defined via signal specific env instead of general signal env', () => {
    envSource.OTEL_EXPORTER_OTLP_INSECURE='true';
    envSource.OTEL_EXPORTER_OTLP_TRACES_INSECURE='false';
    const credentials = configureSecurity(undefined);

    assert.ok(credentials._isSecure() === true);
    delete envSource.OTEL_EXPORTER_OTLP_INSECURE;
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_INSECURE;
  });
  // certificate test - WIP
  it.skip('should return credentials with provided certificate via env var', () => {
    envSource.OTEL_EXPORTER_OTLP_TRACES_INSECURE='false';
    envSource.OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE='test/certs/ca.crt';

    const credentials = configureSecurity(undefined);
    assert.ok(credentials._isSecure() === true);

    delete envSource.OTEL_EXPORTER_OTLP_TRACES_INSECURE;
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE;
  });
  it.skip('should return credentials without using provided certificate', () => {
    envSource.OTEL_EXPORTER_OTLP_TRACES_INSECURE='false';
    envSource.OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE='test/certs/wrongpathtocertificate/ca.crt';

    const diagWarn = sinon.stub(diag, 'warn');
    const credentials = configureSecurity(undefined);
    assert.ok(credentials._isSecure() === true);
    sinon.assert.calledWith(diagWarn, 'unable to read certificate file - using default host platform trusted certificate');

    delete envSource.OTEL_EXPORTER_OTLP_TRACES_INSECURE;
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE;
  });
});
