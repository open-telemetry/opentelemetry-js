/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { OTLPMetricExporter, createOtlpGrpcMetricExporter } from '../src';
import type { ServerTestContext } from './utils';
import { startServer, TestMetricReader } from './utils';
import * as assert from 'assert';
import { AggregationTemporalityPreference } from '@opentelemetry/exporter-metrics-otlp-http';
import {
  AggregationTemporality,
  InstrumentType,
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';

const testServiceDefinition = {
  export: {
    path: '/opentelemetry.proto.collector.metrics.v1.MetricsService/Export',
    requestStream: false,
    responseStream: false,
    requestSerialize: (arg: Buffer) => {
      return arg;
    },
    requestDeserialize: (arg: Buffer) => {
      return arg;
    },
    responseSerialize: (arg: Buffer) => {
      return arg;
    },
    responseDeserialize: (arg: Buffer) => {
      return arg;
    },
  },
};

/*
 * NOTE: Tests here are not intended to test the underlying components directly. They are intended as a quick
 * check if the correct components are used. Use the following packages to test details:
 * - `@opentelemetry/oltp-exporter-base`: OTLP common exporter logic (handling of concurrent exports, ...)
 * - `@opentelemetry/otlp-transformer`: Everything regarding serialization and transforming internal representations to OTLP
 * - `@opentelemetry/otlp-grpc-exporter-base`: gRPC transport
 */
describe('OTLPMetricsExporter', function () {
  let shutdownHandle: () => void | undefined;
  const serverTestContext: ServerTestContext = {
    requests: [],
    serverResponseProvider: () => {
      return { error: null, buffer: Buffer.from([]) };
    },
  };

  beforeEach(async function () {
    shutdownHandle = await startServer(
      'localhost:1502',
      testServiceDefinition,
      serverTestContext
    );
  });

  afterEach(function () {
    shutdownHandle();

    // clear context
    serverTestContext.requests = [];
    serverTestContext.serverResponseProvider = () => {
      return { error: null, buffer: Buffer.from([]) };
    };
  });

  it('successfully exports data', async () => {
    // arrange
    const testMetricReader = new TestMetricReader();
    const exporter = new OTLPMetricExporter({ url: 'http://localhost:1502' });
    const meterProvider = new MeterProvider({
      readers: [
        new PeriodicExportingMetricReader({
          exporter,
        }),
        testMetricReader,
      ],
    });
    exporter.setSelfObsMeterProvider(meterProvider);

    // act
    meterProvider.getMeter('test-meter').createCounter('test-counter').add(1);
    await meterProvider.forceFlush();

    // assert
    assert.strictEqual(serverTestContext.requests.length, 1);

    const metrics = await testMetricReader.collect();
    const scopeMetrics = metrics.resourceMetrics.scopeMetrics.find(
      sm => sm.scope.name === '@opentelemetry/otlp-exporter'
    );
    assert.ok(scopeMetrics);
    await meterProvider.shutdown();
  });

  describe('createOtlpGrpcMetricExporter', function () {
    afterEach(function () {
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE;
    });

    it('does not read OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE from the environment', function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE = 'delta';

      // control: the class-based exporter keeps using the environment
      assert.equal(
        new OTLPMetricExporter().selectAggregationTemporality(
          InstrumentType.COUNTER
        ),
        AggregationTemporality.DELTA
      );

      // the factory-created exporter uses the specification default instead
      assert.equal(
        createOtlpGrpcMetricExporter().selectAggregationTemporality!(
          InstrumentType.COUNTER
        ),
        AggregationTemporality.CUMULATIVE
      );
    });

    it('honors an explicit temporalityPreference over the specification default', function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE =
        'cumulative';

      assert.equal(
        createOtlpGrpcMetricExporter({
          temporalityPreference: AggregationTemporalityPreference.DELTA,
        }).selectAggregationTemporality!(InstrumentType.COUNTER),
        AggregationTemporality.DELTA
      );
    });

    it('successfully exports data', async () => {
      // arrange
      const exporter = createOtlpGrpcMetricExporter({
        url: 'http://localhost:1502',
      });
      const meterProvider = new MeterProvider({
        readers: [new PeriodicExportingMetricReader({ exporter })],
      });

      // act
      meterProvider.getMeter('test-meter').createCounter('test-counter').add(1);
      await meterProvider.forceFlush();

      // assert
      assert.strictEqual(serverTestContext.requests.length, 1);
      await meterProvider.shutdown();
    });
  });
});
