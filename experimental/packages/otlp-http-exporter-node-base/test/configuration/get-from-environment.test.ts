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
import * as sinon from 'sinon';
import { diag } from '@opentelemetry/api';
import * as process from 'process';
import { getHttpConfigurationFromEnvironment } from '../../src';

describe('environment configuration provider', function () {
  describe('headers', function () {
    afterEach(function () {
      delete process.env.OTEL_EXPORTER_OTLP_HEADERS;
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_HEADERS;
    });

    it('unset if env vars are not set', function () {
      // ensure both are not set
      delete process.env.OTEL_EXPORTER_OTLP_HEADERS;
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_HEADERS;

      const config = getHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(config.headers, undefined);
    });

    it('merges headers instead of overriding', function () {
      process.env.OTEL_EXPORTER_OTLP_HEADERS = 'key1=value1,key2=value2';
      process.env.OTEL_EXPORTER_OTLP_METRICS_HEADERS = 'key1=metrics';

      const config = getHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.deepEqual(config.headers, {
        key1: 'metrics',
        key2: 'value2',
      });
    });

    it('allows non-specific only headers', function () {
      process.env.OTEL_EXPORTER_OTLP_HEADERS = 'key1=value1,key2=value2';

      const config = getHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.deepEqual(config.headers, {
        key1: 'value1',
        key2: 'value2',
      });
    });

    it('allows specific only headers', function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_HEADERS =
        'key1=value1,key2=value2';

      const config = getHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.deepEqual(config.headers, {
        key1: 'value1',
        key2: 'value2',
      });
    });
  });

  describe('url', function () {
    afterEach(function () {
      delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT;
      sinon.restore();
    });

    it('should use url defined in env that ends with root path and append version and signal path', function () {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar/';
      const config = getHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(
        config.url,
        `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}v1/metrics`
      );
    });
    it('should use url defined in env without checking if path is already present', function () {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar/v1/metrics';
      const config = getHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(
        config.url,
        `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`
      );
    });
    it('should use url defined in env and append version and signal', function () {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar';
      const config = getHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(
        config.url,
        `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`
      );
    });
    it('should override global exporter url with signal url defined in env', function () {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar/';
      process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = 'http://foo.metrics/';
      const config = getHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(
        config.url,
        process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT
      );
    });
    it('should add root path when signal url defined in env contains no path and no root path', function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = 'http://foo.bar';
      const config = getHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(
        config.url,
        `${process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT}/`
      );
    });
    it('should not add root path when signal url defined in env contains root path but no path', function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = 'http://foo.bar/';
      const config = getHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(
        config.url,
        `${process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT}`
      );
    });
    it('should not add root path when signal url defined in env contains path', function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT =
        'http://foo.bar/v1/metrics';
      const config = getHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(
        config.url,
        `${process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT}`
      );
    });
    it('should not add root path when signal url defined in env contains path and ends in /', function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT =
        'http://foo.bar/v1/metrics/';
      const config = getHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(
        config.url,
        `${process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT}`
      );
    });

    it('should warn on invalid url', function () {
      const spyLoggerWarn = sinon.stub(diag, 'warn');
      process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = 'not a url';
      const config = getHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(
        config.url,
        process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT
      );
      assert.strictEqual(
        spyLoggerWarn.args[0]?.[0],
        "Configuration: Could not parse export URL: 'not a url', falling back to undefined"
      );
    });
  });

  describe('timeout', function () {
    afterEach(function () {
      delete process.env.OTEL_EXPORTER_OTLP_TIMEOUT;
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_TIMEOUT;
      sinon.restore();
    });

    it('should not define timeoutMillis if no env var is set', function () {
      const config = getHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(config.timeoutMillis, undefined);
    });

    it('should use specific timeout value', function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_TIMEOUT = '15000';
      const config = getHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(config.timeoutMillis, 15000);
    });

    it('should not define timeoutMillis when specific timeout value is negative', function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_TIMEOUT = '-15000';
      const config = getHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(config.timeoutMillis, undefined);
    });

    it('should not define timeoutMillis when specific and non-specific timeout values are negative', function () {
      const spyLoggerWarn = sinon.stub(diag, 'warn');
      process.env.OTEL_EXPORTER_OTLP_METRICS_TIMEOUT = '-11000';
      process.env.OTEL_EXPORTER_OTLP_TIMEOUT = '-9000';
      const config = getHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(
        spyLoggerWarn.args[0]?.[0],
        'Configuration: OTEL_EXPORTER_OTLP_METRICS_TIMEOUT is invalid, expected number greater than 0 (actual: -11000)'
      );
      assert.strictEqual(
        spyLoggerWarn.args[1]?.[0],
        'Configuration: OTEL_EXPORTER_OTLP_TIMEOUT is invalid, expected number greater than 0 (actual: -9000)'
      );

      assert.strictEqual(config.timeoutMillis, undefined);
    });

    it('should not define timeoutMillis when specific and non-specific timeout values are NaN', function () {
      const spyLoggerWarn = sinon.stub(diag, 'warn');
      process.env.OTEL_EXPORTER_OTLP_METRICS_TIMEOUT = 'NaN';
      process.env.OTEL_EXPORTER_OTLP_TIMEOUT = 'foo';
      const config = getHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(
        spyLoggerWarn.args[0]?.[0],
        'Configuration: OTEL_EXPORTER_OTLP_METRICS_TIMEOUT is invalid, expected number greater than 0 (actual: NaN)'
      );
      assert.strictEqual(
        spyLoggerWarn.args[1]?.[0],
        'Configuration: OTEL_EXPORTER_OTLP_TIMEOUT is invalid, expected number greater than 0 (actual: foo)'
      );

      assert.strictEqual(config.timeoutMillis, undefined);
    });
    it('should not define timeoutMillis when specific and non-specific timeout values are infinite', function () {
      const spyLoggerWarn = sinon.stub(diag, 'warn');
      process.env.OTEL_EXPORTER_OTLP_METRICS_TIMEOUT = '-Infinitiy';
      process.env.OTEL_EXPORTER_OTLP_TIMEOUT = 'Infinity';
      const config = getHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(
        spyLoggerWarn.args[0]?.[0],
        'Configuration: OTEL_EXPORTER_OTLP_METRICS_TIMEOUT is invalid, expected number greater than 0 (actual: -Infinitiy)'
      );
      assert.strictEqual(
        spyLoggerWarn.args[1]?.[0],
        'Configuration: OTEL_EXPORTER_OTLP_TIMEOUT is invalid, expected number greater than 0 (actual: Infinity)'
      );

      assert.strictEqual(config.timeoutMillis, undefined);
    });
  });

  describe('compression', function () {
    afterEach(function () {
      delete process.env.OTEL_EXPORTER_OTLP_COMPRESSION;
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_COMPRESSION;
      sinon.restore();
    });

    it('should not define compression if no env var is set', function () {
      const config = getHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(config.compression, undefined);
    });
    it('should use specific compression value', function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_COMPRESSION = 'gzip';
      const config = getHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(config.compression, 'gzip');
    });

    it('should not define when specific compression value is invalid', function () {
      const spyLoggerWarn = sinon.stub(diag, 'warn');
      process.env.OTEL_EXPORTER_OTLP_METRICS_COMPRESSION = 'bla';
      const config = getHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(
        spyLoggerWarn.args[0]?.[0],
        "Configuration: OTEL_EXPORTER_OTLP_METRICS_COMPRESSION is invalid, expected 'none' or 'gzip' (actual: 'bla')"
      );
      assert.strictEqual(config.compression, undefined);
    });

    it('should not define when non-specific compression value is invalid', function () {
      const spyLoggerWarn = sinon.stub(diag, 'warn');
      process.env.OTEL_EXPORTER_OTLP_COMPRESSION = 'bla';
      const config = getHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(
        spyLoggerWarn.args[0]?.[0],
        "Configuration: OTEL_EXPORTER_OTLP_COMPRESSION is invalid, expected 'none' or 'gzip' (actual: 'bla')"
      );
      assert.strictEqual(config.compression, undefined);
    });

    it('should use signal specific over non-specific', function () {
      process.env.OTEL_EXPORTER_OTLP_COMPRESSION = 'none';
      process.env.OTEL_EXPORTER_OTLP_METRICS_COMPRESSION = 'gzip';

      const config = getHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(config.compression, 'gzip');
    });
  });
});
