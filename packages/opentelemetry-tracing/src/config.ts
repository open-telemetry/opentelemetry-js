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

import { AlwaysOnSampler, getEnv } from '@opentelemetry/core';

/**
 * Default configuration. For fields with primitive values, any user-provided
 * value will override the corresponding default value. For fields with
 * non-primitive values (like `traceParams`), the user-provided value will be
 * used to extend the default value.
 */
export const DEFAULT_CONFIG = {
  logLevel: getEnv().OTEL_LOG_LEVEL,
  sampler: new AlwaysOnSampler(),
  traceParams: {
    numberOfAttributesPerSpan: getEnv().OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT,
    numberOfLinksPerSpan: getEnv().OTEL_SPAN_LINK_COUNT_LIMIT,
    numberOfEventsPerSpan: getEnv().OTEL_SPAN_EVENT_COUNT_LIMIT,
  },
};
