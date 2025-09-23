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
  AttributeLimits,
  ConfigAttributes,
  ConfigTracerProvider,
  ConfigurationModel,
  initializeDefaultConfiguration,
} from './configModel';
import { ConfigProvider } from './IConfigProvider';
import * as fs from 'fs';
import * as yaml from 'yaml';
import {
  getBooleanFromConfigFile,
  getBooleanListFromConfigFile,
  getListFromObjectsFromConfigFile,
  getNumberFromConfigFile,
  getNumberListFromConfigFile,
  getStringFromConfigFile,
  getStringListFromConfigFile,
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
    setAttributeLimits(config, parsedContent['attribute_limits']);
    setPropagator(config, parsedContent['propagator']);
    setTracerProvider(config, parsedContent['tracer_provider']);
  } else {
    throw new Error(
      `Unsupported File Format: ${parsedContent['file_format']}. It must be one of the following: ${supportedFileVersions}`
    );
  }
}

function setResourceAttributes(
  config: ConfigurationModel,
  attributes: ConfigAttributes[]
) {
  if (attributes) {
    config.resource.attributes = [];
    for (let i = 0; i < attributes.length; i++) {
      const att = attributes[i];
      let value = att['value'];
      switch (att['type']) {
        case 'bool':
          value = getBooleanFromConfigFile(value);
          break;
        case 'bool_array':
          value = getBooleanListFromConfigFile(value);
          break;
        case 'int':
        case 'double':
          value = getNumberFromConfigFile(value);
          break;
        case 'int_array':
        case 'double_array':
          value = getNumberListFromConfigFile(value);
          break;
        case 'string_array':
          value = getStringListFromConfigFile(value);
          break;
        default:
          value = getStringFromConfigFile(value);
          break;
      }

      config.resource.attributes.push({
        name: getStringFromConfigFile(att['name']) ?? '',
        value: value,
        type: att['type'] ?? 'string',
      });
    }
  }
}

function setAttributeLimits(
  config: ConfigurationModel,
  attrLimits: AttributeLimits
) {
  if (attrLimits) {
    const lengthLimit = getNumberFromConfigFile(
      attrLimits['attribute_value_length_limit']
    );
    if (lengthLimit) {
      config.attribute_limits.attribute_value_length_limit = lengthLimit;
    }
    const countLimit = getNumberFromConfigFile(
      attrLimits['attribute_count_limit']
    );
    if (countLimit) {
      config.attribute_limits.attribute_count_limit = countLimit;
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setPropagator(config: ConfigurationModel, propagator: any): void {
  if (propagator) {
    let composite = getListFromObjectsFromConfigFile(propagator['composite']);
    const compositeList = getStringListFromConfigFile(
      propagator['composite_list']
    );
    if (composite === undefined) {
      composite = [];
    }
    if (compositeList) {
      for (let i = 0; i < compositeList.length; i++) {
        if (!composite.includes(compositeList[i])) {
          composite.push(compositeList[i]);
        }
      }
    }

    if (composite.length > 0) {
      config.propagator.composite = composite;
    }
    const compositeListString = getStringFromConfigFile(
      propagator['composite_list']
    );
    if (compositeListString) {
      config.propagator.composite_list = compositeListString;
    }
  }
}

function setTracerProvider(
  config: ConfigurationModel,
  tracerProvider: ConfigTracerProvider
): void {
  if (tracerProvider) {
    // Limits
    if (tracerProvider['limits']) {
      const attributeValueLengthLimit = getNumberFromConfigFile(
        tracerProvider['limits']['attribute_value_length_limit']
      );

      if (attributeValueLengthLimit) {
        config.tracer_provider.limits.attribute_value_length_limit =
          attributeValueLengthLimit;
      }

      const attributeCountLimit = getNumberFromConfigFile(
        tracerProvider['limits']['attribute_count_limit']
      );
      if (attributeCountLimit) {
        config.tracer_provider.limits.attribute_count_limit =
          attributeCountLimit;
      }

      const eventCountLimit = getNumberFromConfigFile(
        tracerProvider['limits']['event_count_limit']
      );
      if (eventCountLimit) {
        config.tracer_provider.limits.event_count_limit = eventCountLimit;
      }

      const linkCountLimit = getNumberFromConfigFile(
        tracerProvider['limits']['link_count_limit']
      );
      if (linkCountLimit) {
        config.tracer_provider.limits.link_count_limit = linkCountLimit;
      }

      const eventAttributeCountLimit = getNumberFromConfigFile(
        tracerProvider['limits']['event_attribute_count_limit']
      );
      if (eventAttributeCountLimit) {
        config.tracer_provider.limits.event_attribute_count_limit =
          eventAttributeCountLimit;
      }

      const linkAttributeCountLimit = getNumberFromConfigFile(
        tracerProvider['limits']['link_attribute_count_limit']
      );
      if (linkAttributeCountLimit) {
        config.tracer_provider.limits.link_attribute_count_limit =
          linkAttributeCountLimit;
      }
    }
  }
}
