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
  Instrumentation,
  registerInstrumentations,
} from '@opentelemetry/instrumentation';
import {
  Detector,
  DetectorSync,
  detectResourcesSync,
  envDetector,
  hostDetector,
  IResource,
  processDetector,
  Resource,
  ResourceDetectionConfig,
} from '@opentelemetry/resources';
import {
  LogRecordProcessor,
  LoggerProvider,
  BatchLogRecordProcessor,
  ConsoleLogRecordExporter,
  LogRecordExporter,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import { OTLPLogExporter as OTLPHttpLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPLogExporter as OTLPGrpcLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { OTLPLogExporter as OTLPProtoLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import { MeterProvider, MetricReader, View } from '@opentelemetry/sdk-metrics';
import {
  BatchSpanProcessor,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import {
  NodeTracerConfig,
  NodeTracerProvider,
} from '@opentelemetry/sdk-trace-node';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { NodeSDKConfiguration } from './types';
import { TracerProviderWithEnvExporters } from './TracerProviderWithEnvExporter';
import { getEnv, getEnvWithoutDefaults } from '@opentelemetry/core';
import { getResourceDetectorsFromEnv, filterBlanksAndNulls } from './utils';

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
  logRecordProcessors: LogRecordProcessor[];
};

export class NodeSDK {
  private _tracerProviderConfig?: {
    tracerConfig: NodeTracerConfig;
    spanProcessors: SpanProcessor[];
    contextManager?: ContextManager;
    textMapPropagator?: TextMapPropagator;
  };
  private _loggerProviderConfig?: LoggerProviderConfig;
  private _meterProviderConfig?: MeterProviderConfig;
  private _instrumentations: Instrumentation[];

  private _resource: IResource;
  private _resourceDetectors: Array<Detector | DetectorSync>;
  private _mergeResourceWithDefaults: boolean;

  private _autoDetectResources: boolean;

  private _tracerProvider?: NodeTracerProvider | TracerProviderWithEnvExporters;
  private _loggerProvider?: LoggerProvider;
  private _meterProvider?: MeterProvider;
  private _serviceName?: string;
  private _configuration?: Partial<NodeSDKConfiguration>;

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

    this._configuration = configuration;

    this._resource = configuration.resource ?? new Resource({});
    this._mergeResourceWithDefaults =
      configuration.mergeResourceWithDefaults ?? true;
    this._autoDetectResources = configuration.autoDetectResources ?? true;
    if (!this._autoDetectResources) {
      this._resourceDetectors = [];
    } else if (configuration.resourceDetectors != null) {
      this._resourceDetectors = configuration.resourceDetectors;
    } else if (process.env.OTEL_NODE_RESOURCE_DETECTORS != null) {
      this._resourceDetectors = getResourceDetectorsFromEnv();
    } else {
      this._resourceDetectors = [envDetector, processDetector, hostDetector];
    }

    this._serviceName = configuration.serviceName;

    // If a tracer provider can be created from manual configuration, create it
    if (
      configuration.traceExporter ||
      configuration.spanProcessor ||
      configuration.spanProcessors
    ) {
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

      if (configuration.spanProcessor) {
        diag.warn(
          "The 'spanProcessor' option is deprecated. Please use 'spanProcessors' instead."
        );
      }

      const spanProcessor =
        configuration.spanProcessor ??
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        new BatchSpanProcessor(configuration.traceExporter!);

      const spanProcessors = configuration.spanProcessors ?? [spanProcessor];

      this._tracerProviderConfig = {
        tracerConfig: tracerProviderConfig,
        spanProcessors,
        contextManager: configuration.contextManager,
        textMapPropagator: configuration.textMapPropagator,
      };
    }

    if (configuration.logRecordProcessors) {
      this._loggerProviderConfig = {
        logRecordProcessors: configuration.logRecordProcessors,
      };
    } else if (configuration.logRecordProcessor) {
      this._loggerProviderConfig = {
        logRecordProcessors: [configuration.logRecordProcessor],
      };
      diag.warn(
        "The 'logRecordProcessor' option is deprecated. Please use 'logRecordProcessors' instead."
      );
    } else {
      this.configureLoggerProviderFromEnv();
    }

    if (configuration.metricReader || configuration.views) {
      const meterProviderConfig: MeterProviderConfig = {};
      if (configuration.metricReader) {
        meterProviderConfig.reader = configuration.metricReader;
      }

      if (configuration.views) {
        meterProviderConfig.views = configuration.views;
      }

      this._meterProviderConfig = meterProviderConfig;
    }

    this._instrumentations = configuration.instrumentations?.flat() ?? [];
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
      const internalConfig: ResourceDetectionConfig = {
        detectors: this._resourceDetectors,
      };

      this._resource = this._resource.merge(
        detectResourcesSync(internalConfig)
      );
    }

    this._resource =
      this._serviceName === undefined
        ? this._resource
        : this._resource.merge(
            new Resource({
              [SEMRESATTRS_SERVICE_NAME]: this._serviceName,
            })
          );

    // if there is a tracerProviderConfig (traceExporter/spanProcessor was set manually) or the traceExporter is set manually, use NodeTracerProvider
    const Provider = this._tracerProviderConfig
      ? NodeTracerProvider
      : TracerProviderWithEnvExporters;

    // If the Provider is configured with Env Exporters, we need to check if the SDK had any manual configurations and set them here
    const tracerProvider = new Provider({
      ...this._configuration,
      resource: this._resource,
      mergeResourceWithDefaults: this._mergeResourceWithDefaults,
    });

    this._tracerProvider = tracerProvider;

    if (this._tracerProviderConfig) {
      for (const spanProcessor of this._tracerProviderConfig.spanProcessors) {
        tracerProvider.addSpanProcessor(spanProcessor);
      }
    }

    tracerProvider.register({
      contextManager:
        this._tracerProviderConfig?.contextManager ??
        // _tracerProviderConfig may be undefined if trace-specific settings are not provided - fall back to raw config
        this._configuration?.contextManager,
      propagator: this._tracerProviderConfig?.textMapPropagator,
    });

    if (this._loggerProviderConfig) {
      const loggerProvider = new LoggerProvider({
        resource: this._resource,
        mergeResourceWithDefaults: this._mergeResourceWithDefaults,
      });

      for (const logRecordProcessor of this._loggerProviderConfig
        .logRecordProcessors) {
        loggerProvider.addLogRecordProcessor(logRecordProcessor);
      }

      this._loggerProvider = loggerProvider;

      logs.setGlobalLoggerProvider(loggerProvider);
    }

    if (this._meterProviderConfig) {
      const readers: MetricReader[] = [];
      if (this._meterProviderConfig.reader) {
        readers.push(this._meterProviderConfig.reader);
      }
      const meterProvider = new MeterProvider({
        resource: this._resource,
        views: this._meterProviderConfig?.views ?? [],
        readers: readers,
        mergeResourceWithDefaults: this._mergeResourceWithDefaults,
      });

      this._meterProvider = meterProvider;

      metrics.setGlobalMeterProvider(meterProvider);

      // TODO: This is a workaround to fix https://github.com/open-telemetry/opentelemetry-js/issues/3609
      // If the MeterProvider is not yet registered when instrumentations are registered, all metrics are dropped.
      // This code is obsolete once https://github.com/open-telemetry/opentelemetry-js/issues/3622 is implemented.
      for (const instrumentation of this._instrumentations) {
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

  private configureLoggerProviderFromEnv(): void {
    const logExportersList = process.env.OTEL_LOGS_EXPORTER ?? '';
    const enabledExporters = filterBlanksAndNulls(logExportersList.split(','));

    if (enabledExporters.length === 0) {
      diag.info('OTEL_LOGS_EXPORTER is empty. Using default otlp exporter.');
      enabledExporters.push('otlp');
    }

    if (enabledExporters.includes('none')) {
      diag.info(
        `OTEL_LOGS_EXPORTER contains "none". Logger provider will not be initialized.`
      );
      return;
    }

    const exporters: LogRecordExporter[] = [];

    enabledExporters.forEach(exporter => {
      if (exporter === 'otlp') {
        const protocol = (
          process.env.OTEL_EXPORTER_OTLP_LOGS_PROTOCOL ??
          process.env.OTEL_EXPORTER_OTLP_PROTOCOL
        )?.trim();

        switch (protocol) {
          case 'grpc':
            exporters.push(new OTLPGrpcLogExporter());
            break;
          case 'http/json':
            exporters.push(new OTLPHttpLogExporter());
            break;
          case 'http/protobuf':
            exporters.push(new OTLPProtoLogExporter());
            break;
          case undefined:
          case '':
            exporters.push(new OTLPProtoLogExporter());
            break;
          default:
            diag.warn(
              `Unsupported OTLP logs protocol: "${protocol}". Using http/protobuf.`
            );
            exporters.push(new OTLPProtoLogExporter());
        }
      } else if (exporter === 'console') {
        exporters.push(new ConsoleLogRecordExporter());
      } else {
        diag.warn(
          `Unsupported OTEL_LOGS_EXPORTER value: "${exporter}". Supported values are: otlp, console, none.`
        );
      }
    });

    if (exporters.length > 0) {
      this._loggerProviderConfig = {
        logRecordProcessors: exporters.map(exporter => {
          if (exporter instanceof ConsoleLogRecordExporter) {
            return new SimpleLogRecordProcessor(exporter);
          } else {
            return new BatchLogRecordProcessor(exporter);
          }
        }),
      };
    }
  }
}
