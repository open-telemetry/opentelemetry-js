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

import { Counter, Meter, ObservableResult } from '@opentelemetry/api';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import * as assert from 'assert';
import * as sinon from 'sinon';
import * as http from 'http';
import { PrometheusExporter } from '../src';
import {
  mockHrTime,
  sdkLanguage,
  sdkName,
  sdkVersion,
  serviceName,
  mockedHrTimeMs,
} from './util';
import { SinonStubbedInstance } from 'sinon';

const infoLine = `target_info{service_name="${serviceName}",telemetry_sdk_language="${sdkLanguage}",telemetry_sdk_name="${sdkName}",telemetry_sdk_version="${sdkVersion}"} 1`;

const serializedDefaultResourceLines = [
  '# HELP target_info Target metadata',
  '# TYPE target_info gauge',
  infoLine,
];

describe('PrometheusExporter', () => {
  beforeEach(() => {
    mockHrTime();
  });
  afterEach(() => {
    sinon.restore();
  });

  afterEach(() => {
    sinon.restore();
    delete process.env.OTEL_EXPORTER_PROMETHEUS_HOST;
    delete process.env.OTEL_EXPORTER_PROMETHEUS_PORT;
  });

  describe('constructor', () => {
    it('should construct an exporter', async () => {
      const exporter = new PrometheusExporter();
      assert.ok(typeof exporter.startServer === 'function');
      assert.ok(typeof exporter.shutdown === 'function');
      await exporter.shutdown();
    });

    it('should start the server by default and call the callback', async () => {
      const port = PrometheusExporter.DEFAULT_OPTIONS.port;
      const endpoint = PrometheusExporter.DEFAULT_OPTIONS.endpoint;
      const exporter = new PrometheusExporter();
      await exporter.startServer();
      const url = `http://localhost:${port}${endpoint}`;
      await request(url);
      await exporter.shutdown();
    });

    it('should pass server error to callback when port is already in use', async () => {
      const firstExporter = new PrometheusExporter();
      await firstExporter.startServer();

      const secondExporter = new PrometheusExporter();
      await assert.rejects(
        secondExporter.startServer(),
        { code: 'EADDRINUSE' },
        'Second exporter should respond with EADDRINUSE but did not pass it to callback'
      );

      await Promise.all(
        [firstExporter, secondExporter].map(it => it.shutdown())
      );
    });

    it('should not start the server if preventServerStart is passed as an option', () => {
      const exporter = new PrometheusExporter({ preventServerStart: true });
      assert.ok(exporter['_server'].listening === false);
    });
  });

  describe('server', () => {
    it('should start on startServer() and call the callback', async () => {
      const exporter = new PrometheusExporter({
        port: 9722,
        preventServerStart: true,
      });
      await exporter.startServer();
      await exporter.shutdown();
    });

    it('should listen on the default port and default endpoint', async () => {
      const port = PrometheusExporter.DEFAULT_OPTIONS.port;
      const endpoint = PrometheusExporter.DEFAULT_OPTIONS.endpoint;
      const exporter = new PrometheusExporter();
      const url = `http://localhost:${port}${endpoint}`;
      await request(url);
      await exporter.shutdown();
    });

    it('should listen on a custom port and endpoint if provided', async () => {
      const port = 9991;
      const endpoint = '/metric';

      const exporter = new PrometheusExporter({
        port,
        endpoint,
      });
      const url = `http://localhost:${port}${endpoint}`;
      await request(url);
      await exporter.shutdown();
    });

    it('should unref the server to allow graceful termination', () => {
      const mockServer = sinon.createStubInstance(http.Server);
      const createStub = sinon.stub(http, 'createServer');
      createStub.returns(mockServer as any as http.Server);
      const exporter = new PrometheusExporter({}, async () => {
        await exporter.shutdown();
      });
      sinon.assert.calledOnce(mockServer.unref);
    });

    it('should listen on environmentally set host and port', () => {
      process.env.OTEL_EXPORTER_PROMETHEUS_HOST = '127.0.0.1';
      process.env.OTEL_EXPORTER_PROMETHEUS_PORT = '1234';
      const exporter = new PrometheusExporter({}, async () => {
        await exporter.shutdown();
      });
      assert.strictEqual(exporter['_host'], '127.0.0.1');
      assert.strictEqual(exporter['_port'], 1234);
    });

    it('should not require endpoints to start with a slash', async () => {
      const port = 9991;
      const endpoint = 'metric';
      const url = `http://localhost:${port}/metric`;

      const exporter = new PrometheusExporter({
        port,
        endpoint,
      });
      await exporter.startServer();
      await request(url);
      await exporter.stopServer();
    });

    it('should return a HTTP status 404 if the endpoint does not match', async () => {
      const port = 9912;
      const endpoint = '/metrics';
      const exporter = new PrometheusExporter({
        port,
        endpoint,
      });
      const url = `http://localhost:${port}/invalid`;

      await assert.rejects(request(url), { statusCode: 404 });
      await exporter.shutdown();
    });

    it('should call a provided callback on shutdown regardless of if the server is running', async () => {
      const exporter = new PrometheusExporter({ preventServerStart: true });
      await exporter.shutdown();
    });

    it('should able to call getMetricsRequestHandler function to generate response with metrics', async () => {
      const exporter = new PrometheusExporter({ preventServerStart: true });
      const mockRequest: SinonStubbedInstance<http.IncomingMessage> =
        sinon.createStubInstance(http.IncomingMessage);
      const mockResponse: SinonStubbedInstance<http.ServerResponse> =
        sinon.createStubInstance(http.ServerResponse);
      let resolve: () => void;
      const deferred = new Promise<void>(res => {
        resolve = res;
      });
      mockResponse.end.callsFake(() => resolve() as any);
      exporter.getMetricsRequestHandler(
        mockRequest as unknown as http.IncomingMessage,
        mockResponse as unknown as http.ServerResponse
      );
      await deferred;
      sinon.assert.calledOnce(mockResponse.setHeader);
      sinon.assert.calledOnce(mockResponse.end);
      assert.strictEqual(mockResponse.statusCode, 200);
    });
  });

  describe('export', () => {
    let exporter: PrometheusExporter;
    let meterProvider: MeterProvider;
    let meter: Meter;

    beforeEach(async () => {
      exporter = new PrometheusExporter();
      meterProvider = new MeterProvider({
        readers: [exporter],
      });
      meter = meterProvider.getMeter('test-prometheus', '1');
      await exporter.startServer();
    });

    afterEach(async () => {
      await exporter.shutdown();
    });

    it('should export a count aggregation', async () => {
      const counter = meter.createCounter('counter_total', {
        description: 'a test description',
      });

      counter.add(10, { key1: 'attributeValue1' });
      const body = await request('http://localhost:9464/metrics');
      const lines = body.split('\n');

      assert.strictEqual(
        lines[serializedDefaultResourceLines.length],
        '# HELP counter_total a test description'
      );

      assert.deepStrictEqual(lines, [
        ...serializedDefaultResourceLines,
        '# HELP counter_total a test description',
        '# TYPE counter_total counter',
        'counter_total{key1="attributeValue1",otel_scope_name="test-prometheus",otel_scope_version="1"} 10',
        '',
      ]);
    });

    it('should export an observable gauge aggregation', async () => {
      function getCpuUsage() {
        return 0.999;
      }

      const observableGauge = meter.createObservableGauge(
        'metric_observable_gauge',
        {
          description: 'a test description',
        }
      );
      observableGauge.addCallback((observableResult: ObservableResult) => {
        observableResult.observe(getCpuUsage(), {
          pid: String(123),
          core: '1',
        });
      });

      const body = await request('http://localhost:9464/metrics');
      const lines = body.split('\n');

      assert.deepStrictEqual(lines, [
        ...serializedDefaultResourceLines,
        '# HELP metric_observable_gauge a test description',
        '# TYPE metric_observable_gauge gauge',
        'metric_observable_gauge{pid="123",core="1",otel_scope_name="test-prometheus",otel_scope_version="1"} 0.999',
        '',
      ]);
    });

    it('should export multiple attributes', async () => {
      const counter = meter.createCounter('counter_total', {
        description: 'a test description',
      });

      counter.add(10, { counterKey1: 'attributeValue1' });
      counter.add(20, { counterKey1: 'attributeValue2' });

      const body = await request('http://localhost:9464/metrics');
      const lines = body.split('\n');

      assert.deepStrictEqual(lines, [
        ...serializedDefaultResourceLines,
        '# HELP counter_total a test description',
        '# TYPE counter_total counter',
        'counter_total{counterKey1="attributeValue1",otel_scope_name="test-prometheus",otel_scope_version="1"} 10',
        'counter_total{counterKey1="attributeValue2",otel_scope_name="test-prometheus",otel_scope_version="1"} 20',
        '',
      ]);
    });

    it('should export multiple attributes on manual shutdown', async () => {
      const counter = meter.createCounter('counter_total', {
        description: 'a test description',
      });

      counter.add(10, { counterKey1: 'attributeValue1' });
      counter.add(20, { counterKey1: 'attributeValue2' });
      counter.add(30, { counterKey1: 'attributeValue3' });
      await meterProvider.shutdown();
      // exporter has been shut down along with meter provider.
      await assert.rejects(request('http://localhost:9464/metrics'), {
        code: 'ECONNREFUSED',
      });
    });

    it('should export resource even if no metrics are registered', async () => {
      const body = await request('http://localhost:9464/metrics');
      const lines = body.split('\n');

      assert.deepStrictEqual(lines, [
        ...serializedDefaultResourceLines,
        '# no registered metrics',
      ]);
    });

    it('should add a description if missing', async () => {
      const counter = meter.createCounter('counter_total');

      counter.add(10, { key1: 'attributeValue1' });

      const body = await request('http://localhost:9464/metrics');
      const lines = body.split('\n');

      assert.deepStrictEqual(lines, [
        ...serializedDefaultResourceLines,
        '# HELP counter_total description missing',
        '# TYPE counter_total counter',
        'counter_total{key1="attributeValue1",otel_scope_name="test-prometheus",otel_scope_version="1"} 10',
        '',
      ]);
    });

    it('should sanitize names', async () => {
      const counter = meter.createCounter('counter..bad-name');

      counter.add(10, { key1: 'attributeValue1' });

      const body = await request('http://localhost:9464/metrics');
      const lines = body.split('\n');

      assert.deepStrictEqual(lines, [
        ...serializedDefaultResourceLines,
        '# HELP counter_bad_name_total description missing',
        '# TYPE counter_bad_name_total counter',
        'counter_bad_name_total{key1="attributeValue1",otel_scope_name="test-prometheus",otel_scope_version="1"} 10',
        '',
      ]);
    });

    it('should export a UpDownCounter as a gauge', async () => {
      const counter = meter.createUpDownCounter('counter', {
        description: 'a test description',
      });

      counter.add(20, { key1: 'attributeValue1' });

      const body = await request('http://localhost:9464/metrics');
      const lines = body.split('\n');
      assert.deepStrictEqual(lines, [
        ...serializedDefaultResourceLines,
        '# HELP counter a test description',
        '# TYPE counter gauge',
        'counter{key1="attributeValue1",otel_scope_name="test-prometheus",otel_scope_version="1"} 20',
        '',
      ]);
    });

    it('should export an ObservableCounter as a counter', async () => {
      function getValue() {
        return 20;
      }

      const observableCounter = meter.createObservableCounter(
        'metric_observable_counter',
        {
          description: 'a test description',
        }
      );
      observableCounter.addCallback((observableResult: ObservableResult) => {
        observableResult.observe(getValue(), {
          key1: 'attributeValue1',
        });
      });

      const body = await request('http://localhost:9464/metrics');
      const lines = body.split('\n');

      assert.deepStrictEqual(lines, [
        ...serializedDefaultResourceLines,
        '# HELP metric_observable_counter_total a test description',
        '# TYPE metric_observable_counter_total counter',
        'metric_observable_counter_total{key1="attributeValue1",otel_scope_name="test-prometheus",otel_scope_version="1"} 20',
        '',
      ]);
    });

    it('should export an ObservableUpDownCounter as a gauge', async () => {
      function getValue() {
        return 20;
      }

      const observableUpDownCounter = meter.createObservableUpDownCounter(
        'metric_observable_up_down_counter',
        {
          description: 'a test description',
        }
      );
      observableUpDownCounter.addCallback(
        (observableResult: ObservableResult) => {
          observableResult.observe(getValue(), {
            key1: 'attributeValue1',
          });
        }
      );

      const body = await request('http://localhost:9464/metrics');
      const lines = body.split('\n');

      assert.deepStrictEqual(lines, [
        ...serializedDefaultResourceLines,
        '# HELP metric_observable_up_down_counter a test description',
        '# TYPE metric_observable_up_down_counter gauge',
        'metric_observable_up_down_counter{key1="attributeValue1",otel_scope_name="test-prometheus",otel_scope_version="1"} 20',
        '',
      ]);
    });

    it('should export a Histogram as a summary', async () => {
      const histogram = meter.createHistogram('test_histogram', {
        description: 'a test description',
      });

      histogram.record(20, { key1: 'attributeValue1' });

      const body = await request('http://localhost:9464/metrics');
      const lines = body.split('\n');

      assert.deepStrictEqual(lines, [
        ...serializedDefaultResourceLines,
        '# HELP test_histogram a test description',
        '# TYPE test_histogram histogram',
        'test_histogram_count{key1="attributeValue1",otel_scope_name="test-prometheus",otel_scope_version="1"} 1',
        'test_histogram_sum{key1="attributeValue1",otel_scope_name="test-prometheus",otel_scope_version="1"} 20',
        'test_histogram_bucket{key1="attributeValue1",otel_scope_name="test-prometheus",otel_scope_version="1",le="0"} 0',
        'test_histogram_bucket{key1="attributeValue1",otel_scope_name="test-prometheus",otel_scope_version="1",le="5"} 0',
        'test_histogram_bucket{key1="attributeValue1",otel_scope_name="test-prometheus",otel_scope_version="1",le="10"} 0',
        'test_histogram_bucket{key1="attributeValue1",otel_scope_name="test-prometheus",otel_scope_version="1",le="25"} 1',
        'test_histogram_bucket{key1="attributeValue1",otel_scope_name="test-prometheus",otel_scope_version="1",le="50"} 1',
        'test_histogram_bucket{key1="attributeValue1",otel_scope_name="test-prometheus",otel_scope_version="1",le="75"} 1',
        'test_histogram_bucket{key1="attributeValue1",otel_scope_name="test-prometheus",otel_scope_version="1",le="100"} 1',
        'test_histogram_bucket{key1="attributeValue1",otel_scope_name="test-prometheus",otel_scope_version="1",le="250"} 1',
        'test_histogram_bucket{key1="attributeValue1",otel_scope_name="test-prometheus",otel_scope_version="1",le="500"} 1',
        'test_histogram_bucket{key1="attributeValue1",otel_scope_name="test-prometheus",otel_scope_version="1",le="750"} 1',
        'test_histogram_bucket{key1="attributeValue1",otel_scope_name="test-prometheus",otel_scope_version="1",le="1000"} 1',
        'test_histogram_bucket{key1="attributeValue1",otel_scope_name="test-prometheus",otel_scope_version="1",le="2500"} 1',
        'test_histogram_bucket{key1="attributeValue1",otel_scope_name="test-prometheus",otel_scope_version="1",le="5000"} 1',
        'test_histogram_bucket{key1="attributeValue1",otel_scope_name="test-prometheus",otel_scope_version="1",le="7500"} 1',
        'test_histogram_bucket{key1="attributeValue1",otel_scope_name="test-prometheus",otel_scope_version="1",le="10000"} 1',
        'test_histogram_bucket{key1="attributeValue1",otel_scope_name="test-prometheus",otel_scope_version="1",le="+Inf"} 1',
        '',
      ]);
    });
  });

  describe('configuration', () => {
    let meter: Meter;
    let meterProvider: MeterProvider;
    let counter: Counter;
    let exporter: PrometheusExporter;

    function setup(reader: PrometheusExporter) {
      meterProvider = new MeterProvider({
        readers: [exporter],
      });

      meter = meterProvider.getMeter('test-prometheus');
      counter = meter.createCounter('counter');
      counter.add(10, { key1: 'attributeValue1' });
    }

    afterEach(async () => {
      await exporter.shutdown();
    });

    it('should use a configured name prefix', async () => {
      exporter = new PrometheusExporter({
        prefix: 'test_prefix',
      });
      setup(exporter);
      const body = await request('http://localhost:9464/metrics');
      const lines = body.split('\n');

      assert.deepStrictEqual(lines, [
        ...serializedDefaultResourceLines,
        '# HELP test_prefix_counter_total description missing',
        '# TYPE test_prefix_counter_total counter',
        'test_prefix_counter_total{key1="attributeValue1",otel_scope_name="test-prometheus"} 10',
        '',
      ]);
    });

    it('should use a configured port', async () => {
      exporter = new PrometheusExporter({
        port: 8080,
      });

      setup(exporter);
      const body = await request('http://localhost:8080/metrics');
      const lines = body.split('\n');

      assert.deepStrictEqual(lines, [
        ...serializedDefaultResourceLines,
        '# HELP counter_total description missing',
        '# TYPE counter_total counter',
        'counter_total{key1="attributeValue1",otel_scope_name="test-prometheus"} 10',
        '',
      ]);
    });

    it('should use a configured endpoint', async () => {
      exporter = new PrometheusExporter({
        endpoint: '/test',
      });

      setup(exporter);
      const body = await request('http://localhost:9464/test');
      const lines = body.split('\n');

      assert.deepStrictEqual(lines, [
        ...serializedDefaultResourceLines,
        '# HELP counter_total description missing',
        '# TYPE counter_total counter',
        'counter_total{key1="attributeValue1",otel_scope_name="test-prometheus"} 10',
        '',
      ]);
    });

    it('should export a metric with timestamp', async () => {
      exporter = new PrometheusExporter({
        appendTimestamp: true,
      });
      setup(exporter);
      const body = await request('http://localhost:9464/metrics');
      const lines = body.split('\n');

      assert.deepStrictEqual(lines, [
        ...serializedDefaultResourceLines,
        '# HELP counter_total description missing',
        '# TYPE counter_total counter',
        `counter_total{key1="attributeValue1",otel_scope_name="test-prometheus"} 10 ${mockedHrTimeMs}`,
        '',
      ]);
    });

    it('should export a metric with all resource attributes', async () => {
      exporter = new PrometheusExporter({
        withResourceConstantLabels: /.*/,
      });
      setup(exporter);
      const body = await request('http://localhost:9464/metrics');
      const lines = body.split('\n');

      assert.deepStrictEqual(lines, [
        ...serializedDefaultResourceLines,
        '# HELP counter_total description missing',
        '# TYPE counter_total counter',
        `counter_total{key1="attributeValue1",otel_scope_name="test-prometheus",service_name="${serviceName}",telemetry_sdk_language="${sdkLanguage}",telemetry_sdk_name="${sdkName}",telemetry_sdk_version="${sdkVersion}"} 10`,
        '',
      ]);
    });

    it('should export a metric with two resource attributes', async () => {
      exporter = new PrometheusExporter({
        withResourceConstantLabels: /telemetry.sdk.language|telemetry.sdk.name/,
      });
      setup(exporter);
      const body = await request('http://localhost:9464/metrics');
      const lines = body.split('\n');

      assert.deepStrictEqual(lines, [
        ...serializedDefaultResourceLines,
        '# HELP counter_total description missing',
        '# TYPE counter_total counter',
        `counter_total{key1="attributeValue1",otel_scope_name="test-prometheus",telemetry_sdk_language="${sdkLanguage}",telemetry_sdk_name="${sdkName}"} 10`,
        '',
      ]);
    });

    it('should omit target_info if withoutTargetInfo is true', async () => {
      exporter = new PrometheusExporter({ withoutTargetInfo: true });
      setup(exporter);
      const body = await request('http://localhost:9464/metrics');

      assert.deepStrictEqual(body.includes('target_info'), false);
    });

    it('should omit scope labels if withoutScopeInfo is true', async () => {
      exporter = new PrometheusExporter({ withoutScopeInfo: true });
      setup(exporter);
      const body = await request('http://localhost:9464/metrics');
      const lines = body.split('\n');

      assert.deepStrictEqual(lines, [
        ...serializedDefaultResourceLines,
        '# HELP counter_total description missing',
        '# TYPE counter_total counter',
        `counter_total{key1="attributeValue1"} 10`,
        '',
      ]);
    });
  });
});

class RequestStatusError extends Error {
  public statusCode: number | undefined;
  constructor(statusCode: number | undefined) {
    super('request failed with non-200 code');
    this.statusCode = statusCode;
  }
}

function request(url: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    http
      .get(url, res => {
        res.setEncoding('utf8');
        let result = '';

        res.on('data', chunk => {
          result += chunk;
        });
        res.on('end', () => {
          if (res.statusCode !== 200) {
            reject(new RequestStatusError(res.statusCode));
            return;
          }
          resolve(result);
        });
      })
      .on('error', reject);
  });
}
