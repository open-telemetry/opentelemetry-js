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

import { getNodeHttpConfigurationFromEnvironment } from '../../../src/configuration/otlp-node-http-env-configuration';
import { testSharedConfigurationFromEnvironment } from './shared-env-configuration.test';

describe('getHttpConfigurationFromEnvironment', function () {
  describe('headers', function () {
    afterEach(function () {
      delete process.env.OTEL_EXPORTER_OTLP_HEADERS;
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_HEADERS;
    });

    it('unset if env vars are not set', function () {
      // ensure both are not set
      delete process.env.OTEL_EXPORTER_OTLP_HEADERS;
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_HEADERS;

      const config = getNodeHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(config.headers, undefined);
    });

    it('merges headers instead of overriding', function () {
      process.env.OTEL_EXPORTER_OTLP_HEADERS = 'key1=value1,key2=value2';
      process.env.OTEL_EXPORTER_OTLP_METRICS_HEADERS = 'key1=metrics';

      const config = getNodeHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.deepEqual(config.headers?.(), {
        key1: 'metrics',
        key2: 'value2',
      });
    });

    it('allows non-specific only headers', function () {
      process.env.OTEL_EXPORTER_OTLP_HEADERS = 'key1=value1,key2=value2';

      const config = getNodeHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.deepEqual(config.headers?.(), {
        key1: 'value1',
        key2: 'value2',
      });
    });

    it('allows specific only headers', function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_HEADERS =
        'key1=value1,key2=value2';

      const config = getNodeHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.deepEqual(config.headers?.(), {
        key1: 'value1',
        key2: 'value2',
      });
    });

    it('remains unset if specific headers are lists of empty strings', function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_HEADERS = ' , , ,';

      const config = getNodeHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.equal(config.headers, undefined);
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
      const config = getNodeHttpConfigurationFromEnvironment(
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
      const config = getNodeHttpConfigurationFromEnvironment(
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
      const config = getNodeHttpConfigurationFromEnvironment(
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
      const config = getNodeHttpConfigurationFromEnvironment(
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
      const config = getNodeHttpConfigurationFromEnvironment(
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
      const config = getNodeHttpConfigurationFromEnvironment(
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
      const config = getNodeHttpConfigurationFromEnvironment(
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
      const config = getNodeHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(
        config.url,
        `${process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT}`
      );
    });

    it('should warn on invalid specific url', function () {
      const spyLoggerWarn = sinon.stub(diag, 'warn');
      process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = 'not a url';
      const config = getNodeHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(config.url, undefined);
      sinon.assert.calledOnceWithExactly(
        spyLoggerWarn,
        "Configuration: Could not parse environment-provided export URL: 'not a url', falling back to undefined"
      );
    });

    it('should warn on invalid non-specific url', function () {
      const spyLoggerWarn = sinon.stub(diag, 'warn');
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'not a url';
      const config = getNodeHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(config.url, undefined);
      sinon.assert.calledOnceWithExactly(
        spyLoggerWarn,
        "Configuration: Could not parse environment-provided export URL: 'not a url', falling back to undefined"
      );
    });

    it('should treat empty urls as not set', function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = '';
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = '';
      const config = getNodeHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(config.url, undefined);
    });
  });

  testSharedConfigurationFromEnvironment(signalIdentifier =>
    getNodeHttpConfigurationFromEnvironment(signalIdentifier, 'v1/metrics')
  );
});
