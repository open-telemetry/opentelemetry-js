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

import { diagLogLevelFromString, getStringFromEnv } from '@opentelemetry/core';
import {
  ConfigAttributes,
  ConfigurationModel,
  initializeDefaultConfiguration,
} from './configModel';
import { ConfigProvider } from './IConfigProvider';
import * as fs from 'fs';
import * as yaml from 'yaml';
import {
  getBooleanFromConfigFile,
  getNumberFromConfigFile,
  getStringFromConfigFile,
} from './utils';

export class FileConfigProvider implements ConfigProvider {
  private _config: ConfigurationModel;

  constructor() {
    this._config = initializeDefaultConfiguration();
    parseConfigFile(this._config);
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

function parseConfigFile(config: ConfigurationModel) {
  const supportedFileVersions = ['1.0-rc.1'];
  const configFile = getStringFromEnv('OTEL_EXPERIMENTAL_CONFIG_FILE') || '';
  const file = fs.readFileSync(configFile, 'utf8');
  const parsedContent = yaml.parse(file);

  if (
    parsedContent['file_format'] &&
    supportedFileVersions.includes(parsedContent['file_format'])
  ) {
    const disabled = getBooleanFromConfigFile(parsedContent['disabled']);
    if (disabled || disabled === false) {
      config.disabled = disabled;
    }

    const logLevel = getNumberFromConfigFile(
      diagLogLevelFromString(parsedContent['log_level'])
    );
    if (logLevel) {
      config.log_level = logLevel;
    }

    const attrList = getStringFromConfigFile(
      parsedContent['resource']?.['attributes_list']
    );
    if (attrList) {
      config.resource.attributes_list = attrList;
    }

    const schemaUrl = getStringFromConfigFile(
      parsedContent['resource']?.['schema_url']
    );
    if (schemaUrl) {
      config.resource.schema_url = schemaUrl;
    }

    setResourceAttributes(config, parsedContent['resource']?.['attributes']);
  } else {
    throw new Error(
      `Unsupported File Format: ${parsedContent['file_format']}. It must be one of the following: ${supportedFileVersions}`
    );
  }
}

function setResourceAttributes(config: ConfigurationModel, attributes: ConfigAttributes[]) {
  if (attributes) {
    config.resource.attributes = [];
    for (let i = 0; i < attributes.length; i++) {
      const att = attributes[i];
      config.resource.attributes.push({
        name: getStringFromConfigFile(att['name']) ?? '',
        value: att['value'],
        type: att['type'] ?? 'string',
      });
    }
  }
}
