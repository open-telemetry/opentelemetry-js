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
  AlwaysOffSampler,
  AlwaysOnSampler,
  getEnv,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/core';
import { ENVIRONMENT } from '@opentelemetry/core/build/src/utils/environment';

const env = getEnv();

/**
 * Default configuration. For fields with primitive values, any user-provided
 * value will override the corresponding default value. For fields with
 * non-primitive values (like `traceParams`), the user-provided value will be
 * used to extend the default value.
 */
export const DEFAULT_CONFIG = {
  logLevel: getEnv().OTEL_LOG_LEVEL,
  sampler: buildSamplerFromEnv(env),
  traceParams: {
    numberOfAttributesPerSpan: env.OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT,
    numberOfLinksPerSpan: env.OTEL_SPAN_LINK_COUNT_LIMIT,
    numberOfEventsPerSpan: env.OTEL_SPAN_EVENT_COUNT_LIMIT,
  },
};

/**
 * Based on environment, builds a sampler, complies with specification.
 * @param env optional, by default uses getEnv(), but allows passing a value to reuse parsed environment
 */
export function buildSamplerFromEnv(env: Required<ENVIRONMENT> = getEnv()) {
  const probability = getSamplerProbabilityFromEnv(env);
  switch (env.OTEL_TRACE_SAMPLER) {
    case 'always_on':
      return new AlwaysOnSampler();
    case 'always_off':
      return new AlwaysOffSampler();
    case 'traceidratio':
      return new TraceIdRatioBasedSampler(probability);
    case 'parentbased_always_on':
      return new ParentBasedSampler({
        root: new AlwaysOnSampler(),
      });
    case 'parentbased_always_off':
      return new ParentBasedSampler({
        root: new AlwaysOffSampler(),
      });
    case 'parentbased_traceidratio':
      return new ParentBasedSampler({
        root: new TraceIdRatioBasedSampler(probability),
      });
    default:
      // use default AlwaysOnSampler if otelSamplingProbability is 1
      if (probability < 1) {
        return new ParentBasedSampler({
          root: new TraceIdRatioBasedSampler(probability),
        });
      }
      return new AlwaysOnSampler();
  }
}

function getSamplerProbabilityFromEnv(env: Required<ENVIRONMENT>) {
  const valueFromGenericArg =
    env.OTEL_TRACE_SAMPLER_ARG !== ''
      ? Number(env.OTEL_TRACE_SAMPLER_ARG)
      : NaN;
  if (!isNaN(valueFromGenericArg)) {
    return valueFromGenericArg;
  }

  return env.OTEL_SAMPLING_PROBABILITY;
}
