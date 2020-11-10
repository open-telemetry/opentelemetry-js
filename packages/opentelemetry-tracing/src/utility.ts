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

import { DEFAULT_CONFIG } from './config';
import { TracerConfig } from './types';
import {
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
  getEnv,
} from '@opentelemetry/core';

/**
 * Function to merge Default configuration (as specified in './config') with
 * user provided configurations.
 */
export function mergeConfig(userConfig: TracerConfig) {
  const otelSamplingProbability = getEnv().OTEL_SAMPLING_PROBABILITY;

  const target = Object.assign(
    {},
    DEFAULT_CONFIG,
    // use default AlwaysOnSampler if otelSamplingProbability is 1
    otelSamplingProbability !== undefined && otelSamplingProbability < 1
      ? {
          sampler: new ParentBasedSampler({
            root: new TraceIdRatioBasedSampler(otelSamplingProbability),
          }),
        }
      : {},
    userConfig
  );

  target.traceParams = Object.assign(
    {},
    DEFAULT_CONFIG.traceParams,
    userConfig.traceParams || {}
  );

  return target;
}
