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

import { LogLevel } from '../common/types';

export type ENVIRONMENT_MAP = { [key: string]: string | number };

/**
 * Environment interface to define all names
 */
export interface ENVIRONMENT {
  OTEL_LOG_LEVEL?: LogLevel;
  OTEL_NO_PATCH_MODULES?: string;
  OTEL_SAMPLING_PROBABILITY?: number;
  OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT?: number;
  OTEL_SPAN_EVENT_COUNT_LIMIT?: number;
  OTEL_SPAN_LINK_COUNT_LIMIT?: number;
  OTEL_BSP_MAX_BATCH_SIZE?: number;
  OTEL_BSP_SCHEDULE_DELAY_MILLIS?: number;
}

const ENVIRONMENT_NUMBERS: Partial<keyof ENVIRONMENT>[] = [
  'OTEL_SAMPLING_PROBABILITY',
  'OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT',
  'OTEL_SPAN_EVENT_COUNT_LIMIT',
  'OTEL_SPAN_LINK_COUNT_LIMIT',
  'OTEL_BSP_MAX_BATCH_SIZE',
  'OTEL_BSP_SCHEDULE_DELAY_MILLIS',
];

/**
 * Default environment variables
 */
export const DEFAULT_ENVIRONMENT: Required<ENVIRONMENT> = {
  OTEL_NO_PATCH_MODULES: '',
  OTEL_LOG_LEVEL: LogLevel.INFO,
  OTEL_SAMPLING_PROBABILITY: 1,
  OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT: 1000,
  OTEL_SPAN_EVENT_COUNT_LIMIT: 1000,
  OTEL_SPAN_LINK_COUNT_LIMIT: 1000,
  OTEL_BSP_MAX_BATCH_SIZE: 512,
  OTEL_BSP_SCHEDULE_DELAY_MILLIS: 5000,
};

/**
 * Parses a variable as number with number validation
 * @param name
 * @param environment
 * @param values
 * @param min
 * @param max
 */
function parseNumber(
  name: keyof ENVIRONMENT,
  environment: ENVIRONMENT_MAP | ENVIRONMENT,
  values: ENVIRONMENT_MAP,
  min = -Infinity,
  max = Infinity
) {
  if (typeof values[name] !== 'undefined') {
    const value = Number(values[name] as string);

    if (!isNaN(value)) {
      if (value < min) {
        environment[name] = min;
      } else if (value > max) {
        environment[name] = max;
      } else {
        environment[name] = value;
      }
    }
  }
}

/**
 * Environmentally sets log level if valid log level string is provided
 * @param key
 * @param environment
 * @param values
 */
function setLogLevelFromEnv(
  key: keyof ENVIRONMENT,
  environment: ENVIRONMENT_MAP | ENVIRONMENT,
  values: ENVIRONMENT_MAP
) {
  const value = values[key];
  switch (typeof value === 'string' ? value.toUpperCase() : value) {
    case 'DEBUG':
      environment[key] = LogLevel.DEBUG;
      break;

    case 'INFO':
      environment[key] = LogLevel.INFO;
      break;

    case 'WARN':
      environment[key] = LogLevel.WARN;
      break;

    case 'ERROR':
      environment[key] = LogLevel.ERROR;
      break;

    default:
      // do nothing
      break;
  }
}

/**
 * Parses environment values
 * @param values
 */
export function parseEnvironment(values: ENVIRONMENT_MAP): ENVIRONMENT {
  const environment: ENVIRONMENT_MAP = {};

  for (const env in DEFAULT_ENVIRONMENT) {
    const key = env as keyof ENVIRONMENT;
    switch (key) {
      case 'OTEL_SAMPLING_PROBABILITY':
        parseNumber(key, environment, values, 0, 1);
        break;

      case 'OTEL_LOG_LEVEL':
        setLogLevelFromEnv(key, environment, values);
        break;

      default:
        if (ENVIRONMENT_NUMBERS.indexOf(key) >= 0) {
          parseNumber(key, environment, values);
        } else {
          if (typeof values[key] !== 'undefined') {
            environment[key] = values[key];
          }
        }
    }
  }

  return environment;
}
