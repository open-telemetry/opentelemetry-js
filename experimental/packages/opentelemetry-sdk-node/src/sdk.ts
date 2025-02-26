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
  defaultResource,
  detectResources,
  envDetector,
  hostDetector,
  Resource,
  processDetector,
  ResourceDetectionConfig,
  ResourceDetector,
  resourceFromAttributes,
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
import { OTLPMetricExporter as OTLPGrpcMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPMetricExporter as OTLPProtoMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPMetricExporter as OTLPHttpMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PrometheusExporter as PrometheusMetricExporter } from '@opentelemetry/exporter-prometheus';
import {
  MeterProvider,
  IMetricReader,
  ViewOptions,
  ConsoleMetricExporter,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import {
  BatchSpanProcessor,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import {
  NodeTracerConfig,
  NodeTracerProvider,
} from '@opentelemetry/sdk-trace-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { NodeSDKConfiguration } from './types';
import {
  getBooleanFromEnv,
  getStringFromEnv,
  diagLogLevelFromString,
} from '@opentelemetry/core';
import {
  getResourceDetectorsFromEnv,
  getSpanProcessorsFromEnv,
  filterBlanksAndNulls,
  getPropagatorFromEnv,
} from './utils';

/** This class represents everything needed to register a fully configured OpenTelemetry Node.js SDK */

export type MeterProviderConfig = {
  /**
   * Reference to the MetricReader instance by the NodeSDK
   */
  reader?: IMetricReader;
  /**
   * List of {@link ViewOptions}s that should be passed to the MeterProvider
   */
  views?: ViewOptions[];
};

export type LoggerProviderConfig = {
  /**
   * Reference to the LoggerRecordProcessor instance by the NodeSDK
   */
  logRecordProcessors: LogRecordProcessor[];
};

/**
 * @Returns param value, if set else returns the default value
 */
function getValueInMillis(envName: string, defaultValue: number): number {
  return parseInt(process.env[envName] || '') || defaultValue;
}

/**
 *
 * @returns MetricReader[] if appropriate environment variables are configured
 */
function configureMetricProviderFromEnv(): IMetricReader[] {
  const metricReaders: IMetricReader[] = [];
  const metricsExporterList = process.env.OTEL_METRICS_EXPORTER?.trim();
  if (!metricsExporterList) {
    return metricReaders;
  }
  const enabledExporters = filterBlanksAndNulls(metricsExporterList.split(','));

  if (enabledExporters.length === 0) {
    diag.debug('OTEL_METRICS_EXPORTER is empty. Using default otlp exporter.');
  }

  if (enabledExporters.includes('none')) {
    diag.info(
      `OTEL_METRICS_EXPORTER contains "none". Metric provider will not be initialized.`
    );
    return metricReaders;
  }
  enabledExporters.forEach(exporter => {
    if (exporter === 'otlp') {
      const protocol =
        process.env.OTEL_EXPORTER_OTLP_METRICS_PROTOCOL?.trim() ||
        process.env.OTEL_EXPORTER_OTLP_PROTOCOL?.trim();

      const exportIntervalMillis = getValueInMillis(
        'OTEL_METRIC_EXPORT_INTERVAL',
        60000
      );
      const exportTimeoutMillis = getValueInMillis(
        'OTEL_METRIC_EXPORT_TIMEOUT',
        30000
      );

      switch (protocol) {
        case 'grpc':
          metricReaders.push(
            new PeriodicExportingMetricReader({
              exporter: new OTLPGrpcMetricExporter(),
              exportIntervalMillis: exportIntervalMillis,
              exportTimeoutMillis: exportTimeoutMillis,
            })
          );
          break;
        case 'http/json':
          metricReaders.push(
            new PeriodicExportingMetricReader({
              exporter: new OTLPHttpMetricExporter(),
              exportIntervalMillis: exportIntervalMillis,
              exportTimeoutMillis: exportTimeoutMillis,
            })
          );
          break;
        case 'http/protobuf':
          metricReaders.push(
            new PeriodicExportingMetricReader({
              exporter: new OTLPProtoMetricExporter(),
              exportIntervalMillis: exportIntervalMillis,
              exportTimeoutMillis: exportTimeoutMillis,
            })
          );
          break;
        default:
          diag.warn(
            `Unsupported OTLP metrics protocol: "${protocol}". Using http/protobuf.`
          );
          metricReaders.push(
            new PeriodicExportingMetricReader({
              exporter: new OTLPProtoMetricExporter(),
              exportIntervalMillis: exportIntervalMillis,
              exportTimeoutMillis: exportTimeoutMillis,
            })
          );
      }
    } else if (exporter === 'console') {
      metricReaders.push(
        new PeriodicExportingMetricReader({
          exporter: new ConsoleMetricExporter(),
        })
      );
    } else if (exporter === 'prometheus') {
      metricReaders.push(new PrometheusMetricExporter());
    } else {
      diag.warn(
        `Unsupported OTEL_METRICS_EXPORTER value: "${exporter}". Supported values are: otlp, console, prometheus, none.`
      );
    }
  });

  return metricReaders;
}
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

  private _resource: Resource;
  private _resourceDetectors: Array<ResourceDetector>;

  private _autoDetectResources: boolean;

  private _tracerProvider?: NodeTracerProvider;
  private _loggerProvider?: LoggerProvider;
  private _meterProvider?: MeterProvider;
  private _serviceName?: string;
  private _configuration?: Partial<NodeSDKConfiguration>;

  private _disabled?: boolean;

  /**
   * Create a new NodeJS SDK instance
   */
  public constructor(configuration: Partial<NodeSDKConfiguration> = {}) {
    if (getBooleanFromEnv('OTEL_SDK_DISABLED')) {
      this._disabled = true;
      // Functions with possible side-effects are set
      // to no-op via the _disabled flag
    }

    const logLevel = getStringFromEnv('OTEL_LOG_LEVEL');
    if (logLevel != null) {
      diag.setLogger(new DiagConsoleLogger(), {
        logLevel: diagLogLevelFromString(logLevel),
      });
    }

    this._configuration = configuration;

    this._resource = configuration.resource ?? defaultResource();
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

      this._resource = this._resource.merge(detectResources(internalConfig));
    }

    this._resource =
      this._serviceName === undefined
        ? this._resource
        : this._resource.merge(
            resourceFromAttributes({
              [ATTR_SERVICE_NAME]: this._serviceName,
            })
          );

    const spanProcessors = this._tracerProviderConfig
      ? this._tracerProviderConfig.spanProcessors
      : getSpanProcessorsFromEnv();

    this._tracerProvider = new NodeTracerProvider({
      ...this._configuration,
      resource: this._resource,
      spanProcessors,
    });

    // Only register if there is a span processor
    if (spanProcessors.length > 0) {
      this._tracerProvider.register({
        contextManager:
          this._tracerProviderConfig?.contextManager ??
          // _tracerProviderConfig may be undefined if trace-specific settings are not provided - fall back to raw config
          this._configuration?.contextManager,
        propagator:
          this._tracerProviderConfig?.textMapPropagator ??
          getPropagatorFromEnv(),
      });
    }

    if (this._loggerProviderConfig) {
      const loggerProvider = new LoggerProvider({
        resource: this._resource,
      });

      for (const logRecordProcessor of this._loggerProviderConfig
        .logRecordProcessors) {
        loggerProvider.addLogRecordProcessor(logRecordProcessor);
      }

      this._loggerProvider = loggerProvider;

      logs.setGlobalLoggerProvider(loggerProvider);
    }

    const metricReadersFromEnv: IMetricReader[] =
      configureMetricProviderFromEnv();
    if (this._meterProviderConfig || metricReadersFromEnv.length > 0) {
      const readers: IMetricReader[] = [];
      if (this._meterProviderConfig?.reader) {
        readers.push(this._meterProviderConfig.reader);
      }

      if (readers.length === 0) {
        metricReadersFromEnv.forEach((r: IMetricReader) => readers.push(r));
      }

      const meterProvider = new MeterProvider({
        resource: this._resource,
        views: this._meterProviderConfig?.views ?? [],
        readers: readers,
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
      diag.debug('OTEL_LOGS_EXPORTER is empty. Using default otlp exporter.');
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
