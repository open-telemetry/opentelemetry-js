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

import {
  ContextManager,
  TextMapPropagator,
  metrics,
  diag,
  DiagConsoleLogger,
} from '@opentelemetry/api';
import { logs } from '@opentelemetry/api-logs';
import {
  InstrumentationOption,
  registerInstrumentations,
} from '@opentelemetry/instrumentation';
import {
  Detector,
  DetectorSync,
  detectResourcesSync,
  envDetector,
  IResource,
  processDetector,
  Resource,
  ResourceDetectionConfig,
} from '@opentelemetry/resources';
import { LogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs';
import { MeterProvider, MetricReader, View } from '@opentelemetry/sdk-metrics';
import {
  BatchSpanProcessor,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import {
  NodeTracerConfig,
  NodeTracerProvider,
} from '@opentelemetry/sdk-trace-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { NodeSDKConfiguration } from './types';
import { TracerProviderWithEnvExporters } from './TracerProviderWithEnvExporter';
import { getEnv, getEnvWithoutDefaults } from '@opentelemetry/core';
import { parseInstrumentationOptions } from './utils';

/** This class represents everything needed to register a fully configured OpenTelemetry Node.js SDK */

export type MeterProviderConfig = {
  /**
   * Reference to the MetricReader instance by the NodeSDK
   */
  reader?: MetricReader;
  /**
   * List of {@link View}s that should be passed to the MeterProvider
   */
  views?: View[];
};

export type LoggerProviderConfig = {
  /**
   * Reference to the LoggerRecordProcessor instance by the NodeSDK
   */
  logRecordProcessor: LogRecordProcessor;
};

export class NodeSDK {
  private _tracerProviderConfig?: {
    tracerConfig: NodeTracerConfig;
    spanProcessor: SpanProcessor;
    contextManager?: ContextManager;
    textMapPropagator?: TextMapPropagator;
  };
  private _loggerProviderConfig?: LoggerProviderConfig;
  private _meterProviderConfig?: MeterProviderConfig;
  private _instrumentations: InstrumentationOption[];

  private _resource: IResource;
  private _resourceDetectors: Array<Detector | DetectorSync>;

  private _autoDetectResources: boolean;

  private _tracerProvider?: NodeTracerProvider | TracerProviderWithEnvExporters;
  private _loggerProvider?: LoggerProvider;
  private _meterProvider?: MeterProvider;
  private _serviceName?: string;

  private _disabled?: boolean;

  /**
   * Create a new NodeJS SDK instance
   */
  public constructor(configuration: Partial<NodeSDKConfiguration> = {}) {
    const env = getEnv();
    const envWithoutDefaults = getEnvWithoutDefaults();

    if (env.OTEL_SDK_DISABLED) {
      this._disabled = true;
      // Functions with possible side-effects are set
      // to no-op via the _disabled flag
    }

    // Default is INFO, use environment without defaults to check
    // if the user originally set the environment variable.
    if (envWithoutDefaults.OTEL_LOG_LEVEL) {
      diag.setLogger(new DiagConsoleLogger(), {
        logLevel: envWithoutDefaults.OTEL_LOG_LEVEL,
      });
    }

    this._resource = configuration.resource ?? new Resource({});
    this._resourceDetectors = configuration.resourceDetectors ?? [
      envDetector,
      processDetector,
    ];

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
      if (configuration.idGenerator) {
        tracerProviderConfig.idGenerator = configuration.idGenerator;
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

    if (configuration.logRecordProcessor) {
      const loggerProviderConfig: LoggerProviderConfig = {
        logRecordProcessor: configuration.logRecordProcessor,
      };
      this.configureLoggerProvider(loggerProviderConfig);
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

  /**
   *
   * @deprecated Please pass {@code sampler}, {@code generalLimits}, {@code spanLimits}, {@code resource},
   * {@code IdGenerator}, {@code spanProcessor}, {@code contextManager} and {@code textMapPropagator},
   * to the constructor options instead.
   *
   * Set configurations needed to register a TracerProvider
   */
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

  /**
   * @deprecated Please pass {@code logRecordProcessor} to the constructor options instead.
   *
   * Set configurations needed to register a LoggerProvider
   */
  public configureLoggerProvider(config: LoggerProviderConfig): void {
    // nothing is set yet, we can set config and then return
    if (this._loggerProviderConfig == null) {
      this._loggerProviderConfig = config;
      return;
    }

    // make sure we do not override existing logRecordProcessor with other logRecordProcessors.
    if (
      this._loggerProviderConfig.logRecordProcessor != null &&
      config.logRecordProcessor != null
    ) {
      throw new Error(
        'LogRecordProcessor passed but LogRecordProcessor has already been configured.'
      );
    }

    // set logRecordProcessor, but make sure we do not override existing logRecordProcessors with null/undefined.
    if (config.logRecordProcessor != null) {
      this._loggerProviderConfig.logRecordProcessor = config.logRecordProcessor;
    }
  }

  /**
   * @deprecated Please pass {@code views} and {@code reader} to the constructor options instead.
   *
   * Set configurations needed to register a MeterProvider
   */
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
      throw new Error(
        'MetricReader passed but MetricReader has already been configured.'
      );
    }

    // set reader, but make sure we do not override existing reader with null/undefined.
    if (config.reader != null) {
      this._meterProviderConfig.reader = config.reader;
    }
  }

  /**
   * @deprecated Resources are detected automatically on {@link NodeSDK.start()}, when the {@code autoDetectResources}
   * constructor option is set to {@code true} or left {@code undefined}.
   *
   * Detect resource attributes
   */
  public detectResources(): void {
    if (this._disabled) {
      return;
    }

    const internalConfig: ResourceDetectionConfig = {
      detectors: this._resourceDetectors,
    };

    this.addResource(detectResourcesSync(internalConfig));
  }

  /**
   * @deprecated Please pre-merge resources and pass them to the constructor
   *
   * Manually add a Resource
   * @param resource
   */
  public addResource(resource: IResource): void {
    this._resource = this._resource.merge(resource);
  }

  /**
   * Call this method to construct SDK components and register them with the OpenTelemetry API.
   */
  public start(): void {
    if (this._disabled) {
      return;
    }

    registerInstrumentations({
      instrumentations: this._instrumentations,
    });

    if (this._autoDetectResources) {
      this.detectResources();
    }

    this._resource =
      this._serviceName === undefined
        ? this._resource
        : this._resource.merge(
            new Resource({
              [SemanticResourceAttributes.SERVICE_NAME]: this._serviceName,
            })
          );

    const Provider = this._tracerProviderConfig
      ? NodeTracerProvider
      : TracerProviderWithEnvExporters;

    const tracerProvider = new Provider({
      ...this._tracerProviderConfig?.tracerConfig,
      resource: this._resource,
    });

    this._tracerProvider = tracerProvider;

    if (this._tracerProviderConfig) {
      tracerProvider.addSpanProcessor(this._tracerProviderConfig.spanProcessor);
    }

    tracerProvider.register({
      contextManager: this._tracerProviderConfig?.contextManager,
      propagator: this._tracerProviderConfig?.textMapPropagator,
    });

    if (this._loggerProviderConfig) {
      const loggerProvider = new LoggerProvider({
        resource: this._resource,
      });
      loggerProvider.addLogRecordProcessor(
        this._loggerProviderConfig.logRecordProcessor
      );

      this._loggerProvider = loggerProvider;

      logs.setGlobalLoggerProvider(loggerProvider);
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

      // TODO: This is a workaround to fix https://github.com/open-telemetry/opentelemetry-js/issues/3609
      // If the MeterProvider is not yet registered when instrumentations are registered, all metrics are dropped.
      // This code is obsolete once https://github.com/open-telemetry/opentelemetry-js/issues/3622 is implemented.
      for (const instrumentation of parseInstrumentationOptions(
        this._instrumentations
      )) {
        instrumentation.setMeterProvider(metrics.getMeterProvider());
      }
    }
  }

  public shutdown(): Promise<void> {
    const promises: Promise<unknown>[] = [];
    if (this._tracerProvider) {
      promises.push(this._tracerProvider.shutdown());
    }
    if (this._loggerProvider) {
      promises.push(this._loggerProvider.shutdown());
    }
    if (this._meterProvider) {
      promises.push(this._meterProvider.shutdown());
    }

    return (
      Promise.all(promises)
        // return void instead of the array from Promise.all
        .then(() => {})
    );
  }
}
