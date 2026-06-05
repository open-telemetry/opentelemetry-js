/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { BooleanEnvVar, StringEnvVar } from './EnvReader';

export enum SamplerType {
  AlwaysOn = 'always_on',
  AlwaysOff = 'always_off',
  TraceIdRatio = 'traceidratio',
  ParentBasedAlwaysOn = 'parentbased_always_on',
  ParentBasedAlwaysOff = 'parentbased_always_off',
  ParentBasedTraceIdRatio = 'parentbased_traceidratio',
}

export const ENV_DEFS = {
  OTEL_SDK_DISABLED: {
    key: 'OTEL_SDK_DISABLED',
    type: 'boolean',
    description: 'Disable the SDK',
    defaultValue: false,
  } as BooleanEnvVar,

  OTEL_TRACES_SAMPLER: {
    key: 'OTEL_TRACES_SAMPLER',
    type: 'string',
    description: 'Traces sampler',
    allowedValues: Object.values(SamplerType),
  } as StringEnvVar,

  OTEL_TRACES_SAMPLER_ARG: {
    key: 'OTEL_TRACES_SAMPLER_ARG',
    type: 'string',
    description: 'Traces sampler argument',
  } as StringEnvVar,
} as const;
