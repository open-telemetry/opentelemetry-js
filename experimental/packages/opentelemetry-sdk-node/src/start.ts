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
  ConfigFactory,
  ConfigurationModel,
  createConfigFactory,
  LogRecordExporterModel,
} from '@opentelemetry/configuration';
import { diag, DiagConsoleLogger } from '@opentelemetry/api';
import {
  getPropagatorFromConfiguration,
  getResourceDetectorsFromConfiguration,
  setupDefaultContextManager,
  setupPropagator,
} from './utils';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import type { SDKOptions } from './types';
import {
  BatchLogRecordProcessor,
  ConsoleLogRecordExporter,
  LoggerProvider,
  LogRecordExporter,
  LogRecordProcessor,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import { OTLPLogExporter as OTLPHttpLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPLogExporter as OTLPGrpcLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { OTLPLogExporter as OTLPProtoLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base';
import { logs } from '@opentelemetry/api-logs';
import {
  defaultResource,
  detectResources,
  envDetector,
  hostDetector,
  osDetector,
  processDetector,
  Resource,
  ResourceDetectionConfig,
  ResourceDetector,
  resourceFromAttributes,
  serviceInstanceIdDetector,
} from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

/**
 * @experimental Function to start the OpenTelemetry Node SDK
 * @param sdkOptions
 */
export function startNodeSDK(sdkOptions: SDKOptions): {
  shutdown: () => Promise<void>;
} {
  const configFactory: ConfigFactory = createConfigFactory();
  const config = configFactory.getConfigModel();

  if (config.disabled) {
    diag.info('OpenTelemetry SDK is disabled');
    return NOOP_SDK;
  }
  if (config.log_level != null) {
    diag.setLogger(new DiagConsoleLogger(), { logLevel: config.log_level });
  }

  registerInstrumentations({
    instrumentations: sdkOptions?.instrumentations?.flat() ?? [],
  });
  setupDefaultContextManager();
  setupPropagator(
    sdkOptions?.textMapPropagator === null
      ? null // null means don't set.
      : (sdkOptions?.textMapPropagator ??
          getPropagatorFromConfiguration(config))
  );
  const resource = setupResource(config, sdkOptions);
  const loggerProvider = setupLoggerProvider(config, sdkOptions, resource);

  const shutdownFn = async () => {
    const promises: Promise<unknown>[] = [];
    if (loggerProvider) {
      promises.push(loggerProvider.shutdown());
    }
    await Promise.all(promises);
  };
  return { shutdown: shutdownFn };
}
const NOOP_SDK = {
  shutdown: async () => {},
};

function setupResource(
  config: ConfigurationModel,
  sdkOptions: SDKOptions
): Resource {
  let resource: Resource = sdkOptions.resource ?? defaultResource();
  const autoDetectResources = sdkOptions.autoDetectResources ?? true;
  let resourceDetectors: ResourceDetector[];

  if (!autoDetectResources) {
    resourceDetectors = [];
  } else if (sdkOptions.resourceDetectors != null) {
    resourceDetectors = sdkOptions.resourceDetectors;
  } else if (config.node_resource_detectors) {
    resourceDetectors = getResourceDetectorsFromConfiguration(config);
  } else {
    resourceDetectors = [
      envDetector,
      processDetector,
      hostDetector,
      osDetector,
      serviceInstanceIdDetector,
    ];
  }

  if (autoDetectResources) {
    const internalConfig: ResourceDetectionConfig = {
      detectors: resourceDetectors,
    };

    resource = resource.merge(detectResources(internalConfig));
  }

  resource =
    sdkOptions.serviceName === undefined
      ? resource
      : resource.merge(
          resourceFromAttributes({
            [ATTR_SERVICE_NAME]: sdkOptions.serviceName,
          })
        );

  return resource;
}

function setupLoggerProvider(
  config: ConfigurationModel,
  sdkOptions: SDKOptions,
  resource: Resource | undefined
): LoggerProvider | undefined {
  const logProcessors =
    sdkOptions.logRecordProcessors ??
    getLogRecordProcessorsFromConfiguration(config);

  if (logProcessors) {
    const loggerProvider = new LoggerProvider({
      resource: resource,
      processors: logProcessors,
    });

    logs.setGlobalLoggerProvider(loggerProvider);
    return loggerProvider;
  }
  return undefined;
}

function getExporterType(exporter: LogRecordExporterModel): LogRecordExporter {
  if (exporter.otlp_http) {
    if (exporter.otlp_http.encoding === 'json') {
      return new OTLPHttpLogExporter({
        compression:
          exporter.otlp_http.compression === 'gzip'
            ? CompressionAlgorithm.GZIP
            : CompressionAlgorithm.NONE,
      });
    }
    if (exporter.otlp_http.encoding === 'protobuf') {
      return new OTLPProtoLogExporter();
    }
    diag.warn(`Unsupported OTLP logs protocol. Using http/protobuf.`);
    return new OTLPProtoLogExporter();
  } else if (exporter.otlp_grpc) {
    return new OTLPGrpcLogExporter();
  } else if (exporter.console) {
    return new ConsoleLogRecordExporter();
  }
  diag.warn(`Unsupported Exporter value. Using OTLP http/protobuf.`);
  return new OTLPProtoLogExporter();
}

function getLogRecordProcessorsFromConfiguration(
  config: ConfigurationModel
): LogRecordProcessor[] | undefined {
  const logRecordProcessors: LogRecordProcessor[] = [];
  config.logger_provider?.processors?.forEach(processor => {
    if (processor.batch) {
      logRecordProcessors.push(
        new BatchLogRecordProcessor(getExporterType(processor.batch.exporter), {
          maxQueueSize: processor.batch.max_queue_size,
          maxExportBatchSize: processor.batch.max_export_batch_size,
          scheduledDelayMillis: processor.batch.schedule_delay,
          exportTimeoutMillis: processor.batch.export_timeout,
        })
      );
    }
    if (processor.simple) {
      logRecordProcessors.push(
        new SimpleLogRecordProcessor(getExporterType(processor.simple.exporter))
      );
    }
  });
  if (logRecordProcessors.length > 0) {
    return logRecordProcessors;
  }
  return undefined;
}
