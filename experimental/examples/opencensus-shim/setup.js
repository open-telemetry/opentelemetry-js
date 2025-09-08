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
