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

import { HttpTextPropagator, metrics } from '@opentelemetry/api';
import { ContextManager } from '@opentelemetry/context-base';
import { MeterConfig, MeterProvider } from '@opentelemetry/metrics';
import { NodeTracerConfig, NodeTracerProvider } from '@opentelemetry/node';
import { detectResources, Resource } from '@opentelemetry/resources';
import { BatchSpanProcessor, SpanProcessor } from '@opentelemetry/tracing';
import { NodeSDKConfiguration } from './types';

export class NodeSDK {
  private _tracerProviderConfig?: {
    tracerConfig: NodeTracerConfig;
    spanProcessor: SpanProcessor;
    contextManager?: ContextManager;
    httpTextPropagator?: HttpTextPropagator;
  };
  private _meterProviderConfig?: MeterConfig;

  private _traceResource: Resource;
  private _metricsResource: Resource;

  public constructor(configuration: Partial<NodeSDKConfiguration> = {}) {
    const resource = configuration.resource ?? new Resource({});

    this._traceResource = configuration.traceResource ?? new Resource({});
    this._metricsResource = configuration.metricResource ?? new Resource({});

    this._traceResource = this._traceResource.merge(resource);
    this._metricsResource = this._metricsResource.merge(resource);

    if (configuration.spanProcessor || configuration.traceExporter) {
      const tracerProviderConfig = {
        defaultAttributes: configuration.defaultAttributes,
        logLevel: configuration.logLevel,
        logger: configuration.logger,
        plugins: configuration.plugins,
        sampler: configuration.sampler,
        traceParams: configuration.traceParams,
      };

      const spanProcessor =
        configuration.spanProcessor ??
        new BatchSpanProcessor(configuration.traceExporter!);

      this.configureTracerProvider(
        tracerProviderConfig,
        spanProcessor,
        configuration.contextManager,
        configuration.httpTextPropagator
      );
    }

    if (configuration.metricExporter) {
      this.configureMeterProvider({
        batcher: configuration.metricBatcher,
        exporter: configuration.metricExporter,
        interval: configuration.metricInterval,
        logLevel: configuration.logLevel,
        logger: configuration.logger,
      });
    }
  }

  public configureTracerProvider(
    tracerConfig: NodeTracerConfig,
    spanProcessor: SpanProcessor,
    contextManager?: ContextManager,
    httpTextPropagator?: HttpTextPropagator
  ) {
    this._tracerProviderConfig = {
      tracerConfig,
      spanProcessor,
      contextManager,
      httpTextPropagator,
    };
  }

  public configureMeterProvider(config: MeterConfig) {
    this._meterProviderConfig = config;
  }

  public async detectResources() {
    this.addResource(await detectResources());
  }

  public async addResource(resource: Resource) {
    this.addTraceResource(resource);
    this.addMetricsResource(resource);
  }

  public async addTraceResource(resource: Resource) {
    this._traceResource.merge(resource);
  }

  public async addMetricsResource(resource: Resource) {
    this._metricsResource.merge(resource);
  }

  public start() {
    if (this._tracerProviderConfig) {
      const tracerProvider = new NodeTracerProvider({
        ...this._tracerProviderConfig,
        resource: this._traceResource,
      });

      tracerProvider.addSpanProcessor(this._tracerProviderConfig.spanProcessor);
      tracerProvider.register({
        contextManager: this._tracerProviderConfig.contextManager,
        propagator: this._tracerProviderConfig.httpTextPropagator,
      });
    }

    if (this._meterProviderConfig) {
      const meterProvider = new MeterProvider({
        ...this._meterProviderConfig,
        resource: this._metricsResource,
      });

      metrics.setGlobalMeterProvider(meterProvider);
    }
  }
}
