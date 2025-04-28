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
import {
  AggregationTemporality,
  DataPointType,
  InMemoryMetricExporter,
  MeterProvider,
} from '@opentelemetry/sdk-metrics';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import {
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_HTTP_ROUTE,
  ATTR_NETWORK_PROTOCOL_VERSION,
  ATTR_SERVER_ADDRESS,
  ATTR_SERVER_PORT,
  ATTR_URL_SCHEME,
} from '@opentelemetry/semantic-conventions';
import * as assert from 'assert';
import { HttpInstrumentation } from '../../src/http';
import { httpRequest } from '../utils/httpRequest';
import { TestMetricReader } from '../utils/TestMetricReader';
import { context, ContextManager } from '@opentelemetry/api';

const instrumentation = new HttpInstrumentation();
instrumentation.enable();
instrumentation.disable();

import * as http from 'http';
import { getRPCMetadata, RPCType } from '@opentelemetry/core';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';

let server: http.Server;
const serverPort = 22346;
const protocol = 'http';
const hostname = 'localhost';
const pathname = '/test';
const tracerProvider = new NodeTracerProvider();
const metricsMemoryExporter = new InMemoryMetricExporter(
  AggregationTemporality.DELTA
);
const metricReader = new TestMetricReader(metricsMemoryExporter);
const meterProvider = new MeterProvider({ readers: [metricReader] });

instrumentation.setTracerProvider(tracerProvider);
instrumentation.setMeterProvider(meterProvider);

describe('metrics', () => {
  let contextManager: ContextManager;

  beforeEach(() => {
    contextManager = new AsyncHooksContextManager().enable();
    context.setGlobalContextManager(contextManager);
    instrumentation['_updateMetricInstruments']();
    metricsMemoryExporter.reset();
  });

  before(() => {
    instrumentation.setConfig({});
    instrumentation.enable();
    server = http.createServer((request, response) => {
      const rpcData = getRPCMetadata(context.active());
      assert.ok(rpcData != null);
      assert.strictEqual(rpcData.type, RPCType.HTTP);
      assert.strictEqual(rpcData.route, undefined);
      rpcData.route = 'TheRoute';
      response.end('Test Server Response');
    });
    server.listen(serverPort);
  });

  after(() => {
    server.close();
    instrumentation.disable();
  });

  describe('using semconv stability attributes', () => {
    it('should add server/client duration metrics', async () => {
      const requestCount = 3;
      for (let i = 0; i < requestCount; i++) {
        await httpRequest.get(
          `${protocol}://${hostname}:${serverPort}${pathname}`
        );
      }
      await metricReader.collectAndExport();
      const resourceMetrics = metricsMemoryExporter.getMetrics();
      const scopeMetrics = resourceMetrics[0].scopeMetrics;
      assert.strictEqual(scopeMetrics.length, 1, 'scopeMetrics count');
      const metrics = scopeMetrics[0].metrics;
      assert.strictEqual(metrics.length, 2, 'metrics count');
      assert.strictEqual(metrics[0].dataPointType, DataPointType.HISTOGRAM);
      assert.strictEqual(
        metrics[0].descriptor.description,
        'Duration of HTTP server requests.'
      );
      assert.strictEqual(
        metrics[0].descriptor.name,
        'http.server.request.duration'
      );
      assert.strictEqual(metrics[0].descriptor.unit, 's');
      assert.strictEqual(metrics[0].dataPoints.length, 1);
      assert.strictEqual(
        (metrics[0].dataPoints[0].value as any).count,
        requestCount
      );
      assert.deepStrictEqual(metrics[0].dataPoints[0].attributes, {
        [ATTR_HTTP_REQUEST_METHOD]: 'GET',
        [ATTR_URL_SCHEME]: 'http',
        [ATTR_HTTP_RESPONSE_STATUS_CODE]: 200,
        [ATTR_NETWORK_PROTOCOL_VERSION]: '1.1',
        [ATTR_HTTP_ROUTE]: 'TheRoute',
      });

      assert.strictEqual(metrics[1].dataPointType, DataPointType.HISTOGRAM);
      assert.strictEqual(
        metrics[1].descriptor.description,
        'Duration of HTTP client requests.'
      );
      assert.strictEqual(
        metrics[1].descriptor.name,
        'http.client.request.duration'
      );
      assert.strictEqual(metrics[1].descriptor.unit, 's');
      assert.strictEqual(metrics[1].dataPoints.length, 1);
      assert.strictEqual(
        (metrics[1].dataPoints[0].value as any).count,
        requestCount
      );

      assert.deepStrictEqual(metrics[1].dataPoints[0].attributes, {
        [ATTR_HTTP_REQUEST_METHOD]: 'GET',
        [ATTR_SERVER_ADDRESS]: 'localhost',
        [ATTR_SERVER_PORT]: 22346,
        [ATTR_NETWORK_PROTOCOL_VERSION]: '1.1',
        [ATTR_HTTP_RESPONSE_STATUS_CODE]: 200,
      });
    });
  });
});
