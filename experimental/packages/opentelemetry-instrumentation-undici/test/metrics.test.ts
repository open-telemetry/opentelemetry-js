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

import { context, propagation } from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import {
  AggregationTemporality,
  DataPointType,
  InMemoryMetricExporter,
  MeterProvider,
} from '@opentelemetry/sdk-metrics';

import { UndiciInstrumentation } from '../src/undici';

import { MockServer } from './utils/mock-server';
import { MockMetricsReader } from './utils/mock-metrics-reader';
import { SemanticAttributes } from '../src/enums/SemanticAttributes';

const instrumentation = new UndiciInstrumentation();
instrumentation.enable();
instrumentation.disable();

const protocol = 'http';
const hostname = 'localhost';
const mockServer = new MockServer();
const provider = new NodeTracerProvider();
const meterProvider = new MeterProvider();
// const memoryExporter = new InMemorySpanExporter();
const metricsMemoryExporter = new InMemoryMetricExporter(
  AggregationTemporality.DELTA
);
const metricReader = new MockMetricsReader(metricsMemoryExporter);
meterProvider.addMetricReader(metricReader);
// provider.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));
instrumentation.setTracerProvider(provider);
instrumentation.setMeterProvider(meterProvider);

describe('UndiciInstrumentation metrics tests', function () {
  before(function (done) {
    // Do not test if the `fetch` global API is not available
    // This applies to nodejs < v18 or nodejs < v16.15 wihtout the flag
    // `--experimental-global-fetch` set
    // https://nodejs.org/api/globals.html#fetch
    if (typeof globalThis.fetch !== 'function') {
      this.skip();
    }

    context.setGlobalContextManager(new AsyncHooksContextManager().enable());
    mockServer.start(done);
    mockServer.mockListener((req, res) => {
      // Return a valid response always
      res.statusCode = 200;
      res.setHeader('content-type', 'application/json');
      res.write(JSON.stringify({ success: true }));
      res.end();
    });

    // enable instrumentation for all tests
    instrumentation.enable();
  });

  after(function (done) {
    instrumentation.disable();
    context.disable();
    propagation.disable();
    mockServer.mockListener(undefined);
    mockServer.stop(done);
  });

  beforeEach(function () {
    metricsMemoryExporter.reset();
  });

  describe('with fetch API', function () {
    before(function (done) {
      // Do not test if the `fetch` global API is not available
      // This applies to nodejs < v18 or nodejs < v16.15 wihtout the flag
      // `--experimental-global-fetch` set
      // https://nodejs.org/api/globals.html#fetch
      if (typeof globalThis.fetch !== 'function') {
        this.skip();
      }

      done();
    });

    it('should report "http.client.request.duration" metric', async () => {
      const fetchUrl = `${protocol}://${hostname}:${mockServer.port}/?query=test`;
      await fetch(fetchUrl);

      await metricReader.collectAndExport();
      const resourceMetrics = metricsMemoryExporter.getMetrics();
      const scopeMetrics = resourceMetrics[0].scopeMetrics;
      const metrics = scopeMetrics[0].metrics;

      assert.strictEqual(scopeMetrics.length, 1, 'scopeMetrics count');
      assert.strictEqual(metrics.length, 1, 'metrics count');
      assert.strictEqual(
        metrics[0].descriptor.name,
        'http.client.request.duration'
      );
      assert.strictEqual(
        metrics[0].descriptor.description,
        'Measures the duration of outbound HTTP requests.'
      );
      assert.strictEqual(metrics[0].descriptor.unit, 'ms');
      assert.strictEqual(metrics[0].dataPointType, DataPointType.HISTOGRAM);
      assert.strictEqual(metrics[0].dataPoints.length, 1);

      const metricAttributes = metrics[0].dataPoints[0].attributes;
      assert.strictEqual(
        metricAttributes[SemanticAttributes.URL_SCHEME],
        'http'
      );
      assert.strictEqual(
        metricAttributes[SemanticAttributes.HTTP_REQUEST_METHOD],
        'GET'
      );
      assert.strictEqual(
        metricAttributes[SemanticAttributes.SERVER_ADDRESS],
        'localhost'
      );
      assert.strictEqual(
        metricAttributes[SemanticAttributes.SERVER_PORT],
        mockServer.port
      );
      assert.strictEqual(
        metricAttributes[SemanticAttributes.HTTP_RESPONSE_STATUS_CODE],
        200
      );
    });

    it('should have error.type in "http.client.request.duration" metric', async () => {
      const fetchUrl = 'http://unknownhost/';

      try {
        await fetch(fetchUrl);
      } catch (err) {
        // Expected error, do nothing
      }

      await metricReader.collectAndExport();
      const resourceMetrics = metricsMemoryExporter.getMetrics();
      const scopeMetrics = resourceMetrics[0].scopeMetrics;
      const metrics = scopeMetrics[0].metrics;

      assert.strictEqual(scopeMetrics.length, 1, 'scopeMetrics count');
      assert.strictEqual(metrics.length, 1, 'metrics count');
      assert.strictEqual(
        metrics[0].descriptor.name,
        'http.client.request.duration'
      );
      assert.strictEqual(
        metrics[0].descriptor.description,
        'Measures the duration of outbound HTTP requests.'
      );
      assert.strictEqual(metrics[0].descriptor.unit, 'ms');
      assert.strictEqual(metrics[0].dataPointType, DataPointType.HISTOGRAM);
      assert.strictEqual(metrics[0].dataPoints.length, 1);

      const metricAttributes = metrics[0].dataPoints[0].attributes;
      assert.strictEqual(
        metricAttributes[SemanticAttributes.URL_SCHEME],
        'http'
      );
      assert.strictEqual(
        metricAttributes[SemanticAttributes.HTTP_REQUEST_METHOD],
        'GET'
      );
      assert.strictEqual(
        metricAttributes[SemanticAttributes.SERVER_ADDRESS],
        'unknownhost'
      );
      assert.strictEqual(metricAttributes[SemanticAttributes.SERVER_PORT], 80);
      assert.ok(
        metricAttributes[SemanticAttributes.ERROR_TYPE],
        `the metric contains "${SemanticAttributes.ERROR_TYPE}" attribute if request failed`
      );
    });
  });
});
