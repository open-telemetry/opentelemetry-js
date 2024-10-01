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
  InMemoryMetricExporter,
  MeterProvider,
} from '@opentelemetry/sdk-metrics';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import * as assert from 'assert';
import { HttpInstrumentation } from '../../src/http';
import { httpRequest } from '../utils/httpRequest';
import { TestMetricReader } from '../utils/TestMetricReader';

const instrumentation = new HttpInstrumentation({ disableMetrics: true });
instrumentation.enable();
instrumentation.disable();

import * as http from 'http';

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

describe('metrics can be disabled', () => {
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

  it('should not create server/client duration metrics', async () => {
    const requestCount = 3;
    for (let i = 0; i < requestCount; i++) {
      await httpRequest.get(
        `${protocol}://${hostname}:${serverPort}${pathname}`
      );
    }
    await metricReader.collectAndExport();
    const resourceMetrics = metricsMemoryExporter.getMetrics();
    const scopeMetrics = resourceMetrics[0].scopeMetrics;
    assert.strictEqual(scopeMetrics.length, 0, 'scopeMetrics count');
  });
});
