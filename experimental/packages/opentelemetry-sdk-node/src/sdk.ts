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

import { ContextManager, TextMapPropagator } from '@opentelemetry/api';
import { metrics } from '@opentelemetry/api-metrics';
import {
  InstrumentationOption,
  registerInstrumentations
} from '@opentelemetry/instrumentation';
import {
  detectResources,
  envDetector,
  processDetector,
  Resource,
  ResourceDetectionConfig
} from '@opentelemetry/resources';
import { MeterProvider, MetricReader, View } from '@opentelemetry/sdk-metrics';
import {
  BatchSpanProcessor,
  SpanProcessor
} from '@opentelemetry/sdk-trace-base';
import { NodeTracerConfig, NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { NodeSDKConfiguration } from './types';

/** This class represents everything needed to register a fully configured OpenTelemetry Node.js SDK */

export type MeterProviderConfig = {
  /**
   * Reference to the MetricReader instance by the NodeSDK
   */
  reader?: MetricReader
  /**
   * Lists the views that should be passed when meterProvider
   *
   * Note: This is only getting used when NodeSDK is responsible for
   * instantiated an instance of MeterProvider
   */
  views?: View[]
};
export class NodeSDK {
  private _tracerProviderConfig?: {
    tracerConfig: NodeTracerConfig;
    spanProcessor: SpanProcessor;
    contextManager?: ContextManager;
    textMapPropagator?: TextMapPropagator;
  };
  private _meterProviderConfig?: MeterProviderConfig;
  private _instrumentations: InstrumentationOption[];

  private _resource: Resource;

  private _autoDetectResources: boolean;

  private _tracerProvider?: NodeTracerProvider;
  private _meterProvider?: MeterProvider;
  private _serviceName?: string;

  /**
   * Create a new NodeJS SDK instance
   */
  public constructor(configuration: Partial<NodeSDKConfiguration> = {}) {
    this._resource = configuration.resource ?? new Resource({});

    this._serviceName = configuration.serviceName;

    this._autoDetectResources = configuration.autoDetectResources ?? true;

    if (configuration.spanProcessor || configuration.traceExporter) {
      const tracerProviderConfig: NodeTracerConfig = {};

      if (configuration.sampler) {
        tracerProviderConfig.sampler = configuration.sampler;
      }
      if (configuration.spanLimits) {
        tracerProviderConfig.spanLimits = configuration.spanLimits;
      }

      const spanProcessor =
        configuration.spanProcessor ??
        new BatchSpanProcessor(configuration.traceExporter!);

      this.configureTracerProvider(
        tracerProviderConfig,
        spanProcessor,
        configuration.contextManager,
        configuration.textMapPropagator
      );
    }

    if (configuration.metricReader || configuration.views) {
      const meterProviderConfig: MeterProviderConfig = {};
      if (configuration.metricReader) {
        meterProviderConfig.reader = configuration.metricReader;
      }

      if (configuration.views) {
        meterProviderConfig.views = configuration.views;
      }

      this.configureMeterProvider(meterProviderConfig);
    }

    let instrumentations: InstrumentationOption[] = [];
    if (configuration.instrumentations) {
      instrumentations = configuration.instrumentations;
    }
    this._instrumentations = instrumentations;
  }

  /** Set configurations required to register a NodeTracerProvider */
  public configureTracerProvider(
    tracerConfig: NodeTracerConfig,
    spanProcessor: SpanProcessor,
    contextManager?: ContextManager,
    textMapPropagator?: TextMapPropagator
  ): void {
    this._tracerProviderConfig = {
      tracerConfig,
      spanProcessor,
      contextManager,
      textMapPropagator,
    };
  }

  /** Set configurations needed to register a MeterProvider */
  public configureMeterProvider(config: MeterProviderConfig): void {
    // nothing is set yet, we can set config and return.
    if (this._meterProviderConfig == null) {
      this._meterProviderConfig = config;
      return;
    }

    // make sure we do not override existing views with other views.
    if (this._meterProviderConfig.views != null && config.views != null) {
      throw new Error('Views passed but Views have already been configured.');
    }

    // set views, but make sure we do not override existing views with null/undefined.
    if (config.views != null) {
      this._meterProviderConfig.views = config.views;
    }

    // make sure we do not override existing reader with another reader.
    if (this._meterProviderConfig.reader != null && config.reader != null) {
      throw new Error('MetricReader passed but MetricReader has already been configured.');
    }

    // set reader, but make sure we do not override existing reader with null/undefined.
    if (config.reader != null) {
      this._meterProviderConfig.reader = config.reader;
    }
  }

  /** Detect resource attributes */
  public async detectResources(
    config?: ResourceDetectionConfig
  ): Promise<void> {
    const internalConfig: ResourceDetectionConfig = {
      detectors: [envDetector, processDetector],
      ...config,
    };

    this.addResource(await detectResources(internalConfig));
  }

  /** Manually add a resource */
  public addResource(resource: Resource): void {
    this._resource = this._resource.merge(resource);
  }

  /**
   * Once the SDK has been configured, call this method to construct SDK components and register them with the OpenTelemetry API.
   */
  public async start(): Promise<void> {
    if (this._autoDetectResources) {
      await this.detectResources();
    }

    this._resource = this._serviceName === undefined
      ? this._resource
      : this._resource.merge(new Resource(
        { [SemanticResourceAttributes.SERVICE_NAME]: this._serviceName }
      ));

    if (this._tracerProviderConfig) {
      const tracerProvider = new NodeTracerProvider({
        ...this._tracerProviderConfig.tracerConfig,
        resource: this._resource,
      });

      this._tracerProvider = tracerProvider;

      tracerProvider.addSpanProcessor(this._tracerProviderConfig.spanProcessor);
      tracerProvider.register({
        contextManager: this._tracerProviderConfig.contextManager,
        propagator: this._tracerProviderConfig.textMapPropagator,
      });
    }

    if (this._meterProviderConfig) {
      const meterProvider = new MeterProvider({
        resource: this._resource,
        views: this._meterProviderConfig?.views ?? [],
      });

      if (this._meterProviderConfig.reader) {
        meterProvider.addMetricReader(this._meterProviderConfig.reader);
      }

      this._meterProvider = meterProvider;

      metrics.setGlobalMeterProvider(meterProvider);
    }

    registerInstrumentations({
      instrumentations: this._instrumentations,
    });
  }

  public shutdown(): Promise<void> {
    const promises: Promise<unknown>[] = [];
    if (this._tracerProvider) {
      promises.push(this._tracerProvider.shutdown());
    }
    if (this._meterProvider) {
      promises.push(this._meterProvider.shutdown());
    }

    return (
      Promise.all(promises)
        // return void instead of the array from Promise.all
        .then(() => {
        })
    );
  }
}
