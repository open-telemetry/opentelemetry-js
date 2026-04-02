/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import { createOtlpHttpExportDelegate } from '../../src/otlp-http-export-delegate';
import type { ISerializer } from '@opentelemetry/otlp-transformer';
import { ExportResultCode } from '@opentelemetry/core';

import * as sinon from 'sinon';
import * as http from 'http';
import * as assert from 'assert';
import { TestMetricReader } from '../testHelper';
import { type Histogram, MeterProvider } from '@opentelemetry/sdk-metrics';

// IMPLEMENTATION NOTE:
//
// This file should only include rather simple test cases for integration testing the used components.
// Think: "is the correct component used?", rather than "does the underlying component work correctly?"
// Features and fixes for components that are used by createOtlpHttpExportDelegate() should be tested in-depth
// in the component's respective unit-test files.

describe('createOtlpHttpExportDelegate', function () {
  let server: http.Server;
  let handler: (req: http.IncomingMessage, resp: http.ServerResponse) => void;
  beforeEach(function (done) {
    handler = (request, response) => {
      response.statusCode = 200;
      response.end('Test Server Response');
    };
    server = http.createServer((request, response) => {
      handler(request, response);
    });
    server.listen(8083);
    server.once('listening', () => {
      done();
    });
  });

  afterEach(function (done) {
    server.close(() => {
      done();
    });
  });

  it('creates delegate that exports via http', function (done) {
    const serializer: ISerializer<string, string> = {
      serializeRequest: sinon.stub().returns(Buffer.from([1, 2, 3])),
      deserializeResponse: sinon.stub().returns('response'),
    };
    const delegate = createOtlpHttpExportDelegate(
      {
        url: 'http://localhost:8083',
        agentFactory: () => new http.Agent(),
        compression: 'none',
        concurrencyLimit: 30,
        headers: async () => ({}),
        timeoutMillis: 1000,
      },
      serializer,
      'test_component',
      { name: 'span', countItems: () => 1 },
      undefined
    );

    delegate.export('foo', result => {
      try {
        assert.strictEqual(result.code, ExportResultCode.SUCCESS);
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('records metrics for success', async () => {
    const metricReader = new TestMetricReader();
    const meterProvider = new MeterProvider({
      readers: [metricReader],
    });
    const serializer: ISerializer<string, string> = {
      serializeRequest: sinon.stub().returns(Buffer.from([1, 2, 3])),
      deserializeResponse: sinon.stub().returns('response'),
    };
    const delegate = createOtlpHttpExportDelegate(
      {
        url: 'http://localhost:8083',
        agentFactory: () => new http.Agent(),
        compression: 'none',
        concurrencyLimit: 30,
        headers: async () => ({}),
        timeoutMillis: 1000,
      },
      serializer,
      'test_http_exporter',
      { name: 'metric_data_point', countItems: () => 1 },
      meterProvider
    );

    await new Promise<void>((resolve, reject) =>
      delegate.export('foo', result => {
        try {
          assert.strictEqual(result.code, ExportResultCode.SUCCESS);
          resolve();
        } catch (e) {
          reject(e);
        }
      })
    );

    const { resourceMetrics } = await metricReader.collect();
    const metrics = resourceMetrics.scopeMetrics[0].metrics;
    const duration = metrics.find(
      metric =>
        metric.descriptor.name === 'otel.sdk.exporter.operation.duration'
    );
    assert.ok(duration);
    const histogram = duration.dataPoints[0].value as Histogram;
    assert.strictEqual(histogram.count, 1);
    assert.strictEqual(histogram.count, 1);
    assert.deepStrictEqual(duration.dataPoints[0].attributes, {
      'otel.component.type': 'test_http_exporter',
      'otel.component.name': 'test_http_exporter/0',
      'server.address': 'localhost',
      'server.port': 8083,
      'http.response.status_code': 200,
    });
  });

  it('records metrics for error', async () => {
    handler = (request, response) => {
      response.statusCode = 501;
      response.end();
    };
    const metricReader = new TestMetricReader();
    const meterProvider = new MeterProvider({
      readers: [metricReader],
    });
    const serializer: ISerializer<string, string> = {
      serializeRequest: sinon.stub().returns(Buffer.from([1, 2, 3])),
      deserializeResponse: sinon.stub().returns('response'),
    };
    const delegate = createOtlpHttpExportDelegate(
      {
        url: 'http://localhost:8083',
        agentFactory: () => new http.Agent(),
        compression: 'none',
        concurrencyLimit: 30,
        headers: async () => ({}),
        timeoutMillis: 1000,
      },
      serializer,
      'test_http_exporter',
      { name: 'metric_data_point', countItems: () => 1 },
      meterProvider
    );

    await new Promise<void>((resolve, reject) =>
      delegate.export('foo', result => {
        try {
          assert.strictEqual(result.code, ExportResultCode.FAILED);
          resolve();
        } catch (e) {
          reject(e);
        }
      })
    );

    const { resourceMetrics } = await metricReader.collect();
    const metrics = resourceMetrics.scopeMetrics[0].metrics;
    const duration = metrics.find(
      metric =>
        metric.descriptor.name === 'otel.sdk.exporter.operation.duration'
    );
    assert.ok(duration);
    const histogram = duration.dataPoints[0].value as Histogram;
    assert.strictEqual(histogram.count, 1);
    assert.strictEqual(histogram.count, 1);
    assert.deepStrictEqual(duration.dataPoints[0].attributes, {
      'otel.component.type': 'test_http_exporter',
      'otel.component.name': 'test_http_exporter/1',
      'server.address': 'localhost',
      'server.port': 8083,
      'http.response.status_code': 501,
      'error.type': 'OTLPExporterError',
    });
  });
});
