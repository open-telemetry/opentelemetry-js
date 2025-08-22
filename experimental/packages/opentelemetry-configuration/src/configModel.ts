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
'use strict';

import { DiagLogLevel } from '@opentelemetry/api';
export interface ConfigurationModel {
  /**
   * Configure if the SDK is disabled or not.
   * If omitted or null, false is used.
   */
  disabled: boolean;

  /**
   * Configure the log level of the internal logger used by the SDK.
   * If omitted, info is used.
   */
  log_level: number;

  /**
   * Node resource detectors
   * If omitted, all is used.
   */
  node_resource_detectors: string[];

  /**
   * Configure resource for all signals.
   * If omitted, the default resource is used.
   */
  resource: ConfigResources;
}

export function initializeDefaultConfiguration(): ConfigurationModel {
  const config: ConfigurationModel = {
    disabled: true,
    log_level: DiagLogLevel.INFO,
    node_resource_detectors: ['all'],
    resource: {},
  };

  return config;
}

export interface ConfigAttributes {
  name: string;
  value: string | boolean | number | string[] | boolean[] | number[];
  type:
    | 'string'
    | 'bool'
    | 'int'
    | 'double'
    | 'string_array'
    | 'bool_array'
    | 'int_array'
    | 'double_array';
}

export interface ConfigResources {
  /**
   * Configure resource attributes. Entries have higher priority than entries from .resource.attributes_list.
   * Entries must contain .name and .value, and may optionally include .type. If an entry's .type omitted or null, string is used.
   * The .value's type must match the .type. Values for .type include: string, bool, int, double, string_array, bool_array, int_array, double_array.
   */
  attributes?: ConfigAttributes[];

  /**
   * Configure resource attributes. Entries have lower priority than entries from .resource.attributes.
   * The value is a list of comma separated key-value pairs matching the format of OTEL_RESOURCE_ATTRIBUTES.
   * If omitted or null, no resource attributes are added.
   */
  attributes_list?: string;

  /**
   * Configure resource schema URL.
   * If omitted or null, no schema URL is used.
   */
  schema_url?: string;
}
