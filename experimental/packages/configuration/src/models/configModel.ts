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
import {
  initializeDefaultTracerProviderConfiguration,
  TracerProvider,
} from './tracerProviderModel';
import {
  initializeDefaultLoggerProviderConfiguration,
  LoggerProvider,
} from './loggerProviderModel';
import { Resource } from './resourceModel';
import {
  initializeDefaultMeterProviderConfiguration,
  MeterProvider,
} from './meterProviderModel';

export interface ConfigurationModel {
  /**
   * Configure if the SDK is disabled or not.
   * If omitted or null, false is used.
   */
  disabled?: boolean;

  /**
   * Configure the log level of the internal logger used by the SDK.
   * If omitted, info is used.
   */
  log_level?: number;

  /**
   * Node resource detectors
   * If omitted, all is used.
   */
  node_resource_detectors?: string[];

  /**
   * Configure resource for all signals.
   * If omitted, the default resource is used.
   */
  resource?: Resource;

  /**
   * Configure general attribute limits.
   * See also tracer_provider.limits, logger_provider.limits.
   */
  attribute_limits?: AttributeLimits;

  /**
   * Configure text map context propagators.
   */
  propagator?: Propagator;

  /**
   * Configure tracer provider.
   */
  tracer_provider?: TracerProvider;

  /**
   * Configure meter provider.
   */
  meter_provider?: MeterProvider;

  /**
   * Configure logger provider.
   */
  logger_provider?: LoggerProvider;
}

export function initializeDefaultConfiguration(): ConfigurationModel {
  const config: ConfigurationModel = {
    disabled: false,
    log_level: DiagLogLevel.INFO,
    resource: {},
    attribute_limits: {
      attribute_count_limit: 128,
    },
    propagator: {
      composite: [{ tracecontext: null }, { baggage: null }],
      composite_list: 'tracecontext,baggage',
    },
    tracer_provider: initializeDefaultTracerProviderConfiguration(),
    meter_provider: initializeDefaultMeterProviderConfiguration(),
    logger_provider: initializeDefaultLoggerProviderConfiguration(),
  };

  return config;
}
export interface AttributeLimits {
  /**
   * Configure max attribute value size.
   * Value must be non-negative.
   * If omitted or null, there is no limit.
   */
  attribute_value_length_limit?: number;

  /**
   * Configure max attribute count.
   * Value must be non-negative.
   * If omitted or null, 128 is used.
   */
  attribute_count_limit: number;
}

export interface Propagator {
  /**
   * Configure the propagators in the composite text map propagator.
   * Entries from .composite_list are appended to the list here with duplicates filtered out.
   * Built-in propagator keys include: tracecontext, baggage, b3, b3multi, jaeger, ottrace.
   * Known third party keys include: xray.
   * If the resolved list of propagators (from .composite and .composite_list) is empty, a noop propagator is used.
   */
  composite?: object[];

  /**
   * Configure the propagators in the composite text map propagator.
   * Entries are appended to .composite with duplicates filtered out.
   * The value is a comma separated list of propagator identifiers matching the format of OTEL_PROPAGATORS.
   * Built-in propagator identifiers include: tracecontext, baggage, b3, b3multi, jaeger, ottrace.
   * Known third party identifiers include: xray.
   * If the resolved list of propagators (from .composite and .composite_list) is empty, a noop propagator is used.
   */
  composite_list?: string;
}
