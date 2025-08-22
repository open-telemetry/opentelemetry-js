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
  diagLogLevelFromString,
  getStringFromEnv,
  getStringListFromEnv,
} from '@opentelemetry/core';
import {
  ConfigurationModel,
  initializeDefaultConfiguration,
} from './configModel';
import { ConfigProvider } from './IConfigProvider';
import * as fs from 'fs';
import * as yaml from 'yaml';
import { DiagLogLevel } from '@opentelemetry/api';

export class FileConfigProvider implements ConfigProvider {
  private _config: ConfigurationModel;

  constructor() {
    this._config = initializeDefaultConfiguration();
    ParseConfigFile(this._config);
  }

  getInstrumentationConfig(): ConfigurationModel {
    return this._config;
  }
}

export function hasValidConfigFile(): boolean {
  const configFile = getStringFromEnv('OTEL_EXPERIMENTAL_CONFIG_FILE');
  if (configFile) {
    if (
      !(configFile.endsWith('.yaml') || configFile.endsWith('.yml')) ||
      !fs.existsSync(configFile)
    ) {
      throw new Error(
        `Config file ${configFile} set on OTEL_EXPERIMENTAL_CONFIG_FILE is not valid`
      );
    }
    return true;
  }
  return false;
}

function ParseConfigFile(config: ConfigurationModel) {
  const supportedFileVersions = ['1.0-rc.1'];
  const configFile = getStringFromEnv('OTEL_EXPERIMENTAL_CONFIG_FILE') || '';
  const file = fs.readFileSync(configFile, 'utf8');
  const parsedContent = yaml.parse(file);

  if (
    parsedContent['file_format'] &&
    supportedFileVersions.includes(parsedContent['file_format'])
  ) {
    config.disabled = setValue(config.disabled, parsedContent['disabled']);
    config.log_level = setValue(
      config.log_level,
      diagLogLevelFromString(parsedContent['log_level']) ?? DiagLogLevel.INFO
    );
    config.resource.attributes_list = setValue(
      config.resource.attributes_list,
      parsedContent['resource']?.['attributes_list']
    );
    config.resource.schema_url = setValue(
      config.resource.schema_url,
      parsedContent['resource']?.['schema_url']
    );
    setResourceAttributes(config, parsedContent['resource']?.['attributes']);

    setValuesFromEnvVariables(config);
  } else {
    throw new Error(
      `Unsupported File Format: ${parsedContent['file_format']}. It must be one of the following: ${supportedFileVersions}`
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setValue(obj: unknown, value: unknown): any {
  if (value) {
    return value;
  }
  if (typeof obj === 'boolean') {
    const raw = String(value)?.trim().toLowerCase();
    if (raw === 'false') {
      return false;
    }
  }
  return obj;
}

/**
 * Some values can only be set by Environment Variables and
 * not declarative configuration. This function set those values.
 * @param config
 */
function setValuesFromEnvVariables(config: ConfigurationModel) {
  const nodeResourceDetectors = getStringListFromEnv(
    'OTEL_NODE_RESOURCE_DETECTORS'
  );
  if (nodeResourceDetectors) {
    config.node_resource_detectors = nodeResourceDetectors;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setResourceAttributes(config: ConfigurationModel, attributes: any[]) {
  if (attributes) {
    config.resource.attributes = [];
    for (let i = 0; i < attributes.length; i++) {
      const att = attributes[i];
      config.resource.attributes.push({
        name: att['name'],
        value: att['value'],
        type: att['type'] ?? 'string',
      });
    }
  }
}
