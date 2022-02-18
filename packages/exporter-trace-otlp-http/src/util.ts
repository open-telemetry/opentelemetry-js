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

import { diag } from '@opentelemetry/api';
import { getEnv } from '@opentelemetry/core';

const DEFAULT_TRACE_TIMEOUT = 10000;

/**
 * Parses headers from config leaving only those that have defined values
 * @param partialHeaders
 */
export function parseHeaders(
  partialHeaders: Partial<Record<string, unknown>> = {}
): Record<string, string> {
  const headers: Record<string, string> = {};
  Object.entries(partialHeaders).forEach(([key, value]) => {
    if (typeof value !== 'undefined') {
      headers[key] = String(value);
    } else {
      diag.warn(`Header "${key}" has wrong value and will be ignored`);
    }
  });
  return headers;
}

export function appendResourcePathToUrlIfNotPresent(url: string, path: string): string {
  if (url.match(/v\d\/(traces|metrics)$/)) return url;

  return url + path;
}

/**
 * Configure exporter trace timeout value from passed in value or environment variables
 * @param timeoutMillis
 * @returns timeout value in milliseconds
 */

export function configureExporterTimeout(timeoutMillis: number | undefined): number {
  if (typeof timeoutMillis === 'number') {
    if (timeoutMillis <= 0) {
      // OTLP exporter configured timeout - using default value of 10000ms
      return invalidTimeout(timeoutMillis, DEFAULT_TRACE_TIMEOUT);
    }
    return timeoutMillis;
  } else {
    return getExporterTimeoutFromEnv();
  }
}

function getExporterTimeoutFromEnv(): number {
  const definedTimeout =
    Number(getEnv().OTEL_EXPORTER_OTLP_TRACES_TIMEOUT ||
    getEnv().OTEL_EXPORTER_OTLP_TIMEOUT);

  if (definedTimeout) {
    if (definedTimeout <= 0) {
      // OTLP exporter configured timeout - using default value of 10000ms
      return invalidTimeout(definedTimeout, DEFAULT_TRACE_TIMEOUT);
    }
    return definedTimeout;
  } else {
    return getEnv().OTEL_EXPORTER_OTLP_TRACES_TIMEOUT;
  }
}

// OTLP exporter configured timeout - using default value of 10000ms
function invalidTimeout(timeout: number, defaultTimeout: number): number {
  diag.warn('Timeout must be non-negative', timeout);

  return defaultTimeout;
}
