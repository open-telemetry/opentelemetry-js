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

import { IncludeExclude } from './commonModel';

export interface Resource {
  /**
   * Configure resource attributes. Entries have higher priority than entries from .resource.attributes_list.
   * Entries must contain .name and .value, and may optionally include .type. If an entry's .type omitted or null, string is used.
   * The .value's type must match the .type. Values for .type include: string, bool, int, double, string_array, bool_array, int_array, double_array.
   */
  attributes?: AttributeNameValue[];

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

  /**
   * Configure resource detection.
   * This type is in development and subject to breaking changes in minor versions.
   * If omitted or null, resource detection is disabled.
   */
  'detection/development'?: ResourceDetection;
}

export interface AttributeNameValue {
  name: string;
  value:
    | string
    | boolean
    | number
    | string[]
    | boolean[]
    | number[]
    | undefined;
  type?:
    | 'string'
    | 'bool'
    | 'int'
    | 'double'
    | 'string_array'
    | 'bool_array'
    | 'int_array'
    | 'double_array';
}

export interface ResourceDetection {
  /**
   * Configure attributes provided by resource detectors.
   */
  attributes?: IncludeExclude;

  /**
   * Configure resource detectors.
   * Resource detector names are dependent on the SDK language ecosystem. Please consult documentation for each respective language.
   * If omitted or null, no resource detectors are enabled.
   */
  detectors?: ResourceDetector;
}

export interface ResourceDetector {
  /**
   * Enable the container resource detector, which populates container.* attributes.
   */
  container?: object;

  /**
   * Enable the host resource detector, which populates host.* and os.* attributes.
   */
  host?: object;

  /**
   * Enable the process resource detector, which populates process.* attributes.
   */
  process?: object;

  /**
   * Enable the service detector, which populates service.name based on the OTEL_SERVICE_NAME
   * environment variable and service.instance.id.
   */
  service?: object;
}
