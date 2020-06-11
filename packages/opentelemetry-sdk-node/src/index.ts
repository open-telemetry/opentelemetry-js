/*!
 * Copyright 2020, OpenTelemetry Authors
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

import { metrics } from '@opentelemetry/api';
import { MeterProvider } from '@opentelemetry/metrics';
import { NodeTracerProvider } from '@opentelemetry/node';
import { detectResources, Resource } from '@opentelemetry/resources';
import { BatchSpanProcessor } from '@opentelemetry/tracing';
import { SDKConfiguration } from './types';

export * as api from '@opentelemetry/api';
export * as contextBase from '@opentelemetry/context-base';
export * as core from '@opentelemetry/core';
export * as metrics from '@opentelemetry/metrics';
export * as node from '@opentelemetry/node';
export * as resources from '@opentelemetry/resources';
export * as tracing from '@opentelemetry/tracing';

export async function configure(
  configuration: Partial<SDKConfiguration> = {}
): Promise<void> {
  const resource = await getResources(configuration);

  if (configuration.spanProcessor || configuration.traceExporter) {
    const traceResource =
      configuration.traceResource?.merge(resource) ?? resource;

    const tracerProvider = new NodeTracerProvider({
      defaultAttributes: configuration.defaultAttributes,
      logLevel: configuration.logLevel,
      logger: configuration.logger,
      plugins: configuration.plugins,
      resource: traceResource,
      sampler: configuration.sampler,
      traceParams: configuration.traceParams,
    });

    const spanProcessor =
      configuration.spanProcessor ??
      new BatchSpanProcessor(configuration.traceExporter!);

    tracerProvider.addSpanProcessor(spanProcessor);
    tracerProvider.register({
      contextManager: configuration.contextManager,
      propagator: configuration.httpTextPropagator,
    });
  }

  if (configuration.metricExporter) {
    const metricResource =
      configuration.metricResource?.merge(resource) ?? resource;

    const meterProvider = new MeterProvider({
      batcher: configuration.metricBatcher,
      exporter: configuration.metricExporter,
      interval: configuration.metricInterval,
      logLevel: configuration.logLevel,
      logger: configuration.logger,
      resource: metricResource,
    });

    metrics.setGlobalMeterProvider(meterProvider);
  }
}

async function getResources(configuration: Partial<SDKConfiguration>) {
  const autoDetectResources = configuration.autoDetectResources ?? true;

  if (autoDetectResources) {
    const autoDetectedResource = await detectResources();
    return (
      configuration.resource?.merge(autoDetectedResource) ??
      autoDetectedResource
    );
  }

  return configuration.resource ?? new Resource({});
}
