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

import { Logger } from '@opentelemetry/api';
import { NoopLogger } from '@opentelemetry/core';

/**
 * Parses headers from config leaving only those that have defined values
 * @param partialHeaders
 * @param logger
 */
export function parseHeaders(
  partialHeaders: Partial<Record<string, unknown>> = {},
  logger: Logger = new NoopLogger()
): Record<string, string> {
  const headers: Record<string, string> = {};
  Object.entries(partialHeaders).forEach(([key, value]) => {
    if (typeof value !== 'undefined') {
      headers[key] = String(value);
    } else {
      logger.warn(`Header "${key}" has wrong value and will be ignored`);
    }
  });
  return headers;
}
