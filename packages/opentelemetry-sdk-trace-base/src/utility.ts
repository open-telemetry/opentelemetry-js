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

import { Sampler } from '@opentelemetry/api';
import { buildSamplerFromEnv, loadDefaultConfig } from './config';
import { SpanLimits, TracerConfig, GeneralLimits } from './types';
import {
  DEFAULT_ATTRIBUTE_COUNT_LIMIT,
  DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT
} from '@opentelemetry/core';

/**
 * Function to merge Default configuration (as specified in './config') with
 * user provided configurations.
 */
export function mergeConfig(userConfig: TracerConfig): TracerConfig & {
  sampler: Sampler;
  spanLimits: SpanLimits;
  generalLimits: GeneralLimits;
} {
  const perInstanceDefaults: Partial<TracerConfig> = {
    sampler: buildSamplerFromEnv(),
  };

  const DEFAULT_CONFIG = loadDefaultConfig();

  const target = Object.assign(
    {},
    DEFAULT_CONFIG,
    perInstanceDefaults,
    userConfig
  );

  target.generalLimits = Object.assign(
    {},
    DEFAULT_CONFIG.generalLimits,
    userConfig.generalLimits || {}
  );

  target.spanLimits = Object.assign(
    {},
    DEFAULT_CONFIG.spanLimits,
    userConfig.spanLimits || {}
  );

  return target;
}

/**
 * When general limits are provided and model specific limits are not,
 * configures the model specific limits by using the values from the general ones.
 * @param userConfig User provided tracer configuration
 */
export function reconfigureLimits(userConfig: TracerConfig): TracerConfig {
  const spanLimits = Object.assign({}, userConfig.spanLimits);

  const DEFAULT_CONFIG = loadDefaultConfig();

  /**
   * If span attribute count limit is not defined programatically and through the env variable
   * And general attribute count limit was either defined programatically or through the env variable
   * Then set the span attribute count limit to be equal to the general attribute value length limit
   * that was set programitcally or through the env variable.
   */
  if (
    spanLimits.attributeCountLimit == null &&
    (DEFAULT_CONFIG.spanLimits.attributeCountLimit === DEFAULT_ATTRIBUTE_COUNT_LIMIT) &&
    (
      userConfig.generalLimits?.attributeCountLimit != null ||
      DEFAULT_CONFIG.generalLimits.attributeCountLimit !== DEFAULT_ATTRIBUTE_COUNT_LIMIT
    )
  ) {
    const attributeCountLimit =
     userConfig.generalLimits?.attributeCountLimit ??
      DEFAULT_CONFIG.generalLimits.attributeCountLimit;

    spanLimits.attributeCountLimit = attributeCountLimit;
  }

  /**
   * If span attribute value length limit is not defined programatically and through the env variable
   * And general attribute value length limit was either defined programatically or through the env variable
   * Then set the span attribute value length limit to be equal to the general attribute value length limit
   * that was set programitcally or through the env variable.
   */
  if (
    spanLimits.attributeValueLengthLimit == null &&
    (DEFAULT_CONFIG.spanLimits.attributeValueLengthLimit === DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT) &&
    (
      userConfig.generalLimits?.attributeValueLengthLimit != null ||
      DEFAULT_CONFIG.generalLimits.attributeValueLengthLimit !== DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT
    )
  ) {
    const attributeValueLengthLimit =
      userConfig.generalLimits?.attributeValueLengthLimit ??
        DEFAULT_CONFIG.generalLimits.attributeValueLengthLimit;

    spanLimits.attributeValueLengthLimit = attributeValueLengthLimit;
  }

  return Object.assign({}, userConfig, { spanLimits });
}
