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
import { Logger, ValueType } from '@opentelemetry/api';
import { MetricExporter } from './export/types';
import { Resource } from '@opentelemetry/resources';
import { Batcher } from './export/Batcher';

/** Options needed for SDK metric creation. */
export interface MetricOptions {
  /** The name of the component that reports the Metric. */
  component?: string;

  /** The description of the Metric. */
  description: string;

  /** The unit of the Metric values. */
  unit: string;

  /** The map of constant labels for the Metric. */
  constantLabels?: Map<string, string>;

  /** Indicates the metric is a verbose metric that is disabled by default. */
  disabled: boolean;

  /** (Measure only) Asserts that this metric will only accept non-negative values. */
  absolute: boolean;

  /** User provided logger. */
  logger: Logger;

  /** Indicates the type of the recorded value. */
  valueType: ValueType;
}

/** MeterConfig provides an interface for configuring a Meter. */
export interface MeterConfig {
  /** User provided logger. */
  logger?: Logger;

  /** level of logger. */
  logLevel?: LogLevel;

  /** Metric exporter. */
  exporter?: MetricExporter;

  /** Metric collect interval */
  interval?: number;

  /** Resource associated with metric telemetry */
  resource?: Resource;

  /** Metric batcher. */
  batcher?: Batcher;
}

/** Default Meter configuration. */
export const DEFAULT_CONFIG = {
  logLevel: LogLevel.INFO,
};

/** The default metric creation options value. */
export const DEFAULT_METRIC_OPTIONS = {
  disabled: false,
  absolute: false,
  description: '',
  unit: '1',
  valueType: ValueType.DOUBLE,
};
