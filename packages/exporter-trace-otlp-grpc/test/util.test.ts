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
  it('should use default insecure value when security value it not defined in config and env', () => {
    const credentials = configureSecurity(undefined, undefined);
    assert.ok(credentials);
    assert.ok(credentials._isSecure() === false);
  });
  it('should use security value defined in config over security value defined in env', () => {
    const insecure = grpc.ChannelCredentials.createInsecure();
    envSource.OTEL_EXPORTER_OTLP_TRACES_INSECURE = 'true';
    const credentials = configureSecurity(undefined, insecure);
    assert.ok(credentials._isSecure() === false);
  });
  it('should use security parameter over security value defined in env', () => {
    const secure = grpc.ChannelCredentials.createSsl();
    envSource.OTEL_EXPORTER_OTLP_INSECURE = 'false';
    const credentials = configureSecurity(undefined, secure);

    assert.ok(credentials._isSecure() === true);
    delete envSource.OTEL_EXPORTER_OTLP_INSECURE;
  });
  it('should use signal specific security value defined in env', () => {
    envSource.OTEL_EXPORTER_OTLP_INSECURE = 'true';
    envSource.OTEL_EXPORTER_OTLP_TRACES_INSECURE = 'false';
    const credentials = configureSecurity(undefined, undefined);

    assert.ok(credentials._isSecure() === false);
    delete envSource.OTEL_EXPORTER_OTLP_INSECURE;
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_INSECURE;
  });
  it('should use default insecure value when security value defined in env is not valid', () => {
    envSource.OTEL_EXPORTER_OTLP_INSECURE = 'foo';
    const credentials = configureSecurity(undefined, undefined);

    assert.ok(credentials._isSecure() === false);
    delete envSource.OTEL_EXPORTER_OTLP_INSECURE;
  });
  it('should use secure connection when endpoint scheme is https', () => {
    const url = 'https://localhost.com:1501';
    const credentials = configureSecurity(url, undefined);
    assert.ok(credentials._isSecure() === true);
  });
  it('should use secure connection when endpoint scheme is https and credentials are insecure', () => {
    const url = 'https://localhost.com:1501';
    const insecure = grpc.ChannelCredentials.createInsecure();
    const credentials = configureSecurity(url, insecure);
    assert.ok(credentials._isSecure() === true);
  });
  it('should use secure connection when endpoint env variable scheme is https and credentials are insecure', () => {
    envSource.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT='https://localhost.com:1501';
    const insecure = grpc.ChannelCredentials.createInsecure();
    const credentials = configureSecurity(undefined, insecure);
    assert.ok(credentials._isSecure() === true);
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;
  });
});

