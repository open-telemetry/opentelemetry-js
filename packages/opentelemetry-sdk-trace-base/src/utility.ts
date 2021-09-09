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

import { DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT, DEFAULT_ATTRIBUTE_COUNT_LIMIT } from '@opentelemetry/core';

import { Sampler } from '@opentelemetry/api';
import { buildSamplerFromEnv, DEFAULT_CONFIG } from './config';
import { SpanLimits, TracerConfig, GeneralLimits } from './types';

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

  /**
   * When span attribute count limit is not defined, but general attribute count limit is defined
   * Then, span attribute count limit will be same as general one
   */
  if (target.spanLimits.attributeCountLimit === DEFAULT_ATTRIBUTE_COUNT_LIMIT && target.generalLimits.attributeCountLimit !== DEFAULT_ATTRIBUTE_COUNT_LIMIT) {
    target.spanLimits.attributeCountLimit = target.generalLimits.attributeCountLimit;
  }

  /**
   * When span attribute value length limit is not defined, but general attribute value length limit is defined
   * Then, span attribute value length limit will be same as general one
   */
  if (target.spanLimits.attributeValueLengthLimit === DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT && target.generalLimits.attributeValueLengthLimit !== DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT) {
    target.spanLimits.attributeValueLengthLimit = target.generalLimits.attributeValueLengthLimit;
  }

  return target;
}
