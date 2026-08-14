/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ConfigurationModel } from '@opentelemetry/configuration';
import { parseConfigFile } from '@opentelemetry/configuration';
import type { ContextManager, TextMapPropagator } from '@opentelemetry/api';
import {
  context,
  diag,
  DiagConsoleLogger,
  metrics,
  trace,
  propagation,
} from '@opentelemetry/api';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { logs } from '@opentelemetry/api-logs';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import {
  diagLogLevelFromString,
  getBooleanFromEnv,
  getStringFromEnv,
} from '@opentelemetry/core';
import type { MeterProvider } from '@opentelemetry/sdk-metrics';
import type { TracerProvider } from '@opentelemetry/sdk-trace';
import type { LoggerProvider } from '@opentelemetry/sdk-logs';
import type {
  StartSdkFromConfigOptions,
  StartSdkFromEnvOptions,
  StartSdkOptions,
} from './types';
import { diagLogLevelFromSeverityNumberConfig } from './diag';
import {
  createLoggerProviderFromOptsAndEnv,
  createMeterProviderFromOptsAndEnv,
  createPropagatorFromOptsAndEnv,
  createResourceFromOptsAndEnv,
  createTracerProviderFromOptsAndEnv,
} from './create-from-env';
import {
  createLoggerProviderFromConfig,
  createMeterProviderFromConfig,
  createPropagatorFromConfig,
  createResourceFromConfig,
  createTracerProviderFromConfig,
} from './create-from-config';

interface SdkComponents {
  contextManager?: ContextManager;
  loggerProvider?: LoggerProvider;
  meterProvider?: MeterProvider;
  tracerProvider?: TracerProvider;
  propagator?: TextMapPropagator;
}

interface NodeSdk {
  shutdown: () => Promise<void>;
}

// Exported for testing.
export const NOOP_SDK: NodeSdk = {
  shutdown: async () => {},
};

/**
 * @deprecated use `startNodeSdk`
 */
export function startNodeSDK(sdkOptions?: StartSdkOptions): NodeSdk {
  return startNodeSdk(sdkOptions);
}

/**
 * @experimental Function to start the OpenTelemetry Node SDK
 * @param sdkOptions
 */
export function startNodeSdk(sdkOptions?: StartSdkOptions): NodeSdk {
  const configFile = getStringFromEnv('OTEL_CONFIG_FILE');
  if (configFile) {
    return startNodeSdkFromConfig({
      ...(sdkOptions as StartSdkFromConfigOptions),
      configFile,
    });
  } else {
    return startNodeSdkFromEnv(sdkOptions as StartSdkFromEnvOptions);
  }
}

function startNodeSdkFromEnv(opts?: StartSdkFromEnvOptions): NodeSdk {
  if (getBooleanFromEnv('OTEL_SDK_DISABLED')) {
    return NOOP_SDK;
  }

  const logLevelStr =
    opts?.logLevel ?? getStringFromEnv('OTEL_LOG_LEVEL') ?? 'info';
  const logLevel = diagLogLevelFromString(logLevelStr);
  diag.setLogger(new DiagConsoleLogger(), { logLevel });

  const instrumentations = opts?.instrumentations?.flat();
  if (instrumentations) {
    registerInstrumentations({ instrumentations });
  }

  interface Shutdownable {
    shutdown: () => Promise<void>;
  }
  const toShutdown: Shutdownable[] = [];

  try {
    // TODO: disable context manager on createErr and shutdown
    const contextManager = new AsyncLocalStorageContextManager();
    contextManager.enable();
    const propagator = createPropagatorFromOptsAndEnv(opts);
    const resource = createResourceFromOptsAndEnv(opts);

    // While SDK metrics are unstable, we require an opt-in.
    // https://opentelemetry.io/docs/specs/semconv/otel/sdk-metrics/
    const sdkMetricsEnabled = getBooleanFromEnv(
      'OTEL_NODE_EXPERIMENTAL_SDK_METRICS'
    );

    const meterProvider = createMeterProviderFromOptsAndEnv(
      resource,
      opts,
      sdkMetricsEnabled
    );
    if (meterProvider) {
      toShutdown.push(meterProvider);
    }

    const tracerProvider = createTracerProviderFromOptsAndEnv(
      resource,
      opts,
      sdkMetricsEnabled ? meterProvider : undefined
    );
    if (tracerProvider) {
      toShutdown.push(tracerProvider);
    }

    const loggerProvider = createLoggerProviderFromOptsAndEnv(
      resource,
      opts,
      sdkMetricsEnabled ? meterProvider : undefined
    );
    if (loggerProvider) {
      toShutdown.push(loggerProvider);
    }

    // Register all SDK components with the API. Do this at the end to avoid
    // registering any if creating one fails.
    context.setGlobalContextManager(contextManager);
    if (propagator) {
      propagation.setGlobalPropagator(propagator);
    }
    if (meterProvider) {
      metrics.setGlobalMeterProvider(meterProvider);
      if (instrumentations) {
        // Workaround not having a delegating MeterProvider.  This code is
        // obsolete with https://github.com/open-telemetry/opentelemetry-js/issues/3622
        for (const instr of instrumentations) {
          instr.setMeterProvider(metrics.getMeterProvider());
        }
      }
    }
    if (tracerProvider) {
      trace.setGlobalTracerProvider(tracerProvider);
    }
    if (loggerProvider) {
      logs.setGlobalLoggerProvider(loggerProvider);
    }
  } catch (createErr) {
    // Shutdown any SDK components that were created before the error.
    toShutdown.map(ts => {
      void ts.shutdown();
    });
    diag.error(
      `Could not create OpenTelemetry SDK, SDK will not be setup: ${createErr.message}`
    );
    return NOOP_SDK;
  }

  const shutdownFn = async () => {
    const promises = toShutdown.map(ts => ts.shutdown());
    await Promise.all(promises);
  };
  return { shutdown: shutdownFn };
}

function startNodeSdkFromConfig(opts: StartSdkFromConfigOptions): NodeSdk {
  let config: ConfigurationModel;
  try {
    config = parseConfigFile(opts.configFile);
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
    instrumentations: opts.instrumentations?.flat() ?? [],
  });

  let components: SdkComponents;
  try {
    components = createFromConfig(config);
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
function createFromConfig(config: ConfigurationModel): SdkComponents {
  const components: SdkComponents = {};

  try {
    // TODO: disable context manager on createErr and shutdown
    components.contextManager = new AsyncLocalStorageContextManager();
    components.contextManager.enable();

    const resource = createResourceFromConfig(config.resource);

    if (config.propagator) {
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
