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

import { DiagLogLevel } from '@opentelemetry/api';
import {
  ConfigurationModel,
  initializeDefaultConfiguration,
} from './configModel';
import {
  getBooleanFromEnv,
  getStringFromEnv,
  getStringListFromEnv,
  diagLogLevelFromString,
} from '@opentelemetry/core';
import { ConfigProvider } from './IConfigProvider';

/**
 * EnvironmentConfigProvider provides a configuration based on environment variables.
 */
export class EnvironmentConfigProvider implements ConfigProvider {
  private _config: ConfigurationModel;

  constructor() {
    this._config = initializeDefaultConfiguration();
    this._config.disabled = getBooleanFromEnv('OTEL_SDK_DISABLED');

    const logLevel = getStringFromEnv('OTEL_LOG_LEVEL');
    if (logLevel) {
      this._config.log_level =
        diagLogLevelFromString(logLevel) ?? DiagLogLevel.INFO;
    }

    const nodeResourceDetectors = getStringListFromEnv(
      'OTEL_NODE_RESOURCE_DETECTORS'
    );
    if (nodeResourceDetectors) {
      this._config.node_resource_detectors = nodeResourceDetectors;
    }

    const resourceAttrList = getStringFromEnv('OTEL_RESOURCE_ATTRIBUTES');
    if (resourceAttrList) {
      this._config.resource.attributes_list = resourceAttrList;
    }
  }

  getInstrumentationConfig(): ConfigurationModel {
    return this._config;
  }
}
