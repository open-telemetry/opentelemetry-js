/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as http from 'http';
import * as sinon from 'sinon';
import { Stream } from 'stream';

import { type Attributes } from '@opentelemetry/api';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { TracerProvider, SimpleSpanProcessor } from '@opentelemetry/sdk-trace';
import {
  createOtlpHttpSpanExporter,
  OTLPTraceExporter,
} from '../../src/platform/node';
import { TestMetricReader } from '../utils';

/*
 * NOTE: Tests here are not intended to test the underlying components directly. They are intended as a quick
 * check if the correct components are used. Use the following packages to test details:
 * - `@opentelemetry/oltp-exporter-base`: OTLP common exporter logic (handling of concurrent exports, ...), HTTP transport code
 * - `@opentelemetry/otlp-transformer`: Everything regarding serialization and transforming internal representations to OTLP
 */

describe('OTLPTraceExporter', () => {
  describe('export', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('successfully exports data', done => {
      const metricReader = new TestMetricReader();
      const meterProvider = new MeterProvider({
        readers: [metricReader],
      });

      const fakeRequest = new Stream.PassThrough();
      Object.defineProperty(fakeRequest, 'setTimeout', {
        value: function (_timeout: number) {},
      });

      sinon.stub(http, 'request').returns(fakeRequest as any);
      let buff = Buffer.from('');
      fakeRequest.on('finish', async () => {
        try {
          const requestBody = buff.toString();
          assert.doesNotThrow(() => {
            JSON.parse(requestBody);
          }, 'expected requestBody to be in JSON format, but parsing failed');

          const metrics = await metricReader.collect();
          const scopeMetrics = metrics.resourceMetrics.scopeMetrics.find(
            sm => sm.scope.name === '@opentelemetry/otlp-exporter'
          );
          assert.ok(scopeMetrics);

          done();
        } catch (e) {
          done(e);
        }
      });

      fakeRequest.on('data', chunk => {
        buff = Buffer.concat([buff, chunk]);
      });

      const tracerProvider = new TracerProvider({
        spanProcessors: [
          new SimpleSpanProcessor({
            exporter: new OTLPTraceExporter({
              selfObsMeterProvider: meterProvider,
            }),
          }),
        ],
      });

      tracerProvider.getTracer('test-tracer').startSpan('test-span').end();
    });
  });
});

describe('createOtlpHttpSpanExporter', () => {
  afterEach(() => {
    delete process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;
  });

  async function collectServerAttributes(
    metricReader: TestMetricReader
  ): Promise<Attributes[]> {
    const { resourceMetrics } = await metricReader.collect();
    const scopeMetrics = resourceMetrics.scopeMetrics.find(
      sm => sm.scope.name === '@opentelemetry/otlp-exporter'
    );
    return (
      scopeMetrics?.metrics.flatMap(metric =>
        metric.dataPoints.map(dataPoint => dataPoint.attributes)
      ) ?? []
    );
  }

  it('returns an exporter that does not use configuration from the environment', async () => {
    process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT =
      'http://127.0.0.1:9/v1/traces';

    const metricReader = new TestMetricReader();
    const meterProvider = new MeterProvider({
      readers: [metricReader],
    });
    const tracerProvider = new TracerProvider({
      spanProcessors: [
        new SimpleSpanProcessor({
          exporter: createOtlpHttpSpanExporter({
            selfObsMeterProvider: meterProvider,
          }),
        }),
      ],
    });

    // The exporter records the endpoint it targets in its own metrics,
    // synchronously when the export starts, so no request needs to complete
    // for this assertion (and there is nothing to shut down for it).
    tracerProvider.getTracer('test-tracer').startSpan('test-span').end();

    const serverAttributes = await collectServerAttributes(metricReader);
    assert.ok(
      serverAttributes.some(
        attrs =>
          attrs['server.address'] === 'localhost' &&
          attrs['server.port'] === 4318
      ),
      `expected exporter metrics to target the default endpoint, got ${JSON.stringify(
        serverAttributes
      )}`
    );
    await meterProvider.shutdown();
  });

  it('control: the class-based exporter keeps using the environment', async () => {
    process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT =
      'http://127.0.0.1:9/v1/traces';

    const metricReader = new TestMetricReader();
    const meterProvider = new MeterProvider({
      readers: [metricReader],
    });
    const tracerProvider = new TracerProvider({
      spanProcessors: [
        new SimpleSpanProcessor({
          exporter: new OTLPTraceExporter({
            selfObsMeterProvider: meterProvider,
          }),
        }),
      ],
    });

    tracerProvider.getTracer('test-tracer').startSpan('test-span').end();

    const serverAttributes = await collectServerAttributes(metricReader);
    assert.ok(
      serverAttributes.some(
        attrs =>
          attrs['server.address'] === '127.0.0.1' && attrs['server.port'] === 9
      ),
      `expected exporter metrics to target the env-provided endpoint, got ${JSON.stringify(
        serverAttributes
      )}`
    );
    await meterProvider.shutdown();
  });
});
