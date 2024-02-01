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

import { OtlpHttpConfiguration } from './configuration';

// Defaults:
// Note: Omitting default (required) headers as they'll differ for Node.js and Browser. For header defaults, please use
//  - @opentelemetry/otlp-http-exporter-node-base
//  - @opentelemetry/otlp-http-exporter-browser-base

// Specification defines 10 seconds.
export const DEFAULT_TIMEOUT = 10000;
// Non-specified default limit concurrent exports.
export const DEFAULT_CONCURRENCY_LIMIT = 30;
// Specification defines OTLP/HTTP default URL to be http://localhost:4318
export const DEFAULT_COMPRESSION = 'none';

function validateTimeoutMillis(timeoutMillis: number) {
  if (
    !Number.isNaN(timeoutMillis) &&
    Number.isFinite(timeoutMillis) &&
    timeoutMillis > 0
  ) {
    return timeoutMillis;
  }
  throw new Error(
    `Configuration: timeoutMillis is invalid, expected number greater than 0 (actual: ${timeoutMillis})`
  );
}

function determineHeaders(
  userProvidedHeaders: Record<string, string> | undefined | null,
  fallbackHeaders: Record<string, string> | undefined | null,
  defaultHeaders: Record<string, string>
): Record<string, string> {
  const requiredHeaders = {
    ...defaultHeaders,
  };
  const headers = {};

  // add fallback ones first
  if (fallbackHeaders != null) {
    Object.assign(headers, fallbackHeaders);
  }

  // override with user-provided ones
  if (userProvidedHeaders != null) {
    Object.assign(headers, userProvidedHeaders);
  }

  // override required ones before exiting.
  return Object.assign(headers, requiredHeaders);
}

/**
 * @param userProvidedConfiguration  Configuration options provided by the user in code.
 * @param fallbackConfiguration Fallback to use when the {@link userProvidedConfiguration} does not specify an option.
 * @param defaultConfiguration The defaults as defined by the exporter specification
 */
export function mergeOtlpHttpConfigurationWithDefaults(
  userProvidedConfiguration: Partial<OtlpHttpConfiguration>,
  fallbackConfiguration: Partial<OtlpHttpConfiguration>,
  defaultConfiguration: OtlpHttpConfiguration
): OtlpHttpConfiguration {
  return {
    timeoutMillis: validateTimeoutMillis(
      userProvidedConfiguration.timeoutMillis ??
        fallbackConfiguration.timeoutMillis ??
        defaultConfiguration.timeoutMillis
    ),
    concurrencyLimit:
      userProvidedConfiguration.concurrencyLimit ??
      fallbackConfiguration.concurrencyLimit ??
      defaultConfiguration.concurrencyLimit,
    headers: determineHeaders(
      userProvidedConfiguration.headers,
      fallbackConfiguration.headers,
      defaultConfiguration.headers
    ),
    url:
      userProvidedConfiguration.url ??
      fallbackConfiguration.url ??
      defaultConfiguration.url,
    compression:
      userProvidedConfiguration.compression ??
      fallbackConfiguration.compression ??
      defaultConfiguration.compression,
  };
}
