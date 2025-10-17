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

import {
  OtlpFileExporter,
  OtlpGrpcExporter,
  OtlpHttpEncoding,
  OtlpHttpExporter,
} from './commonModel';

export function initializeDefaultLoggerProviderConfiguration(): LoggerProvider {
  return {
    processors: [
      {
        batch: {
          schedule_delay: 1000,
          export_timeout: 30000,
          max_queue_size: 2048,
          max_export_batch_size: 512,
          exporter: {
            otlp_http: {
              endpoint: 'http://localhost:4318/v1/logs',
              timeout: 10000,
              encoding: OtlpHttpEncoding.Protobuf,
            },
          },
        },
      },
    ],
    limits: {
      attribute_count_limit: 128,
    },
  };
}

export interface LoggerProvider {
  /**
   * Configure log record processors.
   */
  processors: LogRecordProcessor[];

  /**
   * Configure log record limits. See also attribute_limits.
   */
  limits?: LogRecordLimits;

  /**
   * Configure loggers.
   * This type is in development and subject to breaking changes in minor versions.
   */
  'logger_configurator/development'?: LoggerConfigurator;
}

export interface SimpleLogRecordProcessor {
  /**
   * Configure exporter.
   */
  exporter: LogRecordExporter;
}

export interface BatchLogRecordProcessor {
  /**
   * Configure delay interval (in milliseconds) between two consecutive exports.
   * Value must be non-negative.
   * If omitted or null, 1000 is used for traces and 1000 for logs.
   */
  schedule_delay?: number;

  /**
   * Configure maximum allowed time (in milliseconds) to export data.
   * Value must be non-negative. A value of 0 indicates no limit (infinity).
   * If omitted or null, 30000 is used.
   */
  export_timeout?: number;

  /**
   * Configure maximum queue size. Value must be positive.
   * If omitted or null, 2048 is used.
   */
  max_queue_size?: number;

  /**
   * Configure maximum batch size. Value must be positive.
   * If omitted or null, 512 is used.
   */
  max_export_batch_size?: number;

  /**
   * Configure exporter.
   */
  exporter: LogRecordExporter;
}

export interface LogRecordExporter {
  /**
   * Configure exporter to be OTLP with HTTP transport.
   */
  otlp_http?: OtlpHttpExporter;

  /**
   * Configure exporter to be OTLP with gRPC transport.
   */
  otlp_grpc?: OtlpGrpcExporter;

  /**
   * Configure exporter to be OTLP with file transport.
   * This type is in development and subject to breaking changes in minor versions.
   */
  'otlp_file/development'?: OtlpFileExporter;

  /**
   * Configure exporter to be console.
   */
  console?: object;
}

export interface LogRecordLimits {
  /**
   * Configure max attribute value size. Overrides .attribute_limits.attribute_value_length_limit.
   * Value must be non-negative.
   * If omitted or null, there is no limit.
   */
  attribute_value_length_limit?: number;

  /**
   * Configure max attribute count. Overrides .attribute_limits.attribute_count_limit.
   * Value must be non-negative.
   * If omitted or null, 128 is used.
   */
  attribute_count_limit?: number;
}

export interface LogRecordProcessor {
  /**
   * Configure a batch log record processor.
   */
  batch?: BatchLogRecordProcessor;

  /**
   * Configure a simple log record processor.
   */
  simple?: SimpleLogRecordProcessor;
}

export interface LoggerConfigurator {
  /**
   * Configure the default logger config used there is no matching entry in .logger_configurator/development.loggers.
   */
  default_config?: LoggerConfig;

  /**
   * Configure loggers.
   */
  loggers?: LoggerMatcherAndConfig[];
}

export interface LoggerConfig {
  /**
   * Configure if the logger is enabled or not.
   */
  disabled: boolean;
}

export interface LoggerMatcherAndConfig {
  /**
   * Configure logger names to match, evaluated as follows:
   *  * If the logger name exactly matches.
   *  * If the logger name matches the wildcard pattern, where '?' matches any single character
   * and '*' matches any number of characters including none.
   */
  name?: string;

  /**
   * The logger config.
   */
  config?: LoggerConfig;
}
