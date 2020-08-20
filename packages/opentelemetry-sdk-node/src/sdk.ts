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
import {
  detectResources,
  Resource,
  ResourceDetectionConfig,
  envDetector,
} from '@opentelemetry/resources';
import { BatchSpanProcessor, SpanProcessor } from '@opentelemetry/tracing';
import { NodeSDKConfiguration } from './types';
import { awsEc2Detector } from '@opentelemetry/resource-detector-aws';
import { gcpDetector } from '@opentelemetry/resource-detector-gcp';

/** This class represents everything needed to register a fully configured OpenTelemetry Node.js SDK */
export class NodeSDK {
  private _tracerProviderConfig?: {
    tracerConfig: NodeTracerConfig;
    spanProcessor: SpanProcessor;
    contextManager?: ContextManager;
    httpTextPropagator?: HttpTextPropagator;
  };
  private _meterProviderConfig?: MeterConfig;

  private _resource: Resource;

  private _autoDetectResources: boolean;

  /**
   * Create a new NodeJS SDK instance
   */
  public constructor(configuration: Partial<NodeSDKConfiguration> = {}) {
    this._resource = configuration.resource ?? new Resource({});

    this._autoDetectResources = configuration.autoDetectResources ?? true;

    if (configuration.spanProcessor || configuration.traceExporter) {
      const tracerProviderConfig: NodeTracerConfig = {};

      if (typeof configuration.logLevel === 'number') {
        tracerProviderConfig.logLevel = configuration.logLevel;
      }
      if (configuration.logger) {
        tracerProviderConfig.logger = configuration.logger;
      }
      if (configuration.plugins) {
        tracerProviderConfig.plugins = configuration.plugins;
      }
      if (configuration.sampler) {
        tracerProviderConfig.sampler = configuration.sampler;
      }
      if (configuration.traceParams) {
        tracerProviderConfig.traceParams = configuration.traceParams;
      }

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
      const meterConfig: MeterConfig = {};

      if (configuration.metricBatcher) {
        meterConfig.batcher = configuration.metricBatcher;
      }
      if (configuration.metricExporter) {
        meterConfig.exporter = configuration.metricExporter;
      }
      if (typeof configuration.metricInterval === 'number') {
        meterConfig.interval = configuration.metricInterval;
      }
      if (typeof configuration.logLevel === 'number') {
        meterConfig.logLevel = configuration.logLevel;
      }
      if (configuration.logger) {
        meterConfig.logger = configuration.logger;
      }

      this.configureMeterProvider(meterConfig);
    }
  }

  /** Set configurations required to register a NodeTracerProvider */
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

  /** Set configurations needed to register a MeterProvider */
  public configureMeterProvider(config: MeterConfig) {
    this._meterProviderConfig = config;
  }

  /** Detect resource attributes */
  public async detectResources(config?: ResourceDetectionConfig) {
    const internalConfig: ResourceDetectionConfig = {
      detectors: [awsEc2Detector, gcpDetector, envDetector],
      ...config,
    };

    this.addResource(await detectResources(internalConfig));
  }

  /** Manually add a resource */
  public addResource(resource: Resource) {
    this._resource = this._resource.merge(resource);
  }

  /**
   * Once the SDK has been configured, call this method to construct SDK components and register them with the OpenTelemetry API.
   */
  public async start() {
    if (this._autoDetectResources) {
      await this.detectResources();
    }

    if (this._tracerProviderConfig) {
      const tracerProvider = new NodeTracerProvider({
        ...this._tracerProviderConfig.tracerConfig,
        resource: this._resource,
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
        resource: this._resource,
      });

      metrics.setGlobalMeterProvider(meterProvider);
    }
  }
}
