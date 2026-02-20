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
import { Counter, Meter } from '@opentelemetry/api';
import { METRIC_OTEL_SDK_LOG_CREATED } from './semconv';

/**
 * Generates `otel.sdk.log.*` metrics.
 * https://opentelemetry.io/docs/specs/semconv/otel/sdk-metrics/#log-metrics
 */
export class LoggerMetrics {
  private readonly createdLogs: Counter;

  constructor(meter: Meter) {
    this.createdLogs = meter.createCounter(METRIC_OTEL_SDK_LOG_CREATED, {
      unit: '{log_record}',
      description: 'The number of logs submitted to enabled SDK Loggers.',
    });
  }

  emitLog() {
    this.createdLogs.add(1);
  }
}
