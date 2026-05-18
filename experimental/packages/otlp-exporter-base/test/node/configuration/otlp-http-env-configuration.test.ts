/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as fs from 'fs';
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

    it('merges headers instead of overriding', async function () {
      process.env.OTEL_EXPORTER_OTLP_HEADERS = 'key1=value1,key2=value2';
      process.env.OTEL_EXPORTER_OTLP_METRICS_HEADERS = 'key1=metrics';

      const config = getNodeHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.deepEqual(await config.headers?.(), {
        key1: 'metrics',
        key2: 'value2',
      });
    });

    it('allows non-specific only headers', async function () {
      process.env.OTEL_EXPORTER_OTLP_HEADERS = 'key1=value1,key2=value2';

      const config = getNodeHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.deepEqual(await config.headers?.(), {
        key1: 'value1',
        key2: 'value2',
      });
    });

    it('allows specific only headers', async function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_HEADERS =
        'key1=value1,key2=value2';

      const config = getNodeHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.deepEqual(await config.headers?.(), {
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

  describe('certs', function () {
    const certsDir = `${process.cwd()}/test/certs`;
    const caCert = Buffer.from(fs.readFileSync(`${certsDir}/ca.crt`));
    const clientCert = Buffer.from(fs.readFileSync(`${certsDir}/client.crt`));
    const clientKey = Buffer.from(fs.readFileSync(`${certsDir}/client.key`));

    afterEach(function () {
      delete process.env.OTEL_EXPORTER_OTLP_CERTIFICATE;
      delete process.env.OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE;
      delete process.env.OTEL_EXPORTER_OTLP_CLIENT_KEY;
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_CERTIFICATE;
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_CLIENT_CERTIFICATE;
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_CLIENT_KEY;
    });

    it('should not set the certs if not defined in env', async function () {
      const { agentFactory } = getNodeHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(typeof agentFactory, 'function');

      const agent = (await agentFactory!('https:')) as any;
      assert.strictEqual(agent.options.ca, undefined);
      assert.strictEqual(agent.options.cert, undefined);
      assert.strictEqual(agent.options.key, undefined);
    });

    it('should not set the certs if env vars have wrong values', async function () {
      process.env.OTEL_EXPORTER_OTLP_CERTIFICATE = `${certsDir}/bogus-ca.crt`;
      process.env.OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE = `${certsDir}/bogus-client.crt`;
      process.env.OTEL_EXPORTER_OTLP_CLIENT_KEY = `${certsDir}/bogus-client.key`;
      const { agentFactory } = getNodeHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(typeof agentFactory, 'function');

      const agent = (await agentFactory!('https:')) as any;
      assert.strictEqual(agent.options.ca, undefined);
      assert.strictEqual(agent.options.cert, undefined);
      assert.strictEqual(agent.options.key, undefined);
    });

    it('should not set the certs in agent if protocol is http', async function () {
      process.env.OTEL_EXPORTER_OTLP_CERTIFICATE = `${certsDir}/ca.crt`;
      process.env.OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE = `${certsDir}/client.crt`;
      process.env.OTEL_EXPORTER_OTLP_CLIENT_KEY = `${certsDir}/client.key`;
      const { agentFactory } = getNodeHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(typeof agentFactory, 'function');

      const agent = (await agentFactory!('http:')) as any;
      assert.strictEqual(agent.options.ca, undefined);
      assert.strictEqual(agent.options.cert, undefined);
      assert.strictEqual(agent.options.key, undefined);
    });

    it('should use the non signal specific certs in agent if defined in env vars', async function () {
      process.env.OTEL_EXPORTER_OTLP_CERTIFICATE = `${certsDir}/ca.crt`;
      process.env.OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE = `${certsDir}/client.crt`;
      process.env.OTEL_EXPORTER_OTLP_CLIENT_KEY = `${certsDir}/client.key`;
      const { agentFactory } = getNodeHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(typeof agentFactory, 'function');

      const agent = (await agentFactory!('https:')) as any;
      assert.strictEqual(caCert.compare(agent.options.ca), 0);
      assert.strictEqual(clientCert.compare(agent.options.cert), 0);
      assert.strictEqual(clientKey.compare(agent.options.key), 0);
    });

    it('should use the signal specific certs in agent if defined in env vars', async function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_CERTIFICATE = `${certsDir}/ca.crt`;
      process.env.OTEL_EXPORTER_OTLP_METRICS_CLIENT_CERTIFICATE = `${certsDir}/client.crt`;
      process.env.OTEL_EXPORTER_OTLP_METRICS_CLIENT_KEY = `${certsDir}/client.key`;
      // NOTE: if files do not exist the options become undefined
      process.env.OTEL_EXPORTER_OTLP_CERTIFICATE = `${certsDir}/bogus-ca.crt`;
      process.env.OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE = `${certsDir}/bogus-client.crt`;
      process.env.OTEL_EXPORTER_OTLP_CLIENT_KEY = `${certsDir}/bogus-client.key`;
      const { agentFactory } = getNodeHttpConfigurationFromEnvironment(
        'METRICS',
        'v1/metrics'
      );
      assert.strictEqual(typeof agentFactory, 'function');

      const agent = (await agentFactory!('https:')) as any;
      assert.strictEqual(caCert.compare(agent.options.ca), 0);
      assert.strictEqual(clientCert.compare(agent.options.cert), 0);
      assert.strictEqual(clientKey.compare(agent.options.key), 0);
    });
  });

  testSharedConfigurationFromEnvironment(signalIdentifier =>
    getNodeHttpConfigurationFromEnvironment(signalIdentifier, 'v1/metrics')
  );
});
