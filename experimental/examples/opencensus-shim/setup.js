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

const { DiagConsoleLogger, diag, DiagLogLevel } = require('@opentelemetry/api');
const {
  NodeTracerProvider,
  BatchSpanProcessor,
} = require('@opentelemetry/sdk-trace-node');
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-grpc');
const { Resource } = require('@opentelemetry/resources');
const {
  SemanticResourceAttributes,
} = require('@opentelemetry/semantic-conventions');

module.exports = function setup(serviceName) {
  const tracing = require('@opencensus/nodejs');

  diag.setLogger(new DiagConsoleLogger(), { logLevel: DiagLogLevel.ALL });
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
  });
  provider.addSpanProcessor(
    new BatchSpanProcessor(new OTLPTraceExporter(), {
      scheduledDelayMillis: 5000,
    })
  );
  provider.register();

  // Start OpenCensus tracing
  tracing.start({ samplingRate: 1, logger: diag });

  return provider;
};
