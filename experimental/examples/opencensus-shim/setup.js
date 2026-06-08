/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

const { diag, metrics } = require('@opentelemetry/api');
const {
  NodeTracerProvider,
  BatchSpanProcessor,
} = require('@opentelemetry/sdk-trace-node');
const { MeterProvider } = require('@opentelemetry/sdk-metrics');
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-grpc');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');
const { OpenCensusMetricProducer } = require('@opentelemetry/shim-opencensus');
const instrumentationHttp = require('@opencensus/instrumentation-http');
const { TracingBase } = require('@opencensus/nodejs-base');
const oc = require('@opencensus/core');

module.exports = function setup(serviceName) {
  /**
   * You can alternatively just use the @opentelemetry/nodejs package directly:
   *
   * ```js
   * const tracing = require('@opencensus/nodejs');
   * ```
   */
  const tracing = new TracingBase(['http']);
  tracing.tracer = new oc.CoreTracer();

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
  });
  const tracerProvider = new NodeTracerProvider({
    resource,
    spanProcessors: [
      new BatchSpanProcessor(new OTLPTraceExporter(), {
        scheduledDelayMillis: 5000,
      }),
    ],
  });
  tracerProvider.register();

  const meterProvider = new MeterProvider({
    resource,
    readers: [
      new PrometheusExporter({
        metricProducers: [
          new OpenCensusMetricProducer({
            openCensusMetricProducerManager:
              oc.Metrics.getMetricProducerManager(),
          }),
        ],
      }),
    ],
  });
  metrics.setGlobalMeterProvider(meterProvider);

  // Start OpenCensus tracing
  tracing.start({ samplingRate: 1, logger: diag, stats: oc.globalStats });
  // Register OpenCensus HTTP stats views
  instrumentationHttp.registerAllViews(oc.globalStats);

  return tracerProvider;
};
