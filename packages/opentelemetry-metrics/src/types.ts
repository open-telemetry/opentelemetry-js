/*!
 * Copyright 2019, OpenTelemetry Authors
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

import { LogLevel } from '@opentelemetry/core';
import { Logger } from '@opentelemetry/types';

/** Options needed for SDK metric creation. */
export interface MetricOptions {
  /** The name of the component that reports the Metric. */
  component?: string;

  /** The description of the Metric. */
  description: string;

  /** The unit of the Metric values. */
  unit: string;

  /** The list of label keys for the Metric. */
  labelKeys: string[];

  /** The map of constant labels for the Metric. */
  constantLabels?: Map<string, string>;

  /** Indicates the metric is a verbose metric that is disabled by default */
  disabled: boolean;

  /** Monotonic allows this metric to accept negative values. */
  monotonic: boolean;

  /** User provided logger. */
  logger: Logger;
}

/** MeterConfig provides an interface for configuring a Meter. */
export interface MeterConfig {
  /** User provided logger. */
  logger?: Logger;

  /** level of logger.  */
  logLevel?: LogLevel;
}

/** Default Meter configuration. */
export const DEFAULT_CONFIG = {
  logLevel: LogLevel.DEBUG,
};

/** The default metric creation options value. */
export const DEFAULT_METRIC_OPTIONS = {
  disabled: false,
  description: '',
  unit: '1',
  labelKeys: [],
};
