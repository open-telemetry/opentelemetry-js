/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import type {
  ConfigFactory,
  ConfigurationModel,
} from '@opentelemetry/configuration';
import { createConfigFactory } from '@opentelemetry/configuration';
import {
  context,
  diag,
  DiagConsoleLogger,
  metrics,
  trace,
  propagation,
} from '@opentelemetry/api';
import {
  configureInstrumentations,
  getIdGeneratorFromConfiguration,
  getInstanceID,
  createLoggerProviderFromConfig,
  getMeterReadersFromConfiguration,
  getMeterViewsFromConfiguration,
  getPropagatorFromConfiguration,
  getResourceDetectorsFromConfiguration,
  getResourceFromConfiguration,
  getSpanProcessorsFromConfiguration,
} from './utils';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import type { SDKComponents, SDKOptions } from './types';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { TracerProvider } from '@opentelemetry/sdk-trace';
import { logs } from '@opentelemetry/api-logs';
import type {
  Resource,
  ResourceDetectionConfig,
  ResourceDetector,
} from '@opentelemetry/resources';
import {
  defaultResource,
  detectResources,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { ATTR_SERVICE_INSTANCE_ID } from './semconv';
import { diagLogLevelFromSeverityNumberConfig } from './diag';
import { createSpanLimitsFromConfig } from './create-from-config';

// Exported for testing.
export const NOOP_SDK = {
  shutdown: async () => {},
};

/**
 * @experimental Function to start the OpenTelemetry Node SDK
 * @param sdkOptions
 */
export function startNodeSDK(sdkOptions?: SDKOptions): {
  shutdown: () => Promise<void>;
} {
  let config: ConfigurationModel;
  try {
    const configFactory: ConfigFactory = createConfigFactory();
    config = configFactory.getConfigModel();
  } catch (configErr) {
    // Set the diag logger, otherwise the diag.error will typically not be shown.
    const logLevel = diagLogLevelFromSeverityNumberConfig();
    diag.setLogger(new DiagConsoleLogger(), { logLevel });
    diag.error(
      `Could not load OpenTelemetry configuration, SDK will not be setup: ${configErr.message}`
    );
    return NOOP_SDK;
  }

  if (config.disabled) {
    return NOOP_SDK;
  }

  const logLevel = diagLogLevelFromSeverityNumberConfig(config.log_level);
  diag.setLogger(new DiagConsoleLogger(), { logLevel });

  const instrumentations = configureInstrumentations(
    config,
    sdkOptions?.instrumentations?.flat() ?? []
  );
  registerInstrumentations({ instrumentations });

  let components: SDKComponents;
  try {
    components = create(config, sdkOptions);
  } catch (createErr) {
    diag.error(`Could not create OpenTelemetry SDK: ${createErr.message}`);
    return NOOP_SDK;
  }
  if (components.contextManager) {
    context.setGlobalContextManager(components.contextManager);
  }
  if (components.loggerProvider) {
    logs.setGlobalLoggerProvider(components.loggerProvider);
  }
  if (components.meterProvider) {
    metrics.setGlobalMeterProvider(components.meterProvider);
  }
  if (components.tracerProvider) {
    trace.setGlobalTracerProvider(components.tracerProvider);
  }
  if (components.propagator) {
    propagation.setGlobalPropagator(components.propagator);
  }

  const shutdownFn = async () => {
    const promises: Promise<unknown>[] = [];
    if (components.loggerProvider) {
      promises.push(components.loggerProvider.shutdown());
    }
    if (components.meterProvider) {
      promises.push(components.meterProvider.shutdown());
    }
    if (components.tracerProvider) {
      promises.push(components.tracerProvider.shutdown());
    }
    await Promise.all(promises);
  };
  return { shutdown: shutdownFn };
}

/**
 * Interpret configuration model and return SDK components.
 */
function create(
  config: ConfigurationModel,
  sdkOptions?: SDKOptions
): SDKComponents {
  const components: SDKComponents = {};

  try {
    components.contextManager = new AsyncLocalStorageContextManager();
    components.contextManager.enable();

    const resource = setupResource(config, sdkOptions);

    const propagator =
      sdkOptions?.textMapPropagator === null
        ? null
        : (sdkOptions?.textMapPropagator ??
          getPropagatorFromConfiguration(config));
    if (propagator) {
      components.propagator = propagator;
    }

    if (config.logger_provider) {
      components.loggerProvider = createLoggerProviderFromConfig(
        resource,
        config.logger_provider,
        config.attribute_limits
      );
    }

    const meterReaders = getMeterReadersFromConfiguration(config);
    if (meterReaders) {
      const meterViews = getMeterViewsFromConfiguration(config);
      const meterProvider = new MeterProvider({
        resource: resource,
        readers: meterReaders,
        views: meterViews ?? [],
      });
      components.meterProvider = meterProvider;
    }

    const spanProcessors = getSpanProcessorsFromConfiguration(config);
    if (spanProcessors) {
      const idGenerator = getIdGeneratorFromConfiguration(config);
      // TODO (6506): support sampler configuration from config
      const tracerProvider = new TracerProvider({
        resource,
        spanProcessors,
        idGenerator,
        spanLimits: createSpanLimitsFromConfig(
          config.tracer_provider?.limits,
          config.attribute_limits
        ),
        // TODO (6624): support for `meterProvider: components.meterProvider`
      });
      components.tracerProvider = tracerProvider;
    }

    return components;
  } catch (createErr) {
    // Clean up any SDK components that were created before the error.
    if (components.loggerProvider) {
      void components.loggerProvider.shutdown();
    }
    if (components.meterProvider) {
      void components.meterProvider.shutdown();
    }
    if (components.tracerProvider) {
      void components.tracerProvider.shutdown();
    }

    throw createErr;
  }
}

export function setupResource(
  config: ConfigurationModel,
  sdkOptions?: SDKOptions
): Resource {
  let resource: Resource =
    getResourceFromConfiguration(config) ?? defaultResource();
  let resourceDetectors: ResourceDetector[] = [];

  if (sdkOptions?.resourceDetectors != null) {
    resourceDetectors = sdkOptions.resourceDetectors;
  } else if (config.resource?.['detection/development']?.detectors) {
    resourceDetectors = getResourceDetectorsFromConfiguration(config);
  }

  if (resourceDetectors.length > 0) {
    const internalConfig: ResourceDetectionConfig = {
      detectors: resourceDetectors,
    };
    resource = resource.merge(detectResources(internalConfig));
  }

  const instanceId = getInstanceID(config);
  resource =
    instanceId === undefined
      ? resource
      : resource.merge(
          resourceFromAttributes({
            [ATTR_SERVICE_INSTANCE_ID]: instanceId,
          })
        );

  return resource;
}
