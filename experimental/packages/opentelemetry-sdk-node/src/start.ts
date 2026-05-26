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
  getInstanceID,
  resolveLogRecordProcessorsFromConfiguration,
  resolveMeterReadersFromConfiguration,
  getMeterViewsFromConfiguration,
  getPropagatorFromConfiguration,
  getResourceDetectorsFromConfiguration,
  getResourceFromConfiguration,
  getSpanLimitsFromConfiguration,
  resolveSpanProcessorsFromConfiguration,
} from './utils';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import type { SDKComponents, SDKOptions } from './types';
import { LoggerProvider } from '@opentelemetry/sdk-logs';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
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
import { BasicTracerProvider } from '@opentelemetry/sdk-trace-base';
import { diagLogLevelFromSeverityNumberConfig } from './diag';
import type { ComponentProviderMap } from './component-provider';
import { ComponentProviderRegistry } from './component-provider';
import { getBuiltinComponentProviders } from './builtin-providers';

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

  registerInstrumentations({
    instrumentations: sdkOptions?.instrumentations?.flat() ?? [],
  });

  const components = create(config, {
    ...sdkOptions,
    // note: it is intentional that users cannot provide these yet so that we can move quickly without breaking users,
    // we may want to start modeling everything (resource detectors, instrumentations, etc.) as component providers in the future
    // instead of the sdkOptions provided to this function. If we do that, then these can be removed from the SDKOptions type.
    componentProviders: getBuiltinComponentProviders(),
  });
  context.setGlobalContextManager(components.contextManager);
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
  options?: SDKOptions & {
    componentProviders: ComponentProviderMap;
  }
): SDKComponents {
  const registry = new ComponentProviderRegistry(options?.componentProviders ?? {});

  const defaultContextManager = new AsyncLocalStorageContextManager();
  defaultContextManager.enable();
  const components: SDKComponents = {
    contextManager: defaultContextManager,
  };
  const resource = setupResource(config, options);

  const propagator =
    options?.textMapPropagator === null
      ? null
      : (options?.textMapPropagator ?? getPropagatorFromConfiguration(config));
  if (propagator) {
    components.propagator = propagator;
  }

  const logProcessors = resolveLogRecordProcessorsFromConfiguration(
    config,
    registry
  );
  if (logProcessors) {
    const loggerProvider = new LoggerProvider({
      resource: resource,
      processors: logProcessors,
    });
    components.loggerProvider = loggerProvider;
  }

  const meterReaders = resolveMeterReadersFromConfiguration(config, registry);
  if (meterReaders) {
    const meterViews = getMeterViewsFromConfiguration(config);
    const meterProvider = new MeterProvider({
      resource: resource,
      readers: meterReaders,
      views: meterViews ?? [],
    });
    components.meterProvider = meterProvider;
  }

  const spanProcessors = resolveSpanProcessorsFromConfiguration(
    config,
    registry
  );
  if (spanProcessors) {
    const spanLimits = getSpanLimitsFromConfiguration(config);
    // TODO (6506): support sampler configuration from config
    const tracerProvider = new BasicTracerProvider({
      resource,
      spanProcessors,
      spanLimits,
      generalLimits: {
        attributeValueLengthLimit:
          config.attribute_limits?.attribute_value_length_limit ?? undefined,
        attributeCountLimit:
          config.attribute_limits?.attribute_count_limit ?? undefined,
      },
      // TODO (6616): support idGenerator configuration from config
      // TODO (6624): support for `meterProvider: components.meterProvider`
    });
    components.tracerProvider = tracerProvider;
  }

  return components;
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
