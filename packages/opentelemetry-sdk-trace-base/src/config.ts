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
  TracesSamplerValues,
  ParentBasedSampler,
  ENVIRONMENT,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/core';

const env = getEnv();
const FALLBACK_OTEL_TRACES_SAMPLER = TracesSamplerValues.AlwaysOn;
const DEFAULT_RATIO = 1;

/**
 * Default configuration. For fields with primitive values, any user-provided
 * value will override the corresponding default value. For fields with
 * non-primitive values (like `spanLimits`), the user-provided value will be
 * used to extend the default value.
 */
export const DEFAULT_CONFIG = {
  sampler: buildSamplerFromEnv(env),
  forceFlushTimeoutMillis: 30000,
  generalLimits: {
    attributeValueLengthLimit: getEnv().OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT,
    attributeCountLimit: getEnv().OTEL_ATTRIBUTE_COUNT_LIMIT,
  },
  spanLimits: {
    attributeValueLengthLimit: getEnv().OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT,
    attributeCountLimit: getEnv().OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT,
    linkCountLimit: getEnv().OTEL_SPAN_LINK_COUNT_LIMIT,
    eventCountLimit: getEnv().OTEL_SPAN_EVENT_COUNT_LIMIT,
  },
};

/**
 * Based on environment, builds a sampler, complies with specification.
 * @param environment optional, by default uses getEnv(), but allows passing a value to reuse parsed environment
 */
export function buildSamplerFromEnv(
  environment: Required<ENVIRONMENT> = getEnv()
): Sampler {
  switch (environment.OTEL_TRACES_SAMPLER) {
    case TracesSamplerValues.AlwaysOn:
      return new AlwaysOnSampler();
    case TracesSamplerValues.AlwaysOff:
      return new AlwaysOffSampler();
    case TracesSamplerValues.ParentBasedAlwaysOn:
      return new ParentBasedSampler({
        root: new AlwaysOnSampler(),
      });
    case TracesSamplerValues.ParentBasedAlwaysOff:
      return new ParentBasedSampler({
        root: new AlwaysOffSampler(),
      });
    case TracesSamplerValues.TraceIdRatio:
      return new TraceIdRatioBasedSampler(getSamplerProbabilityFromEnv(environment));
    case TracesSamplerValues.ParentBasedTraceIdRatio:
      return new ParentBasedSampler({
        root: new TraceIdRatioBasedSampler(getSamplerProbabilityFromEnv(environment)),
      });
    default:
      diag.error(
        `OTEL_TRACES_SAMPLER value "${environment.OTEL_TRACES_SAMPLER} invalid, defaulting to ${FALLBACK_OTEL_TRACES_SAMPLER}".`
      );
      return new AlwaysOnSampler();
  }
}

function getSamplerProbabilityFromEnv(
  environment: Required<ENVIRONMENT>
): number | undefined {
  if (
    environment.OTEL_TRACES_SAMPLER_ARG === undefined ||
    environment.OTEL_TRACES_SAMPLER_ARG === ''
  ) {
    diag.error(
      `OTEL_TRACES_SAMPLER_ARG is blank, defaulting to ${DEFAULT_RATIO}.`
    );
    return DEFAULT_RATIO;
  }

  const probability = Number(environment.OTEL_TRACES_SAMPLER_ARG);

  if (isNaN(probability)) {
    diag.error(
      `OTEL_TRACES_SAMPLER_ARG=${environment.OTEL_TRACES_SAMPLER_ARG} was given, but it is invalid, defaulting to ${DEFAULT_RATIO}.`
    );
    return DEFAULT_RATIO;
  }

  if (probability < 0 || probability > 1) {
    diag.error(
      `OTEL_TRACES_SAMPLER_ARG=${environment.OTEL_TRACES_SAMPLER_ARG} was given, but it is out of range ([0..1]), defaulting to ${DEFAULT_RATIO}.`
    );
    return DEFAULT_RATIO;
  }

  return probability;
}
