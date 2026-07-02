/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import type {
  ConfigFactory,
  ConfigurationModel,
} from '@opentelemetry/configuration';
import {
  createConfigFactory,
  createConfigProvider,
} from '@opentelemetry/configuration';
import { config as configApi } from '@opentelemetry/api-config';
import type { ConfigProvider } from '@opentelemetry/api-config';
import {
  context,
  diag,
  DiagConsoleLogger,
  metrics,
  trace,
  propagation,
} from '@opentelemetry/api';
import {
  getIdGeneratorFromConfiguration,
  getSamplerFromConfiguration,
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
import type { Instrumentation } from '@opentelemetry/instrumentation';
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

  // Register the global ConfigProvider before constructing instrumentations, so
  // each one reads its declarative config in its constructor.
  const configProvider = createConfigProvider(config);
  configApi.setGlobalConfigProvider(configProvider);
  registerInstrumentations({
    instrumentations: resolveInstrumentations(sdkOptions, configProvider),
  });

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
 * Resolve the instrumentations to register.
 *
 * `instrumentations` (pre-built instances) and `instrumentationRegistry`
 * (factories) are mutually exclusive. Instances are the legacy, in-code-only
 * path. The registry lets the SDK construct each instrumentation after the
 * ConfigProvider is set, so it reads its declarative config in its constructor;
 * instrumentations disabled in config are skipped and never constructed.
 */
function resolveInstrumentations(
  sdkOptions: SDKOptions | undefined,
  configProvider: ConfigProvider
): Instrumentation[] {
  const registry = sdkOptions?.instrumentationRegistry;
  const instrumentations = sdkOptions?.instrumentations;

  if (registry && instrumentations) {
    throw new Error(
      'startNodeSDK: pass either `instrumentations` or `instrumentationRegistry`, not both'
    );
  }

  if (registry) {
    const resolved: Instrumentation[] = [];
    for (const [name, create] of Object.entries(registry)) {
      if (
        configProvider.getInstrumentationConfig(name).getBoolean('enabled') ===
        false
      ) {
        continue;
      }
      resolved.push(create());
    }
    return resolved;
  }

  return instrumentations?.flat() ?? [];
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
      const sampler = getSamplerFromConfiguration(config);
      const tracerProvider = new TracerProvider({
        resource,
        spanProcessors,
        idGenerator,
        sampler,
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
