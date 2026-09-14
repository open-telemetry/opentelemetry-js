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
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import type { SDKComponents, SDKOptions } from './types';
import { logs } from '@opentelemetry/api-logs';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { diagLogLevelFromSeverityNumberConfig } from './diag';
import {
  createLoggerProviderFromConfig,
  createMeterProviderFromConfig,
  createPropagatorFromConfig,
  createResourceFromConfig,
  createTracerProviderFromConfig,
} from './create-from-config';

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

  let components: SDKComponents;
  try {
    components = create(config, sdkOptions);
  } catch (createErr) {
    diag.error(
      `Could not create OpenTelemetry SDK from configuration, SDK will not be setup: ${createErr.message}`
    );
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

    const resource = createResourceFromConfig(config.resource);

    if (sdkOptions?.textMapPropagator !== undefined) {
      if (sdkOptions.textMapPropagator !== null) {
        components.propagator = sdkOptions.textMapPropagator;
      }
    } else if (config.propagator) {
      components.propagator = createPropagatorFromConfig(config.propagator);
    }

    if (config.logger_provider) {
      components.loggerProvider = createLoggerProviderFromConfig(
        resource,
        config.logger_provider,
        config.attribute_limits
      );
    }

    if (config.meter_provider) {
      components.meterProvider = createMeterProviderFromConfig(
        resource,
        config.meter_provider
      );
    }

    if (config.tracer_provider) {
      components.tracerProvider = createTracerProviderFromConfig(
        resource,
        config.tracer_provider,
        config.attribute_limits
      );
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
