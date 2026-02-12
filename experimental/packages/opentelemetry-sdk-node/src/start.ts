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
} from '@opentelemetry/configuration';
import {
  context,
  diag,
  DiagConsoleLogger,
  propagation,
} from '@opentelemetry/api';
import {
  getInstanceID,
  getLogRecordProcessorsFromConfiguration,
  getPropagatorFromConfiguration,
  getResourceDetectorsFromConfiguration,
  getResourceFromConfiguration,
} from './utils';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import type { SDKComponents, SDKOptions } from './types';
import { LoggerProvider } from '@opentelemetry/sdk-logs';
import { logs } from '@opentelemetry/api-logs';
import {
  defaultResource,
  detectResources,
  Resource,
  ResourceDetectionConfig,
  ResourceDetector,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { ATTR_SERVICE_INSTANCE_ID } from './semconv';
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';

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

  const components = create(config, sdkOptions);
  context.setGlobalContextManager(components.contextManager);
  if (components.loggerProvider) {
    logs.setGlobalLoggerProvider(components.loggerProvider);
  }
  if (components.propagator) {
    propagation.setGlobalPropagator(components.propagator);
  }

  const shutdownFn = async () => {
    const promises: Promise<unknown>[] = [];
    if (components.loggerProvider) {
      promises.push(components.loggerProvider.shutdown());
    }
    await Promise.all(promises);
  };
  return { shutdown: shutdownFn };
}
const NOOP_SDK = {
  shutdown: async () => {},
};

/**
 * Interpret configuration model and return SDK components.
 */
function create(
  config: ConfigurationModel,
  sdkOptions: SDKOptions
): SDKComponents {
  const defaultContextManager = new AsyncLocalStorageContextManager();
  defaultContextManager.enable();
  const components: SDKComponents = {
    contextManager: defaultContextManager,
  };
  const resource = setupResource(config, sdkOptions);

  const propagator =
    sdkOptions?.textMapPropagator === null
      ? null // null means don't set.
      : (sdkOptions?.textMapPropagator ??
        getPropagatorFromConfiguration(config));
  if (propagator) {
    components.propagator = propagator;
  } else if (propagator === undefined) {
    components.propagator = new CompositePropagator({
      propagators: [
        new W3CTraceContextPropagator(),
        new W3CBaggagePropagator(),
      ],
    });
  }

  const logProcessors = getLogRecordProcessorsFromConfiguration(config);
  if (logProcessors) {
    const loggerProvider = new LoggerProvider({
      resource: resource,
      processors: logProcessors,
    });
    components.loggerProvider = loggerProvider;
  }

  return components;
}

export function setupResource(
  config: ConfigurationModel,
  sdkOptions: SDKOptions
): Resource {
  let resource: Resource =
    getResourceFromConfiguration(config) ?? defaultResource();
  let resourceDetectors: ResourceDetector[] = [];

  if (sdkOptions.resourceDetectors != null) {
    resourceDetectors = sdkOptions.resourceDetectors;
  } else if (config.node_resource_detectors) {
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
