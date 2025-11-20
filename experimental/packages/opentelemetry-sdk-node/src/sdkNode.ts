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
  createConfigFactory,
} from '@opentelemetry/configuration';
import { NodeSDKConfiguration } from './types';
import { diag, DiagConsoleLogger } from '@opentelemetry/api';
import { setupContextManager } from './utils';

/**
 * Experimental function to start the OpenTelemetry Node SDK
 * @param configurationSDK
 */
export const startNodeSDK = (
  configurationSDK: Partial<NodeSDKConfiguration> = {}
) => {
  const configFactory: ConfigFactory = createConfigFactory();
  const config = configFactory.getConfigModel();

  if (config.disabled) {
    diag.info('OpenTelemetry SDK is disabled');
    return NOOP_SDK;
  }
  if (config.log_level != null) {
    diag.setLogger(new DiagConsoleLogger(), { logLevel: config.log_level });
  }

  setupContextManager(configurationSDK?.contextManager);

  const shutdownFn = async () => {
    const promises: Promise<unknown>[] = [];
    await Promise.all(promises);
  };
  return { shutdown: shutdownFn };
};

const NOOP_SDK = {
  shutdown: () => {},
};
