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
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import * as assert from 'assert';
import { HttpInstrumentation } from '../../src/http';
import { httpRequest } from '../utils/httpRequest';
import { TestMetricReader } from '../utils/TestMetricReader';

const instrumentation = new HttpInstrumentation();
instrumentation.enable();
instrumentation.disable();

import * as http from 'http';

let server: http.Server;
const serverPort = 22346;
const protocol = 'http';
const hostname = 'localhost';
const pathname = '/test';
const tracerProvider = new NodeTracerProvider();
const meterProvider = new MeterProvider();
const metricsMemoryExporter = new InMemoryMetricExporter(
  AggregationTemporality.DELTA
);
const metricReader = new TestMetricReader(metricsMemoryExporter);

meterProvider.addMetricReader(metricReader);
instrumentation.setTracerProvider(tracerProvider);
instrumentation.setMeterProvider(meterProvider);

describe('metrics', () => {
  beforeEach(() => {
    metricsMemoryExporter.reset();
  });

  before(() => {
    instrumentation.enable();
    server = http.createServer((request, response) => {
      response.end('Test Server Response');
    });
    server.listen(serverPort);
  });

  after(() => {
    server.close();
    instrumentation.disable();
  });

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
      'Measures the duration of inbound HTTP requests.'
    );
    assert.strictEqual(metrics[0].descriptor.name, 'http.server.duration');
    assert.strictEqual(metrics[0].descriptor.unit, 'ms');
    assert.strictEqual(metrics[0].dataPoints.length, 1);
    assert.strictEqual(
      (metrics[0].dataPoints[0].value as any).count,
      requestCount
    );
    assert.strictEqual(
      metrics[0].dataPoints[0].attributes[SemanticAttributes.HTTP_SCHEME],
      'http'
    );
    assert.strictEqual(
      metrics[0].dataPoints[0].attributes[SemanticAttributes.HTTP_METHOD],
      'GET'
    );
    assert.strictEqual(
      metrics[0].dataPoints[0].attributes[SemanticAttributes.HTTP_FLAVOR],
      '1.1'
    );
    assert.strictEqual(
      metrics[0].dataPoints[0].attributes[SemanticAttributes.NET_HOST_NAME],
      'localhost'
    );
    assert.strictEqual(
      metrics[0].dataPoints[0].attributes[SemanticAttributes.HTTP_STATUS_CODE],
      200
    );
    assert.strictEqual(
      metrics[0].dataPoints[0].attributes[SemanticAttributes.NET_HOST_PORT],
      22346
    );

    assert.strictEqual(metrics[1].dataPointType, DataPointType.HISTOGRAM);
    assert.strictEqual(
      metrics[1].descriptor.description,
      'Measures the duration of outbound HTTP requests.'
    );
    assert.strictEqual(metrics[1].descriptor.name, 'http.client.duration');
    assert.strictEqual(metrics[1].descriptor.unit, 'ms');
    assert.strictEqual(metrics[1].dataPoints.length, 1);
    assert.strictEqual(
      (metrics[1].dataPoints[0].value as any).count,
      requestCount
    );
    assert.strictEqual(
      metrics[1].dataPoints[0].attributes[SemanticAttributes.HTTP_METHOD],
      'GET'
    );
    assert.strictEqual(
      metrics[1].dataPoints[0].attributes[SemanticAttributes.NET_PEER_NAME],
      'localhost'
    );
    assert.strictEqual(
      metrics[1].dataPoints[0].attributes[SemanticAttributes.NET_PEER_PORT],
      22346
    );
    assert.strictEqual(
      metrics[1].dataPoints[0].attributes[SemanticAttributes.HTTP_STATUS_CODE],
      200
    );
    assert.strictEqual(
      metrics[1].dataPoints[0].attributes[SemanticAttributes.HTTP_FLAVOR],
      '1.1'
    );
  });
});
