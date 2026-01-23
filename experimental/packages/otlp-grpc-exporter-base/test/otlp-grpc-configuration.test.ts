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
import { diag } from '@opentelemetry/api';
import * as sinon from 'sinon';
import * as assert from 'assert';
import {
  getOtlpGrpcDefaultConfiguration,
  mergeOtlpGrpcConfigurationWithDefaults,
  validateAndNormalizeUrl,
} from '../src/configuration/otlp-grpc-configuration';

describe('validateAndNormalizeUrl()', function () {
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
      name: 'should accept unix socket',
      input: 'unix:///tmp/grpc.sock',
      expected: 'unix:///tmp/grpc.sock',
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
    it(test.name, function () {
      const diagWarn = sinon.stub(diag, 'warn');
      try {
        assert.strictEqual(validateAndNormalizeUrl(test.input), test.expected);
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

describe('channelOptions', function () {
  it('uses user-provided channelOptions over fallback', function () {
    const userChannelOptions = {
      'grpc.keepalive_time_ms': 10000,
      'grpc.keepalive_timeout_ms': 5000,
    };
    const fallBackChannelOptions = {
      'grpc.keepalive_time_ms': 20000,
    };

    const config = mergeOtlpGrpcConfigurationWithDefaults(
      { channelOptions: userChannelOptions },
      { channelOptions: fallBackChannelOptions },
      getOtlpGrpcDefaultConfiguration()
    );

    assert.deepStrictEqual(config.channelOptions, userChannelOptions);
  });

  it('uses fallback channelOptions over default', function () {
    const fallbackChannelOptions = {
      'grpc.initial_reconnect_backoff_ms': 1000,
    };

    const config = mergeOtlpGrpcConfigurationWithDefaults(
      {},
      { channelOptions: fallbackChannelOptions },
      getOtlpGrpcDefaultConfiguration()
    );

    assert.deepStrictEqual(config.channelOptions, fallbackChannelOptions);
  });

  it('should use default if nothing is provided', function () {
    const config = mergeOtlpGrpcConfigurationWithDefaults(
      {},
      {},
      getOtlpGrpcDefaultConfiguration()
    );

    assert.strictEqual(config.channelOptions, undefined);
  });
});
