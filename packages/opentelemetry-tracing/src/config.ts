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

import { diag, Sampler } from '@opentelemetry/api';
import {
  AlwaysOffSampler,
  AlwaysOnSampler,
  getEnv,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/core';
import { ENVIRONMENT } from '@opentelemetry/core/src/utils/environment';

const env = getEnv();

/**
 * Default configuration. For fields with primitive values, any user-provided
 * value will override the corresponding default value. For fields with
 * non-primitive values (like `traceParams`), the user-provided value will be
 * used to extend the default value.
 */
export const DEFAULT_CONFIG = {
  sampler: buildSamplerFromEnv(env),
  traceParams: {
    numberOfAttributesPerSpan: getEnv().OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT,
    numberOfLinksPerSpan: getEnv().OTEL_SPAN_LINK_COUNT_LIMIT,
    numberOfEventsPerSpan: getEnv().OTEL_SPAN_EVENT_COUNT_LIMIT,
  },
};

/**
 * Based on environment, builds a sampler, complies with specification.
 * @param env optional, by default uses getEnv(), but allows passing a value to reuse parsed environment
 */
export function buildSamplerFromEnv(
  env: Required<ENVIRONMENT> = getEnv()
): Sampler {
  switch (env.OTEL_TRACES_SAMPLER) {
    case 'always_on':
      return new AlwaysOnSampler();
    case 'always_off':
      return new AlwaysOffSampler();
    case 'parentbased_always_on':
      return new ParentBasedSampler({
        root: new AlwaysOnSampler(),
      });
    case 'parentbased_always_off':
      return new ParentBasedSampler({
        root: new AlwaysOffSampler(),
      });
    case 'traceidratio':
      return new TraceIdRatioBasedSampler(getSamplerProbabilityFromEnv(env));
    case 'parentbased_traceidratio':
      return new ParentBasedSampler({
        root: new TraceIdRatioBasedSampler(getSamplerProbabilityFromEnv(env)),
      });
    default:
      diag.error(
        `OTEL_TRACES_SAMPLER value "${env.OTEL_TRACES_SAMPLER} invalid, defaulting to always_on".`
      );
      return new AlwaysOnSampler();
  }
}

const DEFAULT_RATIO = 1;

function getSamplerProbabilityFromEnv(
  env: Required<ENVIRONMENT>
): number | undefined {
  if (
    env.OTEL_TRACES_SAMPLER_ARG === undefined ||
    env.OTEL_TRACES_SAMPLER_ARG === ''
  ) {
    diag.error(
      `OTEL_TRACES_SAMPLER_ARG is blank, defaulting to ${DEFAULT_RATIO}.`
    );
    return DEFAULT_RATIO;
  }

  const probability = Number(env.OTEL_TRACES_SAMPLER_ARG);

  if (isNaN(probability)) {
    diag.error(
      `OTEL_TRACES_SAMPLER_ARG=${env.OTEL_TRACES_SAMPLER_ARG} was given, but it is invalid, defaulting to ${DEFAULT_RATIO}.`
    );
    return DEFAULT_RATIO;
  }

  if (probability < 0 || probability > 1) {
    diag.error(
      `OTEL_TRACES_SAMPLER_ARG=${env.OTEL_TRACES_SAMPLER_ARG} was given, but it is out of range ([0..1]), defaulting to ${DEFAULT_RATIO}.`
    );
    return DEFAULT_RATIO;
  }

  return probability;
}
