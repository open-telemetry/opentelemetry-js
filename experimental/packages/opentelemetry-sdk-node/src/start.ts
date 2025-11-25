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
import { context, diag, DiagConsoleLogger } from '@opentelemetry/api';
import {
  getInstanceID,
  getLogRecordProcessorsFromConfiguration,
  getPropagatorFromConfiguration,
  getResourceDetectorsFromConfiguration,
  getResourceFromConfiguration,
  setupPropagator,
} from './utils';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import type { SDKOptions } from './types';
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

export function setupResource(
  config: ConfigurationModel,
  sdkOptions: SDKOptions
): Resource {
  let resource: Resource =
    sdkOptions.resource ??
    getResourceFromConfiguration(config) ??
    defaultResource();
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

function setupDefaultContextManager() {
  const defaultContextManager = new AsyncLocalStorageContextManager();
  defaultContextManager.enable();
  context.setGlobalContextManager(defaultContextManager);
}

function setupLoggerProvider(
  config: ConfigurationModel,
  sdkOptions: SDKOptions,
  resource: Resource | undefined
): LoggerProvider | undefined {
  const logProcessors = getLogRecordProcessorsFromConfiguration(config);

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
